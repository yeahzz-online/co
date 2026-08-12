import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";

import { GlassCard } from "@/components/ui-kit";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { lovable } from "@/integrations/lovable/index";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/register")({
  head: () => ({
    meta: [
      { title: "Create account — COPEX Community" },
      { name: "description", content: "Create a COPEX account to register for events, classes and clubs." },
      { property: "og:title", content: "Create account — COPEX Community" },
      { property: "og:description", content: "Create a COPEX account to join events and classes." },
    ],
  }),
  component: RegisterPage,
});

function RegisterPage() {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (password.length < 8) return toast.error("Password must be at least 8 characters");
    setBusy(true);
    const { error } = await supabase.auth.signUp({
      email: email.trim(),
      password,
      options: { emailRedirectTo: window.location.origin, data: { full_name: fullName.trim() } },
    });
    setBusy(false);
    if (error) return toast.error(error.message);
    setSent(true);
  }

  async function handleGoogle() {
    const result = await lovable.auth.signInWithOAuth("google", { redirect_uri: window.location.origin });
    if (result.error) toast.error("Google sign-in failed");
  }

  return (
    <div className="mx-auto flex max-w-md flex-col px-4 py-16">
      <GlassCard className="p-8">
        <h1 className="font-display text-2xl font-bold">Join COPEX</h1>
        {sent ? (
          <p className="mt-4 text-sm text-muted-foreground">
            Check your email to confirm your account, then sign in.
          </p>
        ) : (
          <>
            <p className="mt-2 text-sm text-muted-foreground">One account for every event and class.</p>
            <form onSubmit={handleSubmit} className="mt-6 space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Full name</Label>
                <Input id="name" required maxLength={100} value={fullName} onChange={(e) => setFullName(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" required maxLength={255} value={email} onChange={(e) => setEmail(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input id="password" type="password" required value={password} onChange={(e) => setPassword(e.target.value)} />
              </div>
              <Button type="submit" className="w-full rounded-full" disabled={busy}>
                {busy ? "Creating…" : "Create account"}
              </Button>
            </form>
            <Button variant="secondary" className="mt-3 w-full rounded-full" onClick={handleGoogle}>
              Continue with Google
            </Button>
          </>
        )}
        <p className="mt-6 text-center text-sm text-muted-foreground">
          Already registered? <Link to="/login" className="text-primary">Sign in</Link>
        </p>
      </GlassCard>
    </div>
  );
}
