import assert from "assert";

// Set mock environment variables for Firebase configuration and LLM API keys before requiring modules
if (!process.env.FIREBASE_PROJECT_ID) {
  process.env.FIREBASE_PROJECT_ID = "mock-project";
}
if (!process.env.FIREBASE_CLIENT_EMAIL) {
  process.env.FIREBASE_CLIENT_EMAIL = "mock-email";
}
if (!process.env.FIREBASE_PRIVATE_KEY) {
  process.env.FIREBASE_PRIVATE_KEY = "mock-key";
}
if (!process.env.HUGGINGFACE_API_KEY) {
  process.env.HUGGINGFACE_API_KEY = "mock-key";
}
if (!process.env.HUGGINGFACE_API_TOKEN) {
  process.env.HUGGINGFACE_API_TOKEN = "mock-token";
}
if (!process.env.NVIDIA_API_KEY) {
  process.env.NVIDIA_API_KEY = "mock-key";
}
if (!process.env.KIMI_API_KEY) {
  process.env.KIMI_API_KEY = "mock-key";
}

const { POST: gtmIntakePost } = require("../app/api/gtm-intake/route") as typeof import("../app/api/gtm-intake/route");
const { db } = require("../lib/firebase-admin") as typeof import("../lib/firebase-admin");

let mockStore: Record<string, Record<string, any>> = {};

function resetMockStore() {
  mockStore = {
    gtm_intakes: {},
  };
}

function setupMockFirestore() {
  const mockDb = {
    collection: (collectionName: string) => {
      return {
        doc: (docId: string) => {
          return {
            get: async () => ({
              exists: !!mockStore[collectionName]?.[docId],
              data: () => mockStore[collectionName]?.[docId],
            }),
            set: async (data: any, options?: any) => {
              if (!mockStore[collectionName]) mockStore[collectionName] = {};
              if (options?.merge) {
                mockStore[collectionName][docId] = { ...mockStore[collectionName][docId], ...data };
              } else {
                mockStore[collectionName][docId] = data;
              }
            },
          };
        },
      } as any;
    }
  };
  (globalThis as any).firestoreMock = mockDb;
}

function restoreFirestore() {
  (globalThis as any).firestoreMock = undefined;
}

async function testGtmIntakeSuccess() {
  resetMockStore();
  setupMockFirestore();

  try {
    const payload = {
      companyName: "Acme Corp",
      websiteUrl: "https://acme.com",
      productName: "Neural Outreach Bot",
      productOwnerName: "Sarah Jenkins",
      productOwnerEmail: "sarah@acme.com",
      targetLaunchDate: "2026-09-01",
      targetMarketRegion: "Europe",
      primaryUseCase: "Automate outbound prospecting emails",
      marketingBudgetAllocation: 75000,
      stakeholders: ["John (Product)", "Helen (Legal)"],
      complianceDocuments: ["SOC2-Report.pdf", "Privacy-Policy.pdf"],
    };

    const req = new Request("http://localhost:3000/api/gtm-intake", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    const res = await gtmIntakePost(req);
    assert.strictEqual(res.status, 200, "Response status should be 200");

    const data = await res.json();
    assert.strictEqual(data.success, true);
    assert.ok(data.trackingId);
    assert.ok(data.trackingId.startsWith("GTM-"));

    // Verify stored content in the mock database
    const intakes = mockStore.gtm_intakes;
    assert.strictEqual(Object.keys(intakes).length, 1);
    const saved = Object.values(intakes)[0];
    assert.strictEqual(saved.productName, "Neural Outreach Bot");
    assert.strictEqual(saved.productOwnerEmail, "sarah@acme.com");
    assert.strictEqual(saved.marketingBudgetAllocation, 75000);
    assert.deepEqual(saved.stakeholders, ["John (Product)", "Helen (Legal)"]);

    console.log("✅ Passed: testGtmIntakeSuccess");
  } finally {
    restoreFirestore();
  }
}

async function testGtmIntakeValidationFailure() {
  resetMockStore();
  setupMockFirestore();

  try {
    // Missing required productName and invalid email format
    const payload = {
      companyName: "Acme Corp",
      websiteUrl: "https://acme.com",
      productName: "",
      productOwnerName: "Sarah Jenkins",
      productOwnerEmail: "sarah-invalid-email",
      targetLaunchDate: "2026-09-01",
      targetMarketRegion: "Europe",
      primaryUseCase: "Automate outbound prospecting emails",
      marketingBudgetAllocation: -500, // Invalid: negative number
      stakeholders: [],
      complianceDocuments: [],
    };

    const req = new Request("http://localhost:3000/api/gtm-intake", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    const res = await gtmIntakePost(req);
    assert.strictEqual(res.status, 400, "Response status should be 400");

    const data = await res.json();
    assert.strictEqual(data.success, false);
    assert.ok(data.error.includes("Validation failed"));

    console.log("✅ Passed: testGtmIntakeValidationFailure");
  } finally {
    restoreFirestore();
  }
}

export async function runGtmIntakeTests() {
  const originalFetch = globalThis.fetch;

  globalThis.fetch = (async (url: any, init: any) => {
    const urlString = String(url);

    // Mock HTML requests (e.g. Scrapling crawlers)
    if (urlString.includes("vexatest.com") || urlString.includes("acme.com")) {
      return new Response("<html><body><h1>Vexa Test Co</h1><p>Mocked website response.</p></body></html>", {
        status: 200,
        headers: { "Content-Type": "text/html" }
      });
    }
    
    // HuggingFace feature extraction (embeddings)
    if (urlString.includes("pipeline/feature-extraction")) {
      return new Response(JSON.stringify([0.1, 0.2, 0.3]), {
        status: 200,
        headers: { "Content-Type": "application/json" }
      });
    }

    // HuggingFace provider mappings endpoint
    if (urlString.includes("inference-providers")) {
      return new Response(JSON.stringify({}), {
        status: 200,
        headers: { "Content-Type": "application/json" }
      });
    }
    
    // HuggingFace / NVIDIA / Kimi inference
    if (
      urlString.includes("chat/completions") ||
      urlString.includes("api.nvidia.com/v1") ||
      urlString.includes("api.moonshot.cn/v1")
    ) {
      const body = init?.body ? JSON.parse(init.body) : {};
      const prompt = body.messages ? body.messages[body.messages.length - 1].content : "";
      
      let mockResponse = {};
      
      if (prompt.includes("Playbook") || prompt.includes("Strategic Outreach Playbook")) {
        // Playbook response
        mockResponse = {
          sectionACompetitiveLandscape: [
            {
              competitorName: "Apollo",
              coreOffering: "Data",
              keyWeakness: "No playbook automation",
              companyDifferentiator: "AI execution",
              positioningStatement: "Next-gen RevOps"
            }
          ],
          sectionBMessagingAndPositioning: [
            {
              painPoint: "High churn",
              valuePillar: "Retention",
              hookLine: "Fix customer churn",
              supportingProofPoint: "70% recovery",
              cta: "Try pilot",
              personaMessaging: [{ persona: "CRO", messaging: "Drive retention" }]
            }
          ],
          sectionCObjectionHandlingMatrix: [
            {
              objection: "No time",
              personaMostLikelyToRaiseIt: "CRO",
              responseFramework: "Instant setup",
              supportingAsset: "Implementation guide"
            }
          ],
          sectionDTamSamSom: {
            tam: "5000",
            sam: "2000",
            som: "500"
          },
          sectionEPartnerAndChannelStrategy: {
            referralPartners: ["Partner X"],
            partnerIncentiveModel: "Revenue share",
            coMarketingOpportunities: ["Seminars"]
          },
          sectionFRiskRegister: [
            {
              risk: "Implementation lag",
              likelihood: "Low",
              impact: "Medium",
              mitigation: "Fast onboarding setup"
            }
          ],
          campaignSuccessMetrics: {
            pipelineGeneratedTargetByTier: [{ tier: "Tier 1", target: "$2M" }],
            mqlToSqlConversionRateTarget: "25%",
            cacTargetByChannel: [{ channel: "LinkedIn Ads", target: "$120" }],
            dealVelocityBenchmarkByTier: [{ tier: "Tier 1", days: "30" }]
          }
        };
      } else {
        // GTM Analysis response
        mockResponse = {
          executiveSummary: "Detailed summary for testing Vexa agent that passes constraints.",
          icpDefinition: { inclusionCriteria: ["Test Inclusion"], exclusionCriteria: ["Test Exclusion"] },
          table1FirmographicDemographic: [
            {
              priorityTier: "Tier 1",
              industryVertical: "SaaS",
              companySize: "10-50",
              arrRange: "$1M-$5M",
              location: "USA",
              keyDecisionMakerDemographics: "VP of Sales",
              notes: "Test notes",
              primaryCostDriver: "Sales overhead",
              currentSolutionStatus: "Manual",
              numberOfSitesTeamsLocations: "1",
              sustainabilityEsgComplianceCommitment: "Yes"
            }
          ],
          behavioralPsychographicTraits: {
            observableBehavioralPatterns: ["Active on social"],
            corePsychographicAttributes: ["Tech adopter"]
          },
          table2PainPointAnalysis: [
            {
              painPoint: "High churn",
              severity: "High",
              businessImpact: "Revenue loss",
              rootCause: "Support lag",
              dealFlowAISolution: "RevOps automation",
              frequencyOfPain: "Daily",
              howPainIsCurrentlyDiscovered: "Review",
              competitorCurrentSolutionInUse: "None"
            }
          ],
          table3DecisionMakerInfluence: [
            {
              role: "CRO",
              influenceScore: "10",
              coreDecisionRole: "Economic Buyer",
              top3Priorities: "Quota",
              dealFlowAIMessagingFocus: "ROI",
              preferredContactChannel: "LinkedIn",
              primaryObjectionType: "Price",
              contentFormatPreference: "Case Study"
            }
          ],
          purchasingJourneyMapping: [
            {
              stage: "Awareness",
              duration: "1 week",
              customerActions: "Read blog",
              customerNeedsQuestions: "How to fix churn?",
              channelPreferences: "Organic",
              dealFlowAIAssetsEngagement: "Article"
            }
          ],
          table4LeadScoringFramework: {
            criteria: [
              {
                category: "Firmographics",
                criterion: "B2B SaaS",
                points: "15"
              }
            ],
            qualificationThresholds: {
              mql: "30",
              sql: "60",
              sal: "80"
            }
          },
          table5ChannelEffectiveness: [
            {
              channel: "LinkedIn Ads",
              icpSegmentsBestFor: "Tier 1",
              monthlyLeadVolume: "50",
              conversionRate: "4%",
              costPerAcquisition: "$120",
              ltvToCacRatio: "4:1",
              budgetAllocation: "40%",
              optimizationRecommendations: "Optimize copies"
            }
          ],
          crossTeamAlignmentGuidelines: {
            sharedSLAs: [{ sla: "Response < 15m", owner: "SDR", escalationPath: "Manager" }],
            weeklyReviewMeeting: { cadence: "Mondays", owner: "Sales Lead" },
            hotLeadCriteria: "ICP + CTA click"
          },
          icpValidationChecklist: {
            preQualificationChecklist: ["Is target size"],
            quarterlyValidationReview: ["Verify parameters"],
            dataSourcesForValidation: ["CRM data"],
            icpUpdateTriggers: ["Drop in conversions"],
            quarterlyReviewOwner: "VP Ops",
            scoringThresholdForRevision: "Close < 10%",
            reviewChecklist: ["Check metrics"]
          }
        };
      }
      
      const chatCompletionBody = {
        id: "chatcmpl-mock",
        object: "chat.completion",
        created: Math.floor(Date.now() / 1000),
        model: "mock-model",
        choices: [
          {
            index: 0,
            message: {
              role: "assistant",
              content: "```json\n" + JSON.stringify(mockResponse, null, 2) + "\n```"
            },
            finish_reason: "stop"
          }
        ],
        usage: {
          prompt_tokens: 10,
          completion_tokens: 10,
          total_tokens: 20
        }
      };

      return new Response(JSON.stringify(chatCompletionBody), {
        status: 200,
        headers: { "Content-Type": "application/json" }
      });
    }
    
    // Fallback to original fetch
    return originalFetch(url, init);
  }) as any;

  try {
    await testGtmIntakeSuccess();
    await testGtmIntakeValidationFailure();
  } finally {
    globalThis.fetch = originalFetch;
  }
}
