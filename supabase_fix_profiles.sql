-- Make first_name and last_name nullable in profiles
-- (they may not be available in all profile creation paths)

ALTER TABLE public.profiles
  ALTER COLUMN first_name DROP NOT NULL,
  ALTER COLUMN last_name DROP NOT NULL;

-- Also make email nullable for safety (service role inserts may not have it)
ALTER TABLE public.profiles
  ALTER COLUMN email DROP NOT NULL;

SELECT 'Profile columns made nullable successfully!' AS status;
