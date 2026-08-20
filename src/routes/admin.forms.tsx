import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Copy, Eye, FilePlus2, GripVertical, Loader2, Plus, Save, Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { GlassCard, PageHeader, Pill } from "@/components/ui-kit";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth, usePermissions } from "@/hooks/use-auth";
import { listForms, saveForm, updateFormStatus, type FormQuestionType } from "@/lib/forms";

export const Route = createFileRoute("/admin/forms")({ component: AdminFormsPage });

const questionTypes: { value: FormQuestionType; label: string }[] = [
  { value: "short_answer", label: "Short answer" }, { value: "paragraph", label: "Paragraph" },
  { value: "email", label: "Email" }, { value: "number", label: "Number" }, { value: "phone", label: "Phone" },
  { value: "multiple_choice", label: "Multiple choice" }, { value: "checkboxes", label: "Checkboxes" },
  { value: "dropdown", label: "Dropdown" }, { value: "yes_no", label: "Yes / No" },
  { value: "date", label: "Date" }, { value: "time", label: "Time" }, { value: "url", label: "URL" },
  { value: "rating", label: "Rating" }, { value: "linear_scale", label: "Linear scale" },
];

type DraftQuestion = { title: string; description: string; type: FormQuestionType; required: boolean; options: string[]; placeholder: string; min_value?: number; max_value?: number };
const newQuestion = (): DraftQuestion => ({ title: "", description: "", type: "short_answer", required: false, options: ["Option 1"], placeholder: "" });
const demoQuestions: DraftQuestion[] = [
  { title: "Full name", description: "Enter your name as it appears on your student ID.", type: "short_answer", required: true, options: ["Option 1"], placeholder: "Your full name" },
  { title: "Email address", description: "We will use this email for event updates.", type: "email", required: true, options: ["Option 1"], placeholder: "you@example.com" },
  { title: "Which activities interest you?", description: "Select all that apply.", type: "checkboxes", required: true, options: ["Workshops", "Hackathons", "Volunteering", "Sports and clubs"], placeholder: "" },
  { title: "What is your experience level?", description: "This helps us plan the session.", type: "dropdown", required: true, options: ["Beginner", "Intermediate", "Advanced"], placeholder: "" },
  { title: "Anything else we should know?", description: "Optional comments or accessibility needs.", type: "paragraph", required: false, options: ["Option 1"], placeholder: "Write a note..." },
];

function AdminFormsPage() {
  const { user } = useAuth();
  const { isAdmin, isLoading: permissionLoading } = usePermissions();
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  // Open directly into the builder so the admin can create a form immediately.
  // Cancel returns to the saved forms list.
  const [editing, setEditing] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("Community Registration");
  const [successMessage, setSuccessMessage] = useState("Your response was submitted successfully!");
  const [oneResponsePerUser, setOneResponsePerUser] = useState(true);
  const [questions, setQuestions] = useState<DraftQuestion[]>([newQuestion()]);

  const formsQuery = useQuery({ queryKey: ["forms", "admin"], queryFn: () => listForms(true), enabled: isAdmin });
  const saveMutation = useMutation({
    mutationFn: () => {
      const cleanTitle = title.trim();
      const cleanQuestions = questions.filter((question) => question.title.trim());
      if (!cleanTitle) throw new Error("Please enter a form title.");
      if (!cleanQuestions.length) throw new Error("Add at least one question before saving.");
      if (cleanQuestions.some((question) => ["multiple_choice", "checkboxes", "dropdown"].includes(question.type) && question.options.filter((option) => option.trim()).length === 0)) throw new Error("Choice questions need at least one option.");
      return saveForm({ title: cleanTitle, description, category, success_message: successMessage || "Your response was submitted successfully!", one_response_per_user: oneResponsePerUser, created_by: user!.uid }, cleanQuestions.map((question) => ({ ...question, title: question.title.trim(), options: question.options.map((option) => option.trim()).filter(Boolean) })));
    },
    onSuccess: () => { toast.success("Form saved as draft."); setEditing(false); queryClient.invalidateQueries({ queryKey: ["forms"] }); },
    onError: (error: Error) => toast.error(error.message),
  });
  const demoMutation = useMutation({
    mutationFn: () => saveForm({ id: "demo-community-interest", title: "COPEX Community Interest Form", description: "Tell us what you would like to learn, build, and participate in this semester.", category: "Community Registration", success_message: "Thanks for sharing your interests! We will be in touch soon.", one_response_per_user: true, status: "published", created_by: user!.uid }, demoQuestions),
    onSuccess: () => { toast.success("Demo form created and published."); queryClient.invalidateQueries({ queryKey: ["forms"] }); navigate({ to: "/forms/$formId", params: { formId: "demo-community-interest" } }); },
    onError: (error: Error) => toast.error(error.message),
  });
  const statusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: "published" | "closed" }) => updateFormStatus(id, status),
    onSuccess: () => { toast.success("Form status updated."); queryClient.invalidateQueries({ queryKey: ["forms"] }); },
    onError: (error: Error) => toast.error(error.message),
  });

  function startCreate() { setTitle(""); setDescription(""); setCategory("Community Registration"); setSuccessMessage("Your response was submitted successfully!"); setOneResponsePerUser(true); setQuestions([newQuestion()]); setEditing(true); }
  function updateQuestion(index: number, patch: Partial<DraftQuestion>) { setQuestions((items) => items.map((item, i) => i === index ? { ...item, ...patch } : item)); }
  function duplicateQuestion(index: number) { setQuestions((items) => [...items.slice(0, index + 1), { ...items[index], title: `${items[index].title} (copy)` }, ...items.slice(index + 1)]); }

  if (permissionLoading) return <div className="flex justify-center py-24"><Loader2 className="animate-spin text-primary" /></div>;
  if (!isAdmin) return <div className="mx-auto max-w-xl px-4 py-20"><GlassCard className="p-8 text-center"><h1 className="font-display text-xl font-bold">Admin access required</h1><p className="mt-2 text-sm text-muted-foreground">Sign in with an administrator account to manage forms.</p></GlassCard></div>;

  if (editing) return <FormBuilder title={title} setTitle={setTitle} description={description} setDescription={setDescription} category={category} setCategory={setCategory} successMessage={successMessage} setSuccessMessage={setSuccessMessage} oneResponsePerUser={oneResponsePerUser} setOneResponsePerUser={setOneResponsePerUser} questions={questions} setQuestions={setQuestions} onCancel={() => setEditing(false)} onSave={() => saveMutation.mutate()} saving={saveMutation.isPending} updateQuestion={updateQuestion} duplicateQuestion={duplicateQuestion} />;

  return <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
    <PageHeader title="Forms" description="Create registrations, applications, surveys, and activity forms for your community." />
    <div className="mt-6 flex flex-wrap gap-2"><Button onClick={startCreate} className="rounded-full"><FilePlus2 className="mr-2 size-4" /> Create form</Button><Button variant="secondary" onClick={() => demoMutation.mutate()} disabled={demoMutation.isPending} className="rounded-full">{demoMutation.isPending ? "Creating demo…" : "Create demo form"}</Button><Button variant="outline" asChild className="rounded-full"><Link to="/forms"><Eye className="mr-2 size-4" /> Student view</Link></Button></div>
    <div className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {formsQuery.isLoading ? <GlassCard className="p-6">Loading forms…</GlassCard> : formsQuery.data?.length ? formsQuery.data.map((form) => <GlassCard key={form.id} className="p-5">
        <div className="flex items-start justify-between gap-3"><div><Pill tone={form.status === "published" ? "success" : form.status === "closed" ? "danger" : "muted"} className="text-[10px] capitalize">{form.status}</Pill><h2 className="mt-3 font-display text-lg font-bold">{form.title}</h2></div><span className="text-xs text-muted-foreground">{form.category}</span></div>
        <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">{form.description || "No description"}</p>
        <div className="mt-5 flex flex-wrap gap-2"><Button size="sm" variant="outline" asChild className="rounded-full"><Link to="/forms/$formId" params={{ formId: form.id }}>View</Link></Button><Button size="sm" variant="outline" asChild className="rounded-full"><Link to="/admin/forms/$formId" params={{ formId: form.id }}>Responses</Link></Button>{form.status === "draft" ? <Button size="sm" onClick={() => statusMutation.mutate({ id: form.id, status: "published" })} className="rounded-full">Publish</Button> : form.status === "published" ? <Button size="sm" variant="secondary" onClick={() => statusMutation.mutate({ id: form.id, status: "closed" })} className="rounded-full">Close</Button> : null}<Button size="sm" variant="ghost" onClick={() => navigator.clipboard?.writeText(`${location.origin}/forms/${form.id}`)}><Copy className="size-3.5" /></Button></div>
      </GlassCard>) : <GlassCard className="p-8 text-center md:col-span-2 lg:col-span-3"><FilePlus2 className="mx-auto size-10 text-primary" /><h2 className="mt-3 font-display text-lg font-bold">No forms yet</h2><p className="mt-1 text-sm text-muted-foreground">Create your first student registration form.</p></GlassCard>}
    </div>
  </div>;
}

function FormBuilder(props: { title: string; setTitle: (v: string) => void; description: string; setDescription: (v: string) => void; category: string; setCategory: (v: string) => void; successMessage: string; setSuccessMessage: (v: string) => void; oneResponsePerUser: boolean; setOneResponsePerUser: (v: boolean) => void; questions: DraftQuestion[]; setQuestions: React.Dispatch<React.SetStateAction<DraftQuestion[]>>; onCancel: () => void; onSave: () => void; saving: boolean; updateQuestion: (i: number, p: Partial<DraftQuestion>) => void; duplicateQuestion: (i: number) => void }) {
  return <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6"><PageHeader title="Create form" description="Build a dynamic form that students can complete from any device." /><div className="mt-6 flex justify-end gap-2"><Button variant="ghost" onClick={props.onCancel}>Cancel</Button><Button onClick={props.onSave} disabled={props.saving || !props.title.trim()} className="rounded-full"><Save className="mr-2 size-4" />{props.saving ? "Saving…" : "Save draft"}</Button></div>
    <GlassCard className="mt-4 border-t-4 border-t-primary p-6"><Input value={props.title} onChange={(e) => props.setTitle(e.target.value)} placeholder="Form title" maxLength={120} className="border-0 px-0 font-display text-2xl font-bold shadow-none focus-visible:ring-0" /><textarea value={props.description} onChange={(e) => props.setDescription(e.target.value)} placeholder="Form description and instructions" maxLength={1000} className="mt-3 min-h-20 w-full resize-y bg-transparent text-sm outline-none" /><div className="mt-4 grid gap-4 sm:grid-cols-2"><div><Label>Category</Label><select value={props.category} onChange={(e) => props.setCategory(e.target.value)} className="mt-1 w-full rounded-xl border border-glass-border bg-glass px-3 py-2 text-sm"><option>Community Registration</option><option>Event Registration</option><option>Hackathon</option><option>Workshop</option><option>Volunteer</option><option>Survey</option><option>Feedback</option><option>Other</option></select></div><div><Label>After submission</Label><Input value={props.successMessage} onChange={(e) => props.setSuccessMessage(e.target.value)} placeholder="Thank you message" className="mt-1" /></div></div><label className="mt-4 flex items-center gap-2 text-sm"><input type="checkbox" checked={props.oneResponsePerUser} onChange={(e) => props.setOneResponsePerUser(e.target.checked)} /> Allow only one response per user</label></GlassCard>
    <div className="mt-5 space-y-4">{props.questions.map((question, index) => <GlassCard key={index} className="p-5"><div className="flex gap-3"><GripVertical className="mt-2 size-5 shrink-0 text-muted-foreground" /><div className="min-w-0 flex-1"><p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Question {index + 1}</p><div className="grid gap-3 sm:grid-cols-[1fr_190px]"><Input value={question.title} onChange={(e) => props.updateQuestion(index, { title: e.target.value })} placeholder="Question title" maxLength={200} /><select value={question.type} onChange={(e) => props.updateQuestion(index, { type: e.target.value as FormQuestionType })} className="rounded-xl border border-glass-border bg-glass px-3 py-2 text-sm">{questionTypes.map((type) => <option key={type.value} value={type.value}>{type.label}</option>)}</select></div><Input value={question.description} onChange={(e) => props.updateQuestion(index, { description: e.target.value })} placeholder="Help text (optional)" className="mt-3" /><Input value={question.placeholder} onChange={(e) => props.updateQuestion(index, { placeholder: e.target.value })} placeholder="Placeholder (optional)" className="mt-3" />{["number", "rating", "linear_scale"].includes(question.type) && <div className="mt-3 grid grid-cols-2 gap-2"><Input type="number" value={question.min_value ?? ""} onChange={(e) => props.updateQuestion(index, { min_value: e.target.value ? Number(e.target.value) : undefined })} placeholder="Minimum" /><Input type="number" value={question.max_value ?? ""} onChange={(e) => props.updateQuestion(index, { max_value: e.target.value ? Number(e.target.value) : undefined })} placeholder="Maximum" /></div>}{["multiple_choice", "checkboxes", "dropdown"].includes(question.type) && <div className="mt-3 space-y-2">{question.options.map((option, optionIndex) => <div className="flex gap-2" key={optionIndex}><Input value={option} onChange={(e) => props.updateQuestion(index, { options: question.options.map((value, i) => i === optionIndex ? e.target.value : value) })} placeholder={`Option ${optionIndex + 1}`} /><Button type="button" variant="ghost" size="icon" disabled={question.options.length === 1} onClick={() => props.updateQuestion(index, { options: question.options.filter((_, i) => i !== optionIndex) })}><Trash2 className="size-4" /></Button></div>)}<Button type="button" variant="ghost" size="sm" onClick={() => props.updateQuestion(index, { options: [...question.options, `Option ${question.options.length + 1}`] })}><Plus className="mr-1 size-3" /> Add option</Button></div>}<div className="mt-4 flex items-center justify-between border-t border-glass-border pt-3"><label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={question.required} onChange={(e) => props.updateQuestion(index, { required: e.target.checked })} /> Required</label><div className="flex gap-1"><Button type="button" variant="ghost" size="sm" onClick={() => props.duplicateQuestion(index)}><Copy className="mr-1 size-3.5" /> Duplicate</Button><Button type="button" variant="ghost" size="sm" disabled={props.questions.length === 1} onClick={() => props.setQuestions((items) => items.filter((_, i) => i !== index))}><Trash2 className="mr-1 size-3.5" /> Delete</Button></div></div></div></div></GlassCard>)}<Button type="button" variant="outline" onClick={() => props.setQuestions((items) => [...items, newQuestion()])} className="w-full rounded-2xl border-dashed py-6"><Plus className="mr-2 size-4" /> Add question</Button></div>
  </div>;
}
