#!/usr/bin/env tsx
import { z } from 'zod';
import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore, Firestore } from 'firebase-admin/firestore';
import { CallRecord } from '../lib/types';
import fs from 'fs';
import path from 'path';

// --- Configuration ---
const FIREBASE_SERVICE_ACCOUNT_PATH = process.env.FIREBASE_SERVICE_ACCOUNT_PATH || './dealflow_firebase.json';
const RECALL_REGION = process.env.RECALL_REGION || 'us-east-1';
const HEARTBEAT_INTERVAL = 30000; // 30 seconds
const MEETING_CHECK_INTERVAL = 60000; // 1 minute

// --- Logging Utility ---
function log(message: string, level: 'info' | 'warn' | 'error' | 'debug' = 'info') {
  const timestamp = new Date().toISOString();
  console[level](`[${timestamp}] [MeetingBot] [${level.toUpperCase()}] ${message}`);
}

// --- Validation Schemas ---
const JoinMeetingRequestSchema = z.object({
  callId: z.string().min(1),
  meetingUrl: z.string().url(),
  personaKey: z.string().optional(),
});

type BotStatus = 'idle' | 'joining' | 'in_meeting' | 'leaving' | 'error';

// --- Bot Session Management ---
interface BotSession {
  callId: string;
  meetingUrl: string;
  status: BotStatus;
  joinedAt?: string;
  leftAt?: string;
  lastHeartbeat: number;
  participants: string[];
  transcriptSegments: any[];
  error?: string;
}

const activeSessions: Map<string, BotSession> = new Map();

// --- Firebase Initialization ---
let db: Firestore | null = null;

function initializeFirebase(): Firestore | null {
  try {
    log('Initializing Firebase Admin SDK...');
    if (!fs.existsSync(FIREBASE_SERVICE_ACCOUNT_PATH)) {
      log(`Firebase service account not found at ${FIREBASE_SERVICE_ACCOUNT_PATH}`, 'warn');
      return null;
    }

    const serviceAccount = JSON.parse(
      fs.readFileSync(FIREBASE_SERVICE_ACCOUNT_PATH, 'utf8')
    );

    const app = initializeApp({
      credential: cert(serviceAccount),
    }, 'meeting-bot');

    const firestore = getFirestore(app);
    log('Firebase Admin SDK initialized successfully');
    return firestore;
  } catch (error: any) {
    log(`Failed to initialize Firebase: ${error.message}`, 'error');
    return null;
  }
}

// --- Recall.ai Integration ---
async function joinMeetingWithRecall(
  callId: string,
  meetingUrl: string
): Promise<{ success: boolean; botId?: string; error?: string }> {
  try {
    // This is a placeholder for actual Recall.ai integration
    // In production, you would call the Recall.ai API here
    log(`Attempting to join meeting ${meetingUrl} for call ${callId} (placeholder implementation)`);
    return {
      success: true,
      botId: `recall-bot-${callId}-${Date.now()}`,
    };
  } catch (error: any) {
    log(`Recall.ai join failed: ${error.message}`, 'error');
    return {
      success: false,
      error: error.message,
    };
  }
}

async function leaveMeetingWithRecall(botId: string): Promise<void> {
  try {
    log(`Leaving meeting with bot ID ${botId} (placeholder implementation)`);
  } catch (error: any) {
    log(`Failed to leave meeting: ${error.message}`, 'error');
  }
}

// --- Bot Functions ---
async function startBot(callId: string, meetingUrl: string): Promise<BotSession> {
  log(`Starting bot for call ${callId}...`);

  const session: BotSession = {
    callId,
    meetingUrl,
    status: 'joining',
    lastHeartbeat: Date.now(),
    participants: [],
    transcriptSegments: [],
  };

  activeSessions.set(callId, session);

  // Attempt to join the meeting
  const joinResult = await joinMeetingWithRecall(callId, meetingUrl);
  if (!joinResult.success) {
    session.status = 'error';
    session.error = joinResult.error;
    log(`Bot failed to join meeting for call ${callId}: ${joinResult.error}`, 'error');
    return session;
  }

  session.status = 'in_meeting';
  session.joinedAt = new Date().toISOString();
  log(`Bot successfully joined meeting for call ${callId}`);

  // Update Firestore if available
  if (db) {
    try {
      await db.collection('calls').doc(callId).update({
        status: 'in-progress',
        recallBotId: joinResult.botId,
        updatedAt: new Date().toISOString(),
        updatedAtMs: Date.now(),
      });
    } catch (error: any) {
      log(`Failed to update Firestore: ${error.message}`, 'warn');
    }
  }

  return session;
}

async function stopBot(callId: string): Promise<void> {
  const session = activeSessions.get(callId);
  if (!session) {
    log(`No active session found for call ${callId}`, 'warn');
    return;
  }

  log(`Stopping bot for call ${callId}...`);
  session.status = 'leaving';

  if (db) {
    try {
      await db.collection('calls').doc(callId).update({
        status: 'completed',
        updatedAt: new Date().toISOString(),
        updatedAtMs: Date.now(),
      });
    } catch (error: any) {
      log(`Failed to update Firestore: ${error.message}`, 'warn');
    }
  }

  session.status = 'idle';
  session.leftAt = new Date().toISOString();
  log(`Bot stopped for call ${callId}`);
}

// --- Heartbeat ---
setInterval(() => {
  const now = Date.now();
  for (const [callId, session] of activeSessions.entries()) {
    if (session.status === 'in_meeting') {
      session.lastHeartbeat = now;
      log(`Heartbeat: Bot active for call ${callId}`);
      
      // Update Firestore if available
      if (db) {
        db.collection('calls').doc(callId).update({
          lastHeartbeat: new Date().toISOString(),
        }).catch(err => {
          log(`Failed to update heartbeat: ${err.message}`, 'debug');
        });
      }
    }
  }
}, HEARTBEAT_INTERVAL);

// --- Poll Firestore for New Meetings ---
setInterval(async () => {
  if (!db) return;

  try {
    log('Checking for new scheduled meetings...');
    const now = new Date();
    const fiveMinutesFromNow = new Date(now.getTime() + 5 * 60 * 1000);

    const querySnapshot = await db
      .collection('calls')
      .where('status', '==', 'scheduled')
      .where('scheduledAt', '<=', fiveMinutesFromNow.toISOString())
      .get();

    for (const doc of querySnapshot.docs) {
      const callData = doc.data() as CallRecord;
      if (!activeSessions.has(doc.id) && callData.meetingUrl) {
        log(`Found meeting to join: ${doc.id}`);
        await startBot(doc.id, callData.meetingUrl);
      }
    }
  } catch (error: any) {
    log(`Failed to check for meetings: ${error.message}`, 'error');
  }
}, MEETING_CHECK_INTERVAL);

// --- CLI Arguments ---
function parseArgs() {
  const args = process.argv.slice(2);
  const command = args[0];

  return {
    command,
    args: args.slice(1),
  };
}

// --- Main ---
async function main() {
  log('Meeting bot worker starting...');
  
  // Initialize Firebase
  db = initializeFirebase();

  const { command, args } = parseArgs();

  switch (command) {
    case 'join': {
      if (args.length < 2) {
        console.error('Usage: tsx meeting-bot.ts join <callId> <meetingUrl>');
        process.exit(1);
      }
      const [callId, meetingUrl] = args;
      await startBot(callId, meetingUrl);
      break;
    }
    case 'leave': {
      if (args.length < 1) {
        console.error('Usage: tsx meeting-bot.ts leave <callId>');
        process.exit(1);
      }
      await stopBot(args[0]);
      break;
    }
    case 'daemon':
      log('Running in daemon mode - monitoring Firestore for meetings');
      break;
    default:
      console.log(`
Usage:
  tsx meeting-bot.ts join <callId> <meetingUrl>  - Join a specific meeting
  tsx meeting-bot.ts leave <callId>              - Leave a specific meeting
  tsx meeting-bot.ts daemon                      - Run as a background daemon monitoring Firestore
      `);
  }
}

// --- Graceful Shutdown ---
process.on('SIGTERM', async () => {
  log('Received SIGTERM, shutting down gracefully...');
  for (const callId of activeSessions.keys()) {
    await stopBot(callId);
  }
  process.exit(0);
});

process.on('SIGINT', async () => {
  log('Received SIGINT, shutting down gracefully...');
  for (const callId of activeSessions.keys()) {
    await stopBot(callId);
  }
  process.exit(0);
});

main().catch((error) => {
  log(`Fatal error: ${error}`, 'error');
  process.exit(1);
});
