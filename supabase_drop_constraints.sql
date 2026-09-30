-- Drop all auto-generated check constraints on questionnaire_responses
-- These are auto-created by Supabase and reject mixed-case values from the frontend

ALTER TABLE public.questionnaire_responses 
  DROP CONSTRAINT IF EXISTS questionnaire_responses_knowledge_level_check,
  DROP CONSTRAINT IF EXISTS questionnaire_responses_duration_unit_check,
  DROP CONSTRAINT IF EXISTS questionnaire_responses_goal_check,
  DROP CONSTRAINT IF EXISTS questionnaire_responses_custom_goal_check,
  DROP CONSTRAINT IF EXISTS questionnaire_responses_subscription_status_check;

-- Also drop any on study_plans that may cause issues
ALTER TABLE public.study_plans
  DROP CONSTRAINT IF EXISTS study_plans_status_check,
  DROP CONSTRAINT IF EXISTS study_plans_duration_unit_check;

-- Also drop any on profiles
ALTER TABLE public.profiles
  DROP CONSTRAINT IF EXISTS profiles_subscription_status_check;

SELECT 'Constraints dropped successfully!' AS status;
