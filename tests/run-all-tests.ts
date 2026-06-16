
import { runMeetingUtilsTests } from "./meeting-utils.test";

async function runAllTests() {
  console.log("========================================");
  console.log("RUNNING ALL EXISTING TESTS");
  console.log("========================================\n");

  try {
    await runMeetingUtilsTests();
    console.log("\n✅ All existing tests passed!");
  } catch (error) {
    console.error("\n❌ Some tests failed:", error);
    process.exit(1);
  }
}

runAllTests();

