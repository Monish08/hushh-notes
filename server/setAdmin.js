const admin = require("firebase-admin");
const serviceAccount = require("./serviceAccountKey.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

async function setAdmin() {
  const email = "testfinal@gmail.com";

  try {
    const user = await admin.auth().getUserByEmail(email);

    await admin.auth().setCustomUserClaims(user.uid, {
      admin: true,
    });

    console.log("✅ Admin role assigned successfully!");
  } catch (error) {
    console.error("❌ Error:", error);
  }
}

setAdmin();
