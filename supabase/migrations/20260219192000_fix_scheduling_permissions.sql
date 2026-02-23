-- FIX: Grant permissions for Scheduling V3 RPCs and ensure RLS is correct
-- This fixes the issue where Patients cannot see slots (403/Forbidden or Empty return)

-- 1. Explicitly Grant Execute on RPCs to Authenticated (Patients)
GRANT EXECUTE ON FUNCTION public.get_available_slots_v3(uuid, date, date) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_available_slots_v3(uuid, date, date) TO service_role;
GRANT EXECUTE ON FUNCTION public.get_available_slots_v3(uuid, date, date) TO anon; -- Just in case public view is needed

GRANT EXECUTE ON FUNCTION public.book_appointment_atomic(uuid, uuid, timestamptz, text, text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.book_appointment_atomic(uuid, uuid, timestamptz, text, text) TO service_role;

-- 2. Ensure Professional Availability is Readable by Everyone (Authenticated)
-- The function get_available_slots_v3 is SECURITY DEFINER, so it should work, 
-- but if we query the table directly, we need this:

DROP POLICY IF EXISTS "Public Read Availability" ON public.professional_availability;
CREATE POLICY "Public Read Availability" ON public.professional_availability 
FOR SELECT 
TO authenticated, anon 
USING (true); -- Everyone can read availability rules (they are public info)

-- 3. Reload Schema Cache
NOTIFY pgrst, 'reload schema';
