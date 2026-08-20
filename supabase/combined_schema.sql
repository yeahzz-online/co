-- ========================================================
-- COPEX COMMUNITY — COMPLETE SUPABASE DATABASE SCHEMA
-- Execute this SQL in Supabase Dashboard -> SQL Editor
-- ========================================================

-- 1. Create Enums
CREATE TYPE public.app_role AS ENUM ('student','faculty','organizer','admin');
CREATE TYPE public.activity_kind AS ENUM ('event','class');
CREATE TYPE public.activity_category AS ENUM ('technical','cultural','workshop','hackathon','competition','seminar','club','sports','other');
CREATE TYPE public.activity_mode AS ENUM ('offline','online','hybrid');
CREATE TYPE public.registration_type AS ENUM ('individual','team','student','faculty','approval','invite_only');
CREATE TYPE public.registration_status AS ENUM ('pending','approved','rejected','cancelled','waitlisted','completed');

-- 2. Helper Functions
CREATE OR REPLACE FUNCTION public.set_updated_at() RETURNS TRIGGER
LANGUAGE plpgsql SET search_path = public AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END; $$;

-- 3. Profiles Table
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT, email TEXT, phone TEXT, department TEXT, year TEXT, section TEXT,
  roll_number TEXT, employee_id TEXT, avatar_url TEXT, bio TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- 4. User Roles Table
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL DEFAULT 'student',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);
GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Helper role functions
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role public.app_role)
RETURNS BOOLEAN LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role);
$$;

CREATE OR REPLACE FUNCTION public.is_staff(_user_id UUID)
RETURNS BOOLEAN LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role IN ('organizer','admin'));
$$;

CREATE POLICY "profiles_select_own" ON public.profiles FOR SELECT TO authenticated
  USING (id = auth.uid() OR public.is_staff(auth.uid()));
CREATE POLICY "profiles_insert_own" ON public.profiles FOR INSERT TO authenticated WITH CHECK (id = auth.uid());
CREATE POLICY "profiles_update_own" ON public.profiles FOR UPDATE TO authenticated
  USING (id = auth.uid() OR public.has_role(auth.uid(),'admin'))
  WITH CHECK (id = auth.uid() OR public.has_role(auth.uid(),'admin'));
CREATE POLICY "roles_select_own" ON public.user_roles FOR SELECT TO authenticated
  USING (user_id = auth.uid() OR public.has_role(auth.uid(),'admin'));
CREATE TRIGGER profiles_updated BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- New user trigger
CREATE OR REPLACE FUNCTION public.handle_new_user() RETURNS TRIGGER
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, email)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name'), NEW.email)
  ON CONFLICT (id) DO NOTHING;
  INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'student') ON CONFLICT DO NOTHING;
  RETURN NEW;
END; $$;
CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 5. Communities Table
CREATE TABLE public.communities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL, slug TEXT NOT NULL UNIQUE, description TEXT, about TEXT, rules TEXT,
  category public.activity_category NOT NULL DEFAULT 'club',
  logo_url TEXT, cover_url TEXT,
  published BOOLEAN NOT NULL DEFAULT true,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.communities TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.communities TO authenticated;
GRANT ALL ON public.communities TO service_role;
ALTER TABLE public.communities ENABLE ROW LEVEL SECURITY;
CREATE POLICY "communities_public_read" ON public.communities FOR SELECT TO anon, authenticated USING (published = true);
CREATE POLICY "communities_owner_read" ON public.communities FOR SELECT TO authenticated USING (created_by = auth.uid() OR public.is_staff(auth.uid()));
CREATE POLICY "communities_staff_write" ON public.communities FOR INSERT TO authenticated WITH CHECK (public.is_staff(auth.uid()) AND created_by = auth.uid());
CREATE POLICY "communities_staff_update" ON public.communities FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(),'admin') OR created_by = auth.uid())
  WITH CHECK (public.has_role(auth.uid(),'admin') OR created_by = auth.uid());
CREATE POLICY "communities_staff_delete" ON public.communities FOR DELETE TO authenticated
  USING (public.has_role(auth.uid(),'admin') OR created_by = auth.uid());
CREATE TRIGGER communities_updated BEFORE UPDATE ON public.communities FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- 6. Community Members Table
CREATE TABLE public.community_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  community_id UUID NOT NULL REFERENCES public.communities(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  member_role TEXT NOT NULL DEFAULT 'member',
  joined_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (community_id, user_id)
);
GRANT SELECT ON public.community_members TO anon;
GRANT SELECT, INSERT, DELETE, UPDATE ON public.community_members TO authenticated;
GRANT ALL ON public.community_members TO service_role;
ALTER TABLE public.community_members ENABLE ROW LEVEL SECURITY;

-- 7. Activities Table
CREATE TABLE public.activities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL, summary TEXT, description TEXT,
  kind public.activity_kind NOT NULL DEFAULT 'event',
  category public.activity_category NOT NULL DEFAULT 'technical',
  mode public.activity_mode NOT NULL DEFAULT 'offline',
  venue TEXT, online_url TEXT,
  starts_at TIMESTAMPTZ NOT NULL, ends_at TIMESTAMPTZ,
  duration_minutes INTEGER, registration_deadline TIMESTAMPTZ,
  capacity INTEGER, seats_taken INTEGER NOT NULL DEFAULT 0, allow_waitlist BOOLEAN NOT NULL DEFAULT true,
  registration_type public.registration_type NOT NULL DEFAULT 'individual',
  team_min_size INTEGER DEFAULT 1, team_max_size INTEGER DEFAULT 4,
  is_free BOOLEAN NOT NULL DEFAULT true, price NUMERIC(10,2) DEFAULT 0,
  banner_url TEXT, instructor_name TEXT, instructor_bio TEXT, instructor_photo_url TEXT,
  level TEXT, learning_outcomes TEXT, requirements TEXT, eligibility TEXT, rules TEXT,
  community_id UUID REFERENCES public.communities(id) ON DELETE SET NULL,
  organizer_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  organizer_name TEXT,
  published BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.activities TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.activities TO authenticated;
GRANT ALL ON public.activities TO service_role;
ALTER TABLE public.activities ENABLE ROW LEVEL SECURITY;
CREATE POLICY "activities_public_read" ON public.activities FOR SELECT TO anon, authenticated USING (published = true);
CREATE POLICY "activities_staff_write" ON public.activities FOR INSERT TO authenticated WITH CHECK (public.is_staff(auth.uid()));
CREATE POLICY "activities_staff_update" ON public.activities FOR UPDATE TO authenticated USING (public.is_staff(auth.uid()));

-- 8. Registrations Table
CREATE TABLE public.registrations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  activity_id UUID NOT NULL REFERENCES public.activities(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  status public.registration_status NOT NULL DEFAULT 'approved',
  full_name TEXT NOT NULL, email TEXT NOT NULL, phone TEXT,
  department TEXT, year TEXT, section TEXT, roll_number TEXT, employee_id TEXT,
  team_name TEXT, team_members JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (activity_id, user_id)
);
GRANT SELECT, INSERT, UPDATE ON public.registrations TO authenticated;
GRANT ALL ON public.registrations TO service_role;
ALTER TABLE public.registrations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "registrations_own_read" ON public.registrations FOR SELECT TO authenticated USING (user_id = auth.uid() OR public.is_staff(auth.uid()));
CREATE POLICY "registrations_own_insert" ON public.registrations FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());

-- 9. Notifications Table
CREATE TABLE public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL, body TEXT NOT NULL, link TEXT, read BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, UPDATE ON public.notifications TO authenticated;
GRANT ALL ON public.notifications TO service_role;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "notifications_own" ON public.notifications FOR ALL TO authenticated USING (user_id = auth.uid());

-- 10. Recount Seats Trigger
CREATE OR REPLACE FUNCTION public.recount_activity_seats() RETURNS TRIGGER
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE aid UUID;
BEGIN
  aid := COALESCE(NEW.activity_id, OLD.activity_id);
  UPDATE public.activities a
  SET seats_taken = (
    SELECT count(*) FROM public.registrations r
    WHERE r.activity_id = aid AND r.status IN ('approved','pending','completed')
  )
  WHERE a.id = aid;
  RETURN COALESCE(NEW, OLD);
END; $$;

CREATE TRIGGER registrations_recount AFTER INSERT OR UPDATE OR DELETE ON public.registrations
FOR EACH ROW EXECUTE FUNCTION public.recount_activity_seats();

-- 11. Security Hardening Permissions
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM anon, authenticated, PUBLIC;
REVOKE EXECUTE ON FUNCTION public.set_updated_at() FROM anon, authenticated, PUBLIC;
REVOKE EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) FROM anon, PUBLIC;
REVOKE EXECUTE ON FUNCTION public.is_staff(uuid) FROM anon, PUBLIC;
GRANT EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_staff(uuid) TO authenticated;
