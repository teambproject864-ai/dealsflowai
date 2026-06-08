import Dexie, { type Table } from "dexie";
import { type IntakeFormData } from "./types";

export interface OfflineLead {
  id?: string;
  leadId: string;
  data: Partial<IntakeFormData>;
  readout?: any;
  createdAt: number;
  synced: boolean;
}

export interface UserPreference {
  key: string;
  value: any;
}

class DealFlowOfflineDatabase extends Dexie {
  leads!: Table<OfflineLead>;
  preferences!: Table<UserPreference>;

  constructor() {
    super("DealFlowOfflineDB");
    this.version(1).stores({
      leads: "++id, leadId, synced, createdAt",
      preferences: "key",
    });
  }
}

export const db = new DealFlowOfflineDatabase();

// Helper functions for leads
export async function saveLeadOffline(leadId: string, data: Partial<IntakeFormData>, readout?: any, synced: boolean = false) {
  try {
    const existing = await db.leads.where("leadId").equals(leadId).first();
    if (existing) {
      await db.leads.update(existing.id!, {
        data,
        readout,
        synced,
        createdAt: Date.now(),
      });
    } else {
      await db.leads.add({
        leadId,
        data,
        readout,
        createdAt: Date.now(),
        synced,
      });
    }
  } catch (err) {
    console.error("Failed to save lead offline:", err);
  }
}

export async function getLeadOffline(leadId: string): Promise<OfflineLead | undefined> {
  try {
    return await db.leads.where("leadId").equals(leadId).first();
  } catch (err) {
    console.error("Failed to read lead offline:", err);
    return undefined;
  }
}

export async function getAllUnsyncedLeads(): Promise<OfflineLead[]> {
  try {
    return await db.leads.where("synced").equals(0).toArray(); // Dexie boolean store index is typically 0 or 1
  } catch {
    // Fallback if boolean index is stored differently
    const all = await db.leads.toArray();
    return all.filter((l) => !l.synced);
  }
}

export async function markLeadSynced(leadId: string) {
  try {
    const existing = await db.leads.where("leadId").equals(leadId).first();
    if (existing) {
      await db.leads.update(existing.id!, { synced: true });
    }
  } catch (err) {
    console.error("Failed to mark lead synced:", err);
  }
}

// Helper functions for preferences
export async function savePreferenceOffline(key: string, value: any) {
  try {
    await db.preferences.put({ key, value });
  } catch (err) {
    console.error("Failed to save preference offline:", err);
  }
}

export async function getPreferenceOffline(key: string, defaultValue?: any): Promise<any> {
  try {
    const pref = await db.preferences.get(key);
    return pref ? pref.value : defaultValue;
  } catch (err) {
    console.error("Failed to read preference offline:", err);
    return defaultValue;
  }
}
