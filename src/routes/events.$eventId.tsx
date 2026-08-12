import { createFileRoute } from "@tanstack/react-router";

import { ActivityDetail } from "@/components/activity-detail";

export const Route = createFileRoute("/events/$eventId")({
  head: () => ({
    meta: [
      { title: "Event details — COPEX Community" },
      { name: "description", content: "Event schedule, speakers, eligibility and registration on COPEX." },
      { property: "og:title", content: "Event details — COPEX Community" },
      { property: "og:description", content: "Event schedule, speakers and registration on COPEX." },
    ],
  }),
  component: EventDetailPage,
});

function EventDetailPage() {
  const { eventId } = Route.useParams();
  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      <ActivityDetail id={eventId} kind="event" />
    </div>
  );
}
