import { Database, Upload } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { collegeRecords } from "@/data/colleges";
import { GlassCard } from "@/components/ui-kit";
import { Button } from "@/components/ui/button";
import { documentRef, firestore, writeBatch } from "@/integrations/firebase/firestore";

export function CollegeImportCard() {
  const [saving, setSaving] = useState(false);

  async function saveCollegeDatabase() {
    setSaving(true);
    try {
      for (let start = 0; start < collegeRecords.length; start += 400) {
        const batch = writeBatch(firestore());
        for (const college of collegeRecords.slice(start, start + 400)) {
          const id = college.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 120);
          batch.set(documentRef(`colleges/${id}`), { ...college, search_name: college.name.toLowerCase(), imported_at: new Date().toISOString() }, { merge: true });
        }
        await batch.commit();
      }
      toast.success(`${collegeRecords.length} colleges saved to Firestore.`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "College database could not be saved.");
    } finally {
      setSaving(false);
    }
  }

  return <GlassCard className="border-t-4 border-t-primary p-6"><div className="flex items-start gap-3"><span className="grid size-10 place-items-center rounded-xl bg-primary/10 text-primary"><Database className="size-5" /></span><div><h3 className="font-display font-bold">College database</h3><p className="mt-1 text-sm text-muted-foreground">Save the imported {collegeRecords.length} college records to Firestore for live search.</p></div></div><Button className="mt-5 rounded-full" disabled={saving} onClick={saveCollegeDatabase}><Upload className="mr-2 size-4" />{saving ? "Saving colleges…" : "Save college database"}</Button></GlassCard>;
}
