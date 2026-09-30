-- ============================================================
-- StudySync AI - FINAL COMPREHENSIVE FIX
-- Aligns the live DB with the actual backend code expectations
-- ============================================================

-- 1. Make `schedule` nullable (the old NOT NULL column that's blocking inserts)
ALTER TABLE public.study_plans ALTER COLUMN schedule DROP NOT NULL;

-- 2. The backend uses `plan_data` - make it the primary storage column
--    Copy any existing schedule data into plan_data for consistency
UPDATE public.study_plans 
  SET plan_data = schedule 
  WHERE plan_data IS NULL AND schedule IS NOT NULL;

-- 3. Drop all remaining problematic check constraints
ALTER TABLE public.questionnaire_responses 
  DROP CONSTRAINT IF EXISTS questionnaire_responses_knowledge_level_check,
  DROP CONSTRAINT IF EXISTS questionnaire_responses_duration_unit_check,
  DROP CONSTRAINT IF EXISTS questionnaire_responses_goal_check;

-- 4. Make questionnaire_responses fields that backend may not send nullable
DO $$
BEGIN
  -- These may or may not exist as NOT NULL depending on DB version
  BEGIN ALTER TABLE public.questionnaire_responses ALTER COLUMN knowledge_level DROP NOT NULL; EXCEPTION WHEN others THEN NULL; END;
  BEGIN ALTER TABLE public.questionnaire_responses ALTER COLUMN duration_value DROP NOT NULL; EXCEPTION WHEN others THEN NULL; END;
  BEGIN ALTER TABLE public.questionnaire_responses ALTER COLUMN duration_unit DROP NOT NULL; EXCEPTION WHEN others THEN NULL; END;
  BEGIN ALTER TABLE public.questionnaire_responses ALTER COLUMN daily_study_hours DROP NOT NULL; EXCEPTION WHEN others THEN NULL; END;
  BEGIN ALTER TABLE public.questionnaire_responses ALTER COLUMN preferred_study_times DROP NOT NULL; EXCEPTION WHEN others THEN NULL; END;
  BEGIN ALTER TABLE public.questionnaire_responses ALTER COLUMN available_days DROP NOT NULL; EXCEPTION WHEN others THEN NULL; END;
  BEGIN ALTER TABLE public.questionnaire_responses ALTER COLUMN learning_preferences DROP NOT NULL; EXCEPTION WHEN others THEN NULL; END;
END $$;

-- 5. Re-create the atomic RPC using the correct column (plan_data)
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
BEGIN
  -- Ensure profile exists
  INSERT INTO public.profiles (id, trials_remaining, total_free_trials, trials_used, subscription_status)
  VALUES (p_user_id, 3, 3, 0, 'free')
  ON CONFLICT (id) DO NOTHING;

  -- Lock the row
  SELECT trials_remaining INTO v_current_remaining
  FROM public.profiles
  WHERE id = p_user_id
  FOR UPDATE;

  IF v_current_remaining IS NULL OR v_current_remaining <= 0 THEN
    RETURN jsonb_build_object('success', false, 'message', 'NO_TRIALS_REMAINING');
  END IF;

  -- Decrement trial
  UPDATE public.profiles
  SET trials_remaining = trials_remaining - 1,
      trials_used = trials_used + 1,
      updated_at = now()
  WHERE id = p_user_id;

  -- Insert study plan using plan_data (schedule column gets the same data to satisfy constraints)
  INSERT INTO public.study_plans (
    user_id, questionnaire_id, title, goal,
    duration_value, duration_unit, plan_data, schedule, status, model_name
  ) VALUES (
    p_user_id, p_questionnaire_id, p_title, p_goal,
    p_duration_value, p_duration_unit, p_plan_data, p_plan_data, 'completed', p_model_name
  ) RETURNING id INTO v_plan_id;

  RETURN jsonb_build_object('success', true, 'plan_id', v_plan_id);

EXCEPTION WHEN OTHERS THEN
  RETURN jsonb_build_object('success', false, 'message', SQLERRM);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

SELECT 'Final comprehensive fix applied successfully!' AS status;
