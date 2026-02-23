-- Enable RLS just in case (usually already on)
ALTER TABLE clinical_reports ENABLE ROW LEVEL SECURITY;

-- Drop existing policy if it exists to avoid conflicts
DROP POLICY IF EXISTS "Patients can view their own reports" ON clinical_reports;

-- Create the specific policy for Patients to SELECT their own reports
CREATE POLICY "Patients can view their own reports"
ON clinical_reports
FOR SELECT
TO authenticated
USING (auth.uid() = patient_id);

-- Also allow Users to UPDATE/INSERT if needed, but for now SELECT is critical
-- Assuming the AI (Service Role) does the insertion, removing need for INSERT policy for users.

-- Verify:
SELECT * FROM clinical_reports WHERE patient_id = auth.uid();
