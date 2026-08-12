import { queryOptions } from "@tanstack/react-query";

import { supabase } from "@/integrations/supabase/client";
import type { ActivityRow, CommunityRow } from "@/lib/copex";

const ACTIVITY_COLUMNS = "*";

export type ActivityFilters = {
  kind?: "event" | "class";
  search?: string;
  category?: string;
  window?: "all" | "today" | "week" | "month" | "upcoming";
  price?: "all" | "free" | "paid";
};

function windowRange(win: ActivityFilters["window"]) {
  const now = new Date();
  const start = new Date(now);
  if (win === "today") {
    const end = new Date(now);
    end.setHours(23, 59, 59, 999);
    start.setHours(0, 0, 0, 0);
    return { from: start.toISOString(), to: end.toISOString() };
  }
  if (win === "week") {
    const end = new Date(now.getTime() + 7 * 86_400_000);
    return { from: now.toISOString(), to: end.toISOString() };
  }
  if (win === "month") {
    const end = new Date(now.getTime() + 30 * 86_400_000);
    return { from: now.toISOString(), to: end.toISOString() };
  }
  if (win === "upcoming") return { from: now.toISOString(), to: null };
  return { from: null, to: null };
}

export function activitiesQuery(filters: ActivityFilters = {}) {
  return queryOptions({
    queryKey: ["activities", filters],
    queryFn: async (): Promise<ActivityRow[]> => {
      let q = supabase
        .from("activities")
        .select(ACTIVITY_COLUMNS)
        .eq("published", true)
        .order("starts_at", { ascending: true });

      if (filters.kind) q = q.eq("kind", filters.kind);
      if (filters.category && filters.category !== "all")
        q = q.eq("category", filters.category as ActivityRow["category"]);
      if (filters.price === "free") q = q.eq("is_free", true);
      if (filters.price === "paid") q = q.eq("is_free", false);

      const range = windowRange(filters.window ?? "all");
      if (range.from) q = q.gte("starts_at", range.from);
      if (range.to) q = q.lte("starts_at", range.to);

      const term = filters.search?.trim();
      if (term) {
        const safe = term.replace(/[%,()]/g, " ");
        q = q.or(
          `title.ilike.%${safe}%,summary.ilike.%${safe}%,organizer_name.ilike.%${safe}%,venue.ilike.%${safe}%,instructor_name.ilike.%${safe}%`,
        );
      }

      const { data, error } = await q;
      if (error) throw error;
      return data ?? [];
    },
  });
}

export function activityQuery(id: string) {
  return queryOptions({
    queryKey: ["activity", id],
    queryFn: async () => {
      const [activity, schedule, speakers, faqs] = await Promise.all([
        supabase.from("activities").select("*").eq("id", id).maybeSingle(),
        supabase.from("activity_schedule").select("*").eq("activity_id", id).order("position"),
        supabase.from("activity_speakers").select("*").eq("activity_id", id).order("position"),
        supabase.from("activity_faqs").select("*").eq("activity_id", id).order("position"),
      ]);
      if (activity.error) throw activity.error;
      if (!activity.data) return null;
      return {
        activity: activity.data,
        schedule: schedule.data ?? [],
        speakers: speakers.data ?? [],
        faqs: faqs.data ?? [],
      };
    },
  });
}

export function communitiesQuery(search?: string) {
  return queryOptions({
    queryKey: ["communities", search ?? ""],
    queryFn: async (): Promise<(CommunityRow & { member_count: number })[]> => {
      let q = supabase
        .from("communities")
        .select("*, community_members(count)")
        .eq("published", true)
        .order("name");
      const term = search?.trim();
      if (term) {
        const safe = term.replace(/[%,()]/g, " ");
        q = q.or(`name.ilike.%${safe}%,description.ilike.%${safe}%`);
      }
      const { data, error } = await q;
      if (error) throw error;
      return (data ?? []).map((c) => {
        const { community_members, ...rest } = c as CommunityRow & {
          community_members: { count: number }[];
        };
        return { ...rest, member_count: community_members?.[0]?.count ?? 0 };
      });
    },
  });
}

export function communityQuery(id: string) {
  return queryOptions({
    queryKey: ["community", id],
    queryFn: async () => {
      const [community, members, activities, announcements] = await Promise.all([
        supabase.from("communities").select("*").eq("id", id).maybeSingle(),
        supabase.from("community_members").select("id, user_id, member_role, joined_at").eq("community_id", id),
        supabase
          .from("activities")
          .select("*")
          .eq("community_id", id)
          .eq("published", true)
          .order("starts_at"),
        supabase
          .from("announcements")
          .select("*")
          .eq("community_id", id)
          .order("created_at", { ascending: false }),
      ]);
      if (community.error) throw community.error;
      if (!community.data) return null;
      return {
        community: community.data,
        members: members.data ?? [],
        activities: activities.data ?? [],
        announcements: announcements.data ?? [],
      };
    },
  });
}

export function myRegistrationsQuery(userId: string | undefined) {
  return queryOptions({
    queryKey: ["my-registrations", userId],
    enabled: !!userId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("registrations")
        .select("*, activities(*)")
        .eq("user_id", userId!)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });
}

export function notificationsQuery(userId: string | undefined) {
  return queryOptions({
    queryKey: ["notifications", userId],
    enabled: !!userId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("notifications")
        .select("*")
        .eq("user_id", userId!)
        .order("created_at", { ascending: false })
        .limit(50);
      if (error) throw error;
      return data ?? [];
    },
  });
}

export function myMembershipsQuery(userId: string | undefined) {
  return queryOptions({
    queryKey: ["my-memberships", userId],
    enabled: !!userId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("community_members")
        .select("community_id")
        .eq("user_id", userId!);
      if (error) throw error;
      return (data ?? []).map((r) => r.community_id);
    },
  });
}
