import { useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";

import { ActivityCard } from "@/components/activity-card";
import { ActivityFilterBar, DEFAULT_FILTERS, type FilterState } from "@/components/activity-filters";
import { CardSkeletonGrid, EmptyState, PageHeader } from "@/components/ui-kit";
import { activitiesQuery } from "@/lib/data";

export const Route = createFileRoute("/events")({
  head: () => ({
    meta: [
      { title: "Events & Workshops — COPEX Community" },
      { name: "description", content: "Browse hackathons, seminars, competitions and cultural events on COPEX." },
      { property: "og:title", content: "Events & Workshops — COPEX Community" },
      { property: "og:description", content: "Browse hackathons, seminars and competitions on COPEX." },
    ],
  }),
  component: EventsPage,
});

function EventsPage() {
  const [filters, setFilters] = useState<FilterState>(DEFAULT_FILTERS);
  const { data, isLoading } = useQuery(activitiesQuery({ kind: "event", ...filters }));

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      <PageHeader title="Events" description="Hackathons, seminars, competitions and cultural nights." />
      <div className="mt-6">
        <ActivityFilterBar value={filters} onChange={setFilters} />
      </div>
      <div className="mt-8">
        {isLoading ? (
          <CardSkeletonGrid />
        ) : data?.length ? (
          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {data.map((a) => <ActivityCard key={a.id} activity={a} />)}
          </div>
        ) : (
          <EmptyState title="No events match your filters" description="Try clearing filters or checking a wider date range." />
        )}
      </div>
    </div>
  );
}
