export type ActivityCategory =
  | "technical"
  | "cultural"
  | "workshop"
  | "hackathon"
  | "competition"
  | "seminar"
  | "club"
  | "sports"
  | "other";
export type ActivityMode = "offline" | "online" | "hybrid";
export type RegistrationType =
  "individual" | "team" | "student" | "faculty" | "approval" | "invite_only";
export type RegistrationStatus =
  "pending" | "approved" | "rejected" | "cancelled" | "waitlisted" | "completed";
export type AppRole = "admin" | "organizer";

export type ActivityRow = {
  id: string;
  title: string;
  starts_at: string;
  ends_at?: string | null;
  created_at: string;
  updated_at: string;
  published: boolean;
  kind: string;
  category: ActivityCategory;
  mode: ActivityMode;
  is_free: boolean;
  community_id?: string | null;
  banner_url?: string | null;
  description?: string | null;
  summary?: string | null;
  venue?: string | null;
  online_url?: string | null;
  organizer_id?: string | null;
  organizer_name?: string | null;
  instructor_name?: string | null;
  instructor_bio?: string | null;
  instructor_photo_url?: string | null;
  capacity?: number | null;
  seats_taken?: number;
  price?: number | null;
  level?: string | null;
  registration_type?: RegistrationType;
  registration_deadline?: string | null;
  allow_waitlist?: boolean;
  duration_minutes?: number | null;
  eligibility?: string | null;
  learning_outcomes?: string | null;
  requirements?: string | null;
  rules?: string | null;
  team_min_size?: number | null;
  team_max_size?: number | null;
};
export type CommunityRow = {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  about?: string | null;
  category: ActivityCategory;
  logo_url?: string | null;
  cover_url?: string | null;
  rules?: string | null;
  published: boolean;
  created_at: string;
  updated_at: string;
  created_by?: string | null;
};
export type RegistrationRow = {
  id: string;
  activity_id: string;
  user_id: string;
  code: string;
  status: RegistrationStatus;
  created_at: string;
  updated_at: string;
  full_name?: string | null;
  email?: string | null;
  phone?: string | null;
  year?: string | null;
  department?: string | null;
  roll_number?: string | null;
  section?: string | null;
  employee_id?: string | null;
  notes?: string | null;
  team_name?: string | null;
  reg_type?: RegistrationType;
  activities?: ActivityRow;
};
export type ProfileRow = {
  id: string;
  full_name?: string;
  email?: string;
  phone?: string;
  institution?: string;
  year?: string;
  profile_interests?: string[];
  avatar_url?: string;
  roles?: string[];
  role?: string;
  [key: string]: unknown;
};
export type NotificationRow = {
  id: string;
  user_id: string;
  title: string;
  body?: string | null;
  link?: string | null;
  read: boolean;
  created_at: string;
};

const categoryValues: ActivityCategory[] = [
  "technical",
  "cultural",
  "workshop",
  "hackathon",
  "competition",
  "seminar",
  "club",
  "sports",
  "other",
];
export const CATEGORIES: { value: ActivityCategory; label: string }[] = categoryValues.map(
  (value) => ({ value, label: value.charAt(0).toUpperCase() + value.slice(1) }),
);
export const MODES: { value: ActivityMode; label: string }[] = [
  { value: "offline", label: "Offline" },
  { value: "online", label: "Online" },
  { value: "hybrid", label: "Hybrid" },
];
export const REGISTRATION_TYPES: { value: RegistrationType; label: string; hint: string }[] = [
  { value: "individual", label: "Individual", hint: "Anyone can register personally." },
  { value: "team", label: "Team", hint: "Participants register as a team with members." },
  { value: "student", label: "Student", hint: "Collects student details." },
  { value: "faculty", label: "Faculty", hint: "Collects faculty details." },
  { value: "approval", label: "Approval required", hint: "Organizer approves each registration." },
  {
    value: "invite_only",
    label: "Invite only",
    hint: "Registrations stay pending until approved.",
  },
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
