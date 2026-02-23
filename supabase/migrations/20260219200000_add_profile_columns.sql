-- Migration to add location, phone, and bio columns to public.profiles table
-- This ensures the Profile page can save data correctly.

DO $$
BEGIN
    -- Add location
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'profiles' AND column_name = 'location') THEN
        ALTER TABLE public.profiles ADD COLUMN location text;
    END IF;

    -- Add phone
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'profiles' AND column_name = 'phone') THEN
        ALTER TABLE public.profiles ADD COLUMN phone text;
    END IF;

    -- Add bio
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'profiles' AND column_name = 'bio') THEN
        ALTER TABLE public.profiles ADD COLUMN bio text;
    END IF;

    -- Add updated_at trigger if not exists (optional, keeping it simple for now)
END $$;
