import { createFileRoute } from "@tanstack/react-router";

import { ActivityDetail } from "@/components/activity-detail";

export const Route = createFileRoute("/classes/$classId")({
  head: () => ({
    meta: [
      { title: "Class details — COPEX Community" },
      { name: "description", content: "Class outline, instructor, requirements and enrollment on COPEX." },
      { property: "og:title", content: "Class details — COPEX Community" },
      { property: "og:description", content: "Class outline, instructor and enrollment on COPEX." },
    ],
  }),
  component: ClassDetailPage,
});

function ClassDetailPage() {
  const { classId } = Route.useParams();
  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      <ActivityDetail id={classId} kind="class" />
    </div>
  );
}
