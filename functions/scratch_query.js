const admin = require("firebase-admin");
admin.initializeApp();

const db = admin.firestore();

async function run() {
  try {
    const docRef = db.doc("passometro/balanco");
    const snap = await docRef.get();
    if (!snap.exists) {
      console.log("Document passometro/balanco does not exist!");
      return;
    }
    const data = snap.data().data || {};
    const keys = Object.keys(data).sort();
    console.log("=== ALL BALANCE KEYS IN FIRESTORE ===");
    console.log(JSON.stringify(keys, null, 2));
    console.log("=====================================");
  } catch (e) {
    console.error("Error querying Firestore:", e);
  }
}

run();
