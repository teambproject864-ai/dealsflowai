import { db } from "./firebase-admin";
import bcrypt from "bcrypt";

// Default passwords for seed accounts
const DEV_PASSWORDS = {
  admin: process.env.ADMIN_PASSWORD || "Admin123!",
  admin1: process.env.ADMIN1_PASSWORD || "Pranee@1909",
  praneethAgent: process.env.AGENT_PRANEETH_PASSWORD || "Praneeth123!",
  ashokAgent: process.env.AGENT_ASHOK_PASSWORD || "AgentAshok456!",
  demoCustomer: process.env.CUSTOMER_DEMO_PASSWORD || "CustomerDemo123!",
  praneethCustomer: process.env.CUSTOMER_PRANEETH_PASSWORD || "Praneeth@123",
  anilCustomer: process.env.CUSTOMER_ANIL_PASSWORD || "Anil@123!",
};

export async function seedFirestore() {
  if (!db) {
    console.log("[db-init] Firestore not configured. Skipping seeding.");
    return;
  }

  try {
    // 1. Seed users collection
    console.log("[db-init] Checking and seeding default users...");
    const defaultUsers = [
      {
        id: "admin-1",
        email: "admin1@dealflow.ai",
        name: "Administrator",
        role: "admin",
        hashedPassword: bcrypt.hashSync(DEV_PASSWORDS.admin1, 10),
        createdAt: new Date().toISOString(),
        isActive: true,
      },
      {
        id: "admin-2",
        email: "admin@dealflow.ai",
        name: "Admin One",
        role: "admin",
        hashedPassword: bcrypt.hashSync(DEV_PASSWORDS.admin, 10),
        createdAt: new Date().toISOString(),
        isActive: true,
      },
      {
        id: "agent-praneeth",
        email: "praneeth@dealflow.ai",
        name: "Praneeth",
        role: "agent",
        hashedPassword: bcrypt.hashSync(DEV_PASSWORDS.praneethAgent, 10),
        phoneNumber: "+15550100007",
        countryCode: "US",
        callConversationFramework: "Core Objectives:\n- Assess ICP alignment\n- Review revenue operations inefficiencies",
        whatsAppMessageParameters: "Tone: Authoritative, strategic.",
        createdAt: new Date().toISOString(),
        isActive: true,
      },
      {
        id: "agent-ashok",
        email: "agent.ashok@dealflow.ai",
        name: "Ashok Agent",
        role: "agent",
        hashedPassword: bcrypt.hashSync(DEV_PASSWORDS.ashokAgent, 10),
        phoneNumber: "+15550100001",
        countryCode: "US",
        callConversationFramework: "Core Objectives:\n- Introduce DealFlow AI\n- Pitch pipeline optimization benefits",
        whatsAppMessageParameters: "Tone: Professional, direct.",
        createdAt: new Date().toISOString(),
        isActive: true,
      },
      {
        id: "customer-demo",
        email: "demo@customer.com",
        name: "Demo Customer",
        role: "customer",
        hashedPassword: bcrypt.hashSync(DEV_PASSWORDS.demoCustomer, 10),
        createdAt: new Date().toISOString(),
        isActive: true,
      },
      {
        id: "customer-praneeth",
        email: "praneethburada@gmail.com",
        name: "Praneeth Burada",
        role: "customer",
        hashedPassword: bcrypt.hashSync(DEV_PASSWORDS.praneethCustomer, 10),
        createdAt: new Date().toISOString(),
        isActive: true,
      },
      {
        id: "customer-anil",
        email: "anil@cralgo.com",
        name: "Anil Kumar",
        role: "customer",
        hashedPassword: bcrypt.hashSync(DEV_PASSWORDS.anilCustomer, 10),
        createdAt: new Date().toISOString(),
        isActive: true,
      },
    ];

    for (const u of defaultUsers) {
      const docRef = db.collection("users").doc(u.id);
      const docSnap = await docRef.get();
      // Write user if missing OR if they have corrupted field values
      if (!docSnap.exists || !docSnap.data()?.email) {
        await docRef.set({
          ...u,
          passwordUpdatedAt: new Date().toISOString(),
          failedLoginAttempts: 0,
          isLocked: false,
          lockedUntil: null,
        });
        console.log(`[db-init] Seeded default user ${u.email} successfully.`);
      }
    }
    console.log("[db-init] Default users validation complete.");

    // 2. Seed customers collection
    const customersSnap = await db.collection("customers").limit(1).get();
    if (customersSnap.empty) {
      console.log("[db-init] Seeding customers collection...");
      const defaultCustomers = [
        {
          id: "customer-demo",
          name: "Demo Customer",
          email: "demo@customer.com",
          phone: "+1-555-019-9999",
          companyName: "Acme Corp",
          industry: "Technology",
          status: "active",
          assignedAgentId: "agent-praneeth",
          assignedAgentName: "Praneeth",
          serviceConfigurations: {
            gtmReports: true,
            leadScoring: true,
            aiCalls: true,
          },
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          businessModel: "b2b",
        },
        {
          id: "customer-anil",
          name: "Anil Kumar",
          email: "anil@cralgo.com",
          phone: "+1-555-123-4567",
          companyName: "Cralgo",
          industry: "Fintech",
          status: "onboarding",
          assignedAgentId: "agent-ashok",
          assignedAgentName: "Ashok Agent",
          serviceConfigurations: {
            gtmReports: true,
            leadScoring: false,
            aiCalls: true,
          },
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          businessModel: "b2c",
        },
        {
          id: "customer-praneeth",
          name: "Praneeth Burada",
          email: "praneethburada@gmail.com",
          phone: "+1-555-987-6543",
          companyName: "TechStartup Premium Goods",
          industry: "Technology",
          status: "active",
          assignedAgentId: "agent-praneeth",
          assignedAgentName: "Praneeth",
          serviceConfigurations: {
            gtmReports: true,
            leadScoring: true,
            aiCalls: false,
          },
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          businessModel: "d2c",
        },
      ];

      for (const c of defaultCustomers) {
        await db.collection("customers").doc(c.id).set(c);
      }
      console.log("[db-init] Seeded customers collection successfully.");
    }

    // 3. Seed tasks collection
    const tasksSnap = await db.collection("tasks").limit(1).get();
    if (tasksSnap.empty) {
      console.log("[db-init] Seeding tasks collection...");
      const defaultTasks = [
        {
          id: "task-1",
          title: "Follow up with Demo Customer",
          description: "Contact Demo Customer to discuss GTM strategy",
          status: "in-progress",
          assignedAgentId: "agent-praneeth",
          customerId: "customer-demo",
          priority: "high",
          progressNotes: ["Initial contact made", "Schedule meeting for next week"],
          milestones: [
            { id: "m1", title: "Initial outreach", completed: true, completedAt: "2026-05-10T09:30:00Z" },
            { id: "m2", title: "Needs assessment", completed: false },
            { id: "m3", title: "Proposal sent", completed: false },
          ],
          createdAt: "2026-05-10T09:00:00Z",
          updatedAt: "2026-05-20T14:30:00Z",
        },
        {
          id: "task-2",
          title: "Prepare onboarding materials",
          description: "Create onboarding guide for new clients",
          status: "todo",
          assignedAgentId: "agent-ashok",
          customerId: "customer-anil",
          priority: "medium",
          progressNotes: [],
          milestones: [
            { id: "m1", title: "Draft guide", completed: false },
            { id: "m2", title: "Review and finalize", completed: false },
          ],
          createdAt: "2026-05-15T11:00:00Z",
          updatedAt: "2026-05-15T11:00:00Z",
        },
        {
          id: "task-3",
          title: "Collect customer feedback",
          description: "Get feedback from Demo Customer on initial meeting",
          status: "completed",
          assignedAgentId: "agent-praneeth",
          customerId: "customer-demo",
          priority: "low",
          progressNotes: ["Feedback collected", "Analysis complete"],
          milestones: [
            { id: "m1", title: "Send survey", completed: true, completedAt: "2026-05-18T10:00:00Z" },
            { id: "m2", title: "Analyze results", completed: true, completedAt: "2026-05-19T15:00:00Z" },
          ],
          createdAt: "2026-05-17T09:00:00Z",
          updatedAt: "2026-05-19T15:00:00Z",
        },
      ];

      for (const t of defaultTasks) {
        await db.collection("tasks").doc(t.id).set(t);
      }
      console.log("[db-init] Seeded tasks collection successfully.");
    }

    // 4. Seed documents collection
    const docsSnap = await db.collection("documents").limit(1).get();
    if (docsSnap.empty) {
      console.log("[db-init] Seeding documents collection...");
      const defaultDocs = [
        {
          id: "doc-1",
          customerId: "customer-demo",
          documentType: "icp",
          title: "Demo Corp ICP Profile",
          description: "Ideal Customer Profile for Demo Corp",
          icpId: "icp-demo-1",
          createdBy: "admin-1",
          createdAt: "2026-03-15T00:00:00Z",
          updatedAt: "2026-03-15T00:00:00Z",
          accessRoles: ["admin", "agent", "customer"],
          name: "Enterprise Segment ICP Profile.pdf",
          type: "pdf",
          size: "2.8 MB",
          version: "1.1",
          updateNotes: "Updated target geographies and CRM tool parameters.",
          isNew: true,
        },
        {
          id: "doc-2",
          customerId: "customer-anil",
          documentType: "requirement",
          title: "Cralgo Project Requirements",
          description: "Full project requirements document",
          requirementId: "req-2",
          createdBy: "agent-ashok",
          createdAt: "2026-06-15T00:00:00Z",
          updatedAt: "2026-06-15T00:00:00Z",
          accessRoles: ["admin", "agent"],
          name: "Q2 2026 GTM Strategy Blueprint.xlsx",
          type: "xlsx",
          size: "1.4 MB",
          version: "1.0",
          updateNotes: "Initial GTM strategy mapping.",
          isNew: false,
        },
        {
          id: "doc-3",
          customerId: "customer-demo",
          documentType: "onboarding",
          title: "Demo Corp Onboarding Guide",
          description: "Complete onboarding documentation",
          createdBy: "agent-praneeth",
          createdAt: "2026-03-12T00:00:00Z",
          updatedAt: "2026-03-12T00:00:00Z",
          accessRoles: ["admin", "agent", "customer"],
          name: "Demo Corp Onboarding Guide.pdf",
          type: "pdf",
          size: "2.5 MB",
          version: "1.0",
          updateNotes: "Initial publication.",
          isNew: false,
        },
      ];

      for (const d of defaultDocs) {
        await db.collection("documents").doc(d.id).set(d);
      }
      console.log("[db-init] Seeded documents collection successfully.");
    }

    // 5. Seed gtm_reports collection
    const reportsSnap = await db.collection("gtm_reports").limit(1).get();
    if (reportsSnap.empty) {
      console.log("[db-init] Seeding gtm_reports collection...");
      const defaultReports = [
        {
          id: "gtm-1",
          customerId: "customer-demo",
          reportName: "North America Expansion Blueprint",
          category: "Market Expansion",
          status: "active",
          region: "North America",
          segment: "Enterprise",
          revenue: 125000,
          conversionRate: 2.4,
          cac: 450,
          ltv: 2200,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        {
          id: "gtm-2",
          customerId: "customer-anil",
          reportName: "Fintech Europe Inbound Analysis",
          category: "Channel Optimization",
          status: "draft",
          region: "Europe",
          segment: "SMB",
          revenue: 45000,
          conversionRate: 1.8,
          cac: 120,
          ltv: 850,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      ];

      for (const r of defaultReports) {
        await db.collection("gtm_reports").doc(r.id).set(r);
      }
      console.log("[db-init] Seeded gtm_reports collection successfully.");
    }

    // 6. Seed requirements collection
    const reqsSnap = await db.collection("requirements").limit(1).get();
    if (reqsSnap.empty) {
      console.log("[db-init] Seeding requirements collection...");
      const defaultReqs = [
        {
          id: "req-1",
          customerId: "customer-demo",
          customerName: "Demo Customer",
          requesterName: "Demo Customer",
          requesterEmail: "demo@customer.com",
          category: "Technical Support",
          description: "Integration errors with HubSpot CRM synchronization",
          priority: "High",
          status: "In Progress",
          assignedAgentId: "agent-praneeth",
          assignedAgentName: "Praneeth",
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        {
          id: "req-2",
          customerId: "customer-anil",
          customerName: "Anil Kumar",
          requesterName: "Anil Kumar",
          requesterEmail: "anil@cralgo.com",
          category: "Feature Request",
          description: "Requesting automated WhatsApp calling triggers for live chat leads",
          priority: "Critical",
          status: "Open",
          assignedAgentId: "agent-ashok",
          assignedAgentName: "Ashok Agent",
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      ];

      for (const r of defaultReqs) {
        await db.collection("requirements").doc(r.id).set(r);
      }
      console.log("[db-init] Seeded requirements collection successfully.");
    }

    // 7. Seed resignations collection
    const resignationsSnap = await db.collection("resignations").limit(1).get();
    if (resignationsSnap.empty) {
      console.log("[db-init] Seeding resignations collection...");
      const defaultResignations = [
        {
          id: "resign-1",
          customerId: "customer-praneeth",
          customerName: "Praneeth Burada",
          requestDate: "2026-06-05T00:00:00Z",
          effectiveDate: "2026-07-10T00:00:00Z",
          terminationReason: "Pricing model changes",
          notes: "Seeking lower entry point for smaller projects.",
          documentsArchived: true,
          accountClosed: false,
          processedBy: "admin-1",
          processedAt: new Date().toISOString(),
        },
      ];

      for (const r of defaultResignations) {
        await db.collection("resignations").doc(r.id).set(r);
      }
      console.log("[db-init] Seeded resignations collection successfully.");
    }

    // 8. Seed tickets collection
    const ticketsSnap = await db.collection("tickets").limit(1).get();
    if (ticketsSnap.empty) {
      console.log("[db-init] Seeding tickets collection...");
      const defaultTickets = [
        {
          id: "ticket-1",
          customerId: "customer-demo",
          requesterName: "Demo Customer",
          requesterEmail: "demo@customer.com",
          category: "Technical Support",
          subject: "HubSpot CRM integration failing",
          description: "Auth token keeps expiring every hour instead of 24h.",
          priority: "high",
          status: "open",
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      ];

      for (const t of defaultTickets) {
        await db.collection("tickets").doc(t.id).set(t);
      }
      console.log("[db-init] Seeded tickets collection successfully.");
    }

    // 9. Seed calls collection
    const callsSnap = await db.collection("calls").limit(1).get();
    if (callsSnap.empty) {
      console.log("[db-init] Seeding calls collection...");
      const defaultCalls = [
        {
          id: "call-1",
          sessionId: "session-1",
          callerId: "agent-praneeth",
          callerName: "Praneeth",
          callerRole: "agent",
          receiverId: "customer-demo",
          receiverName: "Demo Customer",
          receiverRole: "customer",
          status: "completed",
          duration: 960,
          startedAt: "2026-06-20T11:00:00Z",
          endedAt: "2026-06-20T11:16:00Z",
        },
      ];

      for (const c of defaultCalls) {
        await db.collection("calls").doc(c.id).set(c);
      }
      console.log("[db-init] Seeded calls collection successfully.");
    }

    // 10. Seed feedback collection
    const feedbackSnap = await db.collection("feedback").limit(1).get();
    if (feedbackSnap.empty) {
      console.log("[db-init] Seeding feedback collection...");
      const defaultFeedback = [
        {
          id: "fb-1",
          sessionId: "session-1",
          agentId: "agent-praneeth",
          customerId: "customer-demo",
          rating: 5,
          comment: "Excellent service! Very helpful.",
          createdAt: new Date().toISOString(),
        },
      ];

      for (const f of defaultFeedback) {
        await db.collection("feedback").doc(f.id).set(f);
      }
      console.log("[db-init] Seeded feedback collection successfully.");
    }

    // 11. Seed chat messages collection
    const chatSnap = await db.collection("chat_messages").limit(1).get();
    if (chatSnap.empty) {
      console.log("[db-init] Seeding chat_messages collection...");
      const defaultMessages = [
        {
          id: "msg-1",
          sessionId: "session-1",
          senderId: "customer-demo",
          senderName: "Demo Customer",
          senderRole: "customer",
          content: "Hi, I'd like to discuss my GTM strategy.",
          timestamp: "2026-06-20T10:00:00Z",
          read: true,
        },
        {
          id: "msg-2",
          sessionId: "session-1",
          senderId: "agent-praneeth",
          senderName: "Praneeth",
          senderRole: "agent",
          content: "Great! Let's schedule a call this week. Here's the GTM analysis report for reference.",
          timestamp: "2026-06-20T10:15:00Z",
          read: true,
          attachments: [
            {
              id: "file-1",
              fileName: "GTM_Analysis_Report.pdf",
              fileSize: 1234567,
              fileType: "application/pdf",
              url: "#",
              uploadedAt: "2026-06-20T10:14:00Z",
              uploadedBy: "agent-praneeth",
            },
          ],
        },
      ];

      for (const m of defaultMessages) {
        await db.collection("chat_messages").doc(m.id).set(m);
      }
      console.log("[db-init] Seeded chat_messages collection successfully.");
    }

  } catch (error) {
    console.error("[db-init] Error seeding Firestore:", error);
  }
}
