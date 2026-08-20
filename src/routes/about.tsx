import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Crown, Sparkles, Users } from "lucide-react";

import { GlassCard, PageHeader } from "@/components/ui-kit";

export const Route = createFileRoute("/about")({ component: AboutPage });

const team = [
  {
    name: "Jayanth Karnati",
    role: "Founder",
    icon: Crown,
    initials: "JK",
    description:
      "Building the vision and bringing students together through practical learning and meaningful opportunities.",
  },
  {
    name: "Aman Khan",
    role: "Co-founder",
    icon: Users,
    initials: "AK",
    description:
      "Helping grow the community, create collaborations, and make every student feel welcome.",
  },
  {
    name: "Vishnu Charith",
    role: "Co-founder",
    icon: Sparkles,
    initials: "VC",
    description:
      "Supporting programs, events, and the community experience that turns ideas into action.",
  },
] as const;

function AboutPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
      <PageHeader
        title="A community built by students, for students."
        description="COPEX helps students learn together, meet the right people, and discover opportunities that move their next chapter forward."
      >
        <p className="text-sm font-semibold text-primary">About COPEX</p>
      </PageHeader>

      <GlassCard className="mt-10 overflow-hidden p-0">
        <div className="grid gap-8 bg-gradient-to-br from-primary/10 via-transparent to-secondary/10 p-6 sm:p-10 lg:grid-cols-[1.2fr_0.8fr] lg:items-center">
          <div>
            <p className="text-sm font-semibold text-primary">Our purpose</p>
            <h2 className="mt-3 font-display text-3xl font-bold tracking-tight sm:text-4xl">
              Learn together. Build boldly. Grow as a community.
            </h2>
            <p className="mt-4 max-w-2xl leading-7 text-muted-foreground">
              From workshops and events to peer connections and real projects, COPEX gives students
              a place to take the next step with confidence.
            </p>
            <Link
              to="/join"
              className="mt-7 inline-flex items-center gap-2 rounded-full bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground hover:opacity-90"
            >
              Join the community <ArrowRight className="size-4" />
            </Link>
          </div>
          <div className="grid grid-cols-2 gap-3 sm:gap-4">
            <div className="rounded-3xl bg-white/75 p-5 shadow-sm">
              <p className="font-display text-3xl font-bold text-primary">1</p>
              <p className="mt-1 text-sm text-muted-foreground">shared student vision</p>
            </div>
            <div className="rounded-3xl bg-white/75 p-5 shadow-sm">
              <p className="font-display text-3xl font-bold text-primary">∞</p>
              <p className="mt-1 text-sm text-muted-foreground">possibilities to explore</p>
            </div>
          </div>
        </div>
      </GlassCard>

      <section className="mt-14">
        <div className="mb-6">
          <p className="text-sm font-semibold text-primary">The people behind COPEX</p>
          <h2 className="mt-2 font-display text-2xl font-bold sm:text-3xl">
            Meet the founding team
          </h2>
        </div>
        <div className="grid gap-5 md:grid-cols-3">
          {team.map((member) => {
            const Icon = member.icon;
            return (
              <GlassCard key={member.name} className="p-6">
                <div className="flex items-center gap-4">
                  <div className="grid size-14 place-items-center rounded-2xl bg-primary text-lg font-bold text-primary-foreground">
                    {member.initials}
                  </div>
                  <div>
                    <h3 className="font-display text-lg font-bold">{member.name}</h3>
                    <p className="text-sm font-semibold text-primary">{member.role}</p>
                  </div>
                </div>
                <div className="mt-6 flex gap-3 text-sm leading-6 text-muted-foreground">
                  <Icon className="mt-1 size-4 shrink-0 text-primary" />
                  {member.description}
                </div>
              </GlassCard>
            );
          })}
        </div>
      </section>
    </div>
  );
}
