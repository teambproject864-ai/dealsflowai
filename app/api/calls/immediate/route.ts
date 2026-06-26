import { NextResponse } from "next/server";
import { getDb } from "@/lib/firebase-admin";
import { loadServiceAccount } from "@/lib/service-account";
import { createGoogleMeetLink } from "@/lib/google-meet";
import { sendEmailWithRetry } from "@/lib/notifications";
import { ensureBotForCall } from "@/lib/call-bot";
import { immediateCallSchema, CallRecord, LeadRecord } from "@/lib/types";
import { decryptLead } from "@/lib/security";

const DEFAULT_MAX_IMMEDIATE_CALLS = 3;

function parseMaxImmediateCalls() {
  const raw = process.env.MAX_IMMEDIATE_CALLS;
  const parsed = Number(raw);
  if (!Number.isFinite(parsed) || parsed <= 0) return DEFAULT_MAX_IMMEDIATE_CALLS;
  return Math.floor(parsed);
}

export async function POST(req: Request) {
  try {
    if (!loadServiceAccount()) {
      return NextResponse.json(
        {
          success: false,
          error: "Firebase Admin SDK is not configured.",
          message:
            "Set FIREBASE_SERVICE_ACCOUNT_PATH=./dealflow_firebase.json in .env.local and restart the dev server.",
        },
        { status: 503 }
      );
    }

    const body = await req.json();
    const validated = immediateCallSchema.safeParse(body);

    if (!validated.success) {
      return NextResponse.json(
        { success: false, error: "Invalid request payload", details: validated.error.flatten() },
        { status: 400 }
      );
    }

    const { leadId, personaKey, analysisId } = validated.data;
    const db = getDb();
    if (!db) {
      return NextResponse.json(
        { success: false, error: "Database not available" },
        { status: 500 }
      );
    }

    // Check rate limit on immediate calls per lead
    const maxCalls = parseMaxImmediateCalls();
    const snap = await db
      .collection("calls")
      .where("leadId", "==", leadId)
      .where("status", "==", "scheduled")
      .get();
    
    if (snap.size >= maxCalls) {
      return NextResponse.json(
        {
          success: false,
          error: "Limit exceeded",
          message: `Too many active calls. A lead is allowed at most ${maxCalls} simultaneous scheduled/immediate calls.`,
        },
        { status: 429 }
      );
    }

    const callData: CallRecord = {
      leadId,
      analysisId,
      meetingUrl: "",
      guests: [],
      status: "in-progress",
      callMode: "immediate",
      agentPersona: personaKey || "praneeth_assist",
      dealProbability: 50,
      dealStatus: "interested",
      scheduledAt: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      updatedAtMs: Date.now(),
    };

    const callRef = await db.collection("calls").add(callData);
    const callId = callRef.id;

    const recipient = process.env.ADMIN_NOTIFICATION_EMAIL || "praneeth@growstack.ai";
    let meetLink: string | null = null;

    try {
      const leadDoc = await db.collection("leads").doc(leadId).get();
      const lead = decryptLead(leadDoc.data()) as LeadRecord | undefined;
      const companyName = lead?.companyName || "a prospect";

      const start = new Date();
      const end = new Date(start.getTime() + 30 * 60 * 1000);
      const title = `Immediate Call — ${companyName} x Dealflow.ai`;
      const descriptionHtml = [
        `<p><strong>Immediate Call</strong></p>`,
        `<p>Call ID: <strong>${callId}</strong></p>`,
        `<p>Join link will be active at the scheduled start time.</p>`,
      ].join("");

      const created = await createGoogleMeetLink({
        title,
        descriptionHtml,
        start,
        end,
      });

      meetLink = created.meetLink;

      await callRef.update({
        meetingUrl: meetLink,
        meetingProvider: "google_meet",
        meetingEventId: created.eventId,
        meetingCreatedAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        updatedAtMs: Date.now(),
      });

      if (meetLink) {
        void ensureBotForCall({
          callId,
          meetingUrl: meetLink,
          personaKey: personaKey || "praneeth_assist",
          forceJoinNow: true,
          reason: "immediate_call_created",
        });
      }

      void (async () => {
        try {
          const emailBody = [
            `<p>Hi Praneeth,</p>`,
            `<p>An <strong>Immediate Call</strong> has been created.</p>`,
            `<p><strong>Title:</strong> ${title}</p>`,
            `<p><strong>Date/Time:</strong> ${start.toLocaleString()}</p>`,
            `<p><strong>Join:</strong> <a href="${meetLink}">${meetLink}</a></p>`,
            `<p><strong>Instructions:</strong> Click the link to join. The AI session is active in-app using Call ID <strong>${callId}</strong>.</p>`,
          ].join("");

          await sendEmailWithRetry({
            to: recipient,
            subject: `Immediate Call Link — ${companyName}`,
            body: emailBody,
          });

          await callRef.update({
            meetingEmailTo: recipient,
            meetingEmailSentAt: new Date().toISOString(),
            meetingEmailStatus: "sent",
            updatedAt: new Date().toISOString(),
            updatedAtMs: Date.now(),
          });

          await db.collection("audit_logs").add({
            type: "immediate_call_meeting_link",
            callId,
            leadId,
            analysisId,
            provider: "google_meet",
            status: "sent",
            recipient,
            meetLink,
            createdAt: new Date().toISOString(),
          });
        } catch (e: any) {
          await callRef.update({
            meetingEmailTo: recipient,
            meetingEmailStatus: "failed",
            meetingEmailError: e?.message || "failed",
            updatedAt: new Date().toISOString(),
            updatedAtMs: Date.now(),
          });
          await db.collection("audit_logs").add({
            type: "immediate_call_meeting_link",
            callId,
            leadId,
            analysisId,
            provider: "google_meet",
            status: "failed",
            recipient,
            error: e?.message || "failed",
            createdAt: new Date().toISOString(),
          });
        }
      })();
    } catch (e: any) {
      const msg = e?.message || "google_meet_create_failed";
      const isCalendarNotEnabled =
        msg.includes("Google Calendar API has not been used") ||
        msg.includes("API has not been enabled") ||
        msg.includes("accessNotConfigured") ||
        msg.includes("Google credentials missing") ||
        msg.includes("Unable to detect a Project Id") ||
        msg.includes("Could not load the default credentials") ||
        msg.includes("GOOGLE_CALENDAR_ID");

      await callRef.update({
        status: "failed",
        error: msg,
        updatedAt: new Date().toISOString(),
        updatedAtMs: Date.now(),
      });
      await db.collection("audit_logs").add({
        type: "immediate_call_meeting_link",
        callId,
        leadId,
        analysisId,
        provider: "google_meet",
        status: "failed",
        recipient,
        error: msg,
        createdAt: new Date().toISOString(),
      });

      const status = isCalendarNotEnabled ? 503 : 500;
      return NextResponse.json(
        {
          success: false,
          available: false,
          error: isCalendarNotEnabled
            ? "Google Calendar API is not configured for this project. Enable it at https://console.cloud.google.com/apis/library/calendar-json.googleapis.com and ensure GOOGLE_CALENDAR_ID is set in .env.local."
            : msg,
          details: isCalendarNotEnabled ? undefined : msg,
        },
        { status }
      );
    }

    return NextResponse.json({
      success: true,
      available: true,
      callId,
      meetingUrl: meetLink,
    });
  } catch (error: any) {
    console.error("Error creating immediate call:", error.message);
    const sa = loadServiceAccount();
    const isCredentialsError = 
      !sa || 
      error.message?.includes("Google credentials missing") || 
      error.message?.includes("Unable to detect a Project Id") ||
      error.message?.includes("Could not load the default credentials");

    if (isCredentialsError) {
      return NextResponse.json(
        {
          success: false,
          error: "Firebase/Google Service Account credentials are missing or misconfigured.",
          message: error.message,
          instructions: {
            title: "How to configure Firebase Service Account Credentials",
            steps: [
              "1. Go to the Firebase Console: https://console.firebase.google.com/",
              "2. Select your project: dealflow-ai-651cb",
              "3. Navigate to Project Settings > Service Accounts.",
              "4. Click 'Generate new private key' and download the JSON file.",
              "5. Save the downloaded JSON file to your project root folder as 'service-account.json'. (Do not overwrite your existing 'firebase.json' hosting configuration file).",
              "6. Open your .env.local file and update FIREBASE_SERVICE_ACCOUNT_PATH to point to it: FIREBASE_SERVICE_ACCOUNT_PATH=./service-account.json"
            ]
          }
        },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { success: false, error: "Failed to create immediate call", message: error.message },
      { status: 500 }
    );
  }
}
