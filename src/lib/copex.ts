import type { Database } from "@/integrations/supabase/types";

export type ActivityRow = Database["public"]["Tables"]["activities"]["Row"];
export type CommunityRow = Database["public"]["Tables"]["communities"]["Row"];
export type RegistrationRow = Database["public"]["Tables"]["registrations"]["Row"];
export type ProfileRow = Database["public"]["Tables"]["profiles"]["Row"];
export type NotificationRow = Database["public"]["Tables"]["notifications"]["Row"];
export type AppRole = Database["public"]["Enums"]["app_role"];
export type ActivityCategory = Database["public"]["Enums"]["activity_category"];
export type ActivityMode = Database["public"]["Enums"]["activity_mode"];
export type RegistrationType = Database["public"]["Enums"]["registration_type"];
export type RegistrationStatus = Database["public"]["Enums"]["registration_status"];

export const CATEGORIES: { value: ActivityCategory; label: string }[] = [
  { value: "technical", label: "Technical" },
  { value: "cultural", label: "Cultural" },
  { value: "workshop", label: "Workshop" },
  { value: "hackathon", label: "Hackathon" },
  { value: "competition", label: "Competition" },
  { value: "seminar", label: "Seminar" },
  { value: "club", label: "Club" },
  { value: "sports", label: "Sports" },
  { value: "other", label: "Other" },
];

export const MODES: { value: ActivityMode; label: string }[] = [
  { value: "offline", label: "Offline" },
  { value: "online", label: "Online" },
  { value: "hybrid", label: "Hybrid" },
];

export const REGISTRATION_TYPES: {
  value: RegistrationType;
  label: string;
  hint: string;
}[] = [
  { value: "individual", label: "Individual", hint: "Anyone can register personally." },
  { value: "team", label: "Team", hint: "Participants register as a team with members." },
  { value: "student", label: "Student", hint: "Collects roll number, department, year and section." },
  { value: "faculty", label: "Faculty", hint: "Collects department and employee ID." },
  { value: "approval", label: "Approval required", hint: "Organizer approves each registration." },
  { value: "invite_only", label: "Invite only", hint: "Registrations stay pending until approved." },
];

export const STATUS_LABEL: Record<RegistrationStatus, string> = {
  pending: "Pending approval",
  approved: "Approved",
  rejected: "Rejected",
  cancelled: "Cancelled",
  waitlisted: "Waitlisted",
  completed: "Completed",
};

export const LEVELS = ["Beginner", "Intermediate", "Advanced", "All levels"];

export function categoryLabel(value: string | null | undefined) {
  return CATEGORIES.find((c) => c.value === value)?.label ?? "Other";
}

export function isStaffRole(roles: AppRole[]) {
  return roles.includes("admin") || roles.includes("organizer");
}
