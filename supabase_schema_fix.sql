-- Comprehensive schema fix: ensures ALL required columns exist on study_plans
-- Safe to run multiple times (uses IF NOT EXISTS pattern)

DO $$
BEGIN
    -- Core columns that must exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='study_plans' AND column_name='plan_data') THEN
        ALTER TABLE public.study_plans ADD COLUMN plan_data jsonb;
        RAISE NOTICE 'Added plan_data column';
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='study_plans' AND column_name='title') THEN
        ALTER TABLE public.study_plans ADD COLUMN title text;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='study_plans' AND column_name='goal') THEN
        ALTER TABLE public.study_plans ADD COLUMN goal text;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='study_plans' AND column_name='duration_value') THEN
        ALTER TABLE public.study_plans ADD COLUMN duration_value integer;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='study_plans' AND column_name='duration_unit') THEN
        ALTER TABLE public.study_plans ADD COLUMN duration_unit text;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='study_plans' AND column_name='model_name') THEN
        ALTER TABLE public.study_plans ADD COLUMN model_name text;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='study_plans' AND column_name='error_message') THEN
        ALTER TABLE public.study_plans ADD COLUMN error_message text;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='study_plans' AND column_name='questionnaire_id') THEN
        ALTER TABLE public.study_plans ADD COLUMN questionnaire_id uuid;
    END IF;
END
$$;

-- Re-create the save_plan_and_consume_trial function (from the fix SQL already applied)
CREATE OR REPLACE FUNCTION public.save_plan_and_consume_trial(
  p_user_id uuid,
  p_questionnaire_id uuid,
  p_title text,
  p_goal text,
  p_duration_value integer,
  p_duration_unit text,
  p_plan_data jsonb,
  p_model_name text
)
RETURNS jsonb AS $$
DECLARE
  v_current_remaining integer;
  v_plan_id uuid;
  v_result jsonb;
BEGIN
  -- Upsert profile to ensure it exists
  INSERT INTO public.profiles (id, trials_remaining, total_free_trials, trials_used, subscription_status)
  VALUES (p_user_id, 3, 3, 0, 'free')
  ON CONFLICT (id) DO NOTHING;

  -- Lock the row for update
  SELECT trials_remaining INTO v_current_remaining
  FROM public.profiles
  WHERE id = p_user_id
  FOR UPDATE;

  IF v_current_remaining IS NULL OR v_current_remaining <= 0 THEN
    RETURN jsonb_build_object('success', false, 'message', 'NO_TRIALS_REMAINING');
  END IF;

  -- Decrement trial
  UPDATE public.profiles
  SET
    trials_remaining = trials_remaining - 1,
    trials_used = trials_used + 1,
    updated_at = now()
  WHERE id = p_user_id;

  -- Insert Study Plan
  INSERT INTO public.study_plans (
    user_id, questionnaire_id, title, goal,
    duration_value, duration_unit, plan_data, status, model_name
  ) VALUES (
    p_user_id, p_questionnaire_id, p_title, p_goal,
    p_duration_value, p_duration_unit, p_plan_data, 'completed', p_model_name
  ) RETURNING id INTO v_plan_id;

  RETURN jsonb_build_object('success', true, 'plan_id', v_plan_id);

EXCEPTION WHEN OTHERS THEN
  RETURN jsonb_build_object('success', false, 'message', SQLERRM);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

SELECT 'Schema fix applied! All columns verified.' AS status;
