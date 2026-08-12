import { useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";

import { ActivityCard } from "@/components/activity-card";
import { ActivityFilterBar, DEFAULT_FILTERS, type FilterState } from "@/components/activity-filters";
import { CardSkeletonGrid, EmptyState, PageHeader } from "@/components/ui-kit";
import { activitiesQuery } from "@/lib/data";

export const Route = createFileRoute("/classes")({
  head: () => ({
    meta: [
      { title: "Classes & Workshops — COPEX Community" },
      { name: "description", content: "Browse live classes, workshops and skill sessions on COPEX." },
      { property: "og:title", content: "Classes & Workshops — COPEX Community" },
      { property: "og:description", content: "Browse live classes and workshops on COPEX." },
    ],
  }),
  component: ClassesPage,
});

function ClassesPage() {
  const [filters, setFilters] = useState<FilterState>(DEFAULT_FILTERS);
  const { data, isLoading } = useQuery(activitiesQuery({ kind: "class", ...filters }));

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      <PageHeader title="Classes" description="Structured sessions with instructors, outcomes and levels." />
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
          <EmptyState title="No classes match your filters" description="Try clearing filters or checking a wider date range." />
        )}
      </div>
    </div>
  );
}
