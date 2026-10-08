-- Profile avatars. Run after 20261008_anilist_identity_from_auth.sql.
-- Preset faces live in /public/avatars. A gallery face is one JPEG per user in the avatars bucket.

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS avatar_url text,
  ADD COLUMN IF NOT EXISTS avatar_type text;

UPDATE public.profiles
SET
  avatar_type = 'preset',
  avatar_url = '/avatars/avatar-' || lpad((1 + floor(random() * 12))::int::text, 2, '0') || '.svg'
WHERE avatar_url IS NULL OR avatar_type IS NULL;

ALTER TABLE public.profiles
  ALTER COLUMN avatar_url SET NOT NULL,
  ALTER COLUMN avatar_type SET NOT NULL;

ALTER TABLE public.profiles
  DROP CONSTRAINT IF EXISTS profile_avatar_type,
  DROP CONSTRAINT IF EXISTS profile_avatar_preset,
  DROP CONSTRAINT IF EXISTS profile_avatar_gallery;

ALTER TABLE public.profiles
  ADD CONSTRAINT profile_avatar_type CHECK (avatar_type IN ('preset', 'gallery')),
  ADD CONSTRAINT profile_avatar_preset CHECK (
    avatar_type <> 'preset'
    OR avatar_url ~ '^/avatars/avatar-(0[1-9]|1[0-2])\.svg$'
  ),
  ADD CONSTRAINT profile_avatar_gallery CHECK (
    avatar_type <> 'gallery'
    OR avatar_url = id::text || '/avatar.jpg'
  );

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

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('avatars', 'avatars', true, 5242880, ARRAY['image/jpeg'])
ON CONFLICT (id) DO UPDATE
SET
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

DROP POLICY IF EXISTS avatars_public_read ON storage.objects;
DROP POLICY IF EXISTS avatars_insert_own ON storage.objects;
DROP POLICY IF EXISTS avatars_update_own ON storage.objects;

CREATE POLICY avatars_public_read ON storage.objects
  FOR SELECT TO public
  USING (bucket_id = 'avatars');

CREATE POLICY avatars_insert_own ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (
    bucket_id = 'avatars'
    AND name = auth.uid()::text || '/avatar.jpg'
  );

CREATE POLICY avatars_update_own ON storage.objects
  FOR UPDATE TO authenticated
  USING (
    bucket_id = 'avatars'
    AND name = auth.uid()::text || '/avatar.jpg'
  )
  WITH CHECK (
    bucket_id = 'avatars'
    AND name = auth.uid()::text || '/avatar.jpg'
  );
