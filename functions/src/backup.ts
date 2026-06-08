import * as functions from "firebase-functions/v1";
import * as firebaseAdmin from "firebase-admin";

// Initialize admin if not already done
if (!firebaseAdmin.apps.length) {
  firebaseAdmin.initializeApp();
}

const PROJECT_ID = process.env.GCLOUD_PROJECT || firebaseAdmin.app().options.projectId;
const BACKUP_BUCKET = `gs://${PROJECT_ID}-firestore-backups`;
const COLLECTIONS_TO_BACKUP = [
  "leads",
  "audit_log",
  "user_consent",
  "gtm_progress",
  "sales_pipeline",
  "marketing_campaigns",
  "alma_memory",
];

/**
 * Scheduled Firestore Export Backup
 *
 * Runs daily at 02:00 UTC. Exports all production collections
 * to a dedicated GCS bucket named `{projectId}-firestore-backups`.
 *
 * Prerequisites (one-time GCP setup):
 *   1. Create the bucket:
 *      gsutil mb -l us-central1 gs://{projectId}-firestore-backups
 *   2. Grant the Firestore service account write access to the bucket:
 *      gsutil iam ch serviceAccount:service-{PROJECT_NUMBER}@gcp-sa-firestore.iam.gserviceaccount.com:objectAdmin \
 *        gs://{projectId}-firestore-backups
 */
export const scheduledFirestoreBackup = functions.pubsub
  .schedule("0 2 * * *") // Every day at 02:00 UTC
  .timeZone("UTC")
  .onRun(async (_context) => {
    const client = new firebaseAdmin.firestore.v1.FirestoreAdminClient();
    const databaseName = client.databasePath(PROJECT_ID!, "(default)");

    const timestamp = new Date().toISOString().slice(0, 10); // YYYY-MM-DD
    const outputUriPrefix = `${BACKUP_BUCKET}/${timestamp}`;

    try {
      const [operation] = await client.exportDocuments({
        name: databaseName,
        outputUriPrefix,
        collectionIds: COLLECTIONS_TO_BACKUP,
      });

      functions.logger.info(
        `[Backup] Export started. Operation: ${operation.name}`,
        { outputUriPrefix }
      );
    } catch (err) {
      functions.logger.error("[Backup] Export failed:", err);
      throw err;
    }
  });
