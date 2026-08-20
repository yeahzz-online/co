import { useQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Award, CheckCircle2, Copy, LockKeyhole, Target, Users } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { GlassCard, PageHeader, Pill } from "@/components/ui-kit";
import { Button } from "@/components/ui/button";
import { useAuth, useProfile } from "@/hooks/use-auth";
import { referralsQuery } from "@/lib/data";

export const Route = createFileRoute("/dashboard")({ component: DashboardPage });

function DashboardPage() {
  const { user, loading } = useAuth();
  const { data: profile, isLoading } = useProfile();
  const { data: referralCount } = useQuery(referralsQuery(user?.uid));
  const [shared, setShared] = useState(false);

  if (!loading && !user)
    return (
      <div className="mx-auto max-w-xl px-4 py-20 text-center">
        <GlassCard className="p-8">
          <h1 className="font-display text-xl font-bold">Member access required</h1>
          <Button asChild className="mt-6 rounded-full">
            <Link to="/login">Sign in</Link>
          </Button>
        </GlassCard>
      </div>
    );
  if (isLoading)
    return <div className="mx-auto max-w-7xl px-4 py-20 text-center">Loading your dashboard…</div>;

  const member = profile as
    | (typeof profile & {
        member_id?: string;
        institution?: string;
        points?: number;
        credits?: number;
        referrals?: number;
        tasks_completed?: number;
        status?: string;
        referral_access?: boolean;
        branch?: string;
        year?: string;
        profile_interests?: string[];
        referral_code?: string;
        avatar_url?: string;
      })
    | null;
  const complete = Boolean(
    member?.full_name && member?.institution && member?.year && member?.profile_interests?.length,
  );
  const name = member?.full_name ?? user?.email ?? "Member";
  const referralLink =
    typeof window === "undefined" ? "" : `${window.location.origin}/join?ref=${user?.uid ?? ""}`;

  async function shareReferral() {
    if (!referralLink) return;
    if (navigator.share)
      await navigator.share({
        title: "Join our community",
        text: "Join me in the community and learn together.",
        url: referralLink,
      });
    else {
      await navigator.clipboard.writeText(referralLink);
      setShared(true);
      toast.success("Referral link copied");
    }
  }

  const stats = [
    { label: "Referrals", value: referralCount ?? member?.referrals ?? 0, icon: Users },
    { label: "Credits", value: member?.credits ?? 0, icon: Award },
    { label: "Tasks done", value: member?.tasks_completed ?? 0, icon: CheckCircle2 },
  ];

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      <PageHeader
        title={`${member?.member_id ?? "MEMBER"}'s Dashboard`}
        description="Your community progress, opportunities, and learning path."
      />
      {!complete ? (
        <GlassCard className="mt-8 border-t-4 border-t-primary p-8 text-center">
          <h2 className="font-display text-2xl font-bold">
            Complete your profile to unlock access
          </h2>
          <p className="mx-auto mt-2 max-w-lg text-sm text-muted-foreground">
            Add your college, year, and interests so we can personalize your dashboard and
            referrals.
          </p>
          <Button asChild className="mt-6 rounded-full">
            <Link to="/learning-profile">Complete profile</Link>
          </Button>
        </GlassCard>
      ) : (
        <div className="mt-8 grid gap-5 lg:grid-cols-[280px_1fr]">
          <aside>
            <GlassCard className="border-t-4 border-t-primary p-6">
              <div className="grid size-16 place-items-center overflow-hidden rounded-full bg-primary text-2xl font-bold text-primary-foreground">
                {member?.avatar_url ? (
                  <img
                    src={member.avatar_url}
                    alt={`${name}'s profile`}
                    className="size-full object-cover"
                  />
                ) : (
                  name.slice(0, 1).toUpperCase()
                )}
              </div>
              <h2 className="mt-4 font-display text-xl font-bold">{name}</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                {member?.branch ?? "Community member"} · {member?.year}
              </p>
              <p className="mt-1 break-all text-xs text-muted-foreground">{user?.email}</p>
              <p className="mt-5 font-display text-2xl font-bold">
                {member?.points ?? 0}{" "}
                <span className="text-sm font-normal text-muted-foreground">pts</span>
              </p>
              <div className="mt-5 flex items-center justify-between border-t border-glass-border pt-4 text-xs">
                <span>{member?.institution}</span>
                <Pill tone="success" className="text-[10px]">
                  {member?.status ?? "ACTIVE"}
                </Pill>
              </div>
            </GlassCard>
            <Button asChild variant="outline" className="mt-4 w-full rounded-xl">
              <Link to="/learning-profile">Edit learning profile</Link>
            </Button>
          </aside>
          <main>
            <div className="grid gap-4 sm:grid-cols-3">
              {stats.map((stat) => (
                <GlassCard key={stat.label} className="p-5">
                  <stat.icon className="size-5 text-primary" />
                  <p className="mt-4 text-xs uppercase tracking-widest text-muted-foreground">
                    {stat.label}
                  </p>
                  <p className="mt-1 font-display text-3xl font-bold">{stat.value}</p>
                </GlassCard>
              ))}
            </div>
            <div className="mt-5 grid gap-5 md:grid-cols-2">
              <GlassCard className="p-6">
                <Users className="size-5 text-primary" />
                <h2 className="mt-4 font-display font-bold">Share & earn credits</h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  Share your link. When a new member joins through it, the referral is recorded for
                  credit approval.
                </p>
                <div className="mt-4 flex gap-2">
                  <input
                    readOnly
                    value={referralLink}
                    className="min-w-0 flex-1 rounded-xl border border-glass-border bg-glass px-3 text-xs"
                  />
                  <Button size="sm" onClick={shareReferral} className="rounded-xl">
                    <Copy className="size-4" /> {shared ? "Copied" : "Share"}
                  </Button>
                </div>
              </GlassCard>
              <GlassCard className="p-6">
                <Target className="size-5 text-primary" />
                <h2 className="mt-4 font-display font-bold">Tasks & rewards</h2>
                <p className="mt-1 flex items-center gap-2 text-sm text-muted-foreground">
                  <LockKeyhole className="size-4" /> Tasks and rewards are coming soon.
                </p>
              </GlassCard>
            </div>
          </main>
        </div>
      )}
    </div>
  );
}
