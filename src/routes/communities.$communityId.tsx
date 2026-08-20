import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { toast } from "sonner";

import { ActivityCard } from "@/components/activity-card";
import { GlassCard, PageHeader, Spinner } from "@/components/ui-kit";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { communityQuery, myMembershipsQuery, removeCommunityMembership, saveCommunityMembership } from "@/lib/data";
import { formatDateTime } from "@/lib/format";

export const Route = createFileRoute("/communities/$communityId")({
  head: () => ({
    meta: [
      { title: "Community — COPEX Community" },
      { name: "description", content: "Community details, members, announcements and upcoming activities." },
      { property: "og:title", content: "Community — COPEX Community" },
      { property: "og:description", content: "Members, announcements and upcoming activities." },
    ],
  }),
  component: CommunityPage,
});

function CommunityPage() {
  const { communityId } = Route.useParams();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { data, isLoading } = useQuery(communityQuery(communityId));
  const memberships = useQuery(myMembershipsQuery(user?.uid));
  const joined = memberships.data?.includes(communityId) ?? false;

  const toggle = useMutation({
    mutationFn: async () => {
      if (joined) await removeCommunityMembership(communityId, user!.uid);
      else await saveCommunityMembership(communityId, user!.uid);
    },
    onSuccess: () => {
      toast.success(joined ? "Left community" : "Joined community");
      queryClient.invalidateQueries({ queryKey: ["my-memberships"] });
      queryClient.invalidateQueries({ queryKey: ["community", communityId] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  if (isLoading) return <div className="py-20"><Spinner /></div>;
  if (!data) return <div className="mx-auto max-w-3xl px-4 py-20 text-center">Community not found.</div>;

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      <PageHeader title={data.community.name} description={data.community.description ?? ""}>
        {user ? (
          <Button className="rounded-full" disabled={toggle.isPending} onClick={() => toggle.mutate()}>
            {joined ? "Leave community" : "Join community"}
          </Button>
        ) : null}
      </PageHeader>

      {data.community.about ? (
        <GlassCard className="mt-8 p-6">
          <h2 className="font-display text-xl font-bold">About</h2>
          <p className="mt-3 whitespace-pre-line text-sm text-muted-foreground">{data.community.about}</p>
        </GlassCard>
      ) : null}

      {data.announcements.length ? (
        <GlassCard className="mt-6 p-6">
          <h2 className="font-display text-xl font-bold">Announcements</h2>
          <ul className="mt-4 space-y-4">
            {data.announcements.map((a) => (
              <li key={a.id} className="rounded-2xl bg-glass p-4">
                <p className="font-semibold">{a.title}</p>
                <p className="text-xs text-muted-foreground">{formatDateTime(a.created_at)}</p>
                <p className="mt-2 text-sm text-muted-foreground">{a.body}</p>
              </li>
            ))}
          </ul>
        </GlassCard>
      ) : null}

      {data.activities.length ? (
        <section className="mt-10">
          <h2 className="font-display text-xl font-bold">Upcoming activities</h2>
          <div className="mt-5 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {data.activities.map((a) => <ActivityCard key={a.id} activity={a} />)}
          </div>
        </section>
      ) : null}
    </div>
  );
}
