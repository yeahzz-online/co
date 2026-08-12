
CREATE TYPE public.app_role AS ENUM ('student','faculty','organizer','admin');
CREATE TYPE public.activity_kind AS ENUM ('event','class');
CREATE TYPE public.activity_category AS ENUM ('technical','cultural','workshop','hackathon','competition','seminar','club','sports','other');
CREATE TYPE public.activity_mode AS ENUM ('offline','online','hybrid');
CREATE TYPE public.registration_type AS ENUM ('individual','team','student','faculty','approval','invite_only');
CREATE TYPE public.registration_status AS ENUM ('pending','approved','rejected','cancelled','waitlisted','completed');

CREATE OR REPLACE FUNCTION public.set_updated_at() RETURNS TRIGGER
LANGUAGE plpgsql SET search_path = public AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END; $$;

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
CREATE POLICY "cm_read" ON public.community_members FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "cm_join" ON public.community_members FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
CREATE POLICY "cm_leave" ON public.community_members FOR DELETE TO authenticated USING (user_id = auth.uid() OR public.has_role(auth.uid(),'admin'));
CREATE POLICY "cm_update" ON public.community_members FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));

CREATE TABLE public.activities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  kind public.activity_kind NOT NULL DEFAULT 'event',
  title TEXT NOT NULL, summary TEXT, description TEXT,
  category public.activity_category NOT NULL DEFAULT 'technical',
  banner_url TEXT, organizer_name TEXT,
  organizer_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  community_id UUID REFERENCES public.communities(id) ON DELETE SET NULL,
  instructor_name TEXT, instructor_bio TEXT, instructor_photo_url TEXT, level TEXT,
  mode public.activity_mode NOT NULL DEFAULT 'offline',
  venue TEXT, online_url TEXT,
  starts_at TIMESTAMPTZ NOT NULL, ends_at TIMESTAMPTZ, duration_minutes INTEGER,
  capacity INTEGER, registration_deadline TIMESTAMPTZ,
  registration_type public.registration_type NOT NULL DEFAULT 'individual',
  team_min_size INTEGER, team_max_size INTEGER,
  is_free BOOLEAN NOT NULL DEFAULT true, price NUMERIC(10,2),
  eligibility TEXT, requirements TEXT, rules TEXT, learning_outcomes TEXT,
  allow_waitlist BOOLEAN NOT NULL DEFAULT true,
  published BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX activities_kind_idx ON public.activities (kind, starts_at);
GRANT SELECT ON public.activities TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.activities TO authenticated;
GRANT ALL ON public.activities TO service_role;
ALTER TABLE public.activities ENABLE ROW LEVEL SECURITY;
CREATE POLICY "activities_public_read" ON public.activities FOR SELECT TO anon, authenticated USING (published = true);
CREATE POLICY "activities_owner_read" ON public.activities FOR SELECT TO authenticated
  USING (organizer_id = auth.uid() OR public.has_role(auth.uid(),'admin'));
CREATE POLICY "activities_insert" ON public.activities FOR INSERT TO authenticated
  WITH CHECK (public.is_staff(auth.uid()) AND organizer_id = auth.uid());
CREATE POLICY "activities_update" ON public.activities FOR UPDATE TO authenticated
  USING (organizer_id = auth.uid() OR public.has_role(auth.uid(),'admin'))
  WITH CHECK (organizer_id = auth.uid() OR public.has_role(auth.uid(),'admin'));
CREATE POLICY "activities_delete" ON public.activities FOR DELETE TO authenticated
  USING (organizer_id = auth.uid() OR public.has_role(auth.uid(),'admin'));
CREATE TRIGGER activities_updated BEFORE UPDATE ON public.activities FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TABLE public.activity_schedule (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  activity_id UUID NOT NULL REFERENCES public.activities(id) ON DELETE CASCADE,
  title TEXT NOT NULL, description TEXT,
  starts_at TIMESTAMPTZ, ends_at TIMESTAMPTZ, position INTEGER NOT NULL DEFAULT 0
);
CREATE TABLE public.activity_speakers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  activity_id UUID NOT NULL REFERENCES public.activities(id) ON DELETE CASCADE,
  name TEXT NOT NULL, title TEXT, bio TEXT, photo_url TEXT, position INTEGER NOT NULL DEFAULT 0
);
CREATE TABLE public.activity_faqs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  activity_id UUID NOT NULL REFERENCES public.activities(id) ON DELETE CASCADE,
  question TEXT NOT NULL, answer TEXT NOT NULL, position INTEGER NOT NULL DEFAULT 0
);
GRANT SELECT ON public.activity_schedule, public.activity_speakers, public.activity_faqs TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.activity_schedule, public.activity_speakers, public.activity_faqs TO authenticated;
GRANT ALL ON public.activity_schedule, public.activity_speakers, public.activity_faqs TO service_role;
ALTER TABLE public.activity_schedule ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activity_speakers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activity_faqs ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.can_manage_activity(_activity_id UUID, _user_id UUID)
RETURNS BOOLEAN LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.activities a WHERE a.id = _activity_id
    AND (a.organizer_id = _user_id OR public.has_role(_user_id,'admin')));
$$;

CREATE POLICY "sched_read" ON public.activity_schedule FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "sched_write" ON public.activity_schedule FOR ALL TO authenticated
  USING (public.can_manage_activity(activity_id, auth.uid())) WITH CHECK (public.can_manage_activity(activity_id, auth.uid()));
CREATE POLICY "spk_read" ON public.activity_speakers FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "spk_write" ON public.activity_speakers FOR ALL TO authenticated
  USING (public.can_manage_activity(activity_id, auth.uid())) WITH CHECK (public.can_manage_activity(activity_id, auth.uid()));
CREATE POLICY "faq_read" ON public.activity_faqs FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "faq_write" ON public.activity_faqs FOR ALL TO authenticated
  USING (public.can_manage_activity(activity_id, auth.uid())) WITH CHECK (public.can_manage_activity(activity_id, auth.uid()));

CREATE TABLE public.registrations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT NOT NULL UNIQUE DEFAULT ('CPX-' || upper(substr(replace(gen_random_uuid()::text,'-',''),1,8))),
  activity_id UUID NOT NULL REFERENCES public.activities(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  reg_type public.registration_type NOT NULL DEFAULT 'individual',
  status public.registration_status NOT NULL DEFAULT 'approved',
  team_name TEXT, full_name TEXT, email TEXT, phone TEXT, department TEXT,
  year TEXT, section TEXT, roll_number TEXT, employee_id TEXT, notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (activity_id, user_id)
);
GRANT SELECT, INSERT, UPDATE ON public.registrations TO authenticated;
GRANT ALL ON public.registrations TO service_role;
ALTER TABLE public.registrations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "reg_read" ON public.registrations FOR SELECT TO authenticated
  USING (user_id = auth.uid() OR public.can_manage_activity(activity_id, auth.uid()));
CREATE POLICY "reg_insert" ON public.registrations FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
CREATE POLICY "reg_update" ON public.registrations FOR UPDATE TO authenticated
  USING (user_id = auth.uid() OR public.can_manage_activity(activity_id, auth.uid()))
  WITH CHECK (user_id = auth.uid() OR public.can_manage_activity(activity_id, auth.uid()));
CREATE TRIGGER registrations_updated BEFORE UPDATE ON public.registrations FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TABLE public.registration_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  registration_id UUID NOT NULL REFERENCES public.registrations(id) ON DELETE CASCADE,
  name TEXT NOT NULL, email TEXT, roll_number TEXT, is_leader BOOLEAN NOT NULL DEFAULT false
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.registration_members TO authenticated;
GRANT ALL ON public.registration_members TO service_role;
ALTER TABLE public.registration_members ENABLE ROW LEVEL SECURITY;
CREATE OR REPLACE FUNCTION public.can_view_registration(_registration_id UUID, _user_id UUID)
RETURNS BOOLEAN LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.registrations r WHERE r.id = _registration_id
    AND (r.user_id = _user_id OR public.can_manage_activity(r.activity_id, _user_id)));
$$;
CREATE POLICY "rm_all" ON public.registration_members FOR ALL TO authenticated
  USING (public.can_view_registration(registration_id, auth.uid()))
  WITH CHECK (public.can_view_registration(registration_id, auth.uid()));

CREATE OR REPLACE FUNCTION public.apply_registration_rules() RETURNS TRIGGER
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE a public.activities%ROWTYPE; taken INTEGER;
BEGIN
  SELECT * INTO a FROM public.activities WHERE id = NEW.activity_id;
  IF a.id IS NULL OR a.published = false THEN RAISE EXCEPTION 'Activity is not open for registration'; END IF;
  IF a.registration_deadline IS NOT NULL AND now() > a.registration_deadline THEN
    RAISE EXCEPTION 'Registration deadline has passed'; END IF;
  NEW.reg_type := a.registration_type;
  SELECT count(*) INTO taken FROM public.registrations
    WHERE activity_id = NEW.activity_id AND status IN ('approved','pending','completed');
  IF a.capacity IS NOT NULL AND taken >= a.capacity THEN
    IF a.allow_waitlist THEN NEW.status := 'waitlisted';
    ELSE RAISE EXCEPTION 'This activity is full'; END IF;
  ELSIF a.registration_type IN ('approval','invite_only') THEN
    NEW.status := 'pending';
  ELSE
    NEW.status := 'approved';
  END IF;
  RETURN NEW;
END; $$;
CREATE TRIGGER registrations_rules BEFORE INSERT ON public.registrations
FOR EACH ROW EXECUTE FUNCTION public.apply_registration_rules();

CREATE TABLE public.announcements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  community_id UUID REFERENCES public.communities(id) ON DELETE CASCADE,
  activity_id UUID REFERENCES public.activities(id) ON DELETE CASCADE,
  title TEXT NOT NULL, body TEXT NOT NULL,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.announcements TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.announcements TO authenticated;
GRANT ALL ON public.announcements TO service_role;
ALTER TABLE public.announcements ENABLE ROW LEVEL SECURITY;
CREATE POLICY "ann_read" ON public.announcements FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "ann_write" ON public.announcements FOR ALL TO authenticated
  USING (public.is_staff(auth.uid())) WITH CHECK (public.is_staff(auth.uid()) AND created_by = auth.uid());

CREATE TABLE public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL, body TEXT, link TEXT,
  read BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.notifications TO authenticated;
GRANT ALL ON public.notifications TO service_role;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "notif_own" ON public.notifications FOR ALL TO authenticated
  USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

CREATE OR REPLACE FUNCTION public.notify_registration() RETURNS TRIGGER
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE t TEXT;
BEGIN
  SELECT title INTO t FROM public.activities WHERE id = NEW.activity_id;
  IF TG_OP = 'INSERT' THEN
    INSERT INTO public.notifications (user_id, title, body, link)
    VALUES (NEW.user_id, 'Registration ' || NEW.status::text, t || ' — ' || NEW.code, '/my-registrations');
  ELSIF NEW.status IS DISTINCT FROM OLD.status THEN
    INSERT INTO public.notifications (user_id, title, body, link)
    VALUES (NEW.user_id, 'Registration ' || NEW.status::text, t || ' — ' || NEW.code, '/my-registrations');
  END IF;
  RETURN NEW;
END; $$;
CREATE TRIGGER registrations_notify AFTER INSERT OR UPDATE ON public.registrations
FOR EACH ROW EXECUTE FUNCTION public.notify_registration();

CREATE OR REPLACE FUNCTION public.activity_seats(_activity_id UUID)
RETURNS INTEGER LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT count(*)::int FROM public.registrations
  WHERE activity_id = _activity_id AND status IN ('approved','pending','completed');
$$;
GRANT EXECUTE ON FUNCTION public.activity_seats(UUID) TO anon, authenticated;
