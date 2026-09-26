-- Part 2: Questionnaire and Study Plans Tables

-- 1. Create Questionnaire Responses Table
CREATE TABLE public.questionnaire_responses (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  goal text NOT NULL,
  custom_goal text,
  subjects jsonb NOT NULL,
  priority_subjects jsonb,
  knowledge_level text NOT NULL,
  duration_value integer NOT NULL,
  duration_unit text NOT NULL,
  daily_study_hours numeric NOT NULL,
  preferred_study_times jsonb NOT NULL,
  available_days jsonb NOT NULL,
  learning_preferences jsonb NOT NULL,
  target_date date,
  additional_requirements text,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.questionnaire_responses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own questionnaire responses" 
  ON public.questionnaire_responses FOR SELECT 
  USING ( auth.uid() = user_id );

CREATE POLICY "Users can insert own questionnaire responses" 
  ON public.questionnaire_responses FOR INSERT 
  WITH CHECK ( auth.uid() = user_id );

-- 2. Create Study Plans Table
CREATE TABLE public.study_plans (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  questionnaire_id uuid REFERENCES public.questionnaire_responses(id) ON DELETE CASCADE,
  plan_data jsonb NOT NULL,
  status text DEFAULT 'active',
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.study_plans ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own study plans" 
  ON public.study_plans FOR SELECT 
  USING ( auth.uid() = user_id );

CREATE POLICY "Users can insert own study plans" 
  ON public.study_plans FOR INSERT 
  WITH CHECK ( auth.uid() = user_id );
