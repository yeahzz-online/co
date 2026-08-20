import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { CalendarDays, Clock, MapPin, Users, Video } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { seatState } from "@/components/activity-card";
import { GlassCard, Pill, Spinner } from "@/components/ui-kit";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useAuth, useProfile } from "@/hooks/use-auth";
import { categoryLabel } from "@/lib/copex";
import { activityQuery } from "@/lib/data";
import { getFirestoreRegistration, saveFirestoreRegistration } from "@/lib/firestore-app";
import { formatDate, formatDateTime, formatDuration, formatTime } from "@/lib/format";

export function ActivityDetail({ id, kind }: { id: string; kind: "event" | "class" }) {
  const { user } = useAuth();
  const { data: profile } = useProfile();
  const queryClient = useQueryClient();
  const { data, isLoading } = useQuery(activityQuery(id));
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ team_name: "", notes: "" });

  const existing = useQuery({
    queryKey: ["registration", id, user?.uid],
    enabled: !!user,
    queryFn: () => getFirestoreRegistration(id, user!.uid),
  });

  const register = useMutation({
    mutationFn: async () => {
      await saveFirestoreRegistration({
        activity_id: id,
        user_id: user!.uid,
        reg_type: data!.activity.registration_type,
        full_name: profile?.full_name ?? null,
        email: profile?.email ?? user!.email ?? null,
        phone: profile?.phone ?? null,
        roll_number: profile?.roll_number ?? null,
        department: profile?.department ?? null,
        year: profile?.year ?? null,
        section: profile?.section ?? null,
        employee_id: profile?.employee_id ?? null,
        team_name: form.team_name || null,
        notes: form.notes || null,
      });
    },
    onSuccess: () => {
      toast.success("Registration submitted");
      setOpen(false);
      queryClient.invalidateQueries({ queryKey: ["registration", id] });
      queryClient.invalidateQueries({ queryKey: ["activity", id] });
      queryClient.invalidateQueries({ queryKey: ["my-registrations"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  if (isLoading) return <Spinner label="Loading" />;
  if (!data) {
    return (
      <GlassCard className="p-10 text-center">
        <h1 className="text-xl font-semibold">Not found</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          This {kind} is unavailable or unpublished.
        </p>
      </GlassCard>
    );
  }

  const { activity, schedule, speakers, faqs } = data;
  const state = seatState(activity);
  const isTeam = activity.registration_type === "team";

  return (
    <article className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_22rem]">
      <div className="space-y-6">
        <GlassCard className="overflow-hidden">
          {activity.banner_url ? (
            <img
              src={activity.banner_url}
              alt=""
              className="h-56 w-full object-cover sm:h-72"
              loading="lazy"
            />
          ) : null}
          <div className="p-6 sm:p-8">
            <div className="flex flex-wrap items-center gap-2">
              <Pill>{categoryLabel(activity.category)}</Pill>
              <Pill tone={state.tone}>{state.label}</Pill>
              {activity.is_free ? <Pill tone="success">Free</Pill> : <Pill>₹{activity.price}</Pill>}
            </div>
            <h1 className="mt-4 font-display text-3xl font-black tracking-tight sm:text-4xl">
              {activity.title}
            </h1>
            {activity.summary ? (
              <p className="mt-3 text-muted-foreground">{activity.summary}</p>
            ) : null}

            <dl className="mt-6 grid gap-4 sm:grid-cols-2">
              <Fact icon={CalendarDays} label="Date" value={formatDate(activity.starts_at)} />
              <Fact
                icon={Clock}
                label="Time"
                value={`${formatTime(activity.starts_at)}${
                  activity.duration_minutes ? ` · ${formatDuration(activity.duration_minutes)}` : ""
                }`}
              />
              <Fact
                icon={activity.mode === "online" ? Video : MapPin}
                label="Location"
                value={activity.mode === "online" ? "Online" : activity.venue ?? "TBA"}
              />
              <Fact
                icon={Users}
                label="Seats"
                value={
                  activity.capacity == null
                    ? "Unlimited"
                    : `${state.seatsLeft} of ${activity.capacity} left`
                }
              />
            </dl>
          </div>
        </GlassCard>

        {activity.description ? (
          <Section title="About">
            <p className="whitespace-pre-line text-sm text-muted-foreground">
              {activity.description}
            </p>
          </Section>
        ) : null}

        {activity.learning_outcomes ? (
          <Section title="What you'll learn">
            <p className="whitespace-pre-line text-sm text-muted-foreground">
              {activity.learning_outcomes}
            </p>
          </Section>
        ) : null}

        {activity.requirements ? (
          <Section title="Requirements">
            <p className="whitespace-pre-line text-sm text-muted-foreground">
              {activity.requirements}
            </p>
          </Section>
        ) : null}

        {activity.rules ? (
          <Section title="Rules">
            <p className="whitespace-pre-line text-sm text-muted-foreground">{activity.rules}</p>
          </Section>
        ) : null}

        {schedule.length ? (
          <Section title="Schedule">
            <ol className="space-y-4">
              {schedule.map((s) => (
                <li key={s.id} className="border-l-2 border-primary/40 pl-4">
                  <p className="text-sm font-semibold">{s.title}</p>
                  {s.starts_at ? (
                    <p className="text-xs text-muted-foreground">{formatDateTime(s.starts_at)}</p>
                  ) : null}
                  {s.description ? (
                    <p className="mt-1 text-sm text-muted-foreground">{s.description}</p>
                  ) : null}
                </li>
              ))}
            </ol>
          </Section>
        ) : null}

        {speakers.length ? (
          <Section title={kind === "class" ? "Instructors" : "Speakers"}>
            <ul className="grid gap-4 sm:grid-cols-2">
              {speakers.map((s) => (
                <li key={s.id} className="rounded-2xl bg-glass p-4">
                  <p className="font-semibold">{s.name}</p>
                  {s.title ? <p className="text-xs text-muted-foreground">{s.title}</p> : null}
                  {s.bio ? <p className="mt-2 text-sm text-muted-foreground">{s.bio}</p> : null}
                </li>
              ))}
            </ul>
          </Section>
        ) : null}

        {faqs.length ? (
          <Section title="FAQ">
            <dl className="space-y-4">
              {faqs.map((f) => (
                <div key={f.id}>
                  <dt className="text-sm font-semibold">{f.question}</dt>
                  <dd className="mt-1 text-sm text-muted-foreground">{f.answer}</dd>
                </div>
              ))}
            </dl>
          </Section>
        ) : null}
      </div>

      <aside className="lg:sticky lg:top-28 lg:self-start">
        <GlassCard className="space-y-4 p-6">
          <p className="font-display text-2xl font-bold">
            {activity.is_free ? "Free" : `₹${activity.price ?? 0}`}
          </p>
          {activity.registration_deadline ? (
            <p className="text-xs text-muted-foreground">
              Registration closes {formatDateTime(activity.registration_deadline)}
            </p>
          ) : null}

          {!user ? (
            <Button asChild className="w-full rounded-full">
              <Link to="/login">Sign in to register</Link>
            </Button>
          ) : existing.data ? (
            <div className="space-y-2">
              <Pill tone="success">You're registered — {existing.data.status}</Pill>
              <Button asChild variant="secondary" className="w-full rounded-full">
                <Link to="/my-registrations">View my registrations</Link>
              </Button>
            </div>
          ) : (
            <Button
              className="w-full rounded-full"
              disabled={!state.open}
              onClick={() => setOpen(true)}
            >
              {state.open ? "Register now" : state.label}
            </Button>
          )}

          {activity.organizer_name ? (
            <p className="text-xs text-muted-foreground">
              Organized by {activity.organizer_name}
            </p>
          ) : null}
          {activity.eligibility ? (
            <p className="text-xs text-muted-foreground">Eligibility: {activity.eligibility}</p>
          ) : null}
        </GlassCard>
      </aside>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="rounded-3xl">
          <DialogHeader>
            <DialogTitle>Register for {activity.title}</DialogTitle>
            <DialogDescription>
              We'll use your profile details. Update them anytime from your profile page.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            {isTeam ? (
              <div className="space-y-2">
                <Label htmlFor="team">Team name</Label>
                <Input
                  id="team"
                  maxLength={80}
                  value={form.team_name}
                  onChange={(e) => setForm({ ...form, team_name: e.target.value })}
                />
              </div>
            ) : null}
            <div className="space-y-2">
              <Label htmlFor="notes">Notes (optional)</Label>
              <Textarea
                id="notes"
                maxLength={500}
                value={form.notes}
                onChange={(e) => setForm({ ...form, notes: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              className="rounded-full"
              disabled={register.isPending || (isTeam && !form.team_name.trim())}
              onClick={() => register.mutate()}
            >
              {register.isPending ? "Submitting…" : "Confirm registration"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </article>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <GlassCard className="p-6 sm:p-8">
      <h2 className="font-display text-xl font-bold">{title}</h2>
      <div className="mt-4">{children}</div>
    </GlassCard>
  );
}

function Fact({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof CalendarDays;
  label: string;
  value: string;
}) {
  return (
    <div className="flex min-w-0 items-start gap-3">
      <Icon className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden="true" />
      <div className="min-w-0">
        <dt className="text-xs uppercase tracking-widest text-muted-foreground">{label}</dt>
        <dd className="truncate text-sm font-medium">{value}</dd>
      </div>
    </div>
  );
}
