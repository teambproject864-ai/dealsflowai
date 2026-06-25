import { v4 as uuidv4 } from "uuid";

// Define a type for LLM job tracking
export interface LLMJob {
  jobId: string;
  analysisId?: string;
  provider: string;
  model: string;
  startTime: number;
  status: "running" | "completed" | "failed" | "terminated";
  endTime?: number;
  abortController?: AbortController;
}

// In-memory store for active LLM jobs
const activeLLMJobs = new Map<string, LLMJob>();

// Log storage for LLM start/stop events
const llmEventLogs: Array<{
  timestamp: number;
  eventType: "start" | "stop" | "terminate";
  jobId: string;
  analysisId?: string;
  provider: string;
  model: string;
  details?: string;
}> = [];

/**
 * Start tracking a new LLM job
 */
export function startLLMJob(
  provider: string,
  model: string,
  analysisId?: string,
  abortController?: AbortController
): string {
  const jobId = uuidv4();
  const job: LLMJob = {
    jobId,
    analysisId,
    provider,
    model,
    startTime: Date.now(),
    status: "running",
    abortController,
  };
  activeLLMJobs.set(jobId, job);
  
  // Log the start event
  llmEventLogs.push({
    timestamp: Date.now(),
    eventType: "start",
    jobId,
    analysisId,
    provider,
    model,
    details: "LLM job started",
  });
  
  console.log(`[LLM Job Tracker] Started job ${jobId} (${provider}/${model}) for analysis ${analysisId}`);
  
  // Keep only last 500 logs
  if (llmEventLogs.length > 500) {
    llmEventLogs.shift();
  }
  
  return jobId;
}

/**
 * Complete an LLM job (mark as completed or failed)
 */
export function completeLLMJob(
  jobId: string,
  status: "completed" | "failed",
  details?: string
): void {
  const job = activeLLMJobs.get(jobId);
  if (!job) {
    console.warn(`[LLM Job Tracker] Job ${jobId} not found`);
    return;
  }
  
  job.status = status;
  job.endTime = Date.now();
  activeLLMJobs.delete(jobId);
  
  // Log the stop event
  llmEventLogs.push({
    timestamp: Date.now(),
    eventType: "stop",
    jobId,
    analysisId: job.analysisId,
    provider: job.provider,
    model: job.model,
    details: details || `LLM job ${status}`,
  });
  
  console.log(`[LLM Job Tracker] ${status === "completed" ? "Completed" : "Failed"} job ${jobId} (${job.provider}/${job.model}) for analysis ${job.analysisId}`);
}

/**
 * Terminate all LLM jobs associated with a specific analysis
 */
export function terminateLLMJobsForAnalysis(analysisId: string): number {
  let terminatedCount = 0;
  
  for (const [jobId, job] of activeLLMJobs.entries()) {
    if (job.analysisId === analysisId) {
      // Try to abort using abortController if available
      if (job.abortController) {
        job.abortController.abort();
        console.log(`[LLM Job Tracker] Aborted job ${jobId} via AbortController`);
      }
      
      job.status = "terminated";
      job.endTime = Date.now();
      activeLLMJobs.delete(jobId);
      terminatedCount++;
      
      // Log the terminate event
      llmEventLogs.push({
        timestamp: Date.now(),
        eventType: "terminate",
        jobId,
        analysisId,
        provider: job.provider,
        model: job.model,
        details: "LLM job terminated (analysis complete)",
      });
    }
  }
  
  console.log(`[LLM Job Tracker] Terminated ${terminatedCount} LLM jobs for analysis ${analysisId}`);
  return terminatedCount;
}

/**
 * Get all active LLM jobs
 */
export function getActiveLLMJobs(): LLMJob[] {
  return Array.from(activeLLMJobs.values());
}

/**
 * Get all LLM event logs (last 500)
 */
export function getLLMEventLogs(): typeof llmEventLogs {
  return [...llmEventLogs];
}

/**
 * Clear all stored data (for testing/reset)
 */
export function clearLLMTrackerData(): void {
  activeLLMJobs.clear();
  llmEventLogs.length = 0;
  console.log(`[LLM Job Tracker] Cleared all data`);
}
