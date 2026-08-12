
ALTER TABLE public.activities ADD COLUMN seats_taken INTEGER NOT NULL DEFAULT 0;

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
REVOKE EXECUTE ON FUNCTION public.recount_activity_seats() FROM anon, authenticated, PUBLIC;

CREATE TRIGGER registrations_recount AFTER INSERT OR UPDATE OR DELETE ON public.registrations
FOR EACH ROW EXECUTE FUNCTION public.recount_activity_seats();
