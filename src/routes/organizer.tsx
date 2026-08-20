import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { CalendarDays, Download, ExternalLink, Plus, Users, X } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { EmptyState, GlassCard, PageHeader, Pill, RowSkeleton } from "@/components/ui-kit";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useAuth, usePermissions } from "@/hooks/use-auth";
import {
  listFirestoreRegistrations,
  listOrganizerActivities,
  saveFirestoreActivity,
  updateFirestoreActivity,
} from "@/lib/firestore-app";
import { uploadImageToOqens } from "@/lib/s3-upload";

export const Route = createFileRoute("/organizer")({ component: OrganizerPage });
type Draft = {
  title: string;
  summary: string;
  description: string;
  starts_at: string;
  ends_at: string;
  venue: string;
  mode: "offline" | "online" | "hybrid";
  online_url: string;
  category: string;
  capacity: string;
  registration_deadline: string;
  banner_url: string;
  is_free: boolean;
  published: boolean;
};
const emptyDraft: Draft = {
  title: "",
  summary: "",
  description: "",
  starts_at: "",
  ends_at: "",
  venue: "",
  mode: "offline",
  online_url: "",
  category: "technical",
  capacity: "",
  registration_deadline: "",
  banner_url: "",
  is_free: true,
  published: false,
};

function OrganizerPage() {
  const { user } = useAuth();
  const { isStaff } = usePermissions();
  const client = useQueryClient();
  const [creating, setCreating] = useState(false);
  const [draft, setDraft] = useState(emptyDraft);
  const [selected, setSelected] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const events = useQuery({
    queryKey: ["organizer-events", user?.uid],
    enabled: !!user && isStaff,
    queryFn: () => listOrganizerActivities(user!.uid),
  });
  const attendees = useQuery({
    queryKey: ["event-attendees", selected],
    enabled: !!selected,
    queryFn: () => listFirestoreRegistrations(selected!),
  });
  const save = useMutation({
    mutationFn: async () => {
      if (!draft.title.trim() || !draft.starts_at)
        throw new Error("Add an event title and start time.");
      await saveFirestoreActivity({
        ...draft,
        title: draft.title.trim(),
        kind: "event",
        organizer_id: user!.uid,
        organizer_name: user!.displayName || user!.email || "COPEX Organizer",
        capacity: draft.capacity ? Number(draft.capacity) : null,
        ends_at: draft.ends_at || null,
        registration_deadline: draft.registration_deadline || null,
        banner_url: draft.banner_url || null,
        online_url: draft.online_url || null,
        venue: draft.venue || null,
      } as never);
    },
    onSuccess: () => {
      toast.success(draft.published ? "Event published." : "Event saved as draft.");
      setDraft(emptyDraft);
      setCreating(false);
      client.invalidateQueries({ queryKey: ["organizer-events"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });
  const publish = useMutation({
    mutationFn: ({ id, value }: { id: string; value: boolean }) =>
      updateFirestoreActivity(id, { published: value }),
    onSuccess: () => client.invalidateQueries({ queryKey: ["organizer-events"] }),
  });
  const setField = (key: keyof Draft, value: string | boolean) =>
    setDraft((current) => ({ ...current, [key]: value }));
  async function uploadBanner(file: File) {
    setUploading(true);
    try {
      const result = await uploadImageToOqens(file, "activities", user!.uid);
      setField("banner_url", result.url);
      toast.success("Event image uploaded to OQENS.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Image upload failed.");
    } finally {
      setUploading(false);
    }
  }
  if (!isStaff)
    return (
      <div className="mx-auto max-w-md px-4 py-20 text-center">
        <GlassCard className="p-8">
          <h1 className="font-display text-xl font-bold">Organizer access required</h1>
          <Button asChild className="mt-6 rounded-full">
            <Link to="/">Back home</Link>
          </Button>
        </GlassCard>
      </div>
    );
  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      <PageHeader
        title="Events workspace"
        description="Create polished event pages, publish them, and manage every attendee from one place."
      >
        <Button
          onClick={() => {
            setDraft(emptyDraft);
            setCreating(true);
          }}
          className="mt-4 rounded-full"
        >
          <Plus className="mr-2 size-4" /> Create event
        </Button>
      </PageHeader>
      {creating ? (
        <Builder
          draft={draft}
          setField={setField}
          saving={save.isPending}
          onSave={() => save.mutate()}
          onCancel={() => setCreating(false)}
          uploading={uploading}
          onUpload={uploadBanner}
        />
      ) : (
        <>
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[
              ["Total events", events.data?.length ?? 0],
              ["Published", events.data?.filter((e) => e.published).length ?? 0],
              [
                "Registrations",
                events.data?.reduce((sum, e) => sum + (e.seats_taken ?? 0), 0) ?? 0,
              ],
              [
                "Upcoming",
                events.data?.filter((e) => new Date(e.starts_at) > new Date()).length ?? 0,
              ],
            ].map(([label, value]) => (
              <GlassCard key={String(label)} className="p-5">
                <CalendarDays className="size-5 text-primary" />
                <p className="mt-4 text-sm text-muted-foreground">{label}</p>
                <p className="font-display text-3xl font-black">{value}</p>
              </GlassCard>
            ))}
          </div>
          <div className="mt-8">
            {events.isLoading ? (
              <RowSkeleton rows={3} />
            ) : events.data?.length ? (
              <div className="space-y-3">
                {events.data.map((event) => (
                  <GlassCard key={event.id} className="p-5">
                    <div className="flex flex-col gap-4 md:flex-row md:items-center">
                      <div className="grid size-14 place-items-center rounded-2xl bg-primary/10 text-primary">
                        <CalendarDays className="size-6" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <Pill tone={event.published ? "success" : "muted"} className="text-[10px]">
                          {event.published ? "Published" : "Draft"}
                        </Pill>
                        <h2 className="mt-2 truncate font-display text-lg font-bold">
                          {event.title}
                        </h2>
                        <p className="text-sm text-muted-foreground">
                          {new Date(event.starts_at).toLocaleString()}{" "}
                          {event.venue ? ` · ${event.venue}` : ""}
                        </p>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <Button size="sm" variant="outline" asChild className="rounded-full">
                          <Link to="/events/$eventId" params={{ eventId: event.id }}>
                            <ExternalLink className="mr-1 size-3.5" /> View
                          </Link>
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setSelected(event.id)}
                          className="rounded-full"
                        >
                          <Users className="mr-1 size-3.5" /> Attendees
                        </Button>
                        <Button
                          size="sm"
                          onClick={() => publish.mutate({ id: event.id, value: !event.published })}
                          className="rounded-full"
                        >
                          {event.published ? "Unpublish" : "Publish"}
                        </Button>
                      </div>
                    </div>
                  </GlassCard>
                ))}
              </div>
            ) : (
              <EmptyState
                title="No events yet"
                description="Create your first Luma-style event page."
              />
            )}
          </div>
          {selected && (
            <Attendees
              rows={attendees.data ?? []}
              loading={attendees.isLoading}
              onClose={() => setSelected(null)}
            />
          )}
        </>
      )}
    </div>
  );
}

function Builder({
  draft,
  setField,
  saving,
  onSave,
  onCancel,
  uploading,
  onUpload,
}: {
  draft: Draft;
  setField: (key: keyof Draft, value: string | boolean) => void;
  saving: boolean;
  onSave: () => void;
  onCancel: () => void;
  uploading: boolean;
  onUpload: (file: File) => void;
}) {
  const fields: [keyof Draft, string, string][] = [
    ["title", "Event title", "AI & Future Technology Meetup"],
    ["summary", "Short summary", "A one-line description for event cards"],
    ["venue", "Venue", "COPEX HQ, Hyderabad"],
    ["online_url", "Meeting link", "https://meet.google.com/…"],
    ["banner_url", "Cover image URL", "https://…"],
  ];
  return (
    <GlassCard className="mt-8 border-t-4 border-t-primary p-6">
      <div className="flex justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-primary">
            Event builder
          </p>
          <h2 className="mt-1 font-display text-2xl font-bold">Create your event page</h2>
        </div>
        <Button variant="ghost" onClick={onCancel}>
          Cancel
        </Button>
      </div>
      <div className="mt-6 grid gap-4 md:grid-cols-2">
        {fields.map(([key, label, placeholder]) => (
          <div
            key={key}
            className={
              key === "title" || key === "summary" || key === "banner_url" ? "md:col-span-2" : ""
            }
          >
            <Label>{label}</Label>
            <Input
              value={String(draft[key])}
              onChange={(e) => setField(key, e.target.value)}
              placeholder={placeholder}
              className="mt-1"
            />
          </div>
        ))}
        <div className="md:col-span-2">
          <Label htmlFor="event-banner-upload">Upload event image to OQENS</Label>
          <Input
            id="event-banner-upload"
            type="file"
            accept="image/*"
            disabled={uploading}
            onChange={(event) => {
              const file = event.target.files?.[0];
              if (file) onUpload(file);
            }}
            className="mt-1"
          />
          <p className="mt-1 text-xs text-muted-foreground">
            Images are stored in OQENS and the returned URL is saved in Firebase.
          </p>
        </div>
        <div className="md:col-span-2">
          <Label>Description</Label>
          <Textarea
            value={draft.description}
            onChange={(e) => setField("description", e.target.value)}
            placeholder="Tell attendees what to expect…"
            className="mt-1 min-h-28"
          />
        </div>
        <div>
          <Label>Start</Label>
          <Input
            type="datetime-local"
            value={draft.starts_at}
            onChange={(e) => setField("starts_at", e.target.value)}
            className="mt-1"
          />
        </div>
        <div>
          <Label>End</Label>
          <Input
            type="datetime-local"
            value={draft.ends_at}
            onChange={(e) => setField("ends_at", e.target.value)}
            className="mt-1"
          />
        </div>
        <div>
          <Label>Capacity</Label>
          <Input
            type="number"
            value={draft.capacity}
            onChange={(e) => setField("capacity", e.target.value)}
            placeholder="Unlimited"
            className="mt-1"
          />
        </div>
        <div>
          <Label>Registration deadline</Label>
          <Input
            type="datetime-local"
            value={draft.registration_deadline}
            onChange={(e) => setField("registration_deadline", e.target.value)}
            className="mt-1"
          />
        </div>
        <div>
          <Label>Format</Label>
          <select
            value={draft.mode}
            onChange={(e) => setField("mode", e.target.value)}
            className="mt-1 w-full rounded-xl border border-glass-border bg-glass px-3 py-2 text-sm"
          >
            <option value="offline">In person</option>
            <option value="online">Online</option>
            <option value="hybrid">Hybrid</option>
          </select>
        </div>
        <div>
          <Label>Category</Label>
          <select
            value={draft.category}
            onChange={(e) => setField("category", e.target.value)}
            className="mt-1 w-full rounded-xl border border-glass-border bg-glass px-3 py-2 text-sm"
          >
            {[
              "technical",
              "workshop",
              "hackathon",
              "seminar",
              "competition",
              "cultural",
              "other",
            ].map((value) => (
              <option key={value}>{value}</option>
            ))}
          </select>
        </div>
      </div>
      <div className="mt-5 flex flex-wrap justify-between gap-3 border-t border-glass-border pt-5">
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={draft.is_free}
            onChange={(e) => setField("is_free", e.target.checked)}
          />{" "}
          Free event
        </label>
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={draft.published}
            onChange={(e) => setField("published", e.target.checked)}
          />{" "}
          Publish immediately
        </label>
        <Button onClick={onSave} disabled={saving} className="rounded-full">
          {saving ? "Saving…" : draft.published ? "Publish event" : "Save draft"}
        </Button>
      </div>
    </GlassCard>
  );
}

function Attendees({
  rows,
  loading,
  onClose,
}: {
  rows: Array<{
    id: string;
    code: string;
    full_name: string | null;
    email: string | null;
    status: string;
  }>;
  loading: boolean;
  onClose: () => void;
}) {
  function exportRows() {
    const csv = [
      ["Name", "Email", "Status", "Code"],
      ...rows.map((r) => [r.full_name, r.email, r.status, r.code]),
    ]
      .map((r) => r.map((v) => `"${String(v ?? "").replaceAll('"', '""')}"`).join(","))
      .join("\n");
    const link = document.createElement("a");
    link.href = URL.createObjectURL(new Blob([csv], { type: "text/csv" }));
    link.download = "copex-attendees.csv";
    link.click();
  }
  return (
    <GlassCard className="mt-5 p-5">
      <div className="flex justify-between">
        <div>
          <p className="text-xs uppercase tracking-wider text-muted-foreground">
            Attendee management
          </p>
          <h2 className="font-display text-xl font-bold">{rows.length} registrations</h2>
        </div>
        <Button variant="ghost" size="icon" onClick={onClose}>
          <X className="size-4" />
        </Button>
      </div>
      <Button variant="outline" onClick={exportRows} className="mt-4 rounded-full">
        <Download className="mr-2 size-4" /> Export CSV
      </Button>
      <div className="mt-4 space-y-2">
        {loading ? (
          <RowSkeleton rows={2} />
        ) : rows.length ? (
          rows.map((r) => (
            <div
              key={r.id}
              className="flex items-center gap-3 rounded-xl border border-glass-border p-3"
            >
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold">
                  {r.full_name || "Unnamed attendee"}
                </p>
                <p className="truncate text-xs text-muted-foreground">{r.email || r.code}</p>
              </div>
              <Pill tone={r.status === "approved" ? "success" : "warning"} className="text-[10px]">
                {r.status}
              </Pill>
            </div>
          ))
        ) : (
          <p className="py-6 text-center text-sm text-muted-foreground">No registrations yet.</p>
        )}
      </div>
    </GlassCard>
  );
}
