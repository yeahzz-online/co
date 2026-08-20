import { useQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { BookOpen, Search as SearchIcon } from "lucide-react";
import { useMemo, useState } from "react";

import { ActivityCard } from "@/components/activity-card";
import { CardSkeletonGrid, EmptyState, GlassCard, PageHeader, Pill } from "@/components/ui-kit";
import { Input } from "@/components/ui/input";
import { activitiesQuery } from "@/lib/data";
import { getStoredResources } from "@/lib/resources";

export const Route = createFileRoute("/search")({
  head: () => ({
    meta: [
      { title: "Search — COPEX Community" },
      { name: "description", content: "Search every COPEX event, resource and community in one place." },
      { property: "og:title", content: "Search — COPEX Community" },
      { property: "og:description", content: "Search COPEX events, resources and communities." },
    ],
  }),
  component: SearchPage,
});

function SearchPage() {
  const [term, setTerm] = useState("");

  const { data: activities, isLoading, isFetching } = useQuery({
    ...activitiesQuery({ search: term }),
    enabled: term.trim().length > 1,
  });

  const matchingResources = useMemo(() => {
    if (term.trim().length < 2) return [];
    const t = term.trim().toLowerCase();
    return getStoredResources().filter(
      (r) =>
        r.title.toLowerCase().includes(t) ||
        r.description.toLowerCase().includes(t) ||
        r.tags.some((tag) => tag.toLowerCase().includes(t))
    );
  }, [term]);

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      <PageHeader title="Search" description="Find events, study resources, and communities instantly." />

      <div className="mt-6 max-w-xl relative">
        <SearchIcon className="absolute left-4 top-1/2 size-5 -translate-y-1/2 text-muted-foreground" />
        <Input
          autoFocus
          value={term}
          onChange={(e) => setTerm(e.target.value)}
          placeholder="Search events, developer resources, roadmaps..."
          aria-label="Search COPEX"
          className="h-12 pl-12 rounded-full border-glass-border bg-glass-strong text-sm"
        />
      </div>

      <div className="mt-8 space-y-10">
        {term.trim().length < 2 ? (
          <EmptyState title="Start typing" description="Enter at least two characters to search platform content." />
        ) : isLoading || isFetching ? (
          <CardSkeletonGrid count={3} />
        ) : (
          <>
            {/* Matching Resources */}
            {matchingResources.length > 0 ? (
              <section>
                <h3 className="mb-4 font-display text-lg font-bold flex items-center gap-2">
                  <BookOpen className="size-4 text-primary" /> Matching Resources ({matchingResources.length})
                </h3>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {matchingResources.map((res) => (
                    <Link key={res.id} to="/resources/$resourceId" params={{ resourceId: res.id }}>
                      <GlassCard className="glass-hover h-full p-5">
                        <Pill tone="violet" className="text-[10px]">{res.category}</Pill>
                        <h4 className="mt-2 font-display text-sm font-bold">{res.title}</h4>
                        <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">{res.description}</p>
                      </GlassCard>
                    </Link>
                  ))}
                </div>
              </section>
            ) : null}

            {/* Matching Events */}
            <section>
              <h3 className="mb-4 font-display text-lg font-bold">
                Matching Events ({activities?.length ?? 0})
              </h3>
              {activities?.length ? (
                <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
                  {activities.map((a) => (
                    <ActivityCard key={a.id} activity={a} />
                  ))}
                </div>
              ) : matchingResources.length === 0 ? (
                <EmptyState title="No results found" description="Try a different keyword or category." />
              ) : null}
            </section>
          </>
        )}
      </div>
    </div>
  );
}
