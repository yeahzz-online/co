import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { GlassCard, PageHeader } from "@/components/ui-kit";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useAuth, useProfile } from "@/hooks/use-auth";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/profile")({
  head: () => ({
    meta: [
      { title: "Your profile — COPEX Community" },
      { name: "description", content: "Manage your COPEX profile details used for registrations." },
      { property: "og:title", content: "Your profile — COPEX Community" },
      { property: "og:description", content: "Manage the details used for your registrations." },
    ],
  }),
  component: ProfilePage,
});

const FIELDS = [
  ["full_name", "Full name"],
  ["phone", "Phone"],
  ["roll_number", "Roll number"],
  ["employee_id", "Employee ID"],
  ["department", "Department"],
  ["year", "Year"],
  ["section", "Section"],
] as const;

function ProfilePage() {
  const { user, loading } = useAuth();
  const { data: profile } = useProfile();
  const queryClient = useQueryClient();
  const [form, setForm] = useState<Record<string, string>>({});

  useEffect(() => {
    if (profile) {
      setForm({
        full_name: profile.full_name ?? "",
        phone: profile.phone ?? "",
        roll_number: profile.roll_number ?? "",
        employee_id: profile.employee_id ?? "",
        department: profile.department ?? "",
        year: profile.year ?? "",
        section: profile.section ?? "",
        bio: profile.bio ?? "",
      });
    }
  }, [profile]);

  const save = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from("profiles").update(form as never).eq("id", user!.id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Profile updated");
      queryClient.invalidateQueries({ queryKey: ["profile"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  if (!loading && !user) {
    return (
      <div className="mx-auto max-w-md px-4 py-20 text-center">
        <GlassCard className="p-8">
          <h1 className="font-display text-xl font-bold">Sign in required</h1>
          <Button asChild className="mt-6 rounded-full"><Link to="/login">Sign in</Link></Button>
        </GlassCard>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-10 sm:px-6">
      <PageHeader title="Your profile" description="These details prefill every registration form." />
      <GlassCard className="mt-8 space-y-4 p-6">
        {FIELDS.map(([key, label]) => (
          <div key={key} className="space-y-2">
            <Label htmlFor={key}>{label}</Label>
            <Input
              id={key}
              maxLength={120}
              value={form[key] ?? ""}
              onChange={(e) => setForm({ ...form, [key]: e.target.value })}
            />
          </div>
        ))}
        <div className="space-y-2">
          <Label htmlFor="bio">Bio</Label>
          <Textarea id="bio" maxLength={500} value={form["bio"] ?? ""} onChange={(e) => setForm({ ...form, bio: e.target.value })} />
        </div>
        <Button className="rounded-full" disabled={save.isPending} onClick={() => save.mutate()}>
          {save.isPending ? "Saving…" : "Save changes"}
        </Button>
      </GlassCard>
    </div>
  );
}
