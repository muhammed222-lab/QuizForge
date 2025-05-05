-- Disable RLS for the teachers table
ALTER TABLE teachers DISABLE ROW LEVEL SECURITY;

-- Insert a teacher record for each user
INSERT INTO teachers (auth_user_id, name, email)
SELECT 
  id, 
  COALESCE(raw_user_meta_data->>'full_name', email), 
  email
FROM auth.users
WHERE NOT EXISTS (
  SELECT 1 FROM teachers WHERE auth_user_id = auth.users.id
);

-- Re-enable RLS for the teachers table
ALTER TABLE teachers ENABLE ROW LEVEL SECURITY;
