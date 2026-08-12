import { useQuery } from "@tanstack/react-query";
import { Link, createFileRoute } from "@tanstack/react-router";
import { useState } from "react";

import { CardSkeletonGrid, EmptyState, GlassCard, PageHeader } from "@/components/ui-kit";
import { Input } from "@/components/ui/input";
import { communitiesQuery } from "@/lib/data";
import { categoryLabel } from "@/lib/copex";

export const Route = createFileRoute("/communities")({
  head: () => ({
    meta: [
      { title: "Communities & Clubs — COPEX Community" },
      { name: "description", content: "Join technical clubs, cultural groups and interest communities on COPEX." },
      { property: "og:title", content: "Communities & Clubs — COPEX Community" },
      { property: "og:description", content: "Join technical clubs and interest groups on COPEX." },
    ],
  }),
  component: CommunitiesPage,
});

function CommunitiesPage() {
  const [search, setSearch] = useState("");
  const { data, isLoading } = useQuery(communitiesQuery(search));

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      <PageHeader title="Communities" description="Clubs and technical groups you can join today." />
      <div className="mt-6 max-w-md">
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search communities"
          aria-label="Search communities"
          className="h-11 rounded-2xl"
        />
      </div>
      <div className="mt-8">
        {isLoading ? (
          <CardSkeletonGrid />
        ) : data?.length ? (
          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {data.map((c) => (
              <Link key={c.id} to="/communities/$communityId" params={{ communityId: c.id }}>
                <GlassCard className="h-full p-6 transition-transform hover:-translate-y-1">
                  <p className="text-xs uppercase tracking-widest text-primary">{categoryLabel(c.category)}</p>
                  <h2 className="mt-2 font-display text-lg font-bold">{c.name}</h2>
                  <p className="mt-2 line-clamp-3 text-sm text-muted-foreground">{c.description}</p>
                  <p className="mt-4 text-xs text-muted-foreground">{c.member_count} members</p>
                </GlassCard>
              </Link>
            ))}
          </div>
        ) : (
          <EmptyState title="No communities found" description="Try a different search term." />
        )}
      </div>
    </div>
  );
}
