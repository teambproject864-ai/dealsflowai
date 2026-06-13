import {
  AgentAssignment,
  CustomerCredentials,
  PageLockState,
  HeyGenVideo,
  ExtendedLeadRecord,
  AnalysisResult,
} from "./types";

let inMemoryLeads: Map<string, ExtendedLeadRecord> = new Map();
let inMemoryAnalyses: Map<string, AnalysisResult> = new Map();
let inMemoryAgentAssignments: Map<string, AgentAssignment> = new Map();
let inMemoryCustomerCredentials: Map<string, CustomerCredentials> = new Map();
let inMemoryPageLocks: Map<string, PageLockState[]> = new Map();
let inMemoryHeyGenVideos: Map<string, HeyGenVideo> = new Map();

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
