import { useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";

import { ActivityCard } from "@/components/activity-card";
import { CardSkeletonGrid, EmptyState, PageHeader } from "@/components/ui-kit";
import { activitiesQuery } from "@/lib/data";
import { formatDate } from "@/lib/format";

export const Route = createFileRoute("/calendar")({
  head: () => ({
    meta: [
      { title: "Calendar — COPEX Community" },
      { name: "description", content: "See every upcoming COPEX event and class grouped by day." },
      { property: "og:title", content: "Calendar — COPEX Community" },
      { property: "og:description", content: "Upcoming COPEX events and classes grouped by day." },
    ],
  }),
  component: CalendarPage,
});

function CalendarPage() {
  const { data, isLoading } = useQuery(activitiesQuery({ window: "upcoming" }));

  const groups = new Map<string, typeof data>();
  for (const a of data ?? []) {
    const key = formatDate(a.starts_at);
    groups.set(key, [...(groups.get(key) ?? []), a]);
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      <PageHeader title="Calendar" description="Everything coming up, grouped by day." />
      <div className="mt-8 space-y-10">
        {isLoading ? (
          <CardSkeletonGrid />
        ) : groups.size ? (
          [...groups.entries()].map(([day, items]) => (
            <section key={day}>
              <h2 className="font-display text-lg font-bold text-primary">{day}</h2>
              <div className="mt-4 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
                {(items ?? []).map((a) => <ActivityCard key={a.id} activity={a} />)}
              </div>
            </section>
          ))
        ) : (
          <EmptyState title="Nothing scheduled" description="New activities will appear here once published." />
        )}
      </div>
    </div>
  );
}
