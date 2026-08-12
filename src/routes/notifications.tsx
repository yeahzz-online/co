import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";

import { EmptyState, GlassCard, PageHeader, RowSkeleton } from "@/components/ui-kit";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/integrations/supabase/client";
import { notificationsQuery } from "@/lib/data";
import { formatRelative } from "@/lib/format";

export const Route = createFileRoute("/notifications")({
  head: () => ({
    meta: [
      { title: "Notifications — COPEX Community" },
      { name: "description", content: "Registration approvals, reminders and community updates." },
      { property: "og:title", content: "Notifications — COPEX Community" },
      { property: "og:description", content: "Approvals, reminders and community updates." },
    ],
  }),
  component: NotificationsPage,
});

function NotificationsPage() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { data, isLoading } = useQuery(notificationsQuery(user?.id));

  const markAll = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from("notifications").update({ read: true }).eq("user_id", user!.id).eq("read", false);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["notifications"] }),
  });

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
      <PageHeader title="Notifications" description="Everything that needs your attention.">
        <Button variant="secondary" className="rounded-full" onClick={() => markAll.mutate()}>
          Mark all read
        </Button>
      </PageHeader>
      <div className="mt-8 space-y-3">
        {isLoading ? (
          <RowSkeleton />
        ) : data?.length ? (
          data.map((n) => (
            <GlassCard key={n.id} className="p-5">
              <div className="flex items-start justify-between gap-3">
                <p className="font-semibold">{n.title}</p>
                {!n.read ? <span className="mt-1.5 size-2 shrink-0 rounded-full bg-primary" /> : null}
              </div>
              {n.body ? <p className="mt-1 text-sm text-muted-foreground">{n.body}</p> : null}
              <p className="mt-2 text-xs text-muted-foreground">{formatRelative(n.created_at)}</p>
            </GlassCard>
          ))
        ) : (
          <EmptyState title="You're all caught up" description="Notifications about your registrations will appear here." />
        )}
      </div>
    </div>
  );
}
