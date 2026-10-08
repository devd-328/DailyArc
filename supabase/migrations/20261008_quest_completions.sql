-- Proof verdicts for /api/verify-proof.
-- Run after 20261008_profiles_quests.sql.
-- The photo is never stored. Quest text is quests.name. Quest XP is quests.xp_value.
-- Signed-in users can read their own rows. Inserts are service-role only.

CREATE TYPE public.proof_status AS ENUM ('no_proof', 'verified', 'rejected');

CREATE TABLE public.quest_completions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.profiles (id) ON DELETE CASCADE,
  quest_id uuid NOT NULL REFERENCES public.quests (id) ON DELETE CASCADE,
  status public.proof_status NOT NULL,
  xp_awarded integer NOT NULL DEFAULT 0,
  reason text,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT quest_completion_xp_allowed CHECK (xp_awarded IN (0, 10, 20, 30)),
  CONSTRAINT quest_completion_reason_length CHECK (reason IS NULL OR char_length(reason) <= 200)
);

CREATE INDEX quest_completions_user_created
  ON public.quest_completions (user_id, created_at);

ALTER TABLE public.quest_completions ENABLE ROW LEVEL SECURITY;

CREATE POLICY quest_completions_select_own ON public.quest_completions
  FOR SELECT TO authenticated USING (user_id = auth.uid());

GRANT SELECT ON public.quest_completions TO authenticated;
