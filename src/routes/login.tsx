import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Github, Mail, Sparkles } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { GlassCard } from "@/components/ui-kit";
import { Button } from "@/components/ui/button";
import { signInWithGitHub, signInWithGoogle } from "@/integrations/firebase/auth";

export const Route = createFileRoute("/login")({ component: LoginPage });

function LoginPage() {
  const navigate = useNavigate(); const [busy, setBusy] = useState<"google" | "github" | null>(null);
  async function handle(provider: "google" | "github") { setBusy(provider); try { if (provider === "google") await signInWithGoogle(); else await signInWithGitHub(); navigate({ to: "/" }); } catch (error) { toast.error(error instanceof Error ? error.message : "Sign in failed"); } finally { setBusy(null); } }
  return <div className="mx-auto flex max-w-md flex-col px-4 py-16"><GlassCard className="p-8 text-center"><span className="mx-auto grid size-12 place-items-center rounded-2xl bg-primary/15 text-primary"><Sparkles className="size-5" /></span><h1 className="mt-5 font-display text-2xl font-bold">Welcome back</h1><p className="mt-2 text-sm text-muted-foreground">Sign in securely to access your community account.</p><div className="mt-7 space-y-3"><Button className="w-full rounded-full" disabled={!!busy} onClick={() => handle("google")}>{busy === "google" ? "Connecting…" : <><Mail className="size-4" /> Continue with Google</>}</Button><Button variant="secondary" className="w-full rounded-full" disabled={!!busy} onClick={() => handle("github")}>{busy === "github" ? "Connecting…" : <><Github className="size-4" /> Continue with GitHub</>}</Button></div><p className="mt-6 text-sm text-muted-foreground">New to the community? <Link to="/join" className="text-primary">Join now</Link></p></GlassCard></div>;
}
