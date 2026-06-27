import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { db } from "./firebase-admin";
import { logger } from "./logger";

// --- Constants & Configuration ---
function getJwtSecret(): string {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    if (process.env.NODE_ENV === "production") {
      throw new Error("CRITICAL SECURITY ERROR: JWT_SECRET environment variable is not defined in production.");
    }
    return "your-secret-key-in-production-env-var-only";
  }
  return secret;
}
const JWT_EXPIRES_IN = "8h"; // 8-hour sessions — auto-refreshed on activity
const AUTH_COOKIE_NAME = "df_auth_token";
const SALT_ROUNDS = 12;

// --- Types ---
export type UserRole = "admin" | "agent" | "customer";

export interface AuthUser {
  id: string;
  email: string;
  role: UserRole;
  name: string;
}

export interface JwtPayload {
  userId: string;
  email: string;
  role: UserRole;
  name: string;
}

interface DemoAgent {
  id: string;
  email: string;
  hashedPassword: string;
  name: string;
  role: "agent";
}

interface DemoCustomer {
  id: string;
  email: string;
  hashedPassword: string;
  name: string;
  role: "customer";
}

interface DemoAdmin {
  id: string;
  email: string;
  hashedPassword: string;
  name: string;
  role: "admin";
}

// --- Demo User Data (replace with real DB in production) ---
export const DEMO_ADMIN = {
  id: "admin-1",
  email: "admin@dealflow.ai",
  name: "Administrator",
  role: "admin" as const,
};

// Additional admin accounts with stored hashed passwords (same pattern as agents)
export const DEMO_ADMINS: DemoAdmin[] = [
  {
    id: "admin-2",
    email: "admin1@dealflow.ai",
    // Hashed password for "Pranee@1909"
    hashedPassword: "$2b$12$77aZxmlj.Kf9JztgXuehGOSdn46SXvvme3tpbosdOfwKh78Qj50iO",
    name: "Admin One",
    role: "admin",
  },
];

export const DEMO_AGENTS: DemoAgent[] = [
  {
    id: "agent-praneeth",
    email: "praneeth@dealflow.ai",
    // Hashed password for "Praneeth123!"
    hashedPassword: "$2b$12$V0TqSpuJrnZGSRfourZpLu8OxZPZ74dThGLE8Q1OznLwmg8iDSuJK",
    name: "Praneeth",
    role: "agent",
  },
  {
    id: "agent-ashok",
    email: "agent.ashok@dealflow.ai",
    // Hashed password for "AgentAshok456!"
    hashedPassword: "$2b$12$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36WQoeG6Lruj3vjPGga31lW",
    name: "Ashok Agent",
    role: "agent",
  },
];

// --- Demo Customer Data ---
export const DEMO_CUSTOMERS: DemoCustomer[] = [
  {
    id: "customer-demo",
    email: "demo@customer.com",
    // Hashed password for "CustomerDemo123!"
    hashedPassword: "$2b$12$ziqpS85cgY.OpbyEtNnU0uvhUbHRySFERSDzoIYt3YLf5xmP6lFDi",
    name: "Demo Customer",
    role: "customer",
  },
  {
    id: "customer-praneeth",
    email: "praneethburada@gmail.com",
    // Hashed password for "Praneeth@123"
    hashedPassword: "$2b$12$KOR/mZadApvr3V6EMSE1WezgudOUX1UU51QoVudLOPXSAv2Meijkq",
    name: "Praneeth Burada",
    role: "customer",
  },
  {
    id: "customer-anil",
    email: "anil@cralgo.com",
    // Hashed password for "Anil@123!"
    hashedPassword: "$2b$12$4nI.PqBx9Wr8si749DrYquPZ0l1Eceo1/aRfyj2fyDLjVEY0Yd/s2",
    name: "Anil Kumar",
    role: "customer",
  },
];

// --- In-memory new customers (legacy fallback, now stored in Firestore) ---
export let NEW_CUSTOMERS: DemoCustomer[] = [];

// --- Audit Logging ---
export function addAuditLog(
  email: string,
  role: UserRole | "unknown",
  success: boolean,
  message: string,
  ip?: string,
  userAgent?: string
) {
  const log = {
    id: `log-${Date.now()}-${Math.random()}`,
    timestamp: new Date().toISOString(),
    email,
    role,
    success,
    ip: ip || "unknown",
    userAgent: userAgent || "unknown",
    message,
  };

  // Write structured JSON log
  logger.info(`[AUDIT LOG] ${message}`, log);

  // Persist to Firestore asynchronously
  if (db) {
    db.collection("audit_logs")
      .add(log)
      .catch((err) => {
        logger.error("Failed to write audit log to Firestore", err);
      });
  }
}

// --- Password Hashing ---
export async function hashPassword(plaintext: string): Promise<string> {
  return bcrypt.hash(plaintext, SALT_ROUNDS);
}

export async function verifyPassword(
  plaintext: string,
  hashed: string
): Promise<boolean> {
  return bcrypt.compare(plaintext, hashed);
}

// --- JWT Token Management ---
export function createToken(user: AuthUser): string {
  const payload: JwtPayload = {
    userId: user.id,
    email: user.email,
    role: user.role,
    name: user.name,
  };
  return jwt.sign(payload, getJwtSecret(), { expiresIn: JWT_EXPIRES_IN });
}

export function verifyToken(token: string): JwtPayload | null {
  try {
    const decoded = jwt.verify(token, getJwtSecret()) as JwtPayload;
    return decoded;
  } catch (error) {
    return null;
  }
}

/**
 * Refreshes a valid token — reissues a fresh JWT if the current one is still valid.
 * Returns null if the token is expired or invalid.
 */
export function refreshToken(existingToken: string): string | null {
  const payload = verifyToken(existingToken);
  if (!payload) return null;
  const user: AuthUser = {
    id: payload.userId,
    email: payload.email,
    role: payload.role,
    name: payload.name,
  };
  return createToken(user);
}

// --- Cookie Management ---
export async function setAuthCookie(token: string) {
  const cookieStore = await cookies();
  cookieStore.set(AUTH_COOKIE_NAME, token, {
    httpOnly: true, // Secure from XSS
    secure: process.env.NODE_ENV === "production", // Only HTTPS in production
    sameSite: "lax", // Prevent CSRF
    path: "/",
    maxAge: 60 * 60 * 8, // 8 hours (matches JWT expiry)
  });
}

export async function getAuthCookie(): Promise<string | null> {
  const cookieStore = await cookies();
  return cookieStore.get(AUTH_COOKIE_NAME)?.value || null;
}

export function deleteAuthCookieFromResponse(response: NextResponse): NextResponse {
  response.cookies.set(AUTH_COOKIE_NAME, "", {
    path: "/",
    maxAge: 0,
    expires: new Date(0),
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
  });
  return response;
}

export async function deleteAuthCookie() {
  const cookieStore = await cookies();
  cookieStore.set(AUTH_COOKIE_NAME, "", {
    path: "/",
    maxAge: 0,
    expires: new Date(0),
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
  });
}

// --- Current User Helper ---
export async function getAuthenticatedUser(req?: Request): Promise<AuthUser | null> {
  let token: string | null = null;
  try {
    token = await getAuthCookie();
  } catch (e) {
    // cookies() might throw in some rendering contexts
  }
  
  if (!token && req) {
    const authHeader = req.headers.get("authorization") ?? "";
    if (authHeader.startsWith("Bearer ")) {
      token = authHeader.slice(7);
    }
    
    if (!token) {
      const cookieHeader = req.headers.get("cookie") ?? "";
      const match = cookieHeader.match(new RegExp(`(^|;)\\s*${AUTH_COOKIE_NAME}\\s*=\\s*([^;]+)`));
      if (match) {
        token = match[2];
      }
    }
  }
  
  if (!token) return null;
  const payload = verifyToken(token);
  if (!payload) return null;
  return {
    id: payload.userId,
    email: payload.email,
    role: payload.role,
    name: payload.name,
  };
}

export async function getCurrentUser(req?: Request): Promise<AuthUser | null> {
  return getAuthenticatedUser(req);
}

/**
 * Reusable RBAC/Auth Guard for Next.js endpoints.
 */
export async function requireAuth(
  req: Request,
  allowedRoles?: UserRole[]
): Promise<{ user: AuthUser | null; errorResponse?: NextResponse }> {
  const user = await getAuthenticatedUser(req);
  
  if (!user) {
    return {
      user: null,
      errorResponse: NextResponse.json(
        { success: false, error: "Authentication required" },
        { status: 401 }
      ),
    };
  }
  
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return {
      user,
      errorResponse: NextResponse.json(
        { success: false, error: "Forbidden: insufficient permissions" },
        { status: 403 }
      ),
    };
  }
  
  return { user };
}
