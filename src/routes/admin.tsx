import { useQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";

import { GlassCard, PageHeader, RowSkeleton } from "@/components/ui-kit";
import { Button } from "@/components/ui/button";
import { usePermissions } from "@/hooks/use-auth";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [
      { title: "Admin — COPEX Community" },
      { name: "description", content: "Platform overview for COPEX administrators." },
      { property: "og:title", content: "Admin — COPEX Community" },
      { property: "og:description", content: "Platform overview for COPEX administrators." },
    ],
  }),
  component: AdminPage,
});

function AdminPage() {
  const { isAdmin } = usePermissions();

  const { data, isLoading } = useQuery({
    queryKey: ["admin-stats"],
    enabled: isAdmin,
    queryFn: async () => {
      const [activities, registrations, communities] = await Promise.all([
        supabase.from("activities").select("id", { count: "exact", head: true }),
        supabase.from("registrations").select("id", { count: "exact", head: true }),
        supabase.from("communities").select("id", { count: "exact", head: true }),
      ]);
      return {
        activities: activities.count ?? 0,
        registrations: registrations.count ?? 0,
        communities: communities.count ?? 0,
      };
    },
  });

  if (!isAdmin) {
    return (
      <div className="mx-auto max-w-md px-4 py-20 text-center">
        <GlassCard className="p-8">
          <h1 className="font-display text-xl font-bold">Admins only</h1>
          <Button asChild className="mt-6 rounded-full"><Link to="/">Back home</Link></Button>
        </GlassCard>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
      <PageHeader title="Admin" description="Platform-wide overview." />
      <div className="mt-8">
        {isLoading ? (
          <RowSkeleton rows={3} />
        ) : (
          <dl className="grid gap-5 sm:grid-cols-3">
            {[
              ["Activities", data?.activities ?? 0],
              ["Registrations", data?.registrations ?? 0],
              ["Communities", data?.communities ?? 0],
            ].map(([label, value]) => (
              <GlassCard key={String(label)} className="p-6">
                <dt className="text-xs uppercase tracking-widest text-muted-foreground">{label}</dt>
                <dd className="mt-2 font-display text-3xl font-black">{value}</dd>
              </GlassCard>
            ))}
          </dl>
        )}
      </div>
    </div>
  );
}
