// lib/crm-types.ts

export type DealStage = "qualification" | "proposal" | "negotiation" | "closed-won" | "closed-lost";

export interface CRMCompany {
  id: string;
  companyName: string;
  industry?: string;
  websiteUrl?: string;
  employeeCount?: number;
  annualRevenue?: string;
  contactEmail?: string;
  phone?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CRMCustomer {
  id: string;
  customerName: string;
  email?: string;
  phone?: string;
  title?: string;
  companyId?: string;
  companyName?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CRMDeal {
  id: string;
  dealName: string;
  amount: number;
  stage: DealStage;
  probability: number;
  customerId?: string;
  customerName?: string;
  companyId?: string;
  companyName?: string;
  expectedCloseDate?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CRMValidationResult {
  isValid: boolean;
  errors: Record<string, string>;
}

export interface CRMFilterOptions {
  type?: "all" | "customer" | "company" | "deal";
  stage?: DealStage | "all";
  query?: string;
}
