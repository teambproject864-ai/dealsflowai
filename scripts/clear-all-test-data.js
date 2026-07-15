// Script to clear all test data from the Firestore database
const path = require('path');
const fs = require('fs');

// Manually load .env.local
const envPath = path.join(__dirname, '../.env.local');
if (fs.existsSync(envPath)) {
  const lines = fs.readFileSync(envPath, 'utf8').split('\n');
  lines.forEach(line => {
    const match = line.match(/^([^#=]+)=(.*)$/);
    if (match) {
      process.env[match[1].trim()] = match[2].trim();
    }
  });
}

const COLLECTIONS = [
  'users',
  'customers',
  'leads',
  'analyses',
  'analysis_metrics',
  'audit_logs',
  'requirements',
  'feedback',
  'chat_messages',
  'calls',
  'gtm_reports',
  'tickets',
  'agent_notifications',
  'in_app_notifications',
  'custom_whatsapp_messages',
  'custom_voice_calls',
  'agent_assignments',
  'agentSessions',
  'gtm_progress',
  'marketing_campaigns',
  'sales_pipeline',
  'icps',
  'password_resets',
  'resignations'
];

async function deleteCollection(db, collectionPath, batchSize = 100) {
  const collectionRef = db.collection(collectionPath);
  const query = collectionRef.orderBy('__name__').limit(batchSize);

  return new Promise((resolve, reject) => {
    deleteQueryBatch(db, query, resolve, reject);
  });
}

async function deleteQueryBatch(db, query, resolve, reject) {
  try {
    const snapshot = await query.get();

    const batchSize = snapshot.size;
    if (batchSize === 0) {
      resolve();
      return;
    }

    const batch = db.batch();
    snapshot.docs.forEach((doc) => {
      batch.delete(doc.ref);
    });

    await batch.commit();
    console.log(`Deleted batch of ${batchSize} documents from collection.`);

    // Recurse on the next batch
    process.nextTick(() => {
      deleteQueryBatch(db, query, resolve, reject);
    });
  } catch (error) {
    reject(error);
  }
}

async function run() {
  try {
    const admin = require('firebase-admin');

    const serviceAccountPath = process.env.FIREBASE_SERVICE_ACCOUNT_PATH || './dealflow_firebase.json';
    const resolvedPath = path.resolve(__dirname, '..', serviceAccountPath.replace('./', ''));

    if (!fs.existsSync(resolvedPath)) {
      console.log('No Firebase service account file found at:', resolvedPath);
      return;
    }

    if (!admin.apps.length) {
      const serviceAccount = require(resolvedPath);
      admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });
    }

    const db = admin.firestore();

    console.log('Starting deletion of all test collections...');
    for (const collection of COLLECTIONS) {
      console.log(`Clearing collection: ${collection}...`);
      await deleteCollection(db, collection);
      console.log(`Successfully cleared: ${collection}`);
    }
    console.log('Finished clearing all test collections successfully!');

  } catch (err) {
    console.error('Error during data clearance:', err.message);
  }
  process.exit(0);
}

run();
