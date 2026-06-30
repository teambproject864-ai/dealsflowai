import { NextRequest, NextResponse } from "next/server";
import {
  verifyPassword,
  createToken,
  setAuthCookie,
  addAuditLog,
} from "@/lib/auth";
import { z } from "zod";
import { logger } from "@/lib/logger";
import { loginLockoutLimiter, captchaTriggerLimiter } from "@/lib/rate-limiter-middleware";

const loginSchema = z.object({
  email: z.string().email("Invalid email format"),
  password: z.string().min(1, "Password cannot be empty"),
  role: z.enum(["admin", "agent", "customer"]),
  mfaCode: z.string().optional(),
  captchaToken: z.string().optional(),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const validation = loginSchema.safeParse(body);

    if (!validation.success) {
      logger.warn("Invalid login request parameters", validation.error.issues);
      return NextResponse.json(
        { success: false, error: "Invalid email or password format" },
        { status: 400 }
      );
    }

    const { email, password, role, mfaCode, captchaToken } = validation.data;
    const ip = (req as any).ip || req.headers.get("x-forwarded-for")?.split(",")[0].trim() || "unknown";
    const userAgent = req.headers.get("user-agent") || "unknown";
    const limiterKey = `${ip}:${email.toLowerCase()}`;

    // ─── 1. Check Rate Limit & Lockout Status ───
    try {
      const lockoutRes = await loginLockoutLimiter.get(limiterKey);
      if (lockoutRes && lockoutRes.remainingPoints <= 0) {
        addAuditLog(email, role, false, `Access blocked: Persistent failed login attempts (Lockout active) from IP: ${ip}`, ip, userAgent);
        return NextResponse.json(
          { success: false, error: "Account lock-out active. Too many failed attempts. Please try again after 15 minutes." },
          { status: 429 }
        );
      }
    } catch (err) {
      // Ignore limiter fetch failure
    }

    // ─── 2. Check CAPTCHA Requirement for High-Risk Login Attempts ───
    let requiresCaptcha = false;
    try {
      const captchaRes = await captchaTriggerLimiter.get(limiterKey);
      if (captchaRes && captchaRes.remainingPoints <= 0) {
        requiresCaptcha = true;
      }
    } catch (err) {
      // Ignore limiter fetch failure
    }

    if (requiresCaptcha) {
      const expectedCaptchaToken = process.env.CAPTCHA_SECRET;
      // If CAPTCHA secret is not configured in env, skip CAPTCHA (for dev only)
      if (expectedCaptchaToken && (!captchaToken || captchaToken !== expectedCaptchaToken)) {
        addAuditLog(email, role, false, `Access rejected: CAPTCHA verification required from IP: ${ip}`, ip, userAgent);
        return NextResponse.json(
          { success: false, error: "CAPTCHA verification required for high-risk login attempt", requiresCaptcha: true },
          { status: 403 }
        );
      }
    }

    // ─── 3. IP Whitelisting for Admin ───
    if (role === "admin" && process.env.ADMIN_IP_WHITELIST) {
      const whitelist = process.env.ADMIN_IP_WHITELIST.split(",").map(item => item.trim());
      if (!whitelist.includes(ip) && ip !== "127.0.0.1" && ip !== "::1" && ip !== "unknown") {
        addAuditLog(email, role, false, `IP not whitelisted: ${ip}`, ip, userAgent);
        return NextResponse.json(
          { success: false, error: "Access denied from this IP address" },
          { status: 403 }
        );
      }
    }

    let user = null;

    // Check Firestore users
    let dbUser = null;
    try {
      const { db } = await import("@/lib/firebase-admin");
      if (db) {
        const snap = await db
          .collection("users")
          .where("email", "==", email.toLowerCase())
          .where("role", "==", role)
          .get();
        if (!snap.empty) {
          const doc = snap.docs[0];
          dbUser = { id: doc.id, ...doc.data() } as any;
        }
      }
    } catch (e) {
      logger.warn("[Login] Firestore not configured or failed to connect", e);
    }

    if (dbUser) {
      // Block unverified customer accounts
      if (role === "customer" && dbUser.isVerified === false) {
        return NextResponse.json(
          { success: false, error: "Please verify your email to activate your account.", requiresVerification: true, email },
          { status: 403 }
        );
      }

      const isValidPassword = await verifyPassword(password, dbUser.hashedPassword);
      if (isValidPassword) {
        user = {
          id: dbUser.id,
          email: dbUser.email,
          name: dbUser.name || (role === "admin" ? "Administrator" : role === "agent" ? "Agent" : "Customer"),
          role: dbUser.role as "admin" | "agent" | "customer",
        };
      }
    }

    // ─── 4. Failed Login Handling (Limiter consumption) ───
    if (!user) {
      try {
        await captchaTriggerLimiter.consume(limiterKey, 1);
      } catch (e) {
        requiresCaptcha = true;
      }

      try {
        await loginLockoutLimiter.consume(limiterKey, 1);
      } catch (e) {
        addAuditLog(email, role, false, `Account locked out: IP: ${ip} after consecutive failed login attempts`, ip, userAgent);
        return NextResponse.json(
          { success: false, error: "Account lock-out active. Too many failed attempts. Please try again after 15 minutes." },
          { status: 429 }
        );
      }

      addAuditLog(email, role, false, "Failed login attempt (Invalid credentials)", ip, userAgent);
      
      // Generic message to avoid email verification leaks
      return NextResponse.json(
        { success: false, error: "Invalid email or password", requiresCaptcha },
        { status: 401 }
      );
    }

    // ─── 5. Successful Login ───
    try {
      await loginLockoutLimiter.delete(limiterKey);
      await captchaTriggerLimiter.delete(limiterKey);
    } catch (e) {}

    const token = createToken(user);
    await setAuthCookie(token);

    addAuditLog(
      user.email,
      user.role,
      true,
      "Successful login",
      ip,
      userAgent
    );

    return NextResponse.json({ success: true, user });
  } catch (error) {
    logger.error("[Login Error]", error);
    // Secure generic message to prevent error leaks
    return NextResponse.json(
      { success: false, error: "An unexpected internal server error occurred" },
      { status: 500 }
    );
  }
}
