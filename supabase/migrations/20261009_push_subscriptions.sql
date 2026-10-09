-- Closed-app streak reminders.
-- Run after 20261008_profiles_quests.sql.
-- The cron (service role) inserts send rows and writes subscriptions.
-- Signed-in users can read and delete only their own rows. They cannot insert.

CREATE TABLE public.push_subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.profiles (id) ON DELETE CASCADE,
  endpoint text NOT NULL,
  p256dh text NOT NULL,
  auth text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT push_subscriptions_endpoint_unique UNIQUE (endpoint),
  CONSTRAINT push_subscriptions_endpoint_length CHECK (char_length(endpoint) BETWEEN 1 AND 2048),
  CONSTRAINT push_subscriptions_p256dh_length CHECK (char_length(p256dh) BETWEEN 1 AND 200),
  CONSTRAINT push_subscriptions_auth_length CHECK (char_length(auth) BETWEEN 1 AND 100)
);

CREATE INDEX push_subscriptions_user ON public.push_subscriptions (user_id);

CREATE TABLE public.push_sends (
  user_id uuid NOT NULL REFERENCES public.profiles (id) ON DELETE CASCADE,
  local_day date NOT NULL,
  kind text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, local_day, kind),
  CONSTRAINT push_sends_kind_allowed CHECK (kind = 'streak_at_risk')
);

ALTER TABLE public.push_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.push_sends ENABLE ROW LEVEL SECURITY;

CREATE POLICY push_subscriptions_select_own ON public.push_subscriptions
  FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY push_subscriptions_delete_own ON public.push_subscriptions
  FOR DELETE TO authenticated USING (user_id = auth.uid());

CREATE POLICY push_sends_select_own ON public.push_sends
  FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY push_sends_delete_own ON public.push_sends
  FOR DELETE TO authenticated USING (user_id = auth.uid());

GRANT SELECT, DELETE ON public.push_subscriptions TO authenticated;
GRANT SELECT, DELETE ON public.push_sends TO authenticated;
