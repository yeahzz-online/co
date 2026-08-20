import { useQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, Download, Loader2 } from "lucide-react";

import { GlassCard, PageHeader, Pill } from "@/components/ui-kit";
import { Button } from "@/components/ui/button";
import { getForm, getQuestions, listSubmissions } from "@/lib/forms";

export const Route = createFileRoute("/admin/forms/$formId")({ component: AdminResponsesPage });

function AdminResponsesPage() {
  const { formId } = Route.useParams();
  const query = useQuery({ queryKey: ["form-responses", formId], queryFn: async () => { const form = await getForm(formId); if (!form) throw new Error("Form not found"); return { form, questions: await getQuestions(formId), submissions: await listSubmissions(formId) }; } });
  function downloadCsv() {
    if (!query.data) return;
    const { questions, submissions } = query.data;
    const header = ["Submission ID", "Submitted At", ...questions.map((question) => question.title)];
    const rows = submissions.map((submission) => [submission.submission_id, submission.submitted_at, ...questions.map((question) => { const answer = submission.answers[question.id]; return Array.isArray(answer) ? answer.join("; ") : answer ?? ""; })]);
    const csv = [header, ...rows].map((row) => row.map((cell) => `"${String(cell).replaceAll('"', '""')}"`).join(",")).join("\n");
    const link = document.createElement("a"); link.href = URL.createObjectURL(new Blob([csv], { type: "text/csv" })); link.download = `${query.data.form.slug}-responses.csv`; link.click(); URL.revokeObjectURL(link.href);
  }
  if (query.isLoading) return <div className="flex justify-center py-24"><Loader2 className="animate-spin text-primary" /></div>;
  if (!query.data) return <div className="p-10">Form not found.</div>;
  const { form, questions, submissions } = query.data;
  return <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6"><Button asChild variant="ghost" className="mb-4"><Link to="/admin/forms"><ArrowLeft className="mr-2 size-4" /> Forms</Link></Button><div className="flex flex-wrap items-end justify-between gap-4"><PageHeader title={`${form.title} responses`} description={`${submissions.length} submission${submissions.length === 1 ? "" : "s"}`} /><Button onClick={downloadCsv} variant="outline" className="rounded-full"><Download className="mr-2 size-4" /> Export CSV</Button></div><GlassCard className="mt-8 overflow-x-auto p-0"><table className="w-full min-w-[720px] text-left text-sm"><thead className="border-b border-glass-border bg-glass-strong"><tr><th className="px-4 py-3">Submission</th><th className="px-4 py-3">Submitted</th>{questions.map((question) => <th className="px-4 py-3" key={question.id}>{question.title}</th>)}<th className="px-4 py-3">Status</th></tr></thead><tbody className="divide-y divide-glass-border">{submissions.map((submission) => <tr key={submission.id}><td className="px-4 py-3 font-mono text-xs">{submission.submission_id}</td><td className="px-4 py-3 text-xs text-muted-foreground">{new Date(submission.submitted_at).toLocaleString()}</td>{questions.map((question) => { const answer = submission.answers[question.id]; return <td className="max-w-xs px-4 py-3" key={question.id}>{Array.isArray(answer) ? answer.join(", ") : answer}</td>; })}<td className="px-4 py-3"><Pill tone="success" className="text-[10px]">{submission.status}</Pill></td></tr>)}</tbody></table>{!submissions.length && <p className="p-8 text-center text-sm text-muted-foreground">No responses yet.</p>}</GlassCard></div>;
}
