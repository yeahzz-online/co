import { useQuery } from "@tanstack/react-query";
import { Link, createFileRoute } from "@tanstack/react-router";
import { ArrowRight, CalendarDays, GraduationCap, Sparkles, Users } from "lucide-react";

import { ActivityCard } from "@/components/activity-card";
import { CardSkeletonGrid, EmptyState, GlassCard, SectionHeading } from "@/components/ui-kit";
import { Button } from "@/components/ui/button";
import { activitiesQuery, communitiesQuery } from "@/lib/data";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "COPEX Community — Events, Classes & Clubs" },
      {
        name: "description",
        content:
          "Discover campus events, workshops, hackathons and live classes. Register in seconds and join communities on COPEX.",
      },
      { property: "og:title", content: "COPEX Community — Events, Classes & Clubs" },
      {
        property: "og:description",
        content: "Discover campus events, workshops and live classes. Register in seconds.",
      },
    ],
  }),
  component: Home,
});

function Home() {
  const events = useQuery(activitiesQuery({ kind: "event", window: "upcoming" }));
  const classes = useQuery(activitiesQuery({ kind: "class", window: "upcoming" }));
  const communities = useQuery(communitiesQuery());

  return (
    <div className="mx-auto max-w-7xl px-4 pt-10 sm:px-6">
      <section className="glass-panel relative overflow-hidden rounded-[2rem] px-6 py-14 sm:px-12 sm:py-20">
        <span className="inline-flex items-center gap-2 rounded-full border border-glass-border bg-glass px-3.5 py-1.5 text-xs font-semibold uppercase tracking-widest text-primary">
          <Sparkles className="size-3.5" aria-hidden="true" /> COPEX Community
        </span>
        <h1 className="mt-6 max-w-3xl font-display text-4xl font-black leading-[1.05] tracking-tight sm:text-6xl">
          Every event, class and club on campus — in one place.
        </h1>
        <p className="mt-5 max-w-xl text-base text-muted-foreground sm:text-lg">
          Browse workshops, hackathons and live classes, register as an individual or a team,
          and keep every ticket in your pocket.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Button asChild size="lg" className="rounded-full">
            <Link to="/events">
              Explore events <ArrowRight className="size-4" aria-hidden="true" />
            </Link>
          </Button>
          <Button asChild size="lg" variant="secondary" className="rounded-full">
            <Link to="/classes">Browse classes</Link>
          </Button>
        </div>

        <dl className="mt-12 grid gap-4 sm:grid-cols-3">
          {[
            { icon: Sparkles, label: "Live events", value: events.data?.length ?? 0 },
            { icon: GraduationCap, label: "Open classes", value: classes.data?.length ?? 0 },
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
            icon={CalendarDays}
            title="No upcoming events yet"
            description="New events will appear here as soon as organizers publish them."
          />
        )}
      </section>

      <section className="mt-20">
        <SectionHeading
          title="Classes & workshops"
          description="Structured sessions with instructors, outcomes and levels."
          action={
            <Button asChild variant="ghost" size="sm" className="rounded-full">
              <Link to="/classes">
                See all <ArrowRight className="size-4" aria-hidden="true" />
              </Link>
            </Button>
          }
        />
        {classes.isLoading ? (
          <CardSkeletonGrid count={3} />
        ) : classes.data?.length ? (
          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {classes.data.slice(0, 6).map((a) => (
              <ActivityCard key={a.id} activity={a} />
            ))}
          </div>
        ) : (
          <EmptyState
            icon={GraduationCap}
            title="No classes scheduled"
            description="Check back soon for new workshops and sessions."
          />
        )}
      </section>

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
            icon={Users}
            title="No communities yet"
            description="Communities created by organizers will show up here."
          />
        )}
      </section>
    </div>
  );
}
