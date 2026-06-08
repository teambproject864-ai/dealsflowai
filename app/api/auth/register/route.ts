import { NextRequest, NextResponse } from "next/server";
import {
  DEMO_CUSTOMERS,
  hashPassword,
  createToken,
  setAuthCookie,
  addAuditLog,
} from "@/lib/auth";
import { z } from "zod";

// In-memory store for new customers (replace with DB in production)
export const NEW_CUSTOMERS: Array<{
  id: string;
  email: string;
  hashedPassword: string;
  name: string;
  role: "customer";
}> = [];

const registerSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(
      /^(?=.*[a-zA-Z])(?=.*[0-9])(?=.*[!@#$%^&*(),.?":{}|<>]).*$/,
      "Password must include at least one letter, one number, and one special character"
    ),
  name: z.string().min(2, "Name must be at least 2 characters"),
  role: z.literal("customer"), // Only customers can register via this endpoint
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const validation = registerSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { 
          success: false, 
          error: validation.error.issues[0]?.message || "Invalid request parameters" 
        },
        { status: 400 }
      );
    }

    const { email, password, name, role } = validation.data;
    const ip = (req as any).ip || req.headers.get("x-forwarded-for") || "unknown";
    const userAgent = req.headers.get("user-agent") || "unknown";

    // Check if email already exists
    const existingCustomer = [...DEMO_CUSTOMERS, ...NEW_CUSTOMERS].find((c) => c.email === email);
    if (existingCustomer) {
      addAuditLog(email, "customer", false, "Email already registered", ip, userAgent);
      return NextResponse.json(
        { success: false, error: "Email is already registered" },
        { status: 409 }
      );
    }

    // Hash password and create new customer
    const hashedPassword = await hashPassword(password);
    const newCustomer = {
      id: `customer-${Date.now()}`,
      email,
      hashedPassword,
      name,
      role: "customer" as const,
    };

    NEW_CUSTOMERS.push(newCustomer);
    console.log("[Register] New customer added:", newCustomer);

    // Auto log them in
    const user = { id: newCustomer.id, email: newCustomer.email, name: newCustomer.name, role: newCustomer.role };
    const token = createToken(user);
    await setAuthCookie(token);

    addAuditLog(email, "customer", true, "Successful registration and login", ip, userAgent);

    return NextResponse.json({ success: true, user });
  } catch (error) {
    console.error("[Register Error]", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
