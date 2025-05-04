-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Drop existing tables if they exist (in reverse order of dependencies)
DROP TABLE IF EXISTS student_answers CASCADE;
DROP TABLE IF EXISTS exam_attempts CASCADE;
DROP TABLE IF EXISTS questions CASCADE;
DROP TABLE IF EXISTS exams CASCADE;
DROP TABLE IF EXISTS ai_content CASCADE;
DROP TABLE IF EXISTS materials CASCADE;
DROP TABLE IF EXISTS class_students CASCADE;
DROP TABLE IF EXISTS students CASCADE;
DROP TABLE IF EXISTS classes CASCADE;
DROP TABLE IF EXISTS teachers CASCADE;

-- Create teachers table
CREATE TABLE IF NOT EXISTS teachers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  auth_user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  profile_image TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create classes table
CREATE TABLE IF NOT EXISTS classes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  subject TEXT NOT NULL,
  grade_level TEXT NOT NULL,
  teacher_id UUID REFERENCES teachers(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create students table
CREATE TABLE IF NOT EXISTS students (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  matric_number TEXT UNIQUE NOT NULL,
  email TEXT UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create class_students table (many-to-many relationship)
CREATE TABLE IF NOT EXISTS class_students (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  class_id UUID REFERENCES classes(id) ON DELETE CASCADE,
  student_id UUID REFERENCES students(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(class_id, student_id)
);

-- Create materials table
CREATE TABLE IF NOT EXISTS materials (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  class_id UUID REFERENCES classes(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  file_url TEXT NOT NULL,
  file_type TEXT NOT NULL,
  file_size INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create ai_content table
CREATE TABLE IF NOT EXISTS ai_content (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  material_id UUID REFERENCES materials(id) ON DELETE CASCADE,
  content_type TEXT NOT NULL, -- 'summary', 'questions', etc.
  content JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create exams table
CREATE TABLE IF NOT EXISTS exams (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT,
  class_id UUID REFERENCES classes(id) ON DELETE CASCADE,
  material_id UUID REFERENCES materials(id) ON DELETE SET NULL,
  scheduled_date TIMESTAMP WITH TIME ZONE,
  duration INTEGER, -- in minutes
  status TEXT DEFAULT 'draft', -- draft, published, archived
  access_code TEXT,
  published_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create questions table
CREATE TABLE IF NOT EXISTS questions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  exam_id UUID REFERENCES exams(id) ON DELETE CASCADE,
  question_text TEXT NOT NULL,
  question_type TEXT NOT NULL, -- multiple_choice, true_false, short_answer, essay
  options JSONB, -- array of options for multiple choice
  correct_answer TEXT, -- index for multiple choice, text for short answer
  points INTEGER DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create exam_attempts table
CREATE TABLE IF NOT EXISTS exam_attempts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  exam_id UUID REFERENCES exams(id) ON DELETE CASCADE,
  student_id UUID REFERENCES students(id) ON DELETE CASCADE,
  score INTEGER,
  max_score INTEGER,
  started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(exam_id, student_id)
);

-- Create student_answers table
CREATE TABLE IF NOT EXISTS student_answers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  attempt_id UUID REFERENCES exam_attempts(id) ON DELETE CASCADE,
  question_id UUID REFERENCES questions(id) ON DELETE CASCADE,
  answer TEXT,
  is_correct BOOLEAN,
  points_earned INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers to update updated_at timestamp
DROP TRIGGER IF EXISTS update_teachers_updated_at ON teachers;
CREATE TRIGGER update_teachers_updated_at
BEFORE UPDATE ON teachers
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_classes_updated_at ON classes;
CREATE TRIGGER update_classes_updated_at
BEFORE UPDATE ON classes
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_students_updated_at ON students;
CREATE TRIGGER update_students_updated_at
BEFORE UPDATE ON students
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_materials_updated_at ON materials;
CREATE TRIGGER update_materials_updated_at
BEFORE UPDATE ON materials
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_ai_content_updated_at ON ai_content;
CREATE TRIGGER update_ai_content_updated_at
BEFORE UPDATE ON ai_content
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_exams_updated_at ON exams;
CREATE TRIGGER update_exams_updated_at
BEFORE UPDATE ON exams
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_questions_updated_at ON questions;
CREATE TRIGGER update_questions_updated_at
BEFORE UPDATE ON questions
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Insert a test teacher record for the current user
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

-- Enable Row Level Security
ALTER TABLE teachers ENABLE ROW LEVEL SECURITY;
ALTER TABLE classes ENABLE ROW LEVEL SECURITY;
ALTER TABLE students ENABLE ROW LEVEL SECURITY;
ALTER TABLE class_students ENABLE ROW LEVEL SECURITY;
ALTER TABLE materials ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_content ENABLE ROW LEVEL SECURITY;
ALTER TABLE exams ENABLE ROW LEVEL SECURITY;
ALTER TABLE questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE exam_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE student_answers ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for teachers
DROP POLICY IF EXISTS teachers_select ON teachers;
CREATE POLICY teachers_select ON teachers
  FOR SELECT USING (auth_user_id = auth.uid());

DROP POLICY IF EXISTS teachers_insert ON teachers;
CREATE POLICY teachers_insert ON teachers
  FOR INSERT WITH CHECK (auth_user_id = auth.uid());

DROP POLICY IF EXISTS teachers_update ON teachers;
CREATE POLICY teachers_update ON teachers
  FOR UPDATE USING (auth_user_id = auth.uid());

DROP POLICY IF EXISTS teachers_delete ON teachers;
CREATE POLICY teachers_delete ON teachers
  FOR DELETE USING (auth_user_id = auth.uid());

-- Create RLS policies for classes
DROP POLICY IF EXISTS classes_select ON classes;
CREATE POLICY classes_select ON classes
  FOR SELECT USING (
    teacher_id IN (
      SELECT id FROM teachers WHERE auth_user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS classes_insert ON classes;
CREATE POLICY classes_insert ON classes
  FOR INSERT WITH CHECK (
    teacher_id IN (
      SELECT id FROM teachers WHERE auth_user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS classes_update ON classes;
CREATE POLICY classes_update ON classes
  FOR UPDATE USING (
    teacher_id IN (
      SELECT id FROM teachers WHERE auth_user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS classes_delete ON classes;
CREATE POLICY classes_delete ON classes
  FOR DELETE USING (
    teacher_id IN (
      SELECT id FROM teachers WHERE auth_user_id = auth.uid()
    )
  );

-- Create RLS policies for students
DROP POLICY IF EXISTS students_select ON students;
CREATE POLICY students_select ON students
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM teachers WHERE auth_user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS students_insert ON students;
CREATE POLICY students_insert ON students
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM teachers WHERE auth_user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS students_update ON students;
CREATE POLICY students_update ON students
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM teachers WHERE auth_user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS students_delete ON students;
CREATE POLICY students_delete ON students
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM teachers WHERE auth_user_id = auth.uid()
    )
  );

-- Create RLS policies for class_students
DROP POLICY IF EXISTS class_students_select ON class_students;
CREATE POLICY class_students_select ON class_students
  FOR SELECT USING (
    class_id IN (
      SELECT id FROM classes WHERE teacher_id IN (
        SELECT id FROM teachers WHERE auth_user_id = auth.uid()
      )
    )
  );

DROP POLICY IF EXISTS class_students_insert ON class_students;
CREATE POLICY class_students_insert ON class_students
  FOR INSERT WITH CHECK (
    class_id IN (
      SELECT id FROM classes WHERE teacher_id IN (
        SELECT id FROM teachers WHERE auth_user_id = auth.uid()
      )
    )
  );

DROP POLICY IF EXISTS class_students_delete ON class_students;
CREATE POLICY class_students_delete ON class_students
  FOR DELETE USING (
    class_id IN (
      SELECT id FROM classes WHERE teacher_id IN (
        SELECT id FROM teachers WHERE auth_user_id = auth.uid()
      )
    )
  );

-- Create RLS policies for materials
DROP POLICY IF EXISTS materials_select ON materials;
CREATE POLICY materials_select ON materials
  FOR SELECT USING (
    class_id IN (
      SELECT id FROM classes WHERE teacher_id IN (
        SELECT id FROM teachers WHERE auth_user_id = auth.uid()
      )
    )
  );

DROP POLICY IF EXISTS materials_insert ON materials;
CREATE POLICY materials_insert ON materials
  FOR INSERT WITH CHECK (
    class_id IN (
      SELECT id FROM classes WHERE teacher_id IN (
        SELECT id FROM teachers WHERE auth_user_id = auth.uid()
      )
    )
  );

DROP POLICY IF EXISTS materials_update ON materials;
CREATE POLICY materials_update ON materials
  FOR UPDATE USING (
    class_id IN (
      SELECT id FROM classes WHERE teacher_id IN (
        SELECT id FROM teachers WHERE auth_user_id = auth.uid()
      )
    )
  );

DROP POLICY IF EXISTS materials_delete ON materials;
CREATE POLICY materials_delete ON materials
  FOR DELETE USING (
    class_id IN (
      SELECT id FROM classes WHERE teacher_id IN (
        SELECT id FROM teachers WHERE auth_user_id = auth.uid()
      )
    )
  );

-- Create RLS policies for exams
DROP POLICY IF EXISTS exams_select ON exams;
CREATE POLICY exams_select ON exams
  FOR SELECT USING (
    class_id IN (
      SELECT id FROM classes WHERE teacher_id IN (
        SELECT id FROM teachers WHERE auth_user_id = auth.uid()
      )
    )
  );

DROP POLICY IF EXISTS exams_insert ON exams;
CREATE POLICY exams_insert ON exams
  FOR INSERT WITH CHECK (
    class_id IN (
      SELECT id FROM classes WHERE teacher_id IN (
        SELECT id FROM teachers WHERE auth_user_id = auth.uid()
      )
    )
  );

DROP POLICY IF EXISTS exams_update ON exams;
CREATE POLICY exams_update ON exams
  FOR UPDATE USING (
    class_id IN (
      SELECT id FROM classes WHERE teacher_id IN (
        SELECT id FROM teachers WHERE auth_user_id = auth.uid()
      )
    )
  );

DROP POLICY IF EXISTS exams_delete ON exams;
CREATE POLICY exams_delete ON exams
  FOR DELETE USING (
    class_id IN (
      SELECT id FROM classes WHERE teacher_id IN (
        SELECT id FROM teachers WHERE auth_user_id = auth.uid()
      )
    )
  );

-- Create RLS policies for questions
DROP POLICY IF EXISTS questions_select ON questions;
CREATE POLICY questions_select ON questions
  FOR SELECT USING (
    exam_id IN (
      SELECT id FROM exams WHERE class_id IN (
        SELECT id FROM classes WHERE teacher_id IN (
          SELECT id FROM teachers WHERE auth_user_id = auth.uid()
        )
      )
    )
  );

DROP POLICY IF EXISTS questions_insert ON questions;
CREATE POLICY questions_insert ON questions
  FOR INSERT WITH CHECK (
    exam_id IN (
      SELECT id FROM exams WHERE class_id IN (
        SELECT id FROM classes WHERE teacher_id IN (
          SELECT id FROM teachers WHERE auth_user_id = auth.uid()
        )
      )
    )
  );

DROP POLICY IF EXISTS questions_update ON questions;
CREATE POLICY questions_update ON questions
  FOR UPDATE USING (
    exam_id IN (
      SELECT id FROM exams WHERE class_id IN (
        SELECT id FROM classes WHERE teacher_id IN (
          SELECT id FROM teachers WHERE auth_user_id = auth.uid()
        )
      )
    )
  );

DROP POLICY IF EXISTS questions_delete ON questions;
CREATE POLICY questions_delete ON questions
  FOR DELETE USING (
    exam_id IN (
      SELECT id FROM exams WHERE class_id IN (
        SELECT id FROM classes WHERE teacher_id IN (
          SELECT id FROM teachers WHERE auth_user_id = auth.uid()
        )
      )
    )
  );

-- Create RLS policies for exam_attempts
DROP POLICY IF EXISTS exam_attempts_select ON exam_attempts;
CREATE POLICY exam_attempts_select ON exam_attempts
  FOR SELECT USING (
    exam_id IN (
      SELECT id FROM exams WHERE class_id IN (
        SELECT id FROM classes WHERE teacher_id IN (
          SELECT id FROM teachers WHERE auth_user_id = auth.uid()
        )
      )
    )
  );

-- Create RLS policies for student_answers
DROP POLICY IF EXISTS student_answers_select ON student_answers;
CREATE POLICY student_answers_select ON student_answers
  FOR SELECT USING (
    attempt_id IN (
      SELECT id FROM exam_attempts WHERE exam_id IN (
        SELECT id FROM exams WHERE class_id IN (
          SELECT id FROM classes WHERE teacher_id IN (
            SELECT id FROM teachers WHERE auth_user_id = auth.uid()
          )
        )
      )
    )
  );
