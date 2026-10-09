-- Run after 20261009_profile_avatars.sql.
-- Profile column freeze, proof attempt reservation, and check-in writes that must pass the freeze.

-- protect_profile_progress stays SECURITY DEFINER so an insert can read auth.users.
-- current_user inside a definer function is the owner, not the caller, so it cannot
-- tell a signed-in update from a server update. The JWT role can. check_in sets a
-- transaction-local flag before it writes XP, because that call still carries the
-- caller's authenticated role.

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
    NEW.avatar_type := 'preset';
    NEW.avatar_url := '/avatars/avatar-' || lpad((1 + floor(random() * 12))::int::text, 2, '0') || '.svg';
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

  IF current_setting('dailyarc.trusted_profile_write', true) = 'on'
     OR coalesce(auth.role(), '') = 'service_role'
     OR session_user IN ('postgres', 'supabase_admin') THEN
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
  IF NEW.avatar_type = 'preset' THEN
    IF NEW.avatar_url !~ '^/avatars/avatar-(0[1-9]|1[0-2])\.svg$' THEN
      RAISE EXCEPTION 'invalid avatar' USING ERRCODE = '22023';
    END IF;
  ELSIF NEW.avatar_type = 'gallery' THEN
    IF NEW.avatar_url IS DISTINCT FROM (NEW.id::text || '/avatar.jpg') THEN
      RAISE EXCEPTION 'invalid avatar' USING ERRCODE = '22023';
    END IF;
  ELSE
    RAISE EXCEPTION 'invalid avatar' USING ERRCODE = '22023';
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS profiles_protect_progress ON public.profiles;
CREATE TRIGGER profiles_protect_progress
BEFORE INSERT OR UPDATE ON public.profiles
FOR EACH ROW
EXECUTE FUNCTION public.protect_profile_progress();

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

  PERFORM set_config('dailyarc.trusted_profile_write', 'on', true);
  UPDATE public.profiles
  SET
    total_xp = p.total_xp,
    current_streak = p.current_streak,
    longest_streak = p.longest_streak,
    last_checkin_date = p.last_checkin_date
  WHERE id = uid;
  PERFORM set_config('dailyarc.trusted_profile_write', '', true);

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

-- One in-flight proof check per user. The daily cap matches lib/config.ts proof.dailyCap (10).
-- A reservation older than 2 minutes is an aborted call and is released.
-- Groq failures and unclear verdicts delete the reservation on purpose, so they do not consume the cap.

CREATE TABLE public.proof_reservations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.profiles (id) ON DELETE CASCADE,
  quest_id uuid NOT NULL REFERENCES public.quests (id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX proof_reservations_one_inflight
  ON public.proof_reservations (user_id);

ALTER TABLE public.proof_reservations ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.reserve_proof_attempt(p_quest_id uuid)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  uid uuid := auth.uid();
  start_of_day timestamptz := date_trunc('day', now() AT TIME ZONE 'utc') AT TIME ZONE 'utc';
  used integer;
  new_id uuid;
BEGIN
  IF uid IS NULL THEN
    RAISE EXCEPTION 'not authenticated' USING ERRCODE = '42501';
  END IF;

  PERFORM pg_advisory_xact_lock(hashtext('dailyarc-proof'), hashtext(uid::text));

  DELETE FROM public.proof_reservations
  WHERE user_id = uid
    AND created_at < now() - interval '2 minutes';

  IF EXISTS (SELECT 1 FROM public.proof_reservations WHERE user_id = uid) THEN
    RAISE EXCEPTION 'proof in flight' USING ERRCODE = 'P0001';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM public.quests WHERE id = p_quest_id AND user_id = uid AND active
  ) THEN
    RAISE EXCEPTION 'quest not found' USING ERRCODE = 'P0002';
  END IF;

  SELECT count(*) INTO used
  FROM public.quest_completions
  WHERE user_id = uid
    AND created_at >= start_of_day;
  IF used >= 10 THEN
    RAISE EXCEPTION 'daily cap' USING ERRCODE = 'P0001';
  END IF;

  INSERT INTO public.proof_reservations (user_id, quest_id)
  VALUES (uid, p_quest_id)
  RETURNING id INTO new_id;

  RETURN new_id;
END;
$$;

REVOKE ALL ON FUNCTION public.reserve_proof_attempt(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.reserve_proof_attempt(uuid) TO authenticated;
