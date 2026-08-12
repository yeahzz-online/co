import { useQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";

import { ActivityCard } from "@/components/activity-card";
import { EmptyState, GlassCard, PageHeader, RowSkeleton } from "@/components/ui-kit";
import { Button } from "@/components/ui/button";
import { useAuth, usePermissions } from "@/hooks/use-auth";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/organizer")({
  head: () => ({
    meta: [
      { title: "Organizer dashboard — COPEX Community" },
      { name: "description", content: "Manage the events and classes you organize on COPEX." },
      { property: "og:title", content: "Organizer dashboard — COPEX Community" },
      { property: "og:description", content: "Manage the activities you organize on COPEX." },
    ],
  }),
  component: OrganizerPage,
});

function OrganizerPage() {
  const { user } = useAuth();
  const { isStaff } = usePermissions();

  const { data, isLoading } = useQuery({
    queryKey: ["organizer-activities", user?.id],
    enabled: !!user && isStaff,
    queryFn: async () => {
      const { data: rows, error } = await supabase
        .from("activities")
        .select("*")
        .eq("organizer_id", user!.id)
        .order("starts_at", { ascending: false });
      if (error) throw error;
      return rows ?? [];
    },
  });

  if (!isStaff) {
    return (
      <div className="mx-auto max-w-md px-4 py-20 text-center">
        <GlassCard className="p-8">
          <h1 className="font-display text-xl font-bold">Organizers only</h1>
          <p className="mt-2 text-sm text-muted-foreground">Ask an admin for organizer access.</p>
          <Button asChild className="mt-6 rounded-full"><Link to="/">Back home</Link></Button>
        </GlassCard>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      <PageHeader title="Organizer dashboard" description="Activities you own, with live seat counts." />
      <div className="mt-8">
        {isLoading ? (
          <RowSkeleton />
        ) : data?.length ? (
          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {data.map((a) => <ActivityCard key={a.id} activity={a} />)}
          </div>
        ) : (
          <EmptyState title="No activities yet" description="Activities you create will appear here." />
        )}
      </div>
    </div>
  );
}
