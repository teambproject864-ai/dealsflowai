// Script to check and clear any Firestore-stored admin user
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

async function run() {
  try {
    const admin = require('firebase-admin');

    const serviceAccountPath = process.env.FIREBASE_SERVICE_ACCOUNT_PATH || './dealflow_firebase.json';
    const resolvedPath = path.resolve(__dirname, '..', serviceAccountPath.replace('./', ''));

    if (!fs.existsSync(resolvedPath)) {
      console.log('No Firebase service account file found at:', resolvedPath);
      console.log('Firestore is NOT configured — only ADMIN_PASSWORD_HASH from env is used.');
      console.log('');
      console.log('Current ADMIN_PASSWORD_HASH:', process.env.ADMIN_PASSWORD_HASH);
      return;
    }

    if (!admin.apps.length) {
      const serviceAccount = require(resolvedPath);
      admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });
    }

    const db = admin.firestore();
    const snap = await db.collection('users')
      .where('email', '==', 'admin@dealflow.ai')
      .where('role', '==', 'admin')
      .get();

    if (snap.empty) {
      console.log('No Firestore admin user found. Login uses ADMIN_PASSWORD_HASH from env.');
    } else {
      snap.forEach(doc => {
        console.log('Found Firestore admin user:', doc.id, JSON.stringify(doc.data()));
      });
      const deletePromises = snap.docs.map(doc => {
        console.log('Deleting:', doc.id);
        return doc.ref.delete();
      });
      await Promise.all(deletePromises);
      console.log('Done. Login will now use ADMIN_PASSWORD_HASH from env.');
    }
  } catch (err) {
    console.error('Error:', err.message);
  }
  process.exit(0);
}

run();
