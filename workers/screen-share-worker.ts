#!/usr/bin/env tsx
import http from 'http';
import express, { Request, Response, NextFunction } from 'express';
import { chromium, Browser, Page, BrowserContext } from 'playwright';
import { z } from 'zod';
import { ScreenSession } from '../lib/types';
import os from 'os';
import fs from 'fs';
import path from 'path';

// --- Configuration & Validation Schemas ---
const NavigateRequestSchema = z.object({
  callId: z.string().min(1, "callId is required"),
  url: z.string().url("Valid URL is required"),
});

const PORT = process.env.PORT || 3001;
const SESSION_TIMEOUT = 30 * 60 * 1000; // 30 minutes
const SCREENSHOT_FORMAT = process.env.SCREENSHOT_FORMAT || 'png'; // 'png' | 'jpeg'
const MAX_RETRIES = 3;
const RETRY_DELAY = 1000;

// --- Session Management ---
interface SessionData {
  browser: Browser;
  context: BrowserContext;
  page: Page;
  lastActive: number;
  callId: string;
}

const sessions: Map<string, SessionData> = new Map();

// --- Logging Utility ---
function log(message: string, level: 'info' | 'warn' | 'error' | 'debug' = 'info') {
  const timestamp = new Date().toISOString();
  console[level](`[${timestamp}] [ScreenShareWorker] [${level.toUpperCase()}] ${message}`);
}

// --- Browser Configuration ---
async function launchBrowser(): Promise<Browser> {
  log('Launching headless browser...');
  const launchOptions = {
    headless: true,
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-gpu',
      '--window-size=1920,1080',
      '--disable-software-rasterizer',
    ],
  };
  
  // Use chromium, but check if available
  try {
    const browser = await chromium.launch(launchOptions);
    log('Browser launched successfully');
    return browser;
  } catch (error: any) {
    log(`Failed to launch browser: ${error.message}`, 'error');
    throw new Error(`Browser launch failed: ${error.message}`);
  }
}

async function getOrCreateSession(callId: string): Promise<SessionData> {
  // Check if session exists
  const existingSession = sessions.get(callId);
  if (existingSession) {
    existingSession.lastActive = Date.now();
    log(`Reusing existing session for call ${callId}`);
    return existingSession;
  }

  // Create new session
  log(`Creating new session for call ${callId}`);
  const browser = await launchBrowser();
  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 },
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  });
  const page = await context.newPage();
  
  // Handle page errors
  page.on('pageerror', (err) => {
    log(`Page error for call ${callId}: ${err.message}`, 'warn');
  });
  page.on('crash', () => {
    log(`Page crashed for call ${callId}`, 'error');
  });
  page.on('console', (msg) => {
    log(`[Call ${callId} Page Console] [${msg.type()}] ${msg.text()}`, 'debug');
  });

  const session: SessionData = {
    browser,
    context,
    page,
    lastActive: Date.now(),
    callId,
  };

  sessions.set(callId, session);
  return session;
}

async function closeSession(callId: string): Promise<void> {
  const session = sessions.get(callId);
  if (!session) {
    log(`No session found for call ${callId} to close`, 'warn');
    return;
  }

  log(`Closing session for call ${callId}`);
  try {
    await session.page.close();
    await session.context.close();
    await session.browser.close();
  } catch (error: any) {
    log(`Error closing session for call ${callId}: ${error.message}`, 'error');
  } finally {
    sessions.delete(callId);
    log(`Session ${callId} closed and removed`);
  }
}

// --- Cleanup Stale Sessions ---
setInterval(() => {
  const now = Date.now();
  const staleCallIds: string[] = [];
  
  for (const [callId, session] of sessions.entries()) {
    if (now - session.lastActive > SESSION_TIMEOUT) {
      staleCallIds.push(callId);
    }
  }
  
  staleCallIds.forEach(closeSession);
}, 5 * 60 * 1000); // Check every 5 minutes

// --- Express App Setup ---
const app = express();
app.use(express.json({ limit: '10mb' }));

// --- CORS Middleware ---
app.use((req: Request, res: Response, next: NextFunction) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') {
    return res.sendStatus(204);
  }
  next();
});

// --- Health Check Endpoint ---
app.get('/health', (req: Request, res: Response) => {
  res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    platform: os.platform(),
    arch: os.arch(),
    nodeVersion: process.version,
    activeSessions: sessions.size,
  });
});

// --- Navigate Endpoint ---
app.post('/navigate', async (req: Request, res: Response) => {
  try {
    const validated = NavigateRequestSchema.safeParse(req.body);
    if (!validated.success) {
      return res.status(400).json({
        success: false,
        error: 'Invalid request body',
        details: validated.error.format(),
      });
    }

    const { callId, url } = validated.data;
    const session = await getOrCreateSession(callId);
    
    log(`Navigating call ${callId} to ${url}`);
    await session.page.goto(url, {
      waitUntil: 'networkidle',
      timeout: 30000,
    });
    
    res.status(200).json({
      success: true,
      callId,
      navigatedTo: url,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    log(`Navigation failed: ${error.message}`, 'error');
    res.status(500).json({
      success: false,
      error: 'Navigation failed',
      message: error.message,
    });
  }
});

// --- Screenshot Endpoint ---
app.get('/screenshot/:callId', async (req: Request, res: Response) => {
  try {
    const { callId } = req.params;
    const session = sessions.get(callId);
    
    if (!session) {
      return res.status(404).json({
        success: false,
        error: 'Session not found',
      });
    }
    
    session.lastActive = Date.now();
    const screenshot = await session.page.screenshot({
      type: SCREENSHOT_FORMAT as 'png' | 'jpeg',
      quality: SCREENSHOT_FORMAT === 'jpeg' ? 80 : undefined,
      fullPage: false,
    });
    
    const base64Screenshot = screenshot.toString('base64');
    const mimeType = SCREENSHOT_FORMAT === 'jpeg' ? 'image/jpeg' : 'image/png';
    
    res.status(200).json({
      success: true,
      callId,
      screenshot: `data:${mimeType};base64,${base64Screenshot}`,
      format: SCREENSHOT_FORMAT,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    log(`Screenshot failed: ${error.message}`, 'error');
    res.status(500).json({
      success: false,
      error: 'Failed to capture screenshot',
      message: error.message,
    });
  }
});

// --- Display Endpoint (Simple HTML) ---
app.get('/display/:callId', async (req: Request, res: Response) => {
  const { callId } = req.params;
  try {
    await getOrCreateSession(callId); // Ensure session exists
    res.send(`
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Screen Share - Call ${callId}</title>
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { font-family: system-ui, -apple-system, sans-serif; background: #0f172a; color: white; height: 100vh; display: flex; flex-direction: column; }
          header { padding: 1rem; background: #1e293b; border-bottom: 1px solid #334155; }
          main { flex: 1; display: flex; align-items: center; justify-content: center; }
          .status { padding: 0.5rem 1rem; background: #16a34a; border-radius: 0.5rem; }
        </style>
      </head>
      <body>
        <header>
          <h1>Screen Share Active: Call ${callId}</h1>
          <div class="status">Connected at ${new Date().toLocaleTimeString()}</div>
        </header>
        <main>
          <p>Screen share session is active. Use API endpoints for control.</p>
        </main>
      </body>
      </html>
    `);
  } catch (error: any) {
    log(`Display endpoint failed: ${error.message}`, 'error');
    res.status(500).send(`Error: ${error.message}`);
  }
});

// --- Delete Session Endpoint ---
app.delete('/session/:callId', async (req: Request, res: Response) => {
  const { callId } = req.params;
  try {
    await closeSession(callId);
    res.status(200).json({
      success: true,
      message: `Session ${callId} closed`,
    });
  } catch (error: any) {
    log(`Session close failed: ${error.message}`, 'error');
    res.status(500).json({
      success: false,
      error: 'Failed to close session',
      message: error.message,
    });
  }
});

// --- Error Handling ---
app.use((error: any, req: Request, res: Response, next: NextFunction) => {
  log(`Unhandled error: ${error.message}`, 'error');
  res.status(500).json({
    success: false,
    error: 'Internal server error',
  });
});

// --- Start Server ---
const server = http.createServer(app);

// Graceful shutdown
process.on('SIGTERM', async () => {
  log('Received SIGTERM, shutting down gracefully...');
  await Promise.all(Array.from(sessions.keys()).map(closeSession));
  server.close(() => {
    log('Server closed');
    process.exit(0);
  });
});

process.on('SIGINT', async () => {
  log('Received SIGINT, shutting down gracefully...');
  await Promise.all(Array.from(sessions.keys()).map(closeSession));
  server.close(() => {
    log('Server closed');
    process.exit(0);
  });
});

server.listen(PORT, () => {
  log(`Screen share worker running on port ${PORT}`);
  log(`Health check: http://localhost:${PORT}/health`);
});
