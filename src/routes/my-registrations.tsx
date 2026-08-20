import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { toast } from "sonner";

import { EmptyState, GlassCard, PageHeader, Pill, RowSkeleton } from "@/components/ui-kit";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { STATUS_LABEL } from "@/lib/copex";
import { cancelRegistration, myRegistrationsQuery } from "@/lib/data";
import { formatDateTime } from "@/lib/format";

export const Route = createFileRoute("/my-registrations")({
  head: () => ({
    meta: [
      { title: "My registrations — COPEX Community" },
      {
        name: "description",
        content: "Track your COPEX event and class registrations and ticket codes.",
      },
      { property: "og:title", content: "My registrations — COPEX Community" },
      { property: "og:description", content: "Track your COPEX registrations and ticket codes." },
    ],
  }),
  component: MyRegistrationsPage,
});

function MyRegistrationsPage() {
  const { user, loading } = useAuth();
  const queryClient = useQueryClient();
  const { data, isLoading } = useQuery(myRegistrationsQuery(user?.uid));

  const cancel = useMutation({
    mutationFn: async (id: string) => {
      await cancelRegistration(id);
    },
    onSuccess: () => {
      toast.success("Registration cancelled");
      queryClient.invalidateQueries({ queryKey: ["my-registrations"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  if (!loading && !user) {
    return (
      <div className="mx-auto max-w-md px-4 py-20 text-center">
        <GlassCard className="p-8">
          <h1 className="font-display text-xl font-bold">Sign in required</h1>
          <p className="mt-2 text-sm text-muted-foreground">Sign in to see your registrations.</p>
          <Button asChild className="mt-6 rounded-full">
            <Link to="/login">Sign in</Link>
          </Button>
        </GlassCard>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
      <PageHeader title="My registrations" description="Your tickets, statuses and codes." />
      <div className="mt-8 space-y-4">
        {isLoading ? (
          <RowSkeleton />
        ) : data?.length ? (
          data.map((r) => (
            <GlassCard
              key={r.id}
              className="grid gap-4 p-6 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center"
            >
              <div className="min-w-0">
                <p className="truncate font-display text-lg font-bold">{r.activities?.title}</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  {formatDateTime(r.activities?.starts_at)}
                </p>
                <p className="mt-2 text-xs uppercase tracking-widest text-primary">Code {r.code}</p>
              </div>
              <div className="flex items-center gap-3">
                <Pill
                  tone={
                    r.status === "approved"
                      ? "success"
                      : r.status === "rejected"
                        ? "danger"
                        : "warning"
                  }
                >
                  {STATUS_LABEL[r.status]}
                </Pill>
                {r.status !== "cancelled" ? (
                  <Button
                    size="sm"
                    variant="secondary"
                    className="rounded-full"
                    onClick={() => cancel.mutate(r.id)}
                  >
                    Cancel
                  </Button>
                ) : null}
              </div>
            </GlassCard>
          ))
        ) : (
          <EmptyState
            title="No registrations yet"
            description="Browse events and classes to get started."
          />
        )}
      </div>
    </div>
  );
}
