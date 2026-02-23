-- Allow Patients to INSERT their own reports
CREATE POLICY "Patients can select their own reports"
ON clinical_reports
FOR SELECT
TO authenticated
USING (auth.uid() = patient_id);

CREATE POLICY "Patients can insert their own reports"
ON clinical_reports
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = patient_id);

-- Also enable UPDATE just in case
CREATE POLICY "Patients can update their own reports"
ON clinical_reports
FOR UPDATE
TO authenticated
USING (auth.uid() = patient_id);
