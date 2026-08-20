import { useQuery } from "@tanstack/react-query";
import { Link, createFileRoute } from "@tanstack/react-router";
import { ArrowRight, BookOpen, CalendarDays, ExternalLink, Sparkles, Users } from "lucide-react";
import { useMemo } from "react";

import { ActivityCard } from "@/components/activity-card";
import { CardSkeletonGrid, EmptyState, GlassCard, Pill, SectionHeading } from "@/components/ui-kit";
import { Button } from "@/components/ui/button";
import { activitiesQuery, communitiesQuery } from "@/lib/data";
import { getStoredResources } from "@/lib/resources";
import { useProfile } from "@/hooks/use-auth";
import { getResourceIcon } from "./resources";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "COPEX Community — Events, Resources & Clubs" },
      {
        name: "description",
        content:
          "Discover campus events, developer resources, hackathons, and study kits. Register in seconds and join communities on COPEX.",
      },
      { property: "og:title", content: "COPEX Community — Events, Resources & Clubs" },
      {
        property: "og:description",
        content: "Discover campus events, developer resources, and hackathons. Register in seconds.",
      },
    ],
  }),
  component: Home,
});

function Home() {
  const events = useQuery(activitiesQuery({ kind: "event", window: "upcoming" }));
  const communities = useQuery(communitiesQuery());
  const resources = useMemo(() => getStoredResources(), []);
  const { data: profile } = useProfile();
  const learningInterests = (profile as (typeof profile & { learning_interests?: string[] }) | null)?.learning_interests ?? [];

  return (
    <div className="mx-auto max-w-7xl px-4 pt-10 sm:px-6">
      <section className="glass-panel relative overflow-hidden rounded-[2rem] px-6 py-14 sm:px-12 sm:py-20">
        <span className="inline-flex items-center gap-2 rounded-full border border-glass-border bg-glass px-3.5 py-1.5 text-xs font-semibold uppercase tracking-widest text-primary">
          <Sparkles className="size-3.5" aria-hidden="true" /> COPEX Community
        </span>
        <h1 className="mt-6 max-w-3xl font-display text-4xl font-black leading-[1.05] tracking-tight sm:text-6xl">
          Every event, resource and club on campus — in one place.
        </h1>
        <p className="mt-5 max-w-xl text-base text-muted-foreground sm:text-lg">
          Browse workshops, hackathon kits, code templates, and guides. Register as an individual or team,
          and keep every resource at your fingertips.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Button asChild size="lg" className="rounded-full">
            <Link to="/events">
              Explore events <ArrowRight className="size-4" aria-hidden="true" />
            </Link>
          </Button>
          <Button asChild size="lg" variant="secondary" className="rounded-full">
            <Link to="/resources">Explore resources</Link>
          </Button>
        </div>

        <dl className="mt-12 grid gap-4 sm:grid-cols-3">
          {[
            { icon: Sparkles, label: "Live events", value: events.data?.length ?? 0 },
            { icon: BookOpen, label: "Study Resources", value: resources.length },
            { icon: Users, label: "Communities", value: communities.data?.length ?? 0 },
          ].map((stat) => (
            <GlassCard key={stat.label} className="flex items-center gap-4 p-5">
              <span className="grid size-11 shrink-0 place-items-center rounded-2xl bg-primary/15 text-primary">
                <stat.icon className="size-5" aria-hidden="true" />
              </span>
              <div className="min-w-0">
                <dt className="truncate text-xs uppercase tracking-widest text-muted-foreground">
                  {stat.label}
                </dt>
                <dd className="font-display text-2xl font-bold">{stat.value}</dd>
              </div>
            </GlassCard>
          ))}
        </dl>
      </section>

      {learningInterests.length ? <section className="mt-8"><GlassCard className="flex flex-col gap-5 p-6 sm:flex-row sm:items-center sm:justify-between"><div><p className="text-xs font-semibold uppercase tracking-widest text-primary">Personalized for you</p><h2 className="mt-2 font-display text-xl font-bold">Your learning path starts here</h2><p className="mt-1 text-sm text-muted-foreground">Explore recommendations based on your interests: {learningInterests.slice(0, 4).join(", ")}.</p></div><Button asChild className="shrink-0 rounded-full"><Link to="/resources">Explore recommendations <ArrowRight className="size-4" /></Link></Button></GlassCard></section> : null}

      {/* Upcoming Events */}
      <section className="mt-20">
        <SectionHeading
          title="Upcoming events"
          description="Hackathons, seminars, competitions and cultural nights."
          action={
            <Button asChild variant="ghost" size="sm" className="rounded-full">
              <Link to="/events">
                See all <ArrowRight className="size-4" aria-hidden="true" />
              </Link>
            </Button>
          }
        />
        {events.isLoading ? (
          <CardSkeletonGrid count={3} />
        ) : events.data?.length ? (
          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {events.data.slice(0, 6).map((a) => (
              <ActivityCard key={a.id} activity={a} />
            ))}
          </div>
        ) : (
          <EmptyState
            icon={<CalendarDays className="size-6" aria-hidden="true" />}
            title="No upcoming events yet"
            description="New events will appear here as soon as organizers publish them."
          />
        )}
      </section>

      {/* Resources & Kits Section */}
      <section className="mt-20">
        <SectionHeading
          title="Resources & Developer Kits"
          description="Roadmaps, hackathon boilerplates, design tokens, and exam study guides."
          action={
            <Button asChild variant="ghost" size="sm" className="rounded-full">
              <Link to="/resources">
                See all <ArrowRight className="size-4" aria-hidden="true" />
              </Link>
            </Button>
          }
        />
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {resources.slice(0, 6).map((res) => {
            const Icon = getResourceIcon(res.type);
            return (
              <Link key={res.id} to="/resources/$resourceId" params={{ resourceId: res.id }}>
                <GlassCard className="glass-hover group flex h-full flex-col p-6 transition-transform duration-300 hover:-translate-y-1">
                  <div className="flex items-center justify-between gap-2">
                    <span className="grid size-9 place-items-center rounded-xl bg-primary/10 text-primary">
                      <Icon className="size-4" aria-hidden="true" />
                    </span>
                    <Pill tone={res.featured ? "primary" : "neutral"} className="text-[10px]">
                      {res.category}
                    </Pill>
                  </div>
                  <h3 className="mt-4 font-display text-base font-bold group-hover:text-primary transition-colors">
                    {res.title}
                  </h3>
                  <p className="mt-2 line-clamp-2 text-xs leading-relaxed text-muted-foreground">
                    {res.description}
                  </p>
                  <div className="mt-auto pt-4 flex items-center justify-between border-t border-glass-border/60 text-xs text-muted-foreground">
                    <span>{res.author_name}</span>
                    <span className="inline-flex items-center gap-1 font-semibold text-primary">
                      View <ExternalLink className="size-3" />
                    </span>
                  </div>
                </GlassCard>
              </Link>
            );
          })}
        </div>
      </section>

      {/* Communities Section */}
      <section className="mt-20">
        <SectionHeading
          title="Communities"
          description="Clubs and technical groups you can join today."
          action={
            <Button asChild variant="ghost" size="sm" className="rounded-full">
              <Link to="/communities">
                See all <ArrowRight className="size-4" aria-hidden="true" />
              </Link>
            </Button>
          }
        />
        {communities.data?.length ? (
          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {communities.data.slice(0, 3).map((c) => (
              <Link key={c.id} to="/communities/$communityId" params={{ communityId: c.id }}>
                <GlassCard className="h-full p-6 transition-transform hover:-translate-y-1">
                  <h3 className="font-display text-lg font-bold">{c.name}</h3>
                  <p className="mt-2 line-clamp-3 text-sm text-muted-foreground">
                    {c.description}
                  </p>
                  <p className="mt-4 text-xs uppercase tracking-widest text-primary">
                    {c.member_count} members
                  </p>
                </GlassCard>
              </Link>
            ))}
          </div>
        ) : (
          <EmptyState
            icon={<Users className="size-6" aria-hidden="true" />}
            title="No communities yet"
            description="Communities created by organizers will show up here."
          />
        )}
      </section>
    </div>
  );
}
