import { useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";

import { ActivityCard } from "@/components/activity-card";
import { CardSkeletonGrid, EmptyState, PageHeader } from "@/components/ui-kit";
import { Input } from "@/components/ui/input";
import { activitiesQuery } from "@/lib/data";

export const Route = createFileRoute("/search")({
  head: () => ({
    meta: [
      { title: "Search — COPEX Community" },
      { name: "description", content: "Search every COPEX event, class and workshop in one place." },
      { property: "og:title", content: "Search — COPEX Community" },
      { property: "og:description", content: "Search COPEX events, classes and workshops." },
    ],
  }),
  component: SearchPage,
});

function SearchPage() {
  const [term, setTerm] = useState("");
  const { data, isLoading, isFetching } = useQuery({
    ...activitiesQuery({ search: term }),
    enabled: term.trim().length > 1,
  });

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      <PageHeader title="Search" description="Find events, classes and workshops instantly." />
      <div className="mt-6 max-w-xl">
        <Input
          autoFocus
          value={term}
          onChange={(e) => setTerm(e.target.value)}
          placeholder="Search COPEX"
          aria-label="Search COPEX"
          className="h-12 rounded-2xl"
        />
      </div>
      <div className="mt-8">
        {term.trim().length < 2 ? (
          <EmptyState title="Start typing" description="Enter at least two characters to search." />
        ) : isLoading || isFetching ? (
          <CardSkeletonGrid count={3} />
        ) : data?.length ? (
          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {data.map((a) => <ActivityCard key={a.id} activity={a} />)}
          </div>
        ) : (
          <EmptyState title="No results" description="Try a different keyword." />
        )}
      </div>
    </div>
  );
}
