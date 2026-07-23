// tests/dealflow-crm.test.ts
import assert from "assert";
import { 
  validateCRMRecord, 
  saveCRMCustomer, 
  saveCRMCompany, 
  saveCRMDeal, 
  getCRMCustomers, 
  getCRMCompanies, 
  getCRMDeals, 
  searchCRMRecords,
  deleteCRMRecord 
} from "../lib/crm-store";
import { CRMCustomer, CRMCompany, CRMDeal } from "../lib/crm-types";

export async function runDealflowCRMTests() {
  console.log("=== Running Dealflow CRM Data Architecture & Validation Tests ===");

  // 1. Test Data Integrity Validation - Rejection of Incomplete Records
  console.log("--> Testing Data Integrity Validation Rules...");
  
  const invalidCustomer = { customerName: "   ", companyName: "" };
  const custVal = validateCRMRecord("customer", invalidCustomer);
  assert.strictEqual(custVal.isValid, false, "Customer record without name or company MUST fail validation");
  assert.ok(custVal.errors.customerName, "Should return clear error for missing customer/company metadata");

  const invalidCompany = { companyName: "" };
  const compVal = validateCRMRecord("company", invalidCompany);
  assert.strictEqual(compVal.isValid, false, "Company record without company name MUST fail validation");
  assert.ok(compVal.errors.companyName);

  const invalidDeal = { dealName: "Incomplete Deal", customerName: "", companyName: "" };
  const dealVal = validateCRMRecord("deal", invalidDeal);
  assert.strictEqual(dealVal.isValid, false, "Deal record without linked customer/company MUST fail validation");
  assert.ok(dealVal.errors.customerName);

  console.log("✅ Passed: 100% rejection of incomplete or orphaned records");

  // 2. Test Storage & Retrieval of Valid CRM Records
  console.log("--> Testing Valid Record Persistence & Metadata Linkage...");

  const testCompanyData: Partial<CRMCompany> = {
    companyName: "Nexus AI Solutions",
    industry: "Enterprise AI",
    websiteUrl: "https://nexus-ai.io",
    employeeCount: 120,
    annualRevenue: "$18M"
  };

  const createdCompany = await saveCRMCompany(testCompanyData);
  assert.ok(createdCompany.id, "Saved company must have generated ID");
  assert.strictEqual(createdCompany.companyName, "Nexus AI Solutions");

  const testCustomerData: Partial<CRMCustomer> = {
    customerName: "Alex Mercer",
    email: "alex@nexus-ai.io",
    title: "Chief Executive Officer",
    companyId: createdCompany.id,
    companyName: createdCompany.companyName
  };

  const createdCustomer = await saveCRMCustomer(testCustomerData);
  assert.ok(createdCustomer.id);
  assert.strictEqual(createdCustomer.customerName, "Alex Mercer");
  assert.strictEqual(createdCustomer.companyId, createdCompany.id);
  assert.strictEqual(createdCustomer.companyName, "Nexus AI Solutions");

  const testDealData: Partial<CRMDeal> = {
    dealName: "Nexus Enterprise Expansion 2026",
    amount: 150000,
    stage: "proposal",
    probability: 80,
    customerId: createdCustomer.id,
    customerName: createdCustomer.customerName,
    companyId: createdCompany.id,
    companyName: createdCompany.companyName
  };

  const createdDeal = await saveCRMDeal(testDealData);
  assert.ok(createdDeal.id);
  assert.strictEqual(createdDeal.dealName, "Nexus Enterprise Expansion 2026");
  assert.strictEqual(createdDeal.customerName, "Alex Mercer");
  assert.strictEqual(createdDeal.companyName, "Nexus AI Solutions");
  assert.strictEqual(createdDeal.amount, 150000);

  console.log("✅ Passed: Valid CRM records stored with complete metadata linkages");

  // 3. Test 100% Non-Incomplete Record Integrity Across All Stored Records
  console.log("--> Verifying 100% Metadata Integrity Across All Stored CRM Records...");

  const allCustomers = await getCRMCustomers();
  const allCompanies = await getCRMCompanies();
  const allDeals = await getCRMDeals();

  for (const c of allCustomers) {
    const hasMetadata = Boolean(c.customerName?.trim() || c.companyName?.trim());
    assert.strictEqual(hasMetadata, true, `Stored customer ${c.id} must contain valid customer or company metadata`);
  }

  for (const comp of allCompanies) {
    const hasMetadata = Boolean(comp.companyName?.trim());
    assert.strictEqual(hasMetadata, true, `Stored company ${comp.id} must contain valid company name`);
  }

  for (const d of allDeals) {
    const hasMetadata = Boolean(d.customerName?.trim() || d.companyName?.trim());
    assert.strictEqual(hasMetadata, true, `Stored deal ${d.id} must contain valid linked customer or company name`);
  }

  console.log("✅ Passed: 100% of stored records verified with mandatory metadata (0 incomplete entries)");

  // 4. Test Search & Filtering (Exact & Partial Match Queries)
  console.log("--> Testing Search & Filtering Capabilities...");

  const partialSearchResults = await searchCRMRecords({ query: "Nexus" });
  assert.ok(partialSearchResults.customers.length >= 1, "Should find customer by partial name 'Nexus'");
  assert.ok(partialSearchResults.companies.length >= 1, "Should find company by partial name 'Nexus'");
  assert.ok(partialSearchResults.deals.length >= 1, "Should find deal by partial name 'Nexus'");

  const stageFilteredResults = await searchCRMRecords({ stage: "proposal" });
  assert.ok(stageFilteredResults.deals.every(d => d.stage === "proposal"), "All returned deals must be in 'proposal' stage");

  console.log("✅ Passed: Search & filtering with exact and partial query matching");

  // 5. Cleanup Test Record
  await deleteCRMRecord("deal", createdDeal.id);
  await deleteCRMRecord("customer", createdCustomer.id);
  await deleteCRMRecord("company", createdCompany.id);

  console.log("🎉 All Dealflow CRM Data Architecture & Integrity Tests Passed Successfully!\n");
}

if (require.main === module) {
  runDealflowCRMTests().catch(err => {
    console.error("❌ Dealflow CRM Test Failed:", err);
    process.exit(1);
  });
}
