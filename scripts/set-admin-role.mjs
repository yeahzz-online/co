import { applicationDefault, cert, initializeApp } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore, FieldValue } from "firebase-admin/firestore";
import process from "node:process";

function usage() {
  console.error("Usage: node scripts/set-admin-role.mjs <firebase-auth-uid> [--revoke]");
  console.error("Set GOOGLE_APPLICATION_CREDENTIALS or FIREBASE_SERVICE_ACCOUNT_JSON first.");
  process.exit(1);
}

const uid = process.argv[2];
const revoke = process.argv.includes("--revoke");
if (!uid) usage();

const serviceAccountJson = process.env["FIREBASE_SERVICE_ACCOUNT_JSON"];
const app = initializeApp(
  serviceAccountJson
    ? { credential: cert(JSON.parse(serviceAccountJson)) }
    : { credential: applicationDefault() },
);

const auth = getAuth(app);
const firestore = getFirestore(app);
const user = await auth.getUser(uid);
const currentClaims = user.customClaims ?? {};

await auth.setCustomUserClaims(uid, {
  ...currentClaims,
  admin: !revoke,
});

const profile = {
  uid,
  email: user.email ?? null,
  full_name: user.displayName ?? null,
  roles: revoke ? ["member"] : ["admin"],
  updated_at: FieldValue.serverTimestamp(),
};

await firestore.collection("users").doc(uid).set(profile, { merge: true });

console.log(`${revoke ? "Revoked" : "Granted"} admin access for ${user.email ?? uid}.`);
console.log("The user must sign out and sign in again before the new custom claim is available.");
