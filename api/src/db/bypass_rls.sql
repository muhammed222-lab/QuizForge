-- Create a function to insert a teacher record bypassing RLS
CREATE OR REPLACE FUNCTION insert_teacher_bypass_rls(
  p_auth_user_id UUID,
  p_name TEXT,
  p_email TEXT
) RETURNS UUID AS $$
DECLARE
  v_teacher_id UUID;
BEGIN
  INSERT INTO teachers (auth_user_id, name, email)
  VALUES (p_auth_user_id, p_name, p_email)
  RETURNING id INTO v_teacher_id;
  
  RETURN v_teacher_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
