import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

type Campaign = {
  audience: "all_members" | "event_registrants";
  activityId?: string;
  subject: string;
  previewText?: string;
  message: string;
};

function escapeHtml(value: string) {
  return value.replace(/[&<>'"]/g, (character) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;" })[character] ?? character);
}

function emailHtml(message: string, previewText?: string) {
  const preview = previewText ? `<span style="display:none!important;opacity:0;color:transparent">${escapeHtml(previewText)}</span>` : "";
  const content = escapeHtml(message).replace(/\n/g, "<br />");
  return `${preview}<main style="max-width:600px;margin:0 auto;padding:32px 24px;font-family:Arial,sans-serif;color:#172033;line-height:1.6"><h1 style="font-size:24px;margin:0 0 20px;color:#4f46e5">COPEX Community</h1><p style="margin:0">${content}</p><hr style="border:0;border-top:1px solid #e5e7eb;margin:32px 0 16px" /><p style="font-size:12px;color:#6b7280;margin:0">You are receiving this update because you are part of the COPEX Community.</p></main>`;
}

Deno.serve(async (request) => {
  if (request.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (request.method !== "POST") return Response.json({ error: "Method not allowed" }, { status: 405, headers: corsHeaders });

  try {
    const authorization = request.headers.get("Authorization");
    if (!authorization?.startsWith("Bearer ")) throw new Error("Sign in before sending a campaign.");

    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    const firebaseMailerUrl = Deno.env.get("FIREBASE_MAILER_URL");
    const firebaseMailerToken = Deno.env.get("FIREBASE_MAILER_TOKEN");
    if (!supabaseUrl || !serviceRoleKey || !firebaseMailerUrl || !firebaseMailerToken) throw new Error("Function secrets are incomplete. Configure FIREBASE_MAILER_URL and FIREBASE_MAILER_TOKEN.");

    const admin = createClient(supabaseUrl, serviceRoleKey, { auth: { persistSession: false } });
    const token = authorization.slice(7);
    const { data: userData, error: userError } = await admin.auth.getUser(token);
    if (userError || !userData.user) throw new Error("Your session is not valid.");

    const { data: role } = await admin.from("user_roles").select("role").eq("user_id", userData.user.id).eq("role", "admin").maybeSingle();
    if (!role) throw new Error("Only administrators can send campaigns.");

    const campaign = await request.json() as Campaign;
    if (!campaign.subject?.trim() || !campaign.message?.trim()) throw new Error("Subject and message are required.");
    if (campaign.subject.length > 180 || campaign.message.length > 20_000) throw new Error("Campaign content is too long.");

    let rows: { email: string | null; full_name: string | null }[] = [];
    if (campaign.audience === "all_members") {
      const { data, error } = await admin.from("profiles").select("email, full_name").not("email", "is", null).limit(1000);
      if (error) throw error;
      rows = data ?? [];
    } else {
      if (!campaign.activityId) throw new Error("Select an event before emailing registrants.");
      const { data, error } = await admin.from("registrations").select("email, full_name").eq("activity_id", campaign.activityId).in("status", ["approved", "pending"]).not("email", "is", null).limit(1000);
      if (error) throw error;
      rows = data ?? [];
    }

    const emails = [...new Set(rows.flatMap((row) => row.email ? [row.email.toLowerCase()] : []))];
    if (!emails.length) throw new Error("No email addresses were found for this audience.");
    const html = emailHtml(campaign.message, campaign.previewText);

    const response = await fetch(firebaseMailerUrl, {
        method: "POST",
        headers: { Authorization: `Bearer ${firebaseMailerToken}`, "Content-Type": "application/json" },
        body: JSON.stringify({ recipients: emails, subject: campaign.subject, previewText: campaign.previewText, message: campaign.message, html }),
      });
    if (!response.ok) throw new Error(`Firebase mailer rejected the campaign: ${await response.text()}`);
    return Response.json({ delivered: emails.length }, { headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (error) {
    return Response.json({ error: error instanceof Error ? error.message : "Could not send campaign." }, { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});
