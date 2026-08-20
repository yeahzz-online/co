import { collectionRef, documentRef, getDoc, getDocs, query, setDoc, where, type FirestoreUserProfile } from "@/integrations/firebase/firestore";
import type { ActivityRow, RegistrationRow } from "@/lib/copex";

const activities = () => collectionRef<ActivityRow>("activities");
const registrations = () => collectionRef<RegistrationRow>("registrations");
const schedules = () => collectionRef<Record<string, unknown>>("activity_schedule");
const speakers = () => collectionRef<Record<string, unknown>>("activity_speakers");
const faqs = () => collectionRef<Record<string, unknown>>("activity_faqs");
const announcements = () => collectionRef<Record<string, unknown>>("announcements");

export async function listFirestoreActivities(filters: { kind?: string; search?: string; category?: string; window?: string; price?: string } = {}) {
  const snapshot = await getDocs(query(activities(), where("published", "==", true)));
  const now = Date.now();
  return snapshot.docs.map((item) => ({ id: item.id, ...item.data() })).filter((item) => {
    if (!item.published || (filters.kind && item.kind !== filters.kind)) return false;
    if (filters.category && filters.category !== "all" && item.category !== filters.category) return false;
    if (filters.price === "free" && !item.is_free) return false;
    if (filters.price === "paid" && item.is_free) return false;
    const starts = new Date(item.starts_at).getTime();
    if (filters.window === "today") { const day = new Date(); return starts >= new Date(day.getFullYear(), day.getMonth(), day.getDate()).getTime() && starts < new Date(day.getFullYear(), day.getMonth(), day.getDate() + 1).getTime(); }
    if (filters.window === "week") return starts >= now && starts <= now + 7 * 86_400_000;
    if (filters.window === "month") return starts >= now && starts <= now + 30 * 86_400_000;
    if (filters.window === "upcoming" && starts < now) return false;
    const term = filters.search?.trim().toLowerCase();
    return !term || `${item.title} ${item.summary ?? ""} ${item.organizer_name ?? ""} ${item.venue ?? ""}`.toLowerCase().includes(term);
  }).sort((a, b) => a.starts_at.localeCompare(b.starts_at)) as ActivityRow[];
}

export async function getFirestoreActivity(id: string) {
  const snapshot = await getDoc(documentRef(`activities/${id}`));
  if (!snapshot.exists()) return null;
  const activity = { id: snapshot.id, ...snapshot.data() } as ActivityRow;
  const [schedule, activitySpeakers, activityFaqs] = await Promise.all([
    getDocs(query(schedules(), where("activity_id", "==", id))),
    getDocs(query(speakers(), where("activity_id", "==", id))),
    getDocs(query(faqs(), where("activity_id", "==", id))),
  ]);
  return { activity, schedule: schedule.docs.map((item) => ({ id: item.id, ...item.data() })), speakers: activitySpeakers.docs.map((item) => ({ id: item.id, ...item.data() })), faqs: activityFaqs.docs.map((item) => ({ id: item.id, ...item.data() })) };
}

export async function listOrganizerActivities(userId: string) {
  const snapshot = await getDocs(query(activities(), where("organizer_id", "==", userId)));
  return snapshot.docs.map((item) => ({ id: item.id, ...item.data() })).filter((item) => item.kind === "event").sort((a, b) => b.starts_at.localeCompare(a.starts_at)) as ActivityRow[];
}

export async function saveFirestoreActivity(activity: Partial<ActivityRow> & Pick<ActivityRow, "title" | "starts_at">) {
  const id = activity.id ?? crypto.randomUUID();
  await setDoc(documentRef(`activities/${id}`), { ...activity, id, updated_at: new Date().toISOString(), created_at: activity.created_at ?? new Date().toISOString() }, { merge: true });
  return id;
}

export async function updateFirestoreActivity(id: string, patch: Partial<ActivityRow>) {
  await setDoc(documentRef(`activities/${id}`), { ...patch, updated_at: new Date().toISOString() }, { merge: true });
}

export async function getFirestoreRegistration(activityId: string, userId: string) {
  const snapshot = await getDocs(query(registrations(), where("activity_id", "==", activityId), where("user_id", "==", userId)));
  const item = snapshot.docs[0];
  return item ? ({ id: item.id, ...item.data() } as RegistrationRow) : null;
}

export async function saveFirestoreRegistration(payload: Partial<RegistrationRow> & Pick<RegistrationRow, "activity_id" | "user_id">) {
  const id = payload.id ?? crypto.randomUUID();
  await setDoc(documentRef(`registrations/${id}`), { ...payload, id, code: payload.code ?? `CPX-${id.slice(0, 8).toUpperCase()}`, status: payload.status ?? "approved", created_at: payload.created_at ?? new Date().toISOString(), updated_at: new Date().toISOString() }, { merge: true });
}

export async function listFirestoreRegistrations(activityId: string) {
  const snapshot = await getDocs(query(registrations(), where("activity_id", "==", activityId)));
  return snapshot.docs.map((item) => ({ id: item.id, ...item.data() })) as RegistrationRow[];
}

export async function listFirestoreAnnouncements(communityId?: string) {
  const snapshot = await getDocs(query(announcements(), where("published", "==", true)));
  return snapshot.docs.map((item) => ({ id: item.id, ...item.data() })).filter((item) => !communityId || item.community_id === communityId).sort((a, b) => String(b.created_at ?? "").localeCompare(String(a.created_at ?? "")));
}

export type FirestoreProfile = FirestoreUserProfile;
