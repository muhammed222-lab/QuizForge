-- Drop the existing policies for teachers table
DROP POLICY IF EXISTS teachers_insert ON teachers;
DROP POLICY IF EXISTS teachers_select ON teachers;
DROP POLICY IF EXISTS teachers_update ON teachers;
DROP POLICY IF EXISTS teachers_delete ON teachers;

-- Create a policy to allow the service role to insert records
CREATE POLICY "Service role can insert teachers"
  ON teachers FOR INSERT
  WITH CHECK (true);

-- Create a policy to allow teachers to view their own profile
CREATE POLICY "Teachers can view their own profile"
  ON teachers FOR SELECT
  USING (auth_user_id = auth.uid());

-- Create a policy to allow teachers to update their own profile
CREATE POLICY "Teachers can update their own profile"
  ON teachers FOR UPDATE
  USING (auth_user_id = auth.uid());

-- Create a policy to allow teachers to delete their own profile
CREATE POLICY "Teachers can delete their own profile"
  ON teachers FOR DELETE
  USING (auth_user_id = auth.uid());

-- Insert a teacher record for the current user
INSERT INTO teachers (auth_user_id, name, email)
SELECT 
  id, 
  COALESCE(raw_user_meta_data->>'full_name', email), 
  email
FROM auth.users
WHERE id = auth.uid()
AND NOT EXISTS (
  SELECT 1 FROM teachers WHERE auth_user_id = auth.uid()
);
