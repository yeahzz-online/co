import { createFileRoute, Link } from "@tanstack/react-router";
import { Github, Mail } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { GlassCard } from "@/components/ui-kit";
import { Button } from "@/components/ui/button";
import { signInWithGitHub, signInWithGoogle } from "@/integrations/firebase/auth";

export const Route = createFileRoute("/register")({ component: RegisterPage });
function RegisterPage() {
  const [busy, setBusy] = useState(false);
  async function join(provider: "google" | "github") { setBusy(true); try { if (provider === "google") await signInWithGoogle(); else await signInWithGitHub(); window.location.href = "/join"; } catch (error) { toast.error(error instanceof Error ? error.message : "Could not create account"); } finally { setBusy(false); } }
  return <div className="mx-auto flex max-w-md flex-col px-4 py-16"><GlassCard className="p-8 text-center"><h1 className="font-display text-2xl font-bold">Join the community</h1><p className="mt-2 text-sm text-muted-foreground">Create your account with Google or GitHub, then complete your member profile.</p><div className="mt-7 space-y-3"><Button className="w-full rounded-full" disabled={busy} onClick={() => join("google")}><Mail className="size-4" /> Continue with Google</Button><Button variant="secondary" className="w-full rounded-full" disabled={busy} onClick={() => join("github")}><Github className="size-4" /> Continue with GitHub</Button></div><p className="mt-6 text-sm text-muted-foreground">Already registered? <Link to="/login" className="text-primary">Sign in</Link></p></GlassCard></div>;
}
