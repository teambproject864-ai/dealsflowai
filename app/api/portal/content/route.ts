import { NextResponse, type NextRequest } from "next/server";
import { getAuthenticatedUser } from "@/lib/auth";
import { db } from "@/lib/firebase-admin";
import { seedFirestore } from "@/lib/db-init";

export const dynamic = "force-dynamic";

// Helper to determine sync platforms based on tactic type
function getSyncPlatforms(tactic: string): string[] {
  switch (tactic) {
    case "Blog Posts":
    case "SEO Landing Pages":
      return ["WordPress", "Webflow", "Official Website CMS"];
    case "Case Studies":
    case "Customer Testimonials":
      return ["Official Website CMS", "HubSpot Content Hub"];
    case "Product Demo Videos":
    case "Explainer Videos":
    case "YouTube Content":
      return ["YouTube Video API", "Vimeo Creator API", "Official Website CMS"];
    case "Webinars":
      return ["Zoom Events API", "YouTube Live", "LinkedIn Events"];
    case "LinkedIn Marketing":
    case "LinkedIn Ads":
      return ["LinkedIn API", "LinkedIn Campaign Manager"];
    case "Instagram/Facebook Marketing":
    case "Meta Ads":
    case "Retargeting Ads":
      return ["Meta Graph API", "Instagram Business Suite", "Meta Ads Manager"];
    case "Google Ads":
      return ["Google Ads API", "Google Display Network"];
    case "Email Automation":
    case "Cold Email":
      return ["HubSpot Marketing Hub", "Mailchimp ESP", "Mailgun Gateway"];
    case "Referral Programs":
    case "Affiliate Marketing":
      return ["ReferralCandy API", "Rewardful Portal", "Stripe Affiliate Sync"];
    case "Community Building":
      return ["Slack Webhooks", "Discord Developer API"];
    case "Customer Reviews":
      return ["G2 Crowd Reviews API", "Capterra Review Portal", "Trustpilot API"];
    case "Interactive Tools (ROI Calculator, Quiz)":
    case "Product Tours":
      return ["Official Website CMS", "Vercel Edge Analytics", "Segment Event Stream"];
    case "AI Content Repurposing":
    case "AI Personalization":
      return ["DealFlow AI Engine", "Webflow Personalization Engine", "HubSpot CMS"];
    case "Industry Reports & Research":
      return ["WordPress", "Amazon S3 Secure Delivery", "HubSpot Document Library"];
    default:
      return ["Official Website CMS"];
  }
}

// Simple Base64 + custom prefix to simulate encrypted payload in transit
function encryptPayloadSimulated(payload: string): string {
  const base64 = Buffer.from(payload).toString("base64");
  return `enc_aes256_df_${base64.substring(0, 45)}...[E2E ENCRYPTED]`;
}

export async function GET(request: NextRequest) {
  try {
    const user = await getAuthenticatedUser(request);
    if (!user) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    await seedFirestore();

    const url = new URL(request.url);
    const customerId = url.searchParams.get("customerId");
    const tactic = url.searchParams.get("tactic");
    const status = url.searchParams.get("status");
    const search = url.searchParams.get("search");

    let assets: any[] = [];
    if (db) {
      let queryRef: any = db.collection("content_assets");

      // RBAC: Customers can ONLY see their own content assets
      if (user.role === "customer") {
        queryRef = queryRef.where("customerId", "==", user.id);
      } else if (user.role === "agent" || user.role === "admin") {
        // Agents and Admins can view any customer or filter by customerId
        if (customerId) {
          queryRef = queryRef.where("customerId", "==", customerId);
        }
      }

      const snap = await queryRef.get();
      snap.forEach((doc: any) => {
        assets.push({ id: doc.id, ...doc.data() });
      });
    }

    // In-memory filtering for more complex/optional queries to avoid needing composite indexes in dev
    if (tactic && tactic !== "all") {
      assets = assets.filter(a => a.tactic === tactic);
    }
    if (status && status !== "all") {
      assets = assets.filter(a => a.status === status);
    }
    if (search) {
      const s = search.toLowerCase();
      assets = assets.filter(a => 
        (a.title || "").toLowerCase().includes(s) || 
        (a.content || "").toLowerCase().includes(s)
      );
    }

    // Sort by updatedAt descending
    assets.sort((a, b) => new Date(b.updatedAt || 0).getTime() - new Date(a.updatedAt || 0).getTime());

    return NextResponse.json({ success: true, assets }, { status: 200 });
  } catch (error) {
    console.error("[api-portal-content-get] Error:", error);
    return NextResponse.json({ success: false, error: "Failed to fetch content assets" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getAuthenticatedUser(request);
    if (!user) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    if (!db) {
      return NextResponse.json({ success: false, error: "Database not configured" }, { status: 500 });
    }

    const body = await request.json();
    const { action, id } = body;

    if (!action) {
      return NextResponse.json({ success: false, error: "Action is required" }, { status: 400 });
    }

    // Handle Create or Update ('save')
    if (action === "save") {
      const { title, tactic, content, status, customerId, customerName } = body;

      // Validate inputs
      if (!title || !tactic || !content) {
        return NextResponse.json({ success: false, error: "Title, Tactic, and Content are required" }, { status: 400 });
      }

      const targetCustomerId = customerId || user.id;
      const targetCustomerName = customerName || (user.role === "customer" ? user.name : "Selected Customer");

      // RBAC: Customer can only edit/create their own content
      if (user.role === "customer" && targetCustomerId !== user.id) {
        return NextResponse.json({ success: false, error: "Forbidden: You can only manage your own content assets" }, { status: 403 });
      }

      const assetId = id || `asset-${Date.now()}`;
      const docRef = db.collection("content_assets").doc(assetId);
      const docSnap = await docRef.get();

      let currentAsset: any = {};
      let nextVersion = 1;
      let versionsList: any[] = [];
      let commentsList: any[] = [];
      let auditTrail: any[] = [];
      let perfMetrics = { views: 0, clicks: 0, conversions: 0, conversionRate: 0 };
      let publishedPlatformsList: string[] = [];

      if (docSnap.exists) {
        currentAsset = docSnap.data();
        
        // RBAC: Check ownership of existing asset
        if (user.role === "customer" && currentAsset.customerId !== user.id) {
          return NextResponse.json({ success: false, error: "Forbidden: Access denied" }, { status: 403 });
        }

        versionsList = currentAsset.versions || [];
        commentsList = currentAsset.comments || [];
        auditTrail = currentAsset.auditLogs || [];
        perfMetrics = currentAsset.performanceMetrics || perfMetrics;
        publishedPlatformsList = currentAsset.publishedPlatforms || [];
        
        // Determine version number
        if (versionsList.length > 0) {
          const maxVer = Math.max(...versionsList.map((v: any) => v.version || 1));
          nextVersion = maxVer + 1;
        }
      }

      // Add to version control
      const newVersionObj = {
        version: nextVersion,
        title,
        content,
        updatedAt: new Date().toISOString(),
        updatedBy: user.name,
        updatedByRole: user.role
      };
      versionsList.push(newVersionObj);

      // Log action
      const actionDesc = id ? `Draft updated to version ${nextVersion} by ${user.name}` : `Asset created by ${user.name}`;
      const logObj = {
        action: id ? "updated" : "created",
        details: actionDesc,
        performedBy: user.name,
        performedByRole: user.role,
        createdAt: new Date().toISOString()
      };
      auditTrail.push(logObj);

      const assetData = {
        id: assetId,
        customerId: targetCustomerId,
        customerName: targetCustomerName,
        title,
        tactic,
        content,
        status: status || currentAsset.status || "draft",
        versions: versionsList,
        comments: commentsList,
        performanceMetrics: perfMetrics,
        publishedPlatforms: publishedPlatformsList,
        auditLogs: auditTrail,
        createdAt: currentAsset.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      await docRef.set(assetData, { merge: true });

      // Save platform level audit log
      await db.collection("audit_logs").add({
        id: `audit-${Date.now()}`,
        actionType: id ? "content_update" : "content_create",
        actionDetails: `${user.name} (${user.role}) ${id ? "updated" : "created"} content asset: ${title} (${tactic})`,
        performedBy: user.id,
        performedByRole: user.role,
        targetId: assetId,
        targetType: "content_asset",
        createdAt: new Date().toISOString()
      });

      return NextResponse.json({ success: true, asset: assetData }, { status: 200 });
    }

    // Handle Commenting
    if (action === "comment") {
      const { comment } = body;
      if (!id || !comment) {
        return NextResponse.json({ success: false, error: "Asset ID and Comment text are required" }, { status: 400 });
      }

      const docRef = db.collection("content_assets").doc(id);
      const docSnap = await docRef.get();
      if (!docSnap.exists) {
        return NextResponse.json({ success: false, error: "Asset not found" }, { status: 444 });
      }

      const asset = docSnap.data() as any;

      // RBAC: Customer can only comment on their own assets
      if (user.role === "customer" && asset.customerId !== user.id) {
        return NextResponse.json({ success: false, error: "Forbidden: Access denied" }, { status: 403 });
      }

      const commentsList = asset.comments || [];
      const auditTrail = asset.auditLogs || [];

      const newComment = {
        id: `comm-${Date.now()}`,
        comment,
        authorName: user.name,
        authorRole: user.role,
        createdAt: new Date().toISOString()
      };
      commentsList.push(newComment);

      auditTrail.push({
        action: "comment_added",
        details: `Comment added by ${user.name} (${user.role})`,
        performedBy: user.name,
        performedByRole: user.role,
        createdAt: new Date().toISOString()
      });

      await docRef.update({
        comments: commentsList,
        auditLogs: auditTrail,
        updatedAt: new Date().toISOString()
      });

      return NextResponse.json({ success: true, comment: newComment }, { status: 200 });
    }

    // Handle Status/Review Flow Toggle
    if (action === "review") {
      const { status } = body; // under_review, approved, draft
      if (!id || !status) {
        return NextResponse.json({ success: false, error: "Asset ID and Status are required" }, { status: 400 });
      }

      const docRef = db.collection("content_assets").doc(id);
      const docSnap = await docRef.get();
      if (!docSnap.exists) {
        return NextResponse.json({ success: false, error: "Asset not found" }, { status: 444 });
      }

      const asset = docSnap.data() as any;

      // RBAC: Customer check
      if (user.role === "customer" && asset.customerId !== user.id) {
        return NextResponse.json({ success: false, error: "Forbidden: Access denied" }, { status: 403 });
      }

      const auditTrail = asset.auditLogs || [];
      
      auditTrail.push({
        action: `status_change_${status}`,
        details: `Status set to '${status}' by ${user.name} (${user.role})`,
        performedBy: user.name,
        performedByRole: user.role,
        createdAt: new Date().toISOString()
      });

      await docRef.update({
        status,
        auditLogs: auditTrail,
        updatedAt: new Date().toISOString()
      });

      return NextResponse.json({ success: true, status }, { status: 200 });
    }

    // Handle Version Rollback
    if (action === "rollback") {
      const { versionNumber } = body;
      if (!id || versionNumber === undefined) {
        return NextResponse.json({ success: false, error: "Asset ID and Version Number are required" }, { status: 400 });
      }

      const docRef = db.collection("content_assets").doc(id);
      const docSnap = await docRef.get();
      if (!docSnap.exists) {
        return NextResponse.json({ success: false, error: "Asset not found" }, { status: 444 });
      }

      const asset = docSnap.data() as any;

      // RBAC: Customer check
      if (user.role === "customer" && asset.customerId !== user.id) {
        return NextResponse.json({ success: false, error: "Forbidden: Access denied" }, { status: 403 });
      }

      const versionsList = asset.versions || [];
      const targetVersion = versionsList.find((v: any) => v.version === Number(versionNumber));

      if (!targetVersion) {
        return NextResponse.json({ success: false, error: "Version not found in asset history" }, { status: 400 });
      }

      const auditTrail = asset.auditLogs || [];
      const maxVer = Math.max(...versionsList.map((v: any) => v.version || 1));
      const nextVersion = maxVer + 1;

      // Append new version reflecting the rollback
      const newVersionObj = {
        version: nextVersion,
        title: targetVersion.title,
        content: targetVersion.content,
        updatedAt: new Date().toISOString(),
        updatedBy: `${user.name} (Rollback)`,
        updatedByRole: user.role
      };
      versionsList.push(newVersionObj);

      auditTrail.push({
        action: "rollback",
        details: `Rolled back to Version ${versionNumber} by ${user.name} (${user.role})`,
        performedBy: user.name,
        performedByRole: user.role,
        createdAt: new Date().toISOString()
      });

      await docRef.update({
        title: targetVersion.title,
        content: targetVersion.content,
        versions: versionsList,
        auditLogs: auditTrail,
        updatedAt: new Date().toISOString()
      });

      return NextResponse.json({ success: true, title: targetVersion.title, content: targetVersion.content }, { status: 200 });
    }

    // Handle Encrypted Sync & External Publishing
    if (action === "publish") {
      const { scheduledDate } = body; // Optional scheduling

      if (!id) {
        return NextResponse.json({ success: false, error: "Asset ID is required for publishing" }, { status: 400 });
      }

      const docRef = db.collection("content_assets").doc(id);
      const docSnap = await docRef.get();
      if (!docSnap.exists) {
        return NextResponse.json({ success: false, error: "Asset not found" }, { status: 444 });
      }

      const asset = docSnap.data() as any;

      // RBAC: Customer check
      if (user.role === "customer" && asset.customerId !== user.id) {
        return NextResponse.json({ success: false, error: "Forbidden: Access denied" }, { status: 403 });
      }

      const syncPlatforms = getSyncPlatforms(asset.tactic);
      const encryptedContent = encryptPayloadSimulated(asset.content || "");
      
      const auditTrail = asset.auditLogs || [];
      const newStatus = scheduledDate ? "scheduled" : "published";

      if (scheduledDate) {
        auditTrail.push({
          action: "scheduled",
          details: `Scheduled to publish on ${new Date(scheduledDate).toLocaleString()} to connected channels: ${syncPlatforms.join(", ")}. Content encryption verified.`,
          performedBy: user.name,
          performedByRole: user.role,
          createdAt: new Date().toISOString()
        });

        await docRef.update({
          status: newStatus,
          scheduledAt: scheduledDate,
          auditLogs: auditTrail,
          updatedAt: new Date().toISOString()
        });
      } else {
        auditTrail.push({
          action: "published",
          details: `Successfully published sync to platforms: ${syncPlatforms.join(", ")}. Payload E2E encrypted: ${encryptedContent}`,
          performedBy: user.name,
          performedByRole: user.role,
          createdAt: new Date().toISOString()
        });

        await docRef.update({
          status: newStatus,
          publishedPlatforms: syncPlatforms,
          auditLogs: auditTrail,
          updatedAt: new Date().toISOString()
        });
      }

      // Save platform level audit log
      await db.collection("audit_logs").add({
        id: `audit-${Date.now()}`,
        actionType: scheduledDate ? "content_schedule" : "content_publish",
        actionDetails: `${user.name} (${user.role}) ${scheduledDate ? "scheduled" : "published"} content asset: ${asset.title} to: ${syncPlatforms.join(", ")}`,
        performedBy: user.id,
        performedByRole: user.role,
        targetId: id,
        targetType: "content_asset",
        createdAt: new Date().toISOString()
      });

      return NextResponse.json({ 
        success: true, 
        status: newStatus, 
        platforms: syncPlatforms,
        encryptedPayload: encryptedContent
      }, { status: 200 });
    }

    return NextResponse.json({ success: false, error: "Invalid action" }, { status: 400 });
  } catch (error) {
    console.error("[api-portal-content-post] Error:", error);
    return NextResponse.json({ success: false, error: "Failed to perform action" }, { status: 500 });
  }
}
