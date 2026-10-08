-- DailyArc profiles, quests, check-ins and stats.
-- Run this in the Supabase SQL editor (SQL -> New query) if you are not using the CLI.

CREATE TYPE public.stat AS ENUM (
  'strength',
  'intelligence',
  'discipline',
  'charisma',
  'vitality'
);

CREATE TYPE public.cadence AS ENUM ('daily', 'weekly');

CREATE TABLE public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users (id) ON DELETE CASCADE,
  username text NOT NULL UNIQUE,
  anilist_user_id bigint UNIQUE,
  anilist_username text UNIQUE,
  timezone text NOT NULL DEFAULT 'UTC',
  total_xp integer NOT NULL DEFAULT 0,
  current_streak integer NOT NULL DEFAULT 0,
  longest_streak integer NOT NULL DEFAULT 0,
  last_checkin_date date,
  watcher_type text,
  is_public boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT username_format CHECK (username ~ '^[A-Za-z0-9_]{2,20}$'),
  CONSTRAINT username_not_reserved CHECK (lower(username) NOT IN ('api', 'login', 'u', 'wrapped')),
  CONSTRAINT watcher_type_known CHECK (
    watcher_type IS NULL
    OR watcher_type IN (
      'genre_loyalist',
      'classic_purist',
      'seasonal_sampler',
      'binge_demon',
      'wanderer'
    )
  )
);

CREATE TABLE public.quests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.profiles (id) ON DELETE CASCADE,
  name text NOT NULL,
  stat public.stat NOT NULL,
  xp_value integer NOT NULL,
  cadence public.cadence NOT NULL,
  weekly_streak integer NOT NULL DEFAULT 0,
  active boolean NOT NULL DEFAULT true,
  template_id uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT quest_name_present CHECK (char_length(trim(name)) > 0),
  CONSTRAINT quest_xp_allowed CHECK (xp_value IN (10, 20, 30))
);

CREATE TABLE public.checkins (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  quest_id uuid NOT NULL REFERENCES public.quests (id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES public.profiles (id) ON DELETE CASCADE,
  period_start date NOT NULL,
  base_xp integer NOT NULL,
  xp_awarded integer NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (quest_id, period_start)
);

CREATE TABLE public.stats (
  user_id uuid PRIMARY KEY REFERENCES public.profiles (id) ON DELETE CASCADE,
  strength_xp integer NOT NULL DEFAULT 0,
  intelligence_xp integer NOT NULL DEFAULT 0,
  discipline_xp integer NOT NULL DEFAULT 0,
  charisma_xp integer NOT NULL DEFAULT 0,
  vitality_xp integer NOT NULL DEFAULT 0
);

CREATE OR REPLACE FUNCTION public.level_from_xp(total integer)
RETURNS integer
LANGUAGE plpgsql
IMMUTABLE
AS $$
DECLARE
  lvl integer := 1;
  remaining integer := GREATEST(COALESCE(total, 0), 0);
  need integer;
BEGIN
  WHILE lvl < 50 LOOP
    need := ROUND(12 * POWER(lvl::numeric, 1.5));
    EXIT WHEN remaining < need;
    remaining := remaining - need;
    lvl := lvl + 1;
  END LOOP;
  RETURN lvl;
END;
$$;

CREATE OR REPLACE FUNCTION public.rank_for_level(lvl integer)
RETURNS text
LANGUAGE sql
IMMUTABLE
AS $$
  SELECT CASE
    WHEN lvl >= 50 THEN 'S'
    WHEN lvl >= 40 THEN 'A'
    WHEN lvl >= 30 THEN 'B'
    WHEN lvl >= 20 THEN 'C'
    WHEN lvl >= 10 THEN 'D'
    ELSE 'E'
  END;
$$;

CREATE OR REPLACE FUNCTION public.local_checkin_date(tz text, at timestamptz)
RETURNS date
LANGUAGE plpgsql
STABLE
AS $$
DECLARE
  local_ts timestamp;
BEGIN
  local_ts := at AT TIME ZONE tz;
  IF EXTRACT(HOUR FROM local_ts) < 3 THEN
    RETURN local_ts::date - 1;
  END IF;
  RETURN local_ts::date;
END;
$$;

CREATE OR REPLACE FUNCTION public.week_monday(day date)
RETURNS date
LANGUAGE sql
IMMUTABLE
AS $$
  SELECT (date_trunc('week', day::timestamp))::date;
$$;

CREATE OR REPLACE FUNCTION public.init_stats_for_profile()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.stats (user_id) VALUES (NEW.id);
  RETURN NEW;
END;
$$;

CREATE TRIGGER profiles_init_stats
AFTER INSERT ON public.profiles
FOR EACH ROW
EXECUTE FUNCTION public.init_stats_for_profile();

CREATE OR REPLACE FUNCTION public.protect_profile_progress()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    NEW.total_xp := 0;
    NEW.current_streak := 0;
    NEW.longest_streak := 0;
    NEW.last_checkin_date := NULL;
    NEW.watcher_type := NULL;
    NEW.anilist_user_id := NULL;
    NEW.anilist_username := NULL;
    SELECT
      CASE
        WHEN (u.raw_app_meta_data->>'anilist_user_id') ~ '^[0-9]+$'
          THEN (u.raw_app_meta_data->>'anilist_user_id')::bigint
        ELSE NULL
      END,
      NULLIF(u.raw_app_meta_data->>'anilist_username', '')
    INTO NEW.anilist_user_id, NEW.anilist_username
    FROM auth.users u
    WHERE u.id = NEW.id;
    RETURN NEW;
  END IF;
  IF current_user NOT IN ('authenticated', 'anon') THEN
    RETURN NEW;
  END IF;
  NEW.id := OLD.id;
  NEW.total_xp := OLD.total_xp;
  NEW.current_streak := OLD.current_streak;
  NEW.longest_streak := OLD.longest_streak;
  NEW.last_checkin_date := OLD.last_checkin_date;
  NEW.watcher_type := OLD.watcher_type;
  NEW.anilist_user_id := OLD.anilist_user_id;
  NEW.anilist_username := OLD.anilist_username;
  NEW.created_at := OLD.created_at;
  RETURN NEW;
END;
$$;

CREATE TRIGGER profiles_protect_progress
BEFORE INSERT OR UPDATE ON public.profiles
FOR EACH ROW
EXECUTE FUNCTION public.protect_profile_progress();

CREATE OR REPLACE FUNCTION public.protect_quest_client_fields()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    NEW.user_id := auth.uid();
    NEW.weekly_streak := 0;
    NEW.template_id := NULL;
    IF NEW.active IS NULL THEN
      NEW.active := true;
    END IF;
    RETURN NEW;
  END IF;
  IF current_user NOT IN ('authenticated', 'anon') THEN
    RETURN NEW;
  END IF;
  NEW.id := OLD.id;
  NEW.user_id := OLD.user_id;
  NEW.weekly_streak := OLD.weekly_streak;
  NEW.template_id := OLD.template_id;
  NEW.created_at := OLD.created_at;
  RETURN NEW;
END;
$$;

CREATE TRIGGER quests_protect_client_fields
BEFORE INSERT OR UPDATE ON public.quests
FOR EACH ROW
EXECUTE FUNCTION public.protect_quest_client_fields();

CREATE OR REPLACE FUNCTION public.enforce_quest_limit()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  IF NEW.active AND (TG_OP = 'INSERT' OR OLD.active IS DISTINCT FROM true) THEN
    IF (
      SELECT count(*) FROM public.quests
      WHERE user_id = NEW.user_id AND active
    ) >= 8 THEN
      RAISE EXCEPTION 'quest limit' USING ERRCODE = 'P0001';
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER quests_limit_active
BEFORE INSERT OR UPDATE ON public.quests
FOR EACH ROW
EXECUTE FUNCTION public.enforce_quest_limit();

CREATE OR REPLACE FUNCTION public.check_in(p_quest_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  uid uuid := auth.uid();
  q public.quests%ROWTYPE;
  p public.profiles%ROWTYPE;
  local_day date;
  period date;
  today_base integer;
  awarded_base integer;
  awarded integer;
  multiplier numeric := 1;
  existing public.checkins%ROWTYPE;
  xp_col text;
BEGIN
  IF uid IS NULL THEN
    RAISE EXCEPTION 'not authenticated' USING ERRCODE = '42501';
  END IF;

  SELECT * INTO q FROM public.quests WHERE id = p_quest_id AND user_id = uid AND active;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'quest not found' USING ERRCODE = 'P0002';
  END IF;

  SELECT * INTO p FROM public.profiles WHERE id = uid;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'profile not found' USING ERRCODE = 'P0002';
  END IF;

  local_day := public.local_checkin_date(p.timezone, now());
  IF q.cadence = 'daily' THEN
    period := local_day;
  ELSE
    period := public.week_monday(local_day);
  END IF;

  SELECT * INTO existing FROM public.checkins WHERE quest_id = p_quest_id AND period_start = period;
  IF FOUND THEN
    RETURN jsonb_build_object(
      'duplicate', true,
      'xp_awarded', 0,
      'level', public.level_from_xp(p.total_xp),
      'rank', public.rank_for_level(public.level_from_xp(p.total_xp)),
      'streak', p.current_streak
    );
  END IF;

  SELECT COALESCE(sum(c.base_xp), 0) INTO today_base
  FROM public.checkins c
  WHERE c.user_id = uid
    AND public.local_checkin_date(p.timezone, c.created_at) = local_day;

  awarded_base := GREATEST(LEAST(q.xp_value, 150 - today_base), 0);

  IF q.cadence = 'daily' THEN
    IF p.last_checkin_date = local_day THEN
      NULL;
    ELSIF p.last_checkin_date = local_day - 1 THEN
      p.current_streak := p.current_streak + 1;
    ELSE
      p.current_streak := 1;
    END IF;
    IF p.current_streak > p.longest_streak THEN
      p.longest_streak := p.current_streak;
    END IF;
    p.last_checkin_date := local_day;
    IF p.current_streak >= 30 THEN
      multiplier := 1.25;
    ELSIF p.current_streak >= 7 THEN
      multiplier := 1.1;
    END IF;
  END IF;

  awarded := ROUND(awarded_base * multiplier);
  p.total_xp := p.total_xp + awarded;

  INSERT INTO public.checkins (quest_id, user_id, period_start, base_xp, xp_awarded)
  VALUES (p_quest_id, uid, period, awarded_base, awarded);

  UPDATE public.profiles
  SET
    total_xp = p.total_xp,
    current_streak = p.current_streak,
    longest_streak = p.longest_streak,
    last_checkin_date = p.last_checkin_date
  WHERE id = uid;

  xp_col := q.stat::text || '_xp';
  EXECUTE format(
    'UPDATE public.stats SET %I = %I + $1 WHERE user_id = $2',
    xp_col,
    xp_col
  ) USING awarded, uid;

  IF q.cadence = 'weekly' THEN
    UPDATE public.quests SET weekly_streak = weekly_streak + 1 WHERE id = p_quest_id;
  END IF;

  RETURN jsonb_build_object(
    'duplicate', false,
    'xp_awarded', awarded,
    'level', public.level_from_xp(p.total_xp),
    'rank', public.rank_for_level(public.level_from_xp(p.total_xp)),
    'streak', p.current_streak
  );
END;
$$;

CREATE VIEW public.public_profiles AS
SELECT
  username,
  anilist_username,
  public.level_from_xp(total_xp) AS level,
  public.rank_for_level(public.level_from_xp(total_xp)) AS rank,
  watcher_type
FROM public.profiles
WHERE is_public;

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.checkins ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stats ENABLE ROW LEVEL SECURITY;

CREATE POLICY profiles_select_own ON public.profiles
  FOR SELECT TO authenticated USING (id = auth.uid());
CREATE POLICY profiles_insert_own ON public.profiles
  FOR INSERT TO authenticated WITH CHECK (id = auth.uid());
CREATE POLICY profiles_update_own ON public.profiles
  FOR UPDATE TO authenticated USING (id = auth.uid()) WITH CHECK (id = auth.uid());

CREATE POLICY quests_select_own ON public.quests
  FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY quests_insert_own ON public.quests
  FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
CREATE POLICY quests_update_own ON public.quests
  FOR UPDATE TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

CREATE POLICY checkins_select_own ON public.checkins
  FOR SELECT TO authenticated USING (user_id = auth.uid());

CREATE POLICY stats_select_own ON public.stats
  FOR SELECT TO authenticated USING (user_id = auth.uid());

GRANT SELECT, INSERT, UPDATE ON public.profiles TO authenticated;
GRANT SELECT, INSERT, UPDATE ON public.quests TO authenticated;
GRANT SELECT ON public.checkins TO authenticated;
GRANT SELECT ON public.stats TO authenticated;
GRANT SELECT ON public.public_profiles TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.check_in(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.level_from_xp(integer) TO authenticated, anon;
GRANT EXECUTE ON FUNCTION public.rank_for_level(integer) TO authenticated, anon;
