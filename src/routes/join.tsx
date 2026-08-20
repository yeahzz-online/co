import { useMutation } from "@tanstack/react-query";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { ArrowRight, Check, MessageCircle, Phone, Sparkles } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { CollegeAutocomplete } from "@/components/college-autocomplete";
import { GlassCard } from "@/components/ui-kit";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { signInWithGitHub, signInWithGoogle } from "@/integrations/firebase/auth";
import { saveProfile, useAuth, useProfile } from "@/hooks/use-auth";
import { recordReferral } from "@/lib/data";

export const Route = createFileRoute("/join")({ component: JoinPage });
const interests = [
  "Frontend & Backend Web",
  "Mobile App Dev",
  "Cloud & DevOps",
  "AI / Machine Learning",
  "Cybersecurity",
  "Product & Design",
  "Web3 & Blockchain",
];
const whatsappCommunityUrl = (import.meta.env["VITE_WHATSAPP_CHANNEL_URL"] ||
  import.meta.env["VITE_WHATSAPP_COMMUNITY_URL"] ||
  "https://chat.whatsapp.com/LcPp2HwBW8YGtOJTky8rir") as string;

function JoinPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { data: profile } = useProfile();
  const [authBusy, setAuthBusy] = useState<"google" | "github" | null>(null);
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    college: "",
    year: "",
    interests: [] as string[],
  });
  const [submitted, setSubmitted] = useState(false);
  useEffect(() => {
    if (user)
      setForm((current) => ({
        ...current,
        name: profile?.full_name ?? user.displayName ?? "",
        email: user.email ?? "",
        phone: profile?.phone ?? "",
        college: (profile as typeof profile & { institution?: string })?.institution ?? "",
        year: profile?.year ?? "",
        interests:
          (profile as typeof profile & { profile_interests?: string[] })?.profile_interests ?? [],
      }));
  }, [user, profile]);
  const join = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error("Please sign in first.");
      if (
        !form.name.trim() ||
        !form.email.trim() ||
        !form.phone.trim() ||
        !form.college.trim() ||
        !form.year ||
        !form.interests.length
      )
        throw new Error("Please complete every required field.");
      const uid = user.uid;
      const referral = new URLSearchParams(window.location.search).get("ref") ?? undefined;
      await saveProfile(uid, {
        full_name: form.name.trim(),
        email: form.email.trim(),
        phone: form.phone.trim(),
        institution: form.college.trim(),
        year: form.year,
        profile_interests: form.interests,
        member_id:
          (profile as typeof profile & { member_id?: string })?.member_id ??
          `MEM-${uid.slice(0, 8).toUpperCase()}`,
        points: 0,
        credits: 0,
        referrals: profile?.referrals ?? 0,
        tasks_completed: 0,
        status: "ACTIVE",
        referral_access: true,
        referral_code: uid.slice(0, 8).toUpperCase(),
        ...(referral ? { referred_by: referral } : {}),
        whatsapp_verified: false,
      });
      if (referral && referral !== uid && !profile?.referred_by) {
        await recordReferral(referral, uid);
      }
    },
    onSuccess: () => {
      setSubmitted(true);
      toast.success("Student details saved. Join the WhatsApp community next!");
    },
    onError: (error: Error) => toast.error(error.message),
  });
  const toggle = (value: string) =>
    setForm((current) => ({
      ...current,
      interests: current.interests.includes(value)
        ? current.interests.filter((item) => item !== value)
        : [...current.interests, value],
    }));
  async function continueWith(provider: "google" | "github") {
    setAuthBusy(provider);
    try {
      if (provider === "google") await signInWithGoogle();
      else await signInWithGitHub();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Sign in failed");
    } finally {
      setAuthBusy(null);
    }
  }
  if (!user)
    return (
      <div className="mx-auto max-w-md px-4 py-16">
        <GlassCard className="p-8 text-center">
          <span className="mx-auto grid size-12 place-items-center rounded-2xl bg-primary/15 text-primary">
            <Sparkles className="size-5" />
          </span>
          <h1 className="mt-5 font-display text-2xl font-bold">Sign in to join</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Sign in first, then complete your member profile to unlock the community.
          </p>
          <div className="mt-7 space-y-3">
            <Button
              className="w-full rounded-full"
              disabled={!!authBusy}
              onClick={() => continueWith("google")}
            >
              {authBusy === "google" ? "Connecting…" : "Continue with Google"}
            </Button>
            <Button
              variant="secondary"
              className="w-full rounded-full"
              disabled={!!authBusy}
              onClick={() => continueWith("github")}
            >
              {authBusy === "github" ? "Connecting…" : "Continue with GitHub"}
            </Button>
          </div>
          <p className="mt-6 text-xs text-muted-foreground">
            Your referral link will be preserved after sign in.
          </p>
        </GlassCard>
      </div>
    );
  if (submitted)
    return (
      <div className="mx-auto max-w-md px-4 py-16">
        <GlassCard className="p-8 text-center">
          <span className="mx-auto grid size-14 place-items-center rounded-2xl bg-emerald-500/15 text-emerald-600">
            <MessageCircle className="size-7" />
          </span>
          <h1 className="mt-5 font-display text-2xl font-bold">Thank you for your response!</h1>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            Your student details and mobile number have been saved. Join the WhatsApp community for
            updates, events, and learning opportunities.
          </p>
          {whatsappCommunityUrl ? (
            <Button asChild className="mt-7 w-full rounded-full" size="lg">
              <a href={whatsappCommunityUrl} target="_blank" rel="noreferrer">
                <MessageCircle className="size-4" /> Join WhatsApp Community
              </a>
            </Button>
          ) : (
            <p className="mt-7 rounded-2xl bg-muted p-4 text-xs text-muted-foreground">
              Add <code>VITE_WHATSAPP_COMMUNITY_URL</code> to enable the community invite button.
            </p>
          )}
          <Button
            variant="ghost"
            className="mt-3 w-full rounded-full"
            onClick={() => navigate({ to: "/dashboard" })}
          >
            Go to dashboard <ArrowRight className="size-4" />
          </Button>
        </GlassCard>
      </div>
    );
  return (
    <div className="mx-auto max-w-2xl px-4 py-12 sm:px-6">
      <div className="mb-8 text-center">
        <span className="mx-auto grid size-12 place-items-center rounded-2xl bg-primary/15 text-primary">
          <Sparkles className="size-5" />
        </span>
        <p className="mt-4 text-xs font-semibold uppercase tracking-widest text-primary">
          Join the student community
        </p>
        <h1 className="mt-2 font-display text-3xl font-bold">Tell us about yourself.</h1>
        <p className="mt-3 text-sm text-muted-foreground">
          Sign in, enter your details, and join the WhatsApp community.
        </p>
      </div>
      <GlassCard className="space-y-5 p-6 sm:p-8">
        <div className="space-y-2">
          <Label htmlFor="join-phone">Mobile number (WhatsApp) *</Label>
          <div className="relative">
            <Phone className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              id="join-phone"
              type="tel"
              required
              placeholder="e.g. +91 98765 43210"
              className="pl-11"
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
            />
          </div>
          <p className="text-xs text-muted-foreground">
            Use the number linked to your WhatsApp account.
          </p>
        </div>
        <div className="grid gap-5 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="join-name">Full name *</Label>
            <Input
              id="join-name"
              placeholder="Enter your full name"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="join-email">Email address *</Label>
            <Input
              id="join-email"
              type="email"
              readOnly
              placeholder="you@example.com"
              value={form.email}
            />
          </div>
        </div>
        <div className="grid gap-5 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="join-college">College / University *</Label>
            <CollegeAutocomplete
              id="join-college"
              value={form.college}
              onChange={(value) => setForm({ ...form, college: value })}
            />
            <p className="text-xs text-muted-foreground">
              Type a college name, then click a matching result.
            </p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="join-year">Year of study *</Label>
            <select
              id="join-year"
              value={form.year}
              onChange={(e) => setForm({ ...form, year: e.target.value })}
              className="h-10 w-full rounded-full border border-glass-border bg-glass px-4 text-sm"
            >
              <option value="">Choose year</option>
              {["1st Year", "2nd Year", "3rd Year", "4th Year", "Other"].map((item) => (
                <option key={item}>{item}</option>
              ))}
            </select>
          </div>
        </div>
        <div>
          <Label>
            Interests *{" "}
            <span className="font-normal text-muted-foreground">Select all that apply</span>
          </Label>
          <div className="mt-3 flex flex-wrap gap-2">
            {interests.map((item) => {
              const selected = form.interests.includes(item);
              return (
                <button
                  type="button"
                  key={item}
                  onClick={() => toggle(item)}
                  className={`rounded-full border px-3 py-2 text-xs ${selected ? "border-primary bg-primary text-primary-foreground" : "border-glass-border bg-glass text-muted-foreground"}`}
                >
                  {selected && <Check className="mr-1 inline size-3" />}
                  {item}
                </button>
              );
            })}
          </div>
        </div>
        <Button
          className="w-full rounded-full"
          size="lg"
          disabled={join.isPending}
          onClick={() => join.mutate()}
        >
          {join.isPending ? "Saving…" : "Save details & join WhatsApp"}
          <ArrowRight className="size-4" />
        </Button>
      </GlassCard>
    </div>
  );
}
