import { useQuery } from "@tanstack/react-query";
import { Link, createFileRoute } from "@tanstack/react-router";
import { ArrowUpRight, Search, SlidersHorizontal, UsersRound } from "lucide-react";
import { useMemo, useState } from "react";

import { CardSkeletonGrid, EmptyState, GlassCard, Pill } from "@/components/ui-kit";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/hooks/use-auth";
import { communitiesQuery } from "@/lib/data";
import { CATEGORIES, categoryLabel } from "@/lib/copex";

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
  const [category, setCategory] = useState("all");
  const { data, isLoading } = useQuery(communitiesQuery(search));
  const { user } = useAuth();
  const visibleCommunities = useMemo(
    () => (data ?? []).filter((community) => category === "all" || community.category === category),
    [category, data],
  );

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      <div className="relative overflow-hidden rounded-[2rem] border border-glass-border bg-glass-strong px-6 py-8 sm:px-10 sm:py-12">
        <div className="absolute -right-20 -top-24 size-72 rounded-full bg-violet/20 blur-3xl" />
        <div className="relative max-w-2xl"><Pill tone="primary">Find your people</Pill><h1 className="mt-4 text-4xl font-bold tracking-tight sm:text-5xl">Communities that move you forward.</h1><p className="mt-4 max-w-xl text-sm leading-6 text-muted-foreground sm:text-base">Join the clubs, circles, and learning groups that make campus life more connected.</p></div>
        <div className="relative mt-8 grid gap-3 sm:grid-cols-[minmax(0,1fr)_auto]"><div className="relative max-w-xl"><Search className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" /><Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search by name or interest" aria-label="Search communities" className="h-12 rounded-2xl pl-11" /></div>{!user ? <Button asChild variant="secondary" className="h-12 rounded-2xl"><Link to="/register">Create your profile <ArrowUpRight className="size-4" /></Link></Button> : null}</div>
      </div>
      <div className="mt-10 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"><div><p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">Explore</p><h2 className="mt-1 text-2xl font-bold">Discover your next circle</h2></div><div className="flex items-center gap-2 text-sm text-muted-foreground"><SlidersHorizontal className="size-4" /> {visibleCommunities.length} communities</div></div>
      <Tabs value={category} onValueChange={setCategory} className="mt-5 overflow-x-auto"><TabsList className="h-auto min-w-max rounded-2xl bg-glass p-1"><TabsTrigger value="all" className="rounded-xl px-4 py-2">All</TabsTrigger>{CATEGORIES.map((item) => <TabsTrigger key={item.value} value={item.value} className="rounded-xl px-4 py-2">{item.label}</TabsTrigger>)}</TabsList></Tabs>
      <div className="mt-6">
        {isLoading ? (
          <CardSkeletonGrid />
        ) : visibleCommunities.length ? (
          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {visibleCommunities.map((c) => (
              <Link key={c.id} to="/communities/$communityId" params={{ communityId: c.id }}>
                <GlassCard interactive className="group relative h-full overflow-hidden p-6">
                  <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-primary via-violet to-accent opacity-70" /><div className="flex items-start justify-between gap-4"><div className="grid size-12 shrink-0 place-items-center overflow-hidden rounded-2xl bg-primary/15 text-lg font-bold text-primary">{c.logo_url ? <img src={c.logo_url} alt="" className="size-full object-cover" /> : c.name.slice(0, 1).toUpperCase()}</div><ArrowUpRight className="size-4 text-muted-foreground transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" /></div>
                  <p className="mt-5 text-xs font-semibold uppercase tracking-widest text-primary">{categoryLabel(c.category)}</p><h2 className="mt-2 font-display text-xl font-bold">{c.name}</h2><p className="mt-2 line-clamp-3 text-sm leading-6 text-muted-foreground">{c.description ?? "A welcoming space to learn, connect, and participate."}</p><div className="mt-6 flex items-center gap-2 text-xs font-medium text-muted-foreground"><UsersRound className="size-4 text-primary" /> {c.member_count} members <span className="text-border">•</span> Open to join</div>
                </GlassCard>
              </Link>
            ))}
          </div>
        ) : (
          <EmptyState title="No communities found" description={search ? "Try a different search term or clear the filter." : "There are no published communities in this category yet."} />
        )}
      </div>
    </div>
  );
}
