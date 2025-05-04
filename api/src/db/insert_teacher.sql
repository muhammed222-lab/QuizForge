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
