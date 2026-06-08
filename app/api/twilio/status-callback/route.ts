import { NextResponse } from "next/server";
import { TwilioService } from "@/lib/twilio-service";

export async function POST(req: Request) {
  try {
    const formData = await req.formData().catch(() => new Headers());
    
    // Twilio sends SID in MessageSid (SMS/WhatsApp) or CallSid (Voice)
    const messageSid = formData.get("MessageSid")?.toString();
    const callSid = formData.get("CallSid")?.toString();
    const sid = messageSid || callSid;

    if (!sid) {
      return NextResponse.json({ success: false, error: "Missing Twilio tracking identifier (MessageSid/CallSid)" }, { status: 400 });
    }

    // Twilio sends status in MessageStatus, SmsStatus, or CallStatus
    const messageStatus = formData.get("MessageStatus")?.toString();
    const smsStatus = formData.get("SmsStatus")?.toString();
    const callStatus = formData.get("CallStatus")?.toString();
    const status = messageStatus || smsStatus || callStatus || "unknown";

    const errorCode = formData.get("ErrorCode")?.toString();
    const errorMessage = formData.get("ErrorMessage")?.toString();
    
    const durationStr = formData.get("CallDuration")?.toString();
    const duration = durationStr ? parseInt(durationStr, 10) : undefined;
    
    const price = formData.get("Price")?.toString();
    const priceUnit = formData.get("PriceUnit")?.toString();

    console.log(`[TwilioCallback] SID: ${sid}, Status: ${status}, Error: ${errorCode || "none"}`);

    const twilio = TwilioService.getInstance();
    await twilio.updateDeliveryStatus(sid, status, errorCode, errorMessage, duration, price, priceUnit);

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("[TwilioCallbackAPI] Error parsing status callback:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function GET(req: Request) {
  return NextResponse.json({ success: true, message: "Twilio status callback active (POST requests only)" });
}
