const admin = require('firebase-admin');

function initFirestore() {
  if (admin.apps && admin.apps.length) return admin.firestore();

  const svc = process.env.FIREBASE_SERVICE_ACCOUNT;
  if (svc) {
    const cred = JSON.parse(svc);
    admin.initializeApp({ credential: admin.credential.cert(cred) });
  } else if (process.env.GOOGLE_APPLICATION_CREDENTIALS) {
    admin.initializeApp();
  } else {
    // Initialize with default (emulator) or no-op - but create a mock in-memory client when missing
    try {
      admin.initializeApp();
    } catch (e) {
      console.warn('firebase-admin init warning:', e.message);
    }
  }

  return admin.firestore();
}

module.exports = { initFirestore };
