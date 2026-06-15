export const dynamic = 'force-dynamic';

const companyNames = [
  "Acme Corp", "TechStart Inc", "SalesFlow Solutions",
  "InnovateCo", "GrowthHub", "Pipeline Pros",
  "DealMakers", "Revenue Rocket", "CloseFast"
];

const contactNames = [
  "John Doe", "Jane Smith", "Mike Johnson", "Sarah Williams",
  "David Brown", "Emily Davis", "Chris Wilson", "Amanda Martinez"
];

const agentNames = ["Praneeth", "Ashok", "Kiran"];

const activityTypes: Array<{ type: any; weight: number }> = [
  { type: "booking", weight: 2 },
  { type: "lead", weight: 3 },
  { type: "task_completed", weight: 2 },
  { type: "call_started", weight: 1 },
  { type: "call_ended", weight: 1 },
  { type: "message_sent", weight: 4 },
  { type: "file_uploaded", weight: 1 },
  { type: "analysis_complete", weight: 1 },
];

const getRandomActivityType = () => {
  const totalWeight = activityTypes.reduce((sum, a) => sum + a.weight, 0);
  let random = Math.random() * totalWeight;
  for (const activity of activityTypes) {
    random -= activity.weight;
    if (random <= 0) return activity.type;
  }
  return "lead";
};

const generateDescription = (type: string, company: string, contact?: string, agent?: string) => {
  switch (type) {
    case "booking":
      return `Demo scheduled with ${contact || 'contact'} for next week`;
    case "lead":
      return `New qualified lead from ${company}`;
    case "task_completed":
      return `Task completed by ${agent} for ${company}`;
    case "call_started":
      return `${agent} started a call with ${contact || 'contact'}`;
    case "call_ended":
      return `Call with ${contact || 'contact'} ended - duration: ${Math.floor(Math.random() * 30) + 5} mins`;
    case "message_sent":
      return `${agent} sent a message to ${company}`;
    case "file_uploaded":
      return `New file uploaded to ${company}'s account`;
    case "analysis_complete":
      return `GTM analysis complete for ${company}`;
    default:
      return `Activity occurred for ${company}`;
  }
};

export async function GET() {
  const encoder = new TextEncoder();
  let intervalId: NodeJS.Timeout | undefined;
  let isControllerClosed = false;

  const stream = new ReadableStream({
    async start(controller) {
      // Generate initial activities
      const initialActivities = Array.from({ length: 8 }, (_, i) => {
        const type = getRandomActivityType();
        const company = companyNames[Math.floor(Math.random() * companyNames.length)];
        const contact = Math.random() > 0.3 ? contactNames[Math.floor(Math.random() * contactNames.length)] : undefined;
        const agent = Math.random() > 0.3 ? agentNames[Math.floor(Math.random() * agentNames.length)] : undefined;
        return {
          id: Date.now().toString() + i,
          type,
          company,
          contact,
          agent,
          description: generateDescription(type, company, contact, agent),
          timestamp: new Date(Date.now() - (i * 60000 * 30)).toISOString()
        };
      });

      // Send initial data
      const initialPayload = JSON.stringify({
        type: 'initial',
        activities: initialActivities
      });
      controller.enqueue(encoder.encode(`data: ${initialPayload}\n\n`));

      // Send periodic updates
      const sendUpdate = () => {
        if (isControllerClosed) return;

        if (Math.random() > 0.4) { // 60% chance of new activity every 2 seconds
          const type = getRandomActivityType();
          const company = companyNames[Math.floor(Math.random() * companyNames.length)];
          const contact = Math.random() > 0.3 ? contactNames[Math.floor(Math.random() * contactNames.length)] : undefined;
          const agent = Math.random() > 0.3 ? agentNames[Math.floor(Math.random() * agentNames.length)] : undefined;
          const newActivity = {
            id: Date.now().toString(),
            type,
            company,
            contact,
            agent,
            description: generateDescription(type, company, contact, agent),
            timestamp: new Date().toISOString(),
            metadata: {
              taskId: type === "task_completed" ? `task-${Date.now()}` : undefined,
              fileType: type === "file_uploaded" ? ["pdf", "csv", "docx"][Math.floor(Math.random() * 3)] : undefined
            }
          };

          const payload = JSON.stringify({
            type: 'new_activity',
            activity: newActivity
          });

          try {
            controller.enqueue(encoder.encode(`data: ${payload}\n\n`));
          } catch (err) {
            console.warn('[ActivitySSE] Failed to enqueue:', err);
            isControllerClosed = true;
            if (intervalId) clearInterval(intervalId);
          }
        }
      };

      intervalId = setInterval(sendUpdate, 2000); // <2s latency as requested
    },
    cancel() {
      console.log('[ActivitySSE] Client disconnected');
      isControllerClosed = true;
      if (intervalId) clearInterval(intervalId);
    }
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      'Connection': 'keep-alive',
    },
  });
}
