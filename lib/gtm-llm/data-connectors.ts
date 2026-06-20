export interface CRMData {
  leads: Array<{
    id: string;
    source: string;
    status: string;
    conversionDate?: Date;
  }>;
  customers: Array<{
    id: string;
    segment: string;
    ltv: number;
    acquisitionDate: Date;
  }>;
}

export interface MarketingAutomationData {
  campaigns: Array<{
    id: string;
    name: string;
    spend: number;
    impressions: number;
    clicks: number;
    conversions: number;
  }>;
  emailMetrics: {
    openRate: number;
    clickThroughRate: number;
    conversionRate: number;
  };
}

export class CRMConnector {
  async fetchCRMData(): Promise<CRMData> {
    // Placeholder implementation - in production, this would connect to HubSpot, Salesforce, etc.
    return {
      leads: [],
      customers: [],
    };
  }
}

export class MarketingAutomationConnector {
  async fetchMarketingData(): Promise<MarketingAutomationData> {
    // Placeholder implementation - in production, connect to Mailchimp, Marketo, etc.
    return {
      campaigns: [],
      emailMetrics: {
        openRate: 25,
        clickThroughRate: 5,
        conversionRate: 2,
      },
    };
  }
}
