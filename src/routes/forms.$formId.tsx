import { useMutation, useQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, CheckCircle2, Loader2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { GlassCard, PageHeader } from "@/components/ui-kit";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/hooks/use-auth";
import { getForm, getQuestions, submitForm, type FormQuestion } from "@/lib/forms";

export const Route = createFileRoute("/forms/$formId")({ component: StudentFormPage });

function StudentFormPage() {
  const { formId } = Route.useParams();
  const { user } = useAuth();
  const [answers, setAnswers] = useState<Record<string, string | string[]>>({});
  const [completed, setCompleted] = useState<string | null>(null);
  const formQuery = useQuery({ queryKey: ["form", formId], queryFn: async () => { const form = await getForm(formId); if (!form) throw new Error("Form not found"); return { form, questions: await getQuestions(form.id) }; } });
  const mutation = useMutation({ mutationFn: async () => { if (!user) throw new Error("Please sign in before submitting this form."); if (!formQuery.data) throw new Error("Form is still loading."); return submitForm(formQuery.data.form, user.uid, answers); }, onSuccess: (submission) => setCompleted(submission.submission_id), onError: (error: Error) => toast.error(error.message) });
  if (formQuery.isLoading) return <div className="flex justify-center py-24"><Loader2 className="animate-spin text-primary" /></div>;
  if (formQuery.error || !formQuery.data) return <div className="mx-auto max-w-xl px-4 py-20"><GlassCard className="p-8 text-center"><h1 className="font-display text-xl font-bold">Form unavailable</h1><p className="mt-2 text-sm text-muted-foreground">This form may have been removed or is not published.</p></GlassCard></div>;
  const { form, questions } = formQuery.data;
  if (completed) return <div className="mx-auto max-w-xl px-4 py-20"><GlassCard className="p-8 text-center"><CheckCircle2 className="mx-auto size-14 text-emerald-500" /><h1 className="mt-4 font-display text-2xl font-bold">Response submitted</h1><p className="mt-2 text-sm text-muted-foreground">{form.success_message}</p><p className="mt-5 rounded-xl bg-glass p-3 font-mono text-sm">Submission ID: {completed}</p><Button asChild className="mt-6 rounded-full"><Link to="/forms">Back to forms</Link></Button></GlassCard></div>;
  const unavailable = form.status !== "published" || (form.start_at ? Date.now() < new Date(form.start_at).getTime() : false) || (form.end_at ? Date.now() > new Date(form.end_at).getTime() : false);
  return <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6"><Button asChild variant="ghost" className="mb-4"><Link to="/forms"><ArrowLeft className="mr-2 size-4" /> All forms</Link></Button><PageHeader title={form.title} description={form.description} />{unavailable ? <GlassCard className="mt-8 p-8 text-center"><h2 className="font-display text-xl font-bold">This form is not accepting responses</h2><p className="mt-2 text-sm text-muted-foreground">Please check back later or contact the organizer.</p></GlassCard> : <form className="mt-8 space-y-4" onSubmit={(event) => { event.preventDefault(); mutation.mutate(); }}>{questions.map((question) => <QuestionField key={question.id} question={question} value={answers[question.id]} onChange={(value) => setAnswers((current) => ({ ...current, [question.id]: value }))} />)}<Button type="submit" disabled={mutation.isPending || !user} className="rounded-full px-6">{mutation.isPending ? "Submitting…" : !user ? "Sign in to submit" : "Submit response"}</Button>{!user && <p className="text-xs text-muted-foreground">Please sign in to submit your response.</p>}</form>}</div>;
}

function QuestionField({ question, value, onChange }: { question: FormQuestion; value: string | string[] | undefined; onChange: (value: string | string[]) => void }) {
  const inputClass = "mt-2";
  if (question.type === "paragraph") return <GlassCard className="p-5"><label className="font-semibold">{question.title}{question.required && <span className="ml-1 text-destructive">*</span>}</label>{question.description && <p className="mt-1 text-xs text-muted-foreground">{question.description}</p>}<textarea required={question.required} value={(value as string) ?? ""} onChange={(e) => onChange(e.target.value)} placeholder={question.placeholder} className={`${inputClass} min-h-28 w-full rounded-xl border border-glass-border bg-glass p-3 text-sm outline-none`} /></GlassCard>;
  if (["multiple_choice", "dropdown", "yes_no", "checkboxes"].includes(question.type)) return <GlassCard className="p-5"><label className="font-semibold">{question.title}{question.required && <span className="ml-1 text-destructive">*</span>}</label>{question.description && <p className="mt-1 text-xs text-muted-foreground">{question.description}</p>}{question.type === "dropdown" ? <select required={question.required} value={(value as string) ?? ""} onChange={(e) => onChange(e.target.value)} className={`${inputClass} w-full rounded-xl border border-glass-border bg-glass px-3 py-2 text-sm`}><option value="">Select an option</option>{question.options?.map((option) => <option key={option}>{option}</option>)}</select> : <div className={`${inputClass} space-y-2`}>{(question.type === "yes_no" ? ["Yes", "No"] : question.options ?? []).map((option) => <label className="flex items-center gap-2 text-sm" key={option}><input required={question.required && question.type !== "checkboxes"} type={question.type === "checkboxes" ? "checkbox" : "radio"} name={question.id} checked={Array.isArray(value) ? value.includes(option) : value === option} onChange={(event) => onChange(question.type === "checkboxes" ? [...(Array.isArray(value) ? value : []), option].filter((item, index, all) => event.target.checked ? all.indexOf(item) === index : item !== option) : option)} />{option}</label>)}</div>}</GlassCard>;
  const type = question.type === "email" ? "email" : question.type === "number" || question.type === "rating" || question.type === "linear_scale" ? "number" : question.type === "url" ? "url" : question.type === "date" || question.type === "time" ? question.type : "text";
  return <GlassCard className="p-5"><label className="font-semibold">{question.title}{question.required && <span className="ml-1 text-destructive">*</span>}</label>{question.description && <p className="mt-1 text-xs text-muted-foreground">{question.description}</p>}<Input required={question.required} type={type} value={(value as string) ?? ""} onChange={(e) => onChange(e.target.value)} placeholder={question.placeholder} className={inputClass} min={question.min_value} max={question.max_value} /></GlassCard>;
}
