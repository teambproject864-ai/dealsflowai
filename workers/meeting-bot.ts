#!/usr/bin/env tsx
import { z } from 'zod';
import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore, Firestore } from 'firebase-admin/firestore';
import { CallRecord } from '../lib/types';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

// --- Configuration ---
const FIREBASE_SERVICE_ACCOUNT_PATH = process.env.FIREBASE_SERVICE_ACCOUNT_PATH || './dealflow_firebase.json';
const RECALL_REGION = process.env.RECALL_REGION || 'us-east-1';
const HEARTBEAT_INTERVAL = 30000; // 30 seconds
const MEETING_CHECK_INTERVAL = 60000; // 1 minute
const MAX_RETRY_ATTEMPTS = 3;
const RETRY_INTERVAL_MS = 60000; // 1 minute

// --- Encryption for Compliance ---
const ENCRYPTION_KEY = process.env.MEETING_ENCRYPTION_KEY;
const ALGORITHM = 'aes-256-gcm';

function encryptData(data: string): string {
  if (!ENCRYPTION_KEY) return data;
  const iv = crypto.randomBytes(16);
  const key = Buffer.from(ENCRYPTION_KEY, 'hex');
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);
  let encrypted = cipher.update(data, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  const authTag = cipher.getAuthTag();
  return `${iv.toString('hex')}:${authTag.toString('hex')}:${encrypted}`;
}

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

type BotStatus = 'idle' | 'joining' | 'in_meeting' | 'leaving' | 'error' | 'reconnecting';

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
  retryAttempts: number;
  botId?: string;
  conversationHistory: string[];
  buyingSignals: string[];
  dealClosed: boolean;
}

const activeSessions: Map<string, BotSession> = new Map();

// --- Metrics Collection ---
interface BotMetrics {
  totalMeetings: number;
  successfulJoins: number;
  failedJoins: number;
  dealClosures: number;
  averageJoinTimeMs: number;
  totalConversationSegments: number;
}

const metrics: BotMetrics = {
  totalMeetings: 0,
  successfulJoins: 0,
  failedJoins: 0,
  dealClosures: 0,
  averageJoinTimeMs: 0,
  totalConversationSegments: 0,
};

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

// --- Retry Utility ---
async function withRetry<T>(
  fn: () => Promise<T>,
  maxRetries: number = MAX_RETRY_ATTEMPTS,
  retryInterval: number = RETRY_INTERVAL_MS
): Promise<T> {
  let lastError: Error | null = null;
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      log(`Attempt ${attempt}/${maxRetries}...`);
      return await fn();
    } catch (error: any) {
      lastError = error;
      log(`Attempt ${attempt} failed: ${error.message}`, 'warn');
      
      if (attempt < maxRetries) {
        log(`Retrying in ${retryInterval / 1000} seconds...`);
        await new Promise(resolve => setTimeout(resolve, retryInterval));
      }
    }
  }
  
  throw lastError || new Error('All retry attempts failed');
}

// --- Recall.ai Integration ---
async function joinMeetingWithRecall(
  callId: string,
  meetingUrl: string
): Promise<{ success: boolean; botId?: string; error?: string }> {
  try {
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

// --- Conversational AI ---
async function generateAIResponse(session: BotSession, userInput: string): Promise<string> {
  try {
    // This is a placeholder for actual LLM integration (uses existing API routes)
    log(`Generating AI response for user input: ${userInput.substring(0, 50)}...`);
    
    // Add to conversation history
    session.conversationHistory.push(`User: ${userInput}`);
    
    // Simple rule-based responses for sales scenarios
    let response = "Thank you for your question. Let's discuss how we can help you achieve your goals.";
    
    const lowerInput = userInput.toLowerCase();
    if (lowerInput.includes('price') || lowerInput.includes('cost')) {
      response = "Our pricing is competitive and tailored to your specific needs. Let me share our detailed pricing document with you.";
    } else if (lowerInput.includes('interested') || lowerInput.includes('yes')) {
      response = "Great to hear! Let's proceed with formalizing our agreement. I'll share the contract with you right away.";
      session.buyingSignals.push('expressed interest');
    } else if (lowerInput.includes('concern') || lowerInput.includes('worry')) {
      response = "I understand your concern. Let's address that and find the best solution for you.";
    }
    
    session.conversationHistory.push(`AI: ${response}`);
    return response;
  } catch (error: any) {
    log(`Failed to generate AI response: ${error.message}`, 'error');
    return "Let's continue our conversation.";
  }
}

// --- Deal Closure ---
async function processDealClosure(session: BotSession): Promise<void> {
  log(`Processing deal closure for call ${session.callId}...`);
  session.dealClosed = true;
  metrics.dealClosures += 1;
  
  // Log in CRM (Firestore)
  if (db) {
    try {
      await db.collection('deals').add({
        callId: session.callId,
        status: 'closed',
        closedAt: new Date().toISOString(),
        meetingUrl: encryptData(session.meetingUrl),
        conversationHistory: session.conversationHistory.map(encryptData),
      });
      log(`Deal successfully logged in CRM for call ${session.callId}`);
    } catch (error: any) {
      log(`Failed to log deal in CRM: ${error.message}`, 'error');
    }
  }
  
  // Trigger post-meeting follow-up
  await triggerPostMeetingFollowup(session);
}

// --- Post-meeting Followup ---
async function triggerPostMeetingFollowup(session: BotSession): Promise<void> {
  try {
    log(`Triggering post-meeting follow-up for call ${session.callId}...`);
    
    // Simulate sending summary email (uses existing notification API)
    // In production, this would call /api/notifications/post-call
    const summary = `
Meeting Summary for Call ${session.callId}:
- Date: ${new Date().toLocaleDateString()}
- Deal Closed: ${session.dealClosed ? 'Yes' : 'No'}
- Key Buying Signals: ${session.buyingSignals.join(', ')}
- Conversation Segments: ${session.transcriptSegments.length}
    `;
    
    log(`Post-meeting summary generated:\n${summary}`);
    
    // Log audit event
    if (db) {
      await db.collection('audit_logs').add({
        action: 'post_meeting_followup_sent',
        callId: session.callId,
        timestamp: new Date().toISOString(),
      });
    }
  } catch (error: any) {
    log(`Failed to trigger post-meeting follow-up: ${error.message}`, 'error');
  }
}

// --- Bot Functions ---
async function startBot(callId: string, meetingUrl: string): Promise<BotSession> {
  log(`Starting bot for call ${callId}...`);
  metrics.totalMeetings += 1;
  const startTime = Date.now();

  const session: BotSession = {
    callId,
    meetingUrl,
    status: 'joining',
    lastHeartbeat: Date.now(),
    participants: [],
    transcriptSegments: [],
    retryAttempts: 0,
    conversationHistory: [],
    buyingSignals: [],
    dealClosed: false,
  };

  activeSessions.set(callId, session);

  // Attempt to join the meeting with retries
  try {
    const joinResult = await withRetry(async () => {
      const result = await joinMeetingWithRecall(callId, meetingUrl);
      if (!result.success) throw new Error(result.error);
      return result;
    });
    
    session.status = 'in_meeting';
    session.joinedAt = new Date().toISOString();
    session.botId = joinResult.botId;
    metrics.successfulJoins += 1;
    metrics.averageJoinTimeMs = (metrics.averageJoinTimeMs * (metrics.successfulJoins - 1) + (Date.now() - startTime)) / metrics.successfulJoins;
    log(`Bot successfully joined meeting for call ${callId}`);
    
    // Send initial greeting
    await generateAIResponse(session, '');
    
  } catch (error: any) {
    session.status = 'error';
    session.error = error.message;
    session.retryAttempts = MAX_RETRY_ATTEMPTS;
    metrics.failedJoins += 1;
    log(`Bot failed to join meeting for call ${callId}: ${error.message}`, 'error');
    return session;
  }

  // Update Firestore if available
  if (db) {
    try {
      await db.collection('calls').doc(callId).update({
        status: 'in-progress',
        recallBotId: session.botId,
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

async function reconnectBot(callId: string): Promise<void> {
  const session = activeSessions.get(callId);
  if (!session) return;
  
  log(`Attempting to reconnect bot for call ${callId}...`);
  session.status = 'reconnecting';
  
  try {
    const joinResult = await joinMeetingWithRecall(callId, session.meetingUrl);
    if (joinResult.success) {
      session.status = 'in_meeting';
      session.botId = joinResult.botId;
      log(`Bot reconnected successfully for call ${callId}`);
    }
  } catch (error: any) {
    log(`Reconnection failed: ${error.message}`, 'error');
    session.status = 'error';
  }
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
          metrics: {
            ...metrics,
            currentConversationSegments: session.conversationHistory.length,
          },
        }).catch(err => {
          log(`Failed to update heartbeat: ${err.message}`, 'debug');
        });
      }
    } else if (session.status === 'error' && session.retryAttempts < MAX_RETRY_ATTEMPTS) {
      reconnectBot(callId);
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
