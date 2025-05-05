-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create teachers table
CREATE TABLE IF NOT EXISTS teachers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
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

-- Create RLS policies

-- Teachers: Users can only read/update their own profiles
ALTER TABLE teachers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Teachers can view their own profile"
  ON teachers FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Teachers can update their own profile"
  ON teachers FOR UPDATE
  USING (auth.uid() = user_id);

-- Classes: Teachers can CRUD their own classes
ALTER TABLE classes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Teachers can view their own classes"
  ON classes FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM teachers
    WHERE teachers.id = classes.teacher_id
    AND teachers.user_id = auth.uid()
  ));

CREATE POLICY "Teachers can create classes"
  ON classes FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM teachers
    WHERE teachers.id = classes.teacher_id
    AND teachers.user_id = auth.uid()
  ));

CREATE POLICY "Teachers can update their own classes"
  ON classes FOR UPDATE
  USING (EXISTS (
    SELECT 1 FROM teachers
    WHERE teachers.id = classes.teacher_id
    AND teachers.user_id = auth.uid()
  ));

CREATE POLICY "Teachers can delete their own classes"
  ON classes FOR DELETE
  USING (EXISTS (
    SELECT 1 FROM teachers
    WHERE teachers.id = classes.teacher_id
    AND teachers.user_id = auth.uid()
  ));

-- Students: Teachers can manage students
ALTER TABLE students ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Teachers can view students"
  ON students FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM teachers
    WHERE teachers.user_id = auth.uid()
  ));

CREATE POLICY "Teachers can create students"
  ON students FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM teachers
    WHERE teachers.user_id = auth.uid()
  ));

CREATE POLICY "Teachers can update students"
  ON students FOR UPDATE
  USING (EXISTS (
    SELECT 1 FROM teachers
    WHERE teachers.user_id = auth.uid()
  ));

-- Class Students: Teachers can manage students in their classes
ALTER TABLE class_students ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Teachers can view students in their classes"
  ON class_students FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM classes
    JOIN teachers ON teachers.id = classes.teacher_id
    WHERE classes.id = class_students.class_id
    AND teachers.user_id = auth.uid()
  ));

CREATE POLICY "Teachers can add students to their classes"
  ON class_students FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM classes
    JOIN teachers ON teachers.id = classes.teacher_id
    WHERE classes.id = class_students.class_id
    AND teachers.user_id = auth.uid()
  ));

CREATE POLICY "Teachers can remove students from their classes"
  ON class_students FOR DELETE
  USING (EXISTS (
    SELECT 1 FROM classes
    JOIN teachers ON teachers.id = classes.teacher_id
    WHERE classes.id = class_students.class_id
    AND teachers.user_id = auth.uid()
  ));

-- Materials: Teachers can CRUD their own materials
ALTER TABLE materials ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Teachers can view materials for their classes"
  ON materials FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM classes
    JOIN teachers ON teachers.id = classes.teacher_id
    WHERE classes.id = materials.class_id
    AND teachers.user_id = auth.uid()
  ));

CREATE POLICY "Teachers can create materials for their classes"
  ON materials FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM classes
    JOIN teachers ON teachers.id = classes.teacher_id
    WHERE classes.id = materials.class_id
    AND teachers.user_id = auth.uid()
  ));

CREATE POLICY "Teachers can update materials for their classes"
  ON materials FOR UPDATE
  USING (EXISTS (
    SELECT 1 FROM classes
    JOIN teachers ON teachers.id = classes.teacher_id
    WHERE classes.id = materials.class_id
    AND teachers.user_id = auth.uid()
  ));

CREATE POLICY "Teachers can delete materials for their classes"
  ON materials FOR DELETE
  USING (EXISTS (
    SELECT 1 FROM classes
    JOIN teachers ON teachers.id = classes.teacher_id
    WHERE classes.id = materials.class_id
    AND teachers.user_id = auth.uid()
  ));

-- AI Content: Teachers can CRUD AI content for their materials
ALTER TABLE ai_content ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Teachers can view AI content for their materials"
  ON ai_content FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM materials
    JOIN classes ON classes.id = materials.class_id
    JOIN teachers ON teachers.id = classes.teacher_id
    WHERE materials.id = ai_content.material_id
    AND teachers.user_id = auth.uid()
  ));

-- Exams: Teachers can CRUD their own exams
ALTER TABLE exams ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Teachers can view their own exams"
  ON exams FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM classes
    JOIN teachers ON teachers.id = classes.teacher_id
    WHERE classes.id = exams.class_id
    AND teachers.user_id = auth.uid()
  ));

CREATE POLICY "Teachers can create exams for their classes"
  ON exams FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM classes
    JOIN teachers ON teachers.id = classes.teacher_id
    WHERE classes.id = exams.class_id
    AND teachers.user_id = auth.uid()
  ));

CREATE POLICY "Teachers can update their own exams"
  ON exams FOR UPDATE
  USING (EXISTS (
    SELECT 1 FROM classes
    JOIN teachers ON teachers.id = classes.teacher_id
    WHERE classes.id = exams.class_id
    AND teachers.user_id = auth.uid()
  ));

CREATE POLICY "Teachers can delete their own exams"
  ON exams FOR DELETE
  USING (EXISTS (
    SELECT 1 FROM classes
    JOIN teachers ON teachers.id = classes.teacher_id
    WHERE classes.id = exams.class_id
    AND teachers.user_id = auth.uid()
  ));

-- Questions: Teachers can CRUD questions for their own exams
ALTER TABLE questions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Teachers can view questions for their exams"
  ON questions FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM exams
    JOIN classes ON classes.id = exams.class_id
    JOIN teachers ON teachers.id = classes.teacher_id
    WHERE exams.id = questions.exam_id
    AND teachers.user_id = auth.uid()
  ));

CREATE POLICY "Teachers can create questions for their exams"
  ON questions FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM exams
    JOIN classes ON classes.id = exams.class_id
    JOIN teachers ON teachers.id = classes.teacher_id
    WHERE exams.id = questions.exam_id
    AND teachers.user_id = auth.uid()
  ));

CREATE POLICY "Teachers can update questions for their exams"
  ON questions FOR UPDATE
  USING (EXISTS (
    SELECT 1 FROM exams
    JOIN classes ON classes.id = exams.class_id
    JOIN teachers ON teachers.id = classes.teacher_id
    WHERE exams.id = questions.exam_id
    AND teachers.user_id = auth.uid()
  ));

CREATE POLICY "Teachers can delete questions for their exams"
  ON questions FOR DELETE
  USING (EXISTS (
    SELECT 1 FROM exams
    JOIN classes ON classes.id = exams.class_id
    JOIN teachers ON teachers.id = classes.teacher_id
    WHERE exams.id = questions.exam_id
    AND teachers.user_id = auth.uid()
  ));

-- Exam Attempts: Teachers can view attempts for their exams
ALTER TABLE exam_attempts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Teachers can view attempts for their exams"
  ON exam_attempts FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM exams
    JOIN classes ON classes.id = exams.class_id
    JOIN teachers ON teachers.id = classes.teacher_id
    WHERE exams.id = exam_attempts.exam_id
    AND teachers.user_id = auth.uid()
  ));

-- Student Answers: Teachers can view answers for attempts to their exams
ALTER TABLE student_answers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Teachers can view answers for attempts to their exams"
  ON student_answers FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM exam_attempts
    JOIN exams ON exams.id = exam_attempts.exam_id
    JOIN classes ON classes.id = exams.class_id
    JOIN teachers ON teachers.id = classes.teacher_id
    WHERE exam_attempts.id = student_answers.attempt_id
    AND teachers.user_id = auth.uid()
  ));

-- Create functions and triggers

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers to update updated_at timestamp
CREATE TRIGGER update_teachers_updated_at
BEFORE UPDATE ON teachers
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_classes_updated_at
BEFORE UPDATE ON classes
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_students_updated_at
BEFORE UPDATE ON students
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_materials_updated_at
BEFORE UPDATE ON materials
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_ai_content_updated_at
BEFORE UPDATE ON ai_content
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_exams_updated_at
BEFORE UPDATE ON exams
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_questions_updated_at
BEFORE UPDATE ON questions
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Create a function to automatically create a teacher record when a new user signs up
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO teachers (user_id, name, email)
  VALUES (NEW.id, NEW.raw_user_meta_data->>'full_name', NEW.email);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create a trigger to call the function when a new user is created
CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW
EXECUTE FUNCTION handle_new_user();

-- Create a function to link the teacher_id to the user_id in the classes table
CREATE OR REPLACE FUNCTION link_teacher_to_class()
RETURNS TRIGGER AS $$
BEGIN
  -- Get the teacher_id for the authenticated user
  NEW.teacher_id := (
    SELECT id FROM teachers 
    WHERE user_id = auth.uid()
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create a trigger to call the function when a new class is created
CREATE TRIGGER on_class_created
BEFORE INSERT ON classes
FOR EACH ROW
EXECUTE FUNCTION link_teacher_to_class();
