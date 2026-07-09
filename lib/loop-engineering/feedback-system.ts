
import { FeedbackItem, LoopState } from "./types";

export class FeedbackSystem {
  private feedbackStorage: Map<string, FeedbackItem[]>;

  constructor() {
    this.feedbackStorage = new Map();
  }

  addFeedback(loopId: string, feedback: Omit<FeedbackItem, "id" | "timestamp" | "processed">): FeedbackItem {
    const newFeedback: FeedbackItem = {
      ...feedback,
      id: crypto.randomUUID(),
      timestamp: Date.now(),
      processed: false
    };

    if (!this.feedbackStorage.has(loopId)) {
      this.feedbackStorage.set(loopId, []);
    }

    const loopFeedback = this.feedbackStorage.get(loopId);
    if (loopFeedback) {
      loopFeedback.push(newFeedback);
    }

    return newFeedback;
  }

  getFeedback(loopId: string): FeedbackItem[] {
    return this.feedbackStorage.get(loopId) || [];
  }

  getUnprocessedFeedback(loopId: string): FeedbackItem[] {
    return (this.feedbackStorage.get(loopId) || []).filter(fb => !fb.processed);
  }

  processFeedback(loopId: string, feedbackId: string): void {
    const loopFeedback = this.feedbackStorage.get(loopId);
    if (loopFeedback) {
      const feedback = loopFeedback.find(fb => fb.id === feedbackId);
      if (feedback) {
        feedback.processed = true;
      }
    }
  }

  getHighPriorityFeedback(loopId: string): FeedbackItem[] {
    const priorityOrder = ["critical", "high", "medium", "low"] as const;
    return (this.feedbackStorage.get(loopId) || [])
      .sort((a, b) => priorityOrder.indexOf(a.priority) - priorityOrder.indexOf(b.priority));
  }

  async processAllFeedback(loop: LoopState): Promise<void> {
    const unprocessed = this.getUnprocessedFeedback(loop.id);
    for (const feedback of unprocessed) {
      await this.applyFeedback(loop, feedback);
      this.processFeedback(loop.id, feedback.id);
    }
  }

  private async applyFeedback(loop: LoopState, feedback: FeedbackItem): Promise<void> {
    console.log(`Applying feedback: ${feedback.content} to loop ${loop.id}`);
    // Mock feedback processing - in real system this would modify loop behavior
    await new Promise(resolve => setTimeout(resolve, 100));
  }
}

