// lib/image-curator.ts
export interface CuratedImage {
  id: string;
  url: string;
  altText: string;
  caption: string;
  category: string;
  aspectRatio: "16:9" | "1:1" | "4:3" | "1.91:1";
  dimensions: { width: number; height: number };
}

export class ImageCurator {
  private static IMAGE_CATALOG: Record<string, CuratedImage[]> = {
    written_content: [
      {
        id: "img-blog-hero",
        url: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?q=80&w=1200&auto=format&fit=crop",
        altText: "B2B SaaS Growth Analytics Dashboard",
        caption: "Figure 1: Strategic B2B Revenue Intelligence & Funnel Analytics Dashboard",
        category: "written_content",
        aspectRatio: "16:9",
        dimensions: { width: 1200, height: 675 }
      },
      {
        id: "img-blog-framework",
        url: "https://images.unsplash.com/photo-1551836022-d5d88e9218df?q=80&w=1200&auto=format&fit=crop",
        altText: "Executive Team Strategy Workshop",
        caption: "Figure 2: Multi-Stakeholder Executive Strategy Alignment & Workflow Optimization",
        category: "written_content",
        aspectRatio: "16:9",
        dimensions: { width: 1200, height: 675 }
      }
    ],
    social_media_content: [
      {
        id: "img-social-card",
        url: "https://images.unsplash.com/photo-1557804506-669a67965ba0?q=80&w=800&auto=format&fit=crop",
        altText: "LinkedIn Executive Leadership Card",
        caption: "Visual Highlight: Key Account Acceleration & Executive Growth Playbook",
        category: "social_media_content",
        aspectRatio: "1:1",
        dimensions: { width: 800, height: 800 }
      }
    ],
    outreach_tactics: [
      {
        id: "img-outreach-email",
        url: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?q=80&w=1200&auto=format&fit=crop",
        altText: "High-Converting Account Outreach Strategy",
        caption: "Campaign Asset: Personalized Account Prospecting & Multi-Touch Sequence Map",
        category: "outreach_tactics",
        aspectRatio: "16:9",
        dimensions: { width: 1200, height: 675 }
      }
    ],
    paid_marketing_tactics: [
      {
        id: "img-paid-ad",
        url: "https://images.unsplash.com/photo-1533750349088-cd871a92f312?q=80&w=1200&auto=format&fit=crop",
        altText: "High-Intent Paid Acquisition & Ad Banner",
        caption: "Ad Creative: Conversion-Optimized Enterprise SaaS Search & Social Ad Banner",
        category: "paid_marketing_tactics",
        aspectRatio: "1.91:1",
        dimensions: { width: 1200, height: 628 }
      }
    ]
  };

  /**
   * Selects relevant curated image for a deliverable category & topic
   */
  public static selectImage(categoryKey: string, topicKeyword: string = ""): CuratedImage {
    const list = this.IMAGE_CATALOG[categoryKey] || this.IMAGE_CATALOG.written_content;
    const selected = list[Math.floor(Math.random() * list.length)];
    
    if (topicKeyword) {
      return {
        ...selected,
        caption: `${selected.caption} — Focus Area: ${topicKeyword}`,
        altText: `${selected.altText} (${topicKeyword})`
      };
    }
    return selected;
  }

  /**
   * Generates formatted Markdown image embed code
   */
  public static generateMarkdownEmbed(image: CuratedImage): string {
    return `\n\n![${image.altText}](${image.url})\n*${image.caption}*\n\n`;
  }
}
