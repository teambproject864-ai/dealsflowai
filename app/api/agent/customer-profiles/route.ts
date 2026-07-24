import { NextResponse } from "next/server";
import { getCRMCustomers, getCRMCompanies, getCRMDeals } from "@/lib/crm-store";
import { requireAuth } from "@/lib/auth";

export const dynamic = "force-dynamic";

export interface CustomerContactProfileData {
  id: string;
  customerName: string;
  email: string;
  phone: string;
  title: string;
  companyId: string;
  companyName: string;
  industry: string;
  annualRevenue: string;
  employeeCount: number;
  websiteUrl: string;
  dealsCount: number;
  totalDealValue: number;
  deals: { id: string; dealName: string; amount: number; stage: string; expectedCloseDate?: string }[];
  createdAt: string;
  updatedAt: string;
}

export async function GET(req: Request) {
  // Enforce Agent / Admin Authorization
  const { user, errorResponse } = await requireAuth(req);
  if (errorResponse) return errorResponse;

  if (user?.role !== "agent" && user?.role !== "admin") {
    return NextResponse.json(
      { success: false, error: "Forbidden: Agent or Admin access required" },
      { status: 403 }
    );
  }

  try {
    const { searchParams } = new URL(req.url);
    const query = (searchParams.get("query") || "").toLowerCase().trim();
    const stage = searchParams.get("stage") || "all";
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "10", 10);

    const customers = await getCRMCustomers();
    const companies = await getCRMCompanies();
    const deals = await getCRMDeals();

    const companyMap = new Map(companies.map(c => [c.id, c]));
    
    // Assemble complete customer contact profiles
    let profiles: CustomerContactProfileData[] = customers.map(cust => {
      const comp = cust.companyId ? companyMap.get(cust.companyId) : undefined;
      const custDeals = deals.filter(d => d.customerId === cust.id || (comp && d.companyId === comp.id));
      const totalDealValue = custDeals.reduce((sum, d) => sum + (d.amount || 0), 0);

      return {
        id: cust.id,
        customerName: cust.customerName,
        email: cust.email || "N/A",
        phone: cust.phone || comp?.phone || "N/A",
        title: cust.title || "Key Decision Maker",
        companyId: cust.companyId || comp?.id || "N/A",
        companyName: cust.companyName || comp?.companyName || "Independent Account",
        industry: comp?.industry || "Enterprise Services",
        annualRevenue: comp?.annualRevenue || "N/A",
        employeeCount: comp?.employeeCount || 0,
        websiteUrl: comp?.websiteUrl || "",
        dealsCount: custDeals.length,
        totalDealValue,
        deals: custDeals.map(d => ({
          id: d.id,
          dealName: d.dealName,
          amount: d.amount,
          stage: d.stage,
          expectedCloseDate: d.expectedCloseDate
        })),
        createdAt: cust.createdAt,
        updatedAt: cust.updatedAt
      };
    });

    // Apply Search Filter
    if (query) {
      profiles = profiles.filter(p =>
        p.customerName.toLowerCase().includes(query) ||
        p.email.toLowerCase().includes(query) ||
        p.companyName.toLowerCase().includes(query) ||
        p.industry.toLowerCase().includes(query) ||
        p.title.toLowerCase().includes(query)
      );
    }

    // Apply Stage Filter
    if (stage !== "all") {
      profiles = profiles.filter(p => p.deals.some(d => d.stage === stage));
    }

    // Pagination
    const totalCount = profiles.length;
    const totalPages = Math.ceil(totalCount / limit) || 1;
    const currentPage = Math.max(1, Math.min(page, totalPages));
    const startIndex = (currentPage - 1) * limit;
    const paginatedProfiles = profiles.slice(startIndex, startIndex + limit);

    return NextResponse.json({
      success: true,
      profiles: paginatedProfiles,
      pagination: {
        totalCount,
        page: currentPage,
        limit,
        totalPages
      }
    });
  } catch (err: any) {
    console.error("[agent/customer-profiles GET] failed:", err);
    return NextResponse.json(
      { success: false, error: "Failed to fetch customer contact profiles" },
      { status: 500 }
    );
  }
}
