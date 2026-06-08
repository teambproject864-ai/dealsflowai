import { NextRequest, NextResponse } from "next/server";
import {
  DEMO_ADMIN,
  DEMO_AGENTS,
  DEMO_CUSTOMERS,
  NEW_CUSTOMERS,
  verifyPassword,
  createToken,
  setAuthCookie,
  addAuditLog,
} from "@/lib/auth";
import { z } from "zod";

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
  role: z.enum(["admin", "agent", "customer"]),
  mfaCode: z.string().optional(),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const validation = loginSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { success: false, error: "Invalid request parameters" },
        { status: 400 }
      );
    }

    const { email, password, role, mfaCode } = validation.data;
    const ip = (req as any).ip || req.headers.get("x-forwarded-for") || "unknown";
    const userAgent = req.headers.get("user-agent") || "unknown";

    let user = null;

    if (role === "admin") {
      if (email === DEMO_ADMIN.email && password === "AdminDF") {
        // Check if MFA is required and provided
        if (!mfaCode) {
          return NextResponse.json(
            { success: false, requireMfa: true, error: "Two-factor authentication required" },
            { status: 403 }
          );
        }
        // For demo, accept any 6-digit code
        if (mfaCode && mfaCode.length !== 6) {
          addAuditLog(email, role, false, "Invalid MFA code", ip, userAgent);
          return NextResponse.json(
            { success: false, error: "Invalid 2FA code" },
            { status: 401 }
          );
        }
        user = { ...DEMO_ADMIN, role: "admin" as const };
      }
    } else if (role === "agent") {
      const agent = DEMO_AGENTS.find((a) => a.email === email);
      if (agent) {
        const isValidPassword = await verifyPassword(password, agent.hashedPassword);
        if (isValidPassword) {
          user = { id: agent.id, email: agent.email, name: agent.name, role: "agent" as const };
        }
      }
    } else if (role === "customer") {
      const allCustomers = [...DEMO_CUSTOMERS, ...NEW_CUSTOMERS];
      const customer = allCustomers.find((c) => c.email === email);
      if (customer) {
        const isValidPassword = await verifyPassword(password, customer.hashedPassword);
        if (isValidPassword) {
          user = { id: customer.id, email: customer.email, name: customer.name, role: "customer" as const };
        }
      }
    }

    if (!user) {
      addAuditLog(
        email,
        role,
        false,
        "Invalid email or password",
        ip,
        userAgent
      );
      return NextResponse.json(
        { success: false, error: "Invalid email or password" },
        { status: 401 }
      );
    }

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
    console.error("[Login Error]", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
