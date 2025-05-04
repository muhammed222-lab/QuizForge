-- Create students table for storing student information
CREATE TABLE IF NOT EXISTS students (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  matric_number VARCHAR(50) UNIQUE NOT NULL,
  name TEXT NOT NULL,
  class_id UUID REFERENCES classes(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_students_matric_number ON students(matric_number);
CREATE INDEX IF NOT EXISTS idx_students_class_id ON students(class_id);

-- Set up Row Level Security
ALTER TABLE students ENABLE ROW LEVEL SECURITY;

-- Create policies
-- Teachers can read all students
CREATE POLICY "Teachers can read all students"
  ON students FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = auth.uid()
      AND auth.users.user_metadata->>'role' = 'teacher'
    )
  );

-- Teachers can insert students
CREATE POLICY "Teachers can insert students"
  ON students FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = auth.uid()
      AND auth.users.user_metadata->>'role' = 'teacher'
    )
  );

-- Teachers can update students
CREATE POLICY "Teachers can update students"
  ON students FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = auth.uid()
      AND auth.users.user_metadata->>'role' = 'teacher'
    )
  );

-- Teachers can delete students
CREATE POLICY "Teachers can delete students"
  ON students FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = auth.uid()
      AND auth.users.user_metadata->>'role' = 'teacher'
    )
  );

-- Function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to call the function before update
CREATE TRIGGER update_students_updated_at
BEFORE UPDATE ON students
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();
