-- Part 4: Analytics and Marketing Setup

-- 1. Campaign Attribution Table
CREATE TABLE IF NOT EXISTS public.campaign_attribution (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  utm_source text,
  utm_medium text,
  utm_campaign text,
  utm_content text,
  utm_term text,
  landing_page text,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.campaign_attribution ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can insert own attribution" 
  ON public.campaign_attribution FOR INSERT 
  WITH CHECK ( auth.uid() = user_id );

CREATE POLICY "Users can view own attribution" 
  ON public.campaign_attribution FOR SELECT 
  USING ( auth.uid() = user_id );

-- 2. Marketing Subscribers Table
CREATE TABLE IF NOT EXISTS public.marketing_subscribers (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  email text NOT NULL,
  mailchimp_status text,
  mailchimp_member_id text,
  marketing_consent boolean DEFAULT false,
  subscribed_at timestamp with time zone,
  unsubscribed_at timestamp with time zone,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE(user_id),
  UNIQUE(email)
);

ALTER TABLE public.marketing_subscribers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can insert own subscription" 
  ON public.marketing_subscribers FOR INSERT 
  WITH CHECK ( auth.uid() = user_id );

CREATE POLICY "Users can view own subscription" 
  ON public.marketing_subscribers FOR SELECT 
  USING ( auth.uid() = user_id );

CREATE POLICY "Users can update own subscription" 
  ON public.marketing_subscribers FOR UPDATE 
  USING ( auth.uid() = user_id );

-- 3. Atomic RPC for generating plan and consuming trial
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
  -- Lock the row for update
  SELECT trials_remaining INTO v_current_remaining 
  FROM public.profiles 
  WHERE id = p_user_id 
  FOR UPDATE;

  IF v_current_remaining > 0 THEN
    -- 1. Decrement Trial
    UPDATE public.profiles
    SET 
      trials_remaining = trials_remaining - 1,
      trials_used = trials_used + 1,
      updated_at = now()
    WHERE id = p_user_id;
    
    -- 2. Insert Study Plan
    INSERT INTO public.study_plans (
      user_id,
      questionnaire_id,
      title,
      goal,
      duration_value,
      duration_unit,
      plan_data,
      status,
      model_name
    ) VALUES (
      p_user_id,
      p_questionnaire_id,
      p_title,
      p_goal,
      p_duration_value,
      p_duration_unit,
      p_plan_data,
      'completed',
      p_model_name
    ) RETURNING id INTO v_plan_id;
    
    -- Build success response
    v_result := jsonb_build_object(
      'success', true,
      'plan_id', v_plan_id
    );
    RETURN v_result;
  ELSE
    v_result := jsonb_build_object(
      'success', false,
      'message', 'NO_TRIALS_REMAINING'
    );
    RETURN v_result;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. Subscription Interests Table
CREATE TABLE IF NOT EXISTS public.subscription_interests (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  email text NOT NULL,
  plan_name text NOT NULL,
  status text NOT NULL DEFAULT 'interested',
  message text,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE(user_id)
);

ALTER TABLE public.subscription_interests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can insert own subscription interest" 
  ON public.subscription_interests FOR INSERT 
  WITH CHECK ( auth.uid() = user_id );

CREATE POLICY "Users can view own subscription interest" 
  ON public.subscription_interests FOR SELECT 
  USING ( auth.uid() = user_id );

CREATE POLICY "Users can update own subscription interest" 
  ON public.subscription_interests FOR UPDATE 
  USING ( auth.uid() = user_id );

