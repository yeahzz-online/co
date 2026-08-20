import { useQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { FileText, Loader2 } from "lucide-react";

import { GlassCard, PageHeader, Pill } from "@/components/ui-kit";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { listForms } from "@/lib/forms";

export const Route = createFileRoute("/forms")({ component: FormsPage });

function FormsPage() {
  const { user } = useAuth();
  const forms = useQuery({ queryKey: ["forms", "published"], queryFn: () => listForms(false) });
  return <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6"><PageHeader title="Available forms" description="Registrations, applications, surveys, and opportunities from the COPEX community." />{!user && <p className="mt-4 text-sm text-muted-foreground">Some forms may require you to sign in before submitting.</p>}<div className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-3">{forms.isLoading ? <div className="flex justify-center md:col-span-2 lg:col-span-3"><Loader2 className="animate-spin text-primary" /></div> : forms.data?.map((form) => <GlassCard key={form.id} className="p-6"><Pill tone="success" className="text-[10px]">Open</Pill><h2 className="mt-3 font-display text-xl font-bold">{form.title}</h2><p className="mt-2 text-sm text-muted-foreground">{form.description || "Complete this form to submit your response."}</p><p className="mt-3 text-xs text-muted-foreground">{form.category}</p><Button asChild className="mt-5 rounded-full"><Link to="/forms/$formId" params={{ formId: form.id }}>Open form</Link></Button></GlassCard>)}{!forms.isLoading && !forms.data?.length && <GlassCard className="p-10 text-center md:col-span-2 lg:col-span-3"><FileText className="mx-auto size-10 text-primary" /><h2 className="mt-3 font-display text-lg font-bold">No active forms</h2><p className="mt-1 text-sm text-muted-foreground">Check back soon for new community activities.</p></GlassCard>}</div></div>;
}
