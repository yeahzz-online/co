import { Link } from "@tanstack/react-router";
import { CalendarDays, Clock, MapPin, Users, Video } from "lucide-react";

import { Pill } from "@/components/ui-kit";
import { type ActivityRow, categoryLabel } from "@/lib/copex";
import { formatDate, formatDuration, formatTime } from "@/lib/format";
import { cn } from "@/lib/utils";

export type ActivityWithSeats = ActivityRow & { taken?: number };

export function seatState(activity: ActivityWithSeats) {
  const deadlinePassed =
    !!activity.registration_deadline && new Date(activity.registration_deadline) < new Date();
  const taken = activity.taken ?? activity.seats_taken ?? 0;
  const seatsLeft = activity.capacity == null ? null : Math.max(0, activity.capacity - taken);

  const full = seatsLeft !== null && seatsLeft <= 0;
  const past = new Date(activity.starts_at) < new Date();

  if (past) return { tone: "muted" as const, label: "Ended", open: false, seatsLeft, deadlinePassed };
  if (deadlinePassed)
    return { tone: "muted" as const, label: "Registration closed", open: false, seatsLeft, deadlinePassed };
  if (full && activity.allow_waitlist)
    return { tone: "warning" as const, label: "Waitlist open", open: true, seatsLeft, deadlinePassed };
  if (full) return { tone: "danger" as const, label: "Full", open: false, seatsLeft, deadlinePassed };
  return { tone: "success" as const, label: "Registration open", open: true, seatsLeft, deadlinePassed };
}

export function ActivityCard({
  activity,
  className,
}: {
  activity: ActivityWithSeats;
  className?: string;
}) {
  const state = seatState(activity);
  const isClass = activity.kind === "class";


  return (
    <Link
      to="/events/$eventId"
      params={{ eventId: activity.id }}
      aria-label={`View full details for ${activity.title}`}
      className={cn(
        "glass-panel glass-hover group flex h-full cursor-pointer flex-col overflow-hidden rounded-none no-underline",
        className,
      )}
    >
      <div className="relative h-40 overflow-hidden bg-glass-strong">
        {activity.banner_url ? (
          <img
            src={activity.banner_url}
            alt=""
            loading="lazy"
            className="size-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="size-full bg-[radial-gradient(30rem_16rem_at_20%_-20%,color-mix(in_oklab,var(--violet)_60%,transparent),transparent_70%),radial-gradient(24rem_14rem_at_90%_120%,color-mix(in_oklab,var(--primary)_45%,transparent),transparent_70%)]" />
        )}
        <div className="absolute inset-x-0 bottom-0 flex flex-wrap gap-2 bg-gradient-to-t from-background/85 to-transparent p-3">
          <Pill tone="primary">{categoryLabel(activity.category)}</Pill>
          {isClass && activity.level ? <Pill tone="violet">{activity.level}</Pill> : null}
        </div>
      </div>

      <div className="flex flex-1 flex-col gap-4 p-5">
        <div className="min-w-0">
          <h3 className="line-clamp-2 text-lg font-semibold leading-snug">{activity.title}</h3>
          {activity.summary ? (
            <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">{activity.summary}</p>
          ) : null}
        </div>

        <dl className="space-y-2 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <CalendarDays className="size-4 shrink-0 text-primary" aria-hidden="true" />
            <dd className="truncate">{formatDate(activity.starts_at)}</dd>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="size-4 shrink-0 text-primary" aria-hidden="true" />
            <dd className="truncate">
              {formatTime(activity.starts_at)}
              {formatDuration(activity.duration_minutes)
                ? ` · ${formatDuration(activity.duration_minutes)}`
                : ""}
            </dd>
          </div>
          <div className="flex items-center gap-2">
            {activity.mode === "online" ? (
              <Video className="size-4 shrink-0 text-primary" aria-hidden="true" />
            ) : (
              <MapPin className="size-4 shrink-0 text-primary" aria-hidden="true" />
            )}
            <dd className="truncate">
              {activity.mode === "online" ? "Online" : (activity.venue ?? "Venue TBA")}
            </dd>
          </div>
          {activity.capacity != null ? (
            <div className="flex items-center gap-2">
              <Users className="size-4 shrink-0 text-primary" aria-hidden="true" />
              <dd className="truncate">
                {state.seatsLeft} of {activity.capacity} seats left
              </dd>
            </div>
          ) : null}
        </dl>

        <div className="mt-auto flex flex-wrap items-center justify-between gap-3 pt-1">
          <Pill tone={state.tone}>{state.label}</Pill>
          <span className="inline-flex h-9 items-center rounded-xl bg-secondary px-3 text-sm font-medium text-secondary-foreground">View details</span>
        </div>

        {activity.organizer_name || activity.instructor_name ? (
          <p className="truncate text-xs text-muted-foreground">
            Organized by {activity.organizer_name ?? activity.instructor_name ?? "COPEX"}
          </p>
        ) : null}
      </div>
    </Link>
  );
}
