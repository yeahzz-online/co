-- COPEX program operations and platform security tables.

CREATE TABLE IF NOT EXISTS public.hackathons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  banner_url TEXT,
  starts_at TIMESTAMPTZ NOT NULL,
  ends_at TIMESTAMPTZ,
  registration_deadline TIMESTAMPTZ,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'pending', 'published', 'closed', 'completed')),
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.hackathon_problem_statements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  hackathon_id UUID NOT NULL REFERENCES public.hackathons(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  max_teams INTEGER,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.hackathon_teams (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  hackathon_id UUID NOT NULL REFERENCES public.hackathons(id) ON DELETE CASCADE,
  problem_statement_id UUID REFERENCES public.hackathon_problem_statements(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  captain_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  status TEXT NOT NULL DEFAULT 'registered' CHECK (status IN ('registered', 'shortlisted', 'disqualified', 'winner')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.hackathon_team_members (
  team_id UUID NOT NULL REFERENCES public.hackathon_teams(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  joined_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (team_id, user_id)
);

CREATE TABLE IF NOT EXISTS public.hackathon_submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id UUID NOT NULL REFERENCES public.hackathon_teams(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  repository_url TEXT,
  demo_url TEXT,
  description TEXT,
  score NUMERIC(7,2),
  status TEXT NOT NULL DEFAULT 'submitted' CHECK (status IN ('submitted', 'under_review', 'shortlisted', 'winner', 'rejected')),
  submitted_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.hackathon_judges (
  hackathon_id UUID NOT NULL REFERENCES public.hackathons(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (hackathon_id, user_id)
);

CREATE TABLE IF NOT EXISTS public.hackathon_mentors (
  hackathon_id UUID NOT NULL REFERENCES public.hackathons(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (hackathon_id, user_id)
);

CREATE TABLE IF NOT EXISTS public.hackathon_winners (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  hackathon_id UUID NOT NULL REFERENCES public.hackathons(id) ON DELETE CASCADE,
  team_id UUID NOT NULL REFERENCES public.hackathon_teams(id) ON DELETE CASCADE,
  position INTEGER NOT NULL CHECK (position > 0),
  prize TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (hackathon_id, position)
);

CREATE TABLE IF NOT EXISTS public.workshops (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  trainer_name TEXT,
  trainer_profile TEXT,
  banner_url TEXT,
  starts_at TIMESTAMPTZ NOT NULL,
  ends_at TIMESTAMPTZ,
  capacity INTEGER,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'pending', 'published', 'closed', 'completed')),
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.program_attendance (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  program_type TEXT NOT NULL CHECK (program_type IN ('activity', 'workshop', 'hackathon')),
  program_id UUID NOT NULL,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  marked_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  attended_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (program_type, program_id, user_id)
);

CREATE TABLE IF NOT EXISTS public.certificates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  program_type TEXT NOT NULL CHECK (program_type IN ('activity', 'workshop', 'hackathon')),
  program_id UUID NOT NULL,
  certificate_number TEXT NOT NULL UNIQUE,
  file_url TEXT,
  issued_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  revoked_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS public.notification_campaigns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  channels TEXT[] NOT NULL DEFAULT ARRAY['in_app'],
  audience JSONB NOT NULL DEFAULT '{"type":"all"}'::jsonb,
  scheduled_for TIMESTAMPTZ,
  sent_at TIMESTAMPTZ,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'scheduled', 'sending', 'sent', 'failed', 'cancelled')),
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.admin_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  ip_address INET,
  user_agent TEXT,
  last_seen_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  revoked_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.admin_settings (
  key TEXT PRIMARY KEY,
  value JSONB NOT NULL DEFAULT '{}'::jsonb,
  updated_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.system_error_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  source TEXT NOT NULL,
  message TEXT NOT NULL,
  fingerprint TEXT,
  severity TEXT NOT NULL DEFAULT 'error' CHECK (severity IN ('info', 'warning', 'error', 'critical')),
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  resolved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS hackathons_status_idx ON public.hackathons(status, starts_at);
CREATE INDEX IF NOT EXISTS hackathon_teams_status_idx ON public.hackathon_teams(hackathon_id, status);
CREATE INDEX IF NOT EXISTS submissions_status_idx ON public.hackathon_submissions(team_id, status);
CREATE INDEX IF NOT EXISTS workshops_status_idx ON public.workshops(status, starts_at);
CREATE INDEX IF NOT EXISTS attendance_program_idx ON public.program_attendance(program_type, program_id);
CREATE INDEX IF NOT EXISTS campaign_status_idx ON public.notification_campaigns(status, scheduled_for);
CREATE INDEX IF NOT EXISTS admin_sessions_active_idx ON public.admin_sessions(admin_id, revoked_at);
CREATE INDEX IF NOT EXISTS errors_created_idx ON public.system_error_events(created_at DESC, severity);

ALTER TABLE public.hackathons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hackathon_problem_statements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hackathon_teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hackathon_team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hackathon_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hackathon_judges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hackathon_mentors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hackathon_winners ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workshops ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.program_attendance ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.certificates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notification_campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.system_error_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY hackathons_public_read ON public.hackathons FOR SELECT TO anon, authenticated USING (status = 'published');
CREATE POLICY hackathons_staff_write ON public.hackathons FOR ALL TO authenticated USING (public.is_staff(auth.uid())) WITH CHECK (public.is_staff(auth.uid()));
CREATE POLICY hackathon_content_staff ON public.hackathon_problem_statements FOR ALL TO authenticated USING (public.is_staff(auth.uid())) WITH CHECK (public.is_staff(auth.uid()));
CREATE POLICY hackathon_teams_member_read ON public.hackathon_teams FOR SELECT TO authenticated USING (captain_id = auth.uid() OR public.is_staff(auth.uid()));
CREATE POLICY hackathon_teams_staff_write ON public.hackathon_teams FOR ALL TO authenticated USING (public.is_staff(auth.uid())) WITH CHECK (public.is_staff(auth.uid()));
CREATE POLICY hackathon_members_self_read ON public.hackathon_team_members FOR SELECT TO authenticated USING (user_id = auth.uid() OR public.is_staff(auth.uid()));
CREATE POLICY hackathon_members_staff_write ON public.hackathon_team_members FOR ALL TO authenticated USING (public.is_staff(auth.uid())) WITH CHECK (public.is_staff(auth.uid()));
CREATE POLICY submissions_team_read ON public.hackathon_submissions FOR SELECT TO authenticated USING (public.is_staff(auth.uid()) OR EXISTS (SELECT 1 FROM public.hackathon_team_members m WHERE m.team_id = public.hackathon_submissions.team_id AND m.user_id = auth.uid()));
CREATE POLICY submissions_staff_write ON public.hackathon_submissions FOR ALL TO authenticated USING (public.is_staff(auth.uid())) WITH CHECK (public.is_staff(auth.uid()));
CREATE POLICY hackathon_roles_staff ON public.hackathon_judges FOR ALL TO authenticated USING (public.is_staff(auth.uid())) WITH CHECK (public.is_staff(auth.uid()));
CREATE POLICY hackathon_mentors_staff ON public.hackathon_mentors FOR ALL TO authenticated USING (public.is_staff(auth.uid())) WITH CHECK (public.is_staff(auth.uid()));
CREATE POLICY hackathon_winners_public ON public.hackathon_winners FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY hackathon_winners_staff ON public.hackathon_winners FOR ALL TO authenticated USING (public.is_staff(auth.uid())) WITH CHECK (public.is_staff(auth.uid()));
CREATE POLICY workshops_public_read ON public.workshops FOR SELECT TO anon, authenticated USING (status = 'published');
CREATE POLICY workshops_staff_write ON public.workshops FOR ALL TO authenticated USING (public.is_staff(auth.uid())) WITH CHECK (public.is_staff(auth.uid()));
CREATE POLICY attendance_staff_read ON public.program_attendance FOR SELECT TO authenticated USING (user_id = auth.uid() OR public.is_staff(auth.uid()));
CREATE POLICY attendance_staff_write ON public.program_attendance FOR ALL TO authenticated USING (public.is_staff(auth.uid())) WITH CHECK (public.is_staff(auth.uid()));
CREATE POLICY certificates_owner_read ON public.certificates FOR SELECT TO authenticated USING (user_id = auth.uid() OR public.is_staff(auth.uid()));
CREATE POLICY certificates_staff_write ON public.certificates FOR ALL TO authenticated USING (public.is_staff(auth.uid())) WITH CHECK (public.is_staff(auth.uid()));
CREATE POLICY campaigns_admin_only ON public.notification_campaigns FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY sessions_admin_read ON public.admin_sessions FOR SELECT TO authenticated USING (admin_id = auth.uid() OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY sessions_admin_revoke ON public.admin_sessions FOR UPDATE TO authenticated USING (admin_id = auth.uid() OR public.has_role(auth.uid(), 'admin')) WITH CHECK (admin_id = auth.uid() OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY settings_admin_only ON public.admin_settings FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY errors_admin_read ON public.system_error_events FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY errors_staff_insert ON public.system_error_events FOR INSERT TO authenticated WITH CHECK (public.is_staff(auth.uid()));
CREATE POLICY errors_admin_update ON public.system_error_events FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

GRANT SELECT ON public.hackathons, public.hackathon_winners, public.workshops TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.hackathons, public.hackathon_problem_statements, public.hackathon_teams, public.hackathon_team_members, public.hackathon_submissions, public.hackathon_judges, public.hackathon_mentors, public.hackathon_winners, public.workshops, public.program_attendance, public.certificates, public.notification_campaigns, public.admin_sessions, public.admin_settings, public.system_error_events TO authenticated;
