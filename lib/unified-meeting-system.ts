
import crypto from "crypto";
import { getHermes } from "@/lib/hermes/hermes";
import { initializeVexaAgent, initializeOpenSpecAgent, initializeHermesAgent } from "@/lib/agents";
import { getEcosystem, EcosystemSystemId } from "@/lib/a2a/integration-layer";
import { Meeting, MeetingParticipant, MeetingAgendaItem, MeetingStatus, MeetingPlatform } from "@/lib/types";
import { createGoogleMeetLink, fetchGoogleCalendarEvent, extractAttendeeStatuses } from "@/lib/google-meet";
import { logger } from "@/lib/logger";

// Encryption utilities for sensitive meeting data
const ENCRYPTION_ALGORITHM = "aes-256-gcm";
const KEY_SIZE = 32; // 256 bits
const IV_LENGTH = 12; // 96 bits

function getEncryptionKey(): Buffer {
  const keyEnv = process.env.MEETING_ENCRYPTION_KEY;
  if (!keyEnv) {
    throw new Error("MEETING_ENCRYPTION_KEY is required (32-byte base64 string)");
  }
  return Buffer.from(keyEnv, "base64");
}

export function encryptMeetingData(plaintext: string): string {
  const key = getEncryptionKey();
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv(ENCRYPTION_ALGORITHM, key, iv);
  let encrypted = cipher.update(plaintext, "utf8", "hex");
  encrypted += cipher.final("hex");
  const authTag = cipher.getAuthTag().toString("hex");
  return JSON.stringify({ iv: iv.toString("hex"), encrypted, authTag });
}

export function decryptMeetingData(encryptedString: string): string {
  const { iv, encrypted, authTag } = JSON.parse(encryptedString);
  const key = getEncryptionKey();
  const decipher = crypto.createDecipheriv(ENCRYPTION_ALGORITHM, key, Buffer.from(iv, "hex"));
  decipher.setAuthTag(Buffer.from(authTag, "hex"));
  let plaintext = decipher.update(encrypted, "hex", "utf8");
  plaintext += decipher.final("utf8");
  return plaintext;
}

export class UnifiedMeetingSystem {
  private static instance: UnifiedMeetingSystem;
  private meetings: Map<string, Meeting> = new Map();

  private constructor() {}

  public static getInstance(): UnifiedMeetingSystem {
    if (!UnifiedMeetingSystem.instance) {
      UnifiedMeetingSystem.instance = new UnifiedMeetingSystem();
    }
    return UnifiedMeetingSystem.instance;
  }

  // Create a new meeting
  async createMeeting(data: {
    title: string;
    description?: string;
    startAt: Date;
    endAt: Date;
    participants: Array<Omit<MeetingParticipant, "id" | "isPresent" | "joinedAt" | "leftAt">>;
    agenda?: Array<Omit<MeetingAgendaItem, "id" | "completedAt">>;
    platform?: MeetingPlatform;
    createdBy: string;
  }): Promise<Meeting> {
    const platform = data.platform || "google_meet";
    let meetingUrl = "";
    let eventId = "";

    // Create meeting URL using appropriate platform
    if (platform === "google_meet") {
      const meetResult = await createGoogleMeetLink({
        title: data.title,
        descriptionHtml: data.description || "",
        start: data.startAt,
        end: data.endAt,
      });
      meetingUrl = meetResult.meetLink;
      eventId = meetResult.eventId;
    } else {
      meetingUrl = `https://example.com/meeting/${crypto.randomUUID()}`;
    }

    const meeting: Meeting = {
      id: crypto.randomUUID(),
      title: data.title,
      description: data.description,
      status: "scheduled",
      platform,
      meetingUrl,
      startAt: data.startAt,
      endAt: data.endAt,
      participants: data.participants.map((p) => ({
        id: crypto.randomUUID(),
        ...p,
        isPresent: false,
      })),
      agenda: data.agenda?.map((item) => ({
        id: crypto.randomUUID(),
        ...item,
      })),
      createdAt: new Date(),
      updatedAt: new Date(),
      createdBy: data.createdBy,
      metadata: { eventId },
    };

    this.meetings.set(meeting.id, meeting);

    // Store meeting in Hermes
    await this.storeMeetingInHermes(meeting);

    // Sync state via A2A
    const ecosystem = getEcosystem();
    await ecosystem.sendStateSync(EcosystemSystemId.HERMES, "meeting_created", {
      meetingId: meeting.id,
    });

    return meeting;
  }

  // Store meeting in Hermes
  private async storeMeetingInHermes(meeting: Meeting) {
    try {
      const hermes = getHermes();
      const serializedMeeting = JSON.stringify(meeting);
      const encryptedMeeting = encryptMeetingData(serializedMeeting);
      const memory = await hermes.storeMemory({
        content: encryptedMeeting,
        type: "long_term",
        tags: ["meeting", `meeting:${meeting.id}`, `company:${meeting.createdBy}`],
        priority: "high",
      });
      // Update meeting with memory ID
      meeting.hermesMemoryId = memory.id;
      this.meetings.set(meeting.id, meeting);
      logger.info(`[UnifiedMeetingSystem] Meeting ${meeting.id} stored in Hermes as ${memory.id}`);
    } catch (error) {
      logger.error(`[UnifiedMeetingSystem] Failed to store meeting in Hermes:`, error);
    }
  }

  // Get a meeting by ID
  async getMeeting(meetingId: string): Promise<Meeting | undefined> {
    let meeting = this.meetings.get(meetingId);

    // Try Hermes if not in memory
    if (!meeting) {
      try {
        const hermes = getHermes();
        const memories = await hermes.searchMemories(`meeting:${meetingId}`, 1);
        if (memories.length > 0) {
          const decrypted = decryptMeetingData(memories[0].content);
          meeting = JSON.parse(decrypted);
          this.meetings.set(meeting.id, meeting);
        }
      } catch (error) {
        logger.error(`[UnifiedMeetingSystem] Failed to fetch meeting from Hermes:`, error);
      }
    }

    return meeting;
  }

  // Start a meeting
  async startMeeting(meetingId: string): Promise<Meeting> {
    const meeting = await this.getMeeting(meetingId);
    if (!meeting) throw new Error("Meeting not found");
    if (meeting.status !== "scheduled") throw new Error("Meeting is not scheduled");

    const updated: Meeting = {
      ...meeting,
      status: "in_progress",
      updatedAt: new Date(),
    };
    this.meetings.set(meetingId, updated);

    // Use Vexa to generate real-time agenda updates
    await this.triggerVexaAgendaGeneration(updated);

    return updated;
  }

  // End a meeting
  async endMeeting(meetingId: string): Promise<Meeting> {
    const meeting = await this.getMeeting(meetingId);
    if (!meeting) throw new Error("Meeting not found");
    if (meeting.status !== "in_progress") throw new Error("Meeting is not in progress");

    const updated: Meeting = {
      ...meeting,
      status: "completed",
      updatedAt: new Date(),
    };
    this.meetings.set(meetingId, updated);

    // Post-meeting processing with all three systems
    await this.processCompletedMeeting(updated);

    return updated;
  }

  // Vexa integration: Generate agenda and strategy
  private async triggerVexaAgendaGeneration(meeting: Meeting) {
    try {
      logger.info(`[UnifiedMeetingSystem] Triggering Vexa for agenda: ${meeting.id}`);
      const ecosystem = getEcosystem();
      await ecosystem.getMessageBus().createAndSendMessage(
        EcosystemSystemId.HERMES,
        EcosystemSystemId.VEXA,
        "task_delegation",
        {
          taskType: "generate_agenda",
          meetingId: meeting.id,
          title: meeting.title,
        }
      );
    } catch (error) {
      logger.error(`[UnifiedMeetingSystem] Failed to trigger Vexa:`, error);
    }
  }

  // Process a completed meeting with all three systems
  private async processCompletedMeeting(meeting: Meeting) {
    try {
      const ecosystem = getEcosystem();
      const bus = ecosystem.getMessageBus();

      logger.info(`[UnifiedMeetingSystem] Processing completed meeting: ${meeting.id}`);

      // 1. Vexa: Generate post-meeting summary and follow-ups
      await bus.createAndSendMessage(
        EcosystemSystemId.HERMES,
        EcosystemSystemId.VEXA,
        "task_delegation",
        {
          taskType: "post_meeting_analysis",
          meetingId: meeting.id,
        }
      );

      // 2. OpenSpec: Validate meeting against standards
      await bus.createAndSendMessage(
        EcosystemSystemId.HERMES,
        EcosystemSystemId.OPENSPEC,
        "task_delegation",
        {
          taskType: "validate_meeting",
          meetingId: meeting.id,
        }
      );

      // 3. Hermes: Update memory with final state
      await this.storeMeetingInHermes(meeting);

    } catch (error) {
      logger.error(`[UnifiedMeetingSystem] Failed to process completed meeting:`, error);
    }
  }

  // Get all meetings for a user
  async getMeetingsForUser(userId: string): Promise<Meeting[]> {
    const allMeetings = Array.from(this.meetings.values());
    return allMeetings.filter(
      (m) =>
        m.createdBy === userId ||
        m.participants.some((p) => p.email === userId || p.name === userId)
    );
  }
}
