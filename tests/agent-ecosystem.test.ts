import assert from "assert";
import { ScraplingCrawler } from "../lib/scrapling";
import { OpenSpecValidator } from "../lib/openspec";
import { initializeIntegratedSystem } from "../lib/integrated-system";
import { A2AMessageType } from "../lib/a2a";
import { TaskStatus } from "../lib/unified-orchestrator/types";

// 1. Test Scrapling processing
async function testScraplingProcessor() {
  console.log("[Test] Running testScraplingProcessor...");
  const mockForm = {
    companyName: "Acme Corp",
    websiteUrl: "acme.com",
    name: "John Doe",
    emailPersonal: "john@acme.com",
    trustFactors: "Established in 1980, 5-star ratings.",
    targetIndustries: ["SaaS", "FinTech"],
    targetGeographicRegionsText: "North America, Europe",
  };

  const processed = ScraplingCrawler.processIntakeForm(mockForm);
  assert.strictEqual(processed.companyName, "Acme Corp");
  assert.strictEqual(processed.websiteUrl, "acme.com");
  assert.strictEqual(processed.brandTrust, "Established in 1980, 5-star ratings.");
  assert.deepStrictEqual(processed.icp.targetIndustries, ["SaaS", "FinTech"]);
  assert.strictEqual(processed.icp.targetGeographicRegionsText, "North America, Europe");
  console.log("✅ testScraplingProcessor passed!");
}

// 2. Test OpenSpec Validation
async function testOpenSpecValidation() {
  console.log("[Test] Running testOpenSpecValidation...");
  
  // Valid GTM structure
  const validGTM = {
    executiveSummary: "A very detailed executive summary for Acme Corp which spans more than ten characters.",
    icpDefinition: {
      inclusionCriteria: ["B2B", "SaaS"],
      exclusionCriteria: ["B2C"],
    },
    table1FirmographicDemographic: [
      {
        priorityTier: "Tier 1",
        industryVertical: "SaaS",
        companySize: "10-50",
        arrRange: "$1M-$5M",
        location: "USA",
        keyDecisionMakerDemographics: "VP of Sales",
        notes: "Highly likely to convert",
        primaryCostDriver: "Sales overhead",
        currentSolutionStatus: "Manual",
        numberOfSitesTeamsLocations: "3",
        sustainabilityEsgComplianceCommitment: "Yes",
      }
    ],
    behavioralPsychographicTraits: {
      observableBehavioralPatterns: ["Active on LinkedIn"],
      corePsychographicAttributes: ["Data-driven"],
    },
    table2PainPointAnalysis: [
      {
        painPoint: "High CAC",
        severity: "Critical",
        businessImpact: "Low profit",
        rootCause: "Poor targeting",
        dealFlowAISolution: "AI lead qualification",
        frequencyOfPain: "Daily",
        howPainIsCurrentlyDiscovered: "Review",
        competitorCurrentSolutionInUse: "Spreadsheets",
      }
    ],
    table3DecisionMakerInfluence: [
      {
        role: "VP Sales",
        influenceScore: "10",
        coreDecisionRole: "Buyer",
        top3Priorities: "Reduce CAC",
        dealFlowAIMessagingFocus: "Efficiency",
        preferredContactChannel: "LinkedIn",
        primaryObjectionType: "Budget",
        contentFormatPreference: "1-pager",
      }
    ],
    purchasingJourneyMapping: [
      {
        stage: "Awareness",
        duration: "1 week",
        customerActions: "Read blog",
        customerNeedsQuestions: "How to reduce CAC?",
        channelPreferences: "LinkedIn",
        dealFlowAIAssetsEngagement: "Blog post",
      }
    ],
    table4LeadScoringFramework: {
      criteria: [
        {
          category: "Firmographics",
          criterion: "B2B SaaS",
          points: "15",
        }
      ],
      qualificationThresholds: {
        mql: "30",
        sql: "60",
        sal: "80",
      },
    },
    table5ChannelEffectiveness: [
      {
        channel: "LinkedIn",
        icpSegmentsBestFor: "Tier 1",
        monthlyLeadVolume: "100",
        conversionRate: "5%",
        costPerAcquisition: "$500",
        ltvToCacRatio: "3:1",
        budgetAllocation: "50%",
        optimizationRecommendations: "More posts",
      }
    ],
    crossTeamAlignmentGuidelines: {
      sharedSLAs: [{ sla: "Response < 15m", owner: "SDR", escalationPath: "Manager" }],
      weeklyReviewMeeting: { cadence: "Mondays", owner: "Sales Lead" },
      hotLeadCriteria: "ICP + CTA click",
    },
    icpValidationChecklist: {
      preQualificationChecklist: ["Is B2B"],
      quarterlyValidationReview: ["Verify revenue"],
      dataSourcesForValidation: ["CRM"],
      icpUpdateTriggers: ["Lower close rate"],
      quarterlyReviewOwner: "VP GTM",
      scoringThresholdForRevision: "Close < 10%",
      reviewChecklist: ["Check sizes"],
    },
  };

  const gtmCheck = OpenSpecValidator.validateGTM(validGTM);
  assert.ok(gtmCheck.success);

  // Invalid GTM structure
  const invalidGTM = {
    executiveSummary: "Short", // Too short (< 10 chars)
  };
  const invalidCheck = OpenSpecValidator.validateGTM(invalidGTM);
  assert.strictEqual(invalidCheck.success, false);
  assert.ok(invalidCheck.errors && invalidCheck.errors.length > 0);

  console.log("✅ testOpenSpecValidation passed!");
}

// 3. Test Hermes, Vexa, and OpenSpec agents in ecosystem
async function testAgentEcosystem() {
  console.log("[Test] Running testAgentEcosystem...");
  
  // Initialize interconnected ecosystem
  const { orchestrator, messageBus } = initializeIntegratedSystem();

  // Test Hermes Agent directly over message bus
  let receivedHermesResponse = false;
  const correlationId = crypto.randomUUID();
  const taskId = crypto.randomUUID();

  const unsubscribe = messageBus.subscribe("orchestrator", (msg) => {
    if (msg.correlationId === correlationId) {
      receivedHermesResponse = true;
      assert.strictEqual(msg.type, A2AMessageType.TASK_RESULT);
      assert.ok(msg.payload.result.success);
      assert.strictEqual(msg.payload.result.memory.content, "hermes_encrypted_dGVzdC1jb250ZW50"); // It gets encrypted
    }
  });

  await messageBus.createAndSendMessage(
    "orchestrator",
    "hermes-agent",
    A2AMessageType.TASK_DELEGATION,
    {
      taskId,
      taskType: "store_memory",
      input: {
        content: "test-content",
        category: "test",
        leadId: "lead_123",
      },
    },
    { correlationId }
  );

  // Wait for the synchronous handler pipeline to finish (1000ms is generous)
  await new Promise((resolve) => setTimeout(resolve, 1000));
  unsubscribe();
  assert.ok(receivedHermesResponse);
  console.log("✅ HermesAgent A2A store task passed!");

  console.log("[Test] Dispatching process_intake_form task via Orchestrator...");
  const orchestratorTask = orchestrator.createTask({
    type: "process_intake_form",
    input: {
      formData: {
        companyName: "Vexa Test Co",
        websiteUrl: "vexatest.com",
      },
      leadId: "lead_vexa",
    },
    priority: "high",
    tags: ["testing"],
    metadata: {},
  });

  // Wait for task completion
  let polledTask = orchestrator.getTask(orchestratorTask.id);
  const start = Date.now();
  // Using 10 seconds limit to allow full workflow to step through
  while (polledTask && polledTask.status !== TaskStatus.COMPLETED && polledTask.status !== TaskStatus.FAILED) {
    if (Date.now() - start > 10000) {
      break;
    }
    await new Promise((resolve) => setTimeout(resolve, 100));
    polledTask = orchestrator.getTask(orchestratorTask.id);
  }

  assert.strictEqual(polledTask?.status, TaskStatus.COMPLETED);
  assert.ok(polledTask?.result?.success);
  assert.ok(polledTask?.result?.gtmAnalysis);
  assert.ok(polledTask?.result?.playbook);

  console.log("✅ VexaAgent GTM generation task passed!");
  
  orchestrator.stop();
}

export async function runAgentEcosystemTests() {
  console.log("=========================================");
  console.log(" Running Connected Agent Ecosystem Tests ");
  console.log("=========================================");

  // Intercept fetch for Hugging Face embeddings and model inference
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
    
    // HuggingFace / NVIDIA / Kimi inference (restrict to chat/completions or actual API requests)
    if (
      urlString.includes("chat/completions") ||
      urlString.includes("api.nvidia.com/v1") ||
      urlString.includes("api.moonshot.cn/v1")
    ) {
      const body = init?.body ? JSON.parse(init.body) : {};
      const prompt = body.messages ? body.messages[body.messages.length - 1].content : "";
      
      let mockResponse = {};
      
      if (prompt.includes("GTM Analysis") || prompt.includes("executiveSummary") || prompt.includes("GTMAnalysisSpecSchema")) {
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
      } else {
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
    await testScraplingProcessor();
    await testOpenSpecValidation();
    await testAgentEcosystem();
    
    console.log("=========================================");
    console.log(" All Ecosystem Tests Passed Successfully ");
    console.log("=========================================");
  } finally {
    // Restore original fetch
    globalThis.fetch = originalFetch;
  }
}
