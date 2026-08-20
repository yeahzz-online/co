import { queryOptions } from "@tanstack/react-query";

import {
  collectionRef,
  deleteDoc,
  documentRef,
  getDocs,
  query,
  setDoc,
  where,
} from "@/integrations/firebase/firestore";
import {
  getFirestoreActivity,
  listFirestoreActivities,
  listFirestoreAnnouncements,
} from "@/lib/firestore-app";
import type { ActivityRow, CommunityRow, NotificationRow, RegistrationRow } from "@/lib/copex";

type CommunityMember = {
  id: string;
  community_id: string;
  user_id: string;
  member_role: string;
  joined_at: string;
};

export type ActivityFilters = {
  kind?: "event" | "workshop" | string;
  search?: string;
  category?: string;
  window?: "all" | "today" | "week" | "month" | "upcoming";
  price?: "all" | "free" | "paid";
};

const rows = async <T extends Record<string, unknown>>(
  name: string,
  filters: Array<[string, unknown]> = [],
) =>
  (
    await getDocs(
      query(collectionRef<T>(name), ...filters.map(([field, value]) => where(field, "==", value))),
    )
  ).docs.map((item) => ({ id: item.id, ...item.data() }));

export function activitiesQuery(filters: ActivityFilters = {}) {
  return queryOptions({
    queryKey: ["activities", filters],
    queryFn: () => listFirestoreActivities(filters),
  });
}
export function activityQuery(id: string) {
  return queryOptions({ queryKey: ["activity", id], queryFn: () => getFirestoreActivity(id) });
}

export function communitiesQuery(search?: string) {
  return queryOptions({
    queryKey: ["communities", search ?? ""],
    queryFn: async () => {
      const term = search?.trim().toLowerCase();
      const communities = (await rows<CommunityRow>("communities", [["published", true]])).filter(
        (item) => !term || `${item.name} ${item.description ?? ""}`.toLowerCase().includes(term),
      );
      return communities
        .sort((a, b) => a.name.localeCompare(b.name))
        .map((community) => ({
          ...community,
          member_count: Number(community.member_count ?? 0),
        }));
    },
  });
}

export function communityQuery(id: string) {
  return queryOptions({
    queryKey: ["community", id],
    queryFn: async () => {
      const communitySnapshot = await import("@/integrations/firebase/firestore").then(
        ({ getDoc }) => getDoc(documentRef(`communities/${id}`)),
      );
      if (!communitySnapshot.exists()) return null;
      const [members, activities, announcements] = await Promise.all([
        rows<CommunityMember>("community_members").then((items) =>
          items.filter((item) => item.community_id === id),
        ),
        rows<ActivityRow>("activities", [
          ["community_id", id],
          ["published", true],
        ]).then((items) => items.sort((a, b) => a.starts_at.localeCompare(b.starts_at))),
        listFirestoreAnnouncements(id),
      ]);
      return {
        community: { id: communitySnapshot.id, ...communitySnapshot.data() } as CommunityRow,
        members,
        activities,
        announcements,
      };
    },
  });
}

export function myRegistrationsQuery(userId: string | undefined) {
  return queryOptions({
    queryKey: ["my-registrations", userId],
    enabled: !!userId,
    queryFn: async () => {
      const registrations = (
        await rows<RegistrationRow>("registrations", [["user_id", userId]])
      ).sort((a, b) => b.created_at.localeCompare(a.created_at));
      const activities = await rows<ActivityRow>("activities");
      return registrations.map((registration) => ({
        ...registration,
        activities: activities.find((activity) => activity.id === registration.activity_id),
      }));
    },
  });
}

export function notificationsQuery(userId: string | undefined) {
  return queryOptions({
    queryKey: ["notifications", userId],
    enabled: !!userId,
    queryFn: async () =>
      (await rows<NotificationRow>("notifications", [["user_id", userId]]))
        .sort((a, b) => b.created_at.localeCompare(a.created_at))
        .slice(0, 50),
  });
}

export function referralsQuery(userId: string | undefined) {
  return queryOptions({
    queryKey: ["referrals", userId],
    enabled: !!userId,
    queryFn: async () =>
      (await rows<Record<string, unknown>>("referrals", [["referrer_id", userId]])).length,
  });
}

export async function recordReferral(referrerId: string, referredUserId: string) {
  if (!referrerId || referrerId === referredUserId) return;
  await setDoc(
    documentRef(`referrals/${referrerId}_${referredUserId}`),
    {
      referrer_id: referrerId,
      referred_user_id: referredUserId,
      created_at: new Date().toISOString(),
    },
    { merge: true },
  );
}

export function myMembershipsQuery(userId: string | undefined) {
  return queryOptions({
    queryKey: ["my-memberships", userId],
    enabled: !!userId,
    queryFn: async () =>
      (await rows<CommunityMember>("community_members", [["user_id", userId]])).map(
        (item) => item.community_id,
      ),
  });
}

export async function saveCommunityMembership(communityId: string, userId: string) {
  const id = `${communityId}_${userId}`;
  await setDoc(
    documentRef(`community_members/${id}`),
    {
      id,
      community_id: communityId,
      user_id: userId,
      member_role: "member",
      joined_at: new Date().toISOString(),
    },
    { merge: true },
  );
}

export async function removeCommunityMembership(communityId: string, userId: string) {
  await deleteDoc(documentRef(`community_members/${communityId}_${userId}`));
}
export async function cancelRegistration(id: string) {
  await setDoc(
    documentRef(`registrations/${id}`),
    { status: "cancelled", updated_at: new Date().toISOString() },
    { merge: true },
  );
}
export async function markNotificationsRead(userId: string) {
  const items = (await rows<NotificationRow>("notifications", [["user_id", userId]])).filter(
    (item) => !item.read,
  );
  await Promise.all(
    items.map((item) =>
      setDoc(documentRef(`notifications/${item.id}`), { read: true }, { merge: true }),
    ),
  );
}
