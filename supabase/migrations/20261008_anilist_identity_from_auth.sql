-- Copy verified AniList identity from auth.users onto a new profile.
-- Run after 20261008_profiles_quests.sql. Safe to run if that file was already applied.

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
