-- Part 3: Study Plans Update, Feedback, and Trial Consumption RPC

-- 1. Atomic Trial Consumption RPC
CREATE OR REPLACE FUNCTION public.use_free_trial(user_uuid uuid)
RETURNS boolean AS $$
DECLARE
  current_remaining integer;
BEGIN
  -- Lock the row for update to prevent concurrent modifications
  SELECT trials_remaining INTO current_remaining 
  FROM public.profiles 
  WHERE id = user_uuid 
  FOR UPDATE;

  IF current_remaining > 0 THEN
    UPDATE public.profiles
    SET 
      trials_remaining = trials_remaining - 1,
      trials_used = trials_used + 1,
      updated_at = now()
    WHERE id = user_uuid;
    RETURN true;
  ELSE
    RETURN false;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Alter study_plans to add new columns if they don't exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='study_plans' AND column_name='title') THEN
        ALTER TABLE public.study_plans ADD COLUMN title text;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='study_plans' AND column_name='goal') THEN
        ALTER TABLE public.study_plans ADD COLUMN goal text;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='study_plans' AND column_name='duration_value') THEN
        ALTER TABLE public.study_plans ADD COLUMN duration_value integer;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='study_plans' AND column_name='duration_unit') THEN
        ALTER TABLE public.study_plans ADD COLUMN duration_unit text;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='study_plans' AND column_name='model_name') THEN
        ALTER TABLE public.study_plans ADD COLUMN model_name text;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='study_plans' AND column_name='error_message') THEN
        ALTER TABLE public.study_plans ADD COLUMN error_message text;
    END IF;
END
$$;

-- 3. Create Feedback Table
CREATE TABLE IF NOT EXISTS public.feedback (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  study_plan_id uuid REFERENCES public.study_plans(id) ON DELETE CASCADE NOT NULL,
  rating integer NOT NULL CHECK (rating >= 1 AND rating <= 5),
  was_useful boolean NOT NULL,
  difficulty_appropriate boolean NOT NULL,
  time_allocation_realistic boolean NOT NULL,
  comments text,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE(user_id, study_plan_id)
);

ALTER TABLE public.feedback ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can insert own feedback" 
  ON public.feedback FOR INSERT 
  WITH CHECK ( auth.uid() = user_id );

CREATE POLICY "Users can view own feedback" 
  ON public.feedback FOR SELECT 
  USING ( auth.uid() = user_id );
