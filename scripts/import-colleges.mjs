import fs from "node:fs";
import { applicationDefault, initializeApp } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";

const source = fs.readFileSync(new URL("../src/data/colleges.ts", import.meta.url), "utf8");
const records = [...source.matchAll(/\{\"name\":\"(.*?)\",\"city\":\"(.*?)\",\"state\":\"(.*?)\"\}/g)].map(([, name, city, state]) => ({ name, city, state }));

if (!records.length) throw new Error("No college records found.");

initializeApp({ credential: applicationDefault() });
const db = getFirestore();
for (let start = 0; start < records.length; start += 400) {
  const batch = db.batch();
  for (const college of records.slice(start, start + 400)) {
    const id = college.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 120);
    batch.set(db.collection("colleges").doc(id), { ...college, search_name: college.name.toLowerCase(), imported_at: new Date().toISOString() }, { merge: true });
  }
  await batch.commit();
}
console.log(`Imported ${records.length} colleges into Firestore /colleges.`);
