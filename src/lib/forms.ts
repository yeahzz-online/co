import { collectionRef, documentRef, getDoc, getDocs, query, setDoc, where } from "@/integrations/firebase/firestore";

export type FormStatus = "draft" | "published" | "closed";
export type FormQuestionType =
  | "short_answer" | "paragraph" | "multiple_choice" | "checkboxes" | "dropdown"
  | "yes_no" | "number" | "phone" | "date" | "time" | "email" | "url" | "rating" | "linear_scale";

export type FormQuestion = {
  id: string;
  form_id: string;
  title: string;
  description?: string;
  type: FormQuestionType;
  required: boolean;
  options?: string[];
  placeholder?: string;
  order_index: number;
  min_value?: number;
  max_value?: number;
};

export type CommunityForm = {
  id: string;
  title: string;
  slug: string;
  description?: string;
  category: string;
  status: FormStatus;
  start_at?: string;
  end_at?: string;
  require_login: boolean;
  one_response_per_user: boolean;
  allow_edit: boolean;
  success_message: string;
  created_by: string;
  created_at: string;
  updated_at: string;
  response_count?: number;
};

export type FormSubmission = {
  id: string;
  form_id: string;
  user_id: string;
  submission_id: string;
  submitted_at: string;
  status: "submitted" | "reviewed";
  answers: Record<string, string | string[]>;
};

const forms = () => collectionRef<CommunityForm>("forms");
const questions = () => collectionRef<FormQuestion>("form_questions");
const submissions = () => collectionRef<FormSubmission>("form_submissions");

function slugify(value: string) {
  return value.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "") || `form-${Date.now()}`;
}

export async function listForms(includeDrafts = false) {
  const snapshot = await getDocs(includeDrafts ? forms() : query(forms(), where("status", "==", "published")));
  return snapshot.docs.map((item) => ({ id: item.id, ...item.data() } as CommunityForm))
    .sort((a, b) => b.created_at.localeCompare(a.created_at));
}

export async function getForm(id: string) {
  const snapshot = await getDoc(documentRef(`forms/${id}`));
  return snapshot.exists() ? ({ id: snapshot.id, ...snapshot.data() } as CommunityForm) : null;
}

export async function getQuestions(formId: string) {
  const snapshot = await getDocs(query(questions(), where("form_id", "==", formId)));
  return snapshot.docs.map((item) => ({ id: item.id, ...item.data() } as FormQuestion & { deleted?: boolean })).filter((item) => !item.deleted).sort((a, b) => a.order_index - b.order_index);
}

export async function saveForm(form: Partial<CommunityForm> & Pick<CommunityForm, "title" | "created_by">, questionRows: Omit<FormQuestion, "id" | "form_id">[]) {
  const now = new Date().toISOString();
  const id = form.id ?? crypto.randomUUID();
  const payload: CommunityForm = {
    id, title: form.title.trim(), slug: form.slug ?? slugify(form.title), description: form.description ?? "",
    category: form.category ?? "Other", status: form.status ?? "draft", start_at: form.start_at, end_at: form.end_at,
    require_login: form.require_login ?? true, one_response_per_user: form.one_response_per_user ?? true,
    allow_edit: form.allow_edit ?? false, success_message: form.success_message ?? "Your response was submitted successfully!",
    created_by: form.created_by, created_at: form.created_at ?? now, updated_at: now,
  };
  await setDoc(documentRef(`forms/${id}`), payload);
  const existing = await getQuestions(id);
  await Promise.all(existing.map((question) => setDoc(documentRef(`form_questions/${question.id}`), { ...question, deleted: true })));
  await Promise.all(questionRows.map((question, index) => {
    const questionId = crypto.randomUUID();
    return setDoc(documentRef(`form_questions/${questionId}`), { ...question, id: questionId, form_id: id, order_index: index });
  }));
  return payload;
}

export async function submitForm(form: CommunityForm, userId: string, answers: Record<string, string | string[]>) {
  if (form.status !== "published") throw new Error("This form is not currently accepting responses.");
  const now = Date.now();
  if (form.start_at && now < new Date(form.start_at).getTime()) throw new Error("This form is not open yet.");
  if (form.end_at && now > new Date(form.end_at).getTime()) throw new Error("This form is closed.");
  const formQuestions = await getQuestions(form.id);
  for (const question of formQuestions) {
    const answer = answers[question.id];
    const empty = answer === undefined || answer === "" || (Array.isArray(answer) && answer.length === 0);
    if (question.required && empty) throw new Error(`Please answer: ${question.title}`);
    if (empty || Array.isArray(answer)) continue;
    if (question.type === "email" && !/^\S+@\S+\.\S+$/.test(answer)) throw new Error(`Enter a valid email for: ${question.title}`);
    if (["number", "rating", "linear_scale"].includes(question.type) && Number.isNaN(Number(answer))) throw new Error(`Enter a valid number for: ${question.title}`);
    if (question.type === "url") { try { new URL(answer); } catch { throw new Error(`Enter a valid URL for: ${question.title}`); } }
    if (question.min_value !== undefined && Number(answer) < question.min_value) throw new Error(`${question.title} must be at least ${question.min_value}.`);
    if (question.max_value !== undefined && Number(answer) > question.max_value) throw new Error(`${question.title} must be at most ${question.max_value}.`);
  }
  const existing = await getDocs(query(submissions(), where("form_id", "==", form.id), where("user_id", "==", userId)));
  if (form.one_response_per_user && !existing.empty) throw new Error("You have already submitted this form.");
  const count = existing.size;
  const submissionId = `COMM-${new Date().getFullYear()}-${String(Date.now()).slice(-6)}${count}`;
  const id = crypto.randomUUID();
  const payload: FormSubmission = { id, form_id: form.id, user_id: userId, submission_id: submissionId, submitted_at: new Date().toISOString(), status: "submitted", answers };
  await setDoc(documentRef(`form_submissions/${id}`), payload);
  return payload;
}

export async function updateFormStatus(formId: string, status: FormStatus) {
  await setDoc(documentRef(`forms/${formId}`), { status, updated_at: new Date().toISOString() }, { merge: true });
}

export async function listSubmissions(formId: string) {
  const snapshot = await getDocs(query(submissions(), where("form_id", "==", formId)));
  return snapshot.docs.map((item) => ({ id: item.id, ...item.data() } as FormSubmission)).sort((a, b) => b.submitted_at.localeCompare(a.submitted_at));
}

export { slugify };
