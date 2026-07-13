import * as cheerio from "cheerio";

export interface ScraplingResult {
  url: string;
  title: string;
  metaDescription: string;
  cleanedText: string;
  links: string[];
  extractedMetadata: Record<string, string>;
}

export class ScraplingCrawler {
  /**
   * Crawls a prospect website, cleans noise elements, and extracts structured text.
   */
  static async crawl(url: string): Promise<ScraplingResult> {
    const targetUrl = url.startsWith("http") ? url : `https://${url}`;
    
    try {
      const response = await fetch(targetUrl, {
        headers: {
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
          "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to crawl URL: ${response.status} ${response.statusText}`);
      }

      const html = await response.text();
      const $ = cheerio.load(html);

      // Clean noise elements
      $("script, style, svg, nav, footer, header, iframe, noscript, [role='banner'], [role='contentinfo']").remove();

      const title = $("title").text().trim() || "";
      const metaDescription = 
        $('meta[name="description"]').attr("content")?.trim() || 
        $('meta[property="og:description"]').attr("content")?.trim() || 
        "";

      // Process links
      const links: string[] = [];
      $("a").each((_, el) => {
        const href = $(el).attr("href");
        if (href && !href.startsWith("#") && !href.startsWith("javascript:")) {
          try {
            links.push(new URL(href, targetUrl).href);
          } catch {
            links.push(href);
          }
        }
      });

      // Extract metadata
      const extractedMetadata: Record<string, string> = {};
      $('meta').each((_, el) => {
        const name = $(el).attr("name") || $(el).attr("property");
        const content = $(el).attr("content");
        if (name && content) {
          extractedMetadata[name] = content;
        }
      });

      // Clean formatting of text content
      const cleanedText = $("body")
        .text()
        .replace(/\s+/g, " ")
        .replace(/\n+/g, " ")
        .trim();

      return {
        url: targetUrl,
        title,
        metaDescription,
        cleanedText: cleanedText.substring(0, 12000), // Limit payload length
        links: Array.from(new Set(links)).slice(0, 20),
        extractedMetadata,
      };
    } catch (error) {
      console.error(`[ScraplingCrawler] Error crawling ${targetUrl}:`, error);
      return {
        url: targetUrl,
        title: "",
        metaDescription: "",
        cleanedText: `Unable to extract content. Error: ${error instanceof Error ? error.message : String(error)}`,
        links: [],
        extractedMetadata: {},
      };
    }
  }

  /**
   * Processes the raw customer intake form details and transforms them into a structured context.
   */
  static processIntakeForm(formData: Record<string, any>): Record<string, any> {
    return {
      companyName: formData.companyName || "Unknown Company",
      websiteUrl: formData.websiteUrl || "",
      contactName: formData.name || "",
      contactEmail: formData.emailPersonal || "",
      caseStudies: formData.caseStudies || "",
      certifications: formData.certifications || [],
      brandTrust: formData.trustFactors || "",
      positioning: {
        socialPlatforms: formData.socialPlatforms || [],
        publishingFrequency: formData.publishingFrequency || "",
        offerPromise: formData.offerPromise || "",
        irresistibleHook: formData.irresistibleHook || "",
        painPoint: formData.painPoint || "",
      },
      offer: {
        riskReversal: formData.riskReversal || [],
        timeToStart: formData.timeToStart || "",
        primaryCta: formData.primaryCta || "",
        minimumAsset: formData.minimumAsset || [],
        objectionsHandling: formData.objectionsHandling || "",
        emailSequenceThemes: formData.emailSequenceThemes || "",
        giftCard: formData.giftCard || "",
      },
      icp: {
        description: formData.icpDescription || "",
        targetIndustries: formData.targetIndustries || [],
        targetCompanySizes: formData.targetCompanySizes || [],
        targetGeographicRegionsText: formData.targetGeographicRegionsText || "",
        decisionMakers: formData.decisionMakers || [],
        buyingTriggers: formData.buyingTriggers || [],
      },
      techStack: formData.currentTools || [],
      additionalNotes: formData.additionalNotes || "",
    };
  }
}
