import { NextResponse } from "next/server";
import { TwilioService } from "@/lib/twilio-service";

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const { action, to, code } = body;

    if (!action || !to) {
      return NextResponse.json(
        { success: false, error: "Missing required parameters: 'action' and 'to'" },
        { status: 400 }
      );
    }

    const twilio = TwilioService.getInstance();

    if (action === "request") {
      const result = await twilio.generateOTP(to);
      return NextResponse.json({
        success: true,
        expiresAt: result.expiresAt,
        message: "OTP successfully sent to the recipient's phone number",
      });
    }

    if (action === "verify") {
      if (!code) {
        return NextResponse.json(
          { success: false, error: "Missing 'code' parameter for verification action" },
          { status: 400 }
        );
      }

      const result = await twilio.verifyOTP(to, code);
      if (result.success) {
        return NextResponse.json({
          success: true,
          message: "OTP successfully verified",
        });
      } else {
        const errorMapping: Record<string, { status: number; message: string }> = {
          otp_not_found: { status: 404, message: "No active verification requests exist for this phone number" },
          otp_already_used: { status: 400, message: "This verification code has already been used" },
          otp_expired: { status: 400, message: "This verification code has expired" },
          maximum_attempts_exceeded: { status: 429, message: "Maximum verification attempts exceeded. Access locked." },
          invalid_code: { status: 400, message: "Invalid verification code" },
        };

        const errorDetail = errorMapping[result.reason || ""] || { status: 400, message: "Verification failed" };
        return NextResponse.json(
          { success: false, error: result.reason, message: errorDetail.message },
          { status: errorDetail.status }
        );
      }
    }

    return NextResponse.json(
      { success: false, error: "Invalid action. Supported values: 'request' and 'verify'" },
      { status: 400 }
    );
  } catch (error: any) {
    console.error("[TwilioOTPAPI] OTP transaction failed:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to process OTP transaction" },
      { status: 500 }
    );
  }
}
