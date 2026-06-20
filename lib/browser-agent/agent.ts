import { chromium, Browser, Page, BrowserContext } from "playwright";
import * as cheerio from "cheerio";
import {
  createOkfDocument,
  addOkfEntity,
  OkfDocument,
} from "../okf";
import { getLiquidAIClient } from "../liquid-ai";

/**
 * Browser Agent Configuration
 */
export interface BrowserAgentConfig {
  headless?: boolean;
  userAgent?: string;
  viewport?: { width: number; height: number };
}

/**
 * Browser Task
 */
export interface BrowserTask {
  id: string;
  url: string;
  actions: BrowserAction[];
  collectKnowledge?: boolean;
}

/**
 * Browser Action Types
 */
export type BrowserAction =
  | { type: "navigate"; url: string }
  | { type: "click"; selector: string }
  | { type: "fill"; selector: string; value: string }
  | { type: "wait"; selector?: string; timeout?: number }
  | { type: "screenshot"; path?: string }
  | { type: "scroll"; direction: "up" | "down" | "to"; selector?: string; pixels?: number };

/**
 * Autonomous Browser Agent
 */
export class BrowserAgent {
  private browser: Browser | null = null;
  private context: BrowserContext | null = null;
  private page: Page | null = null;
  private config: BrowserAgentConfig;

  constructor(config?: BrowserAgentConfig) {
    this.config = {
      headless: true,
      userAgent:
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      viewport: { width: 1280, height: 720 },
      ...config,
    };
  }

  /**
   * Initialize the browser
   */
  async initialize(): Promise<void> {
    this.browser = await chromium.launch({
      headless: this.config.headless,
    });
    this.context = await this.browser.newContext({
      userAgent: this.config.userAgent,
      viewport: this.config.viewport,
    });
    this.page = await this.context.newPage();
  }

  /**
   * Execute a browser task
   */
  async executeTask(task: BrowserTask): Promise<{
    success: boolean;
    knowledge?: OkfDocument;
    screenshots?: string[];
    error?: string;
  }> {
    if (!this.page) {
      throw new Error("Browser not initialized. Call initialize() first.");
    }

    try {
      // Navigate to initial URL
      await this.page.goto(task.url, { waitUntil: "networkidle" });

      // Execute actions
      for (const action of task.actions) {
        await this.executeAction(action);
      }

      // Collect knowledge if requested
      let knowledge: OkfDocument | undefined;
      if (task.collectKnowledge) {
        knowledge = await this.collectKnowledge(task.url);
      }

      return { success: true, knowledge };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  /**
   * Execute a single browser action
   */
  private async executeAction(action: BrowserAction): Promise<void> {
    if (!this.page) return;

    switch (action.type) {
      case "navigate":
        await this.page.goto(action.url, { waitUntil: "networkidle" });
        break;

      case "click":
        await this.page.click(action.selector);
        break;

      case "fill":
        await this.page.fill(action.selector, action.value);
        break;

      case "wait":
        if (action.selector) {
          await this.page.waitForSelector(action.selector, {
            timeout: action.timeout || 30000,
          });
        } else {
          await this.page.waitForTimeout(action.timeout || 1000);
        }
        break;

      case "screenshot":
        await this.page.screenshot({
          path: action.path || `screenshot-${Date.now()}.png`,
        });
        break;

      case "scroll":
        if (action.direction === "down") {
          await this.page.evaluate((pixels) => {
            window.scrollBy(0, pixels || 500);
          }, action.pixels);
        } else if (action.direction === "up") {
          await this.page.evaluate((pixels) => {
            window.scrollBy(0, -(pixels || 500));
          }, action.pixels);
        } else if (action.direction === "to" && action.selector) {
          await this.page.locator(action.selector).scrollIntoViewIfNeeded();
        }
        break;
    }
  }

  /**
   * Collect knowledge from the current page and store in OKF format
   */
  private async collectKnowledge(sourceUrl: string): Promise<OkfDocument> {
    if (!this.page) {
      throw new Error("Browser not initialized.");
    }

    const html = await this.page.content();
    const $ = cheerio.load(html);

    // Create OKF document
    let doc = createOkfDocument({
      title: $("title").text() || "Untitled Page",
      description: $('meta[name="description"]').attr("content"),
      domain: new URL(sourceUrl).hostname,
      source: sourceUrl,
    });

    // Extract text content
    const textContent = $("body").text().replace(/\s+/g, " ").trim();

    // Add text entity
    doc = addOkfEntity(doc, {
      type: "WebPageContent",
      properties: {
        url: sourceUrl,
        title: $("title").text(),
        text: textContent,
      },
      metadata: {
        source: sourceUrl,
      },
    });

    // Extract links
    const links: string[] = [];
    $("a[href]").each((_, el) => {
      const href = $(el).attr("href");
      if (href) {
        try {
          const absoluteUrl = new URL(href, sourceUrl).toString();
          links.push(absoluteUrl);
        } catch {
          // Ignore invalid URLs
        }
      }
    });

    if (links.length > 0) {
      doc = addOkfEntity(doc, {
        type: "WebPageLinks",
        properties: {
          url: sourceUrl,
          links: links.slice(0, 100), // Limit to 100 links
        },
        metadata: {
          source: sourceUrl,
        },
      });
    }

    // Generate embeddings for content
    try {
      const liquidAI = getLiquidAIClient();
      const embeddingResult = await liquidAI.generateEmbeddings([textContent]);
      doc = addOkfEntity(doc, {
        type: "ContentEmbedding",
        properties: {
          url: sourceUrl,
          embedding: embeddingResult.embeddings[0],
          model: embeddingResult.model,
        },
      });
    } catch (error) {
      console.warn("Failed to generate embeddings:", error);
    }

    return doc;
  }

  /**
   * Close the browser
   */
  async close(): Promise<void> {
    if (this.page) await this.page.close();
    if (this.context) await this.context.close();
    if (this.browser) await this.browser.close();
    this.browser = null;
    this.context = null;
    this.page = null;
  }
}
