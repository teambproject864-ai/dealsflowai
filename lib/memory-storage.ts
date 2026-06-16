import {
  AgentAssignment,
  CustomerCredentials,
  PageLockState,
  HeyGenVideo,
  ExtendedLeadRecord,
  AnalysisResult,
} from "./types";
import { ICPEntry } from "./portal-types";

let inMemoryLeads: Map<string, ExtendedLeadRecord> = new Map();
let inMemoryAnalyses: Map<string, AnalysisResult> = new Map();
let inMemoryAgentAssignments: Map<string, AgentAssignment> = new Map();
let inMemoryCustomerCredentials: Map<string, CustomerCredentials> = new Map();
let inMemoryPageLocks: Map<string, PageLockState[]> = new Map();
let inMemoryHeyGenVideos: Map<string, HeyGenVideo> = new Map();
let inMemoryICPEntries: Map<string, ICPEntry> = new Map();
let inMemoryAgentNotifications: Array<{
  id: string;
  agentId: string;
  title: string;
  message: string;
  type: "icp-updated" | "icp-created" | "assignment" | "other";
  read: boolean;
  createdAt: string;
}> = [];

export function getInMemoryLeads() {
  return inMemoryLeads;
}

export function getInMemoryAnalyses() {
  return inMemoryAnalyses;
}

export function getInMemoryAgentAssignments() {
  return inMemoryAgentAssignments;
}

export function getInMemoryCustomerCredentials() {
  return inMemoryCustomerCredentials;
}

export function getInMemoryPageLocks() {
  return inMemoryPageLocks;
}

export function getInMemoryHeyGenVideos() {
  return inMemoryHeyGenVideos;
}

export function getInMemoryICPEntries() {
  return inMemoryICPEntries;
}

export function getInMemoryAgentNotifications() {
  return inMemoryAgentNotifications;
}
