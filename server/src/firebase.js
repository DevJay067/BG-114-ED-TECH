const admin = require('firebase-admin');
const path = require('path');
require('dotenv').config();

let firebaseApp;

function initializeFirebase() {
  if (admin.apps.length > 0) {
    return admin.apps[0];
  }

  let credential;

  // Option 1: Use a service account key JSON file
  const keyFilePath = path.resolve(process.env.FIREBASE_SERVICE_ACCOUNT_KEY || './serviceAccountKey.json');
  try {
    const serviceAccount = require(keyFilePath);
    credential = admin.credential.cert(serviceAccount);
    console.log('✅ Firebase: Loaded service account from key file');
  } catch (err) {
    // Option 2: Use individual env vars (useful for cloud deployments)
    if (process.env.FIREBASE_PROJECT_ID && process.env.FIREBASE_CLIENT_EMAIL && process.env.FIREBASE_PRIVATE_KEY) {
      credential = admin.credential.cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
      });
      console.log('✅ Firebase: Loaded credentials from environment variables');
    } else {
      console.error('❌ Firebase: No valid credentials found.');
      console.error('   → Place serviceAccountKey.json in server/ OR set FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, FIREBASE_PRIVATE_KEY in .env');
      process.exit(1);
    }
  }

  firebaseApp = admin.initializeApp({ credential });
  return firebaseApp;
}

initializeFirebase();

const db = admin.firestore();
const auth = admin.auth();

module.exports = { admin, db, auth };
