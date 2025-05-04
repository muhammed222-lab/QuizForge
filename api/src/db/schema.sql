-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  avatar_url TEXT,
  matric_number TEXT UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create classes table
CREATE TABLE IF NOT EXISTS classes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  subject TEXT,
  grade_level TEXT,
  teacher_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create class_students table (many-to-many relationship)
CREATE TABLE IF NOT EXISTS class_students (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  class_id UUID REFERENCES classes(id) ON DELETE CASCADE,
  student_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(class_id, student_id)
);

-- Create materials table
CREATE TABLE IF NOT EXISTS materials (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  class_id UUID REFERENCES classes(id) ON DELETE CASCADE,
  teacher_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  file_url TEXT NOT NULL,
  file_type TEXT NOT NULL,
  file_size INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create exams table
CREATE TABLE IF NOT EXISTS exams (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT,
  class_id UUID REFERENCES classes(id) ON DELETE CASCADE,
  teacher_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
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

-- Create exam_submissions table
CREATE TABLE IF NOT EXISTS exam_submissions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  exam_id UUID REFERENCES exams(id) ON DELETE CASCADE,
  student_name TEXT NOT NULL,
  matric_number TEXT NOT NULL,
  score INTEGER,
  max_score INTEGER,
  started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create submission_answers table
CREATE TABLE IF NOT EXISTS submission_answers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  submission_id UUID REFERENCES exam_submissions(id) ON DELETE CASCADE,
  question_id UUID REFERENCES questions(id) ON DELETE CASCADE,
  answer TEXT,
  is_correct BOOLEAN,
  points_earned INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create RLS policies

-- Profiles: Users can only read/update their own profiles
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = user_id);

-- Classes: Teachers can CRUD their own classes, students can read classes they're in
ALTER TABLE classes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Teachers can view their own classes"
  ON classes FOR SELECT
  USING (auth.uid() = teacher_id);

CREATE POLICY "Teachers can create classes"
  ON classes FOR INSERT
  WITH CHECK (auth.uid() = teacher_id);

CREATE POLICY "Teachers can update their own classes"
  ON classes FOR UPDATE
  USING (auth.uid() = teacher_id);

CREATE POLICY "Teachers can delete their own classes"
  ON classes FOR DELETE
  USING (auth.uid() = teacher_id);

-- Class Students: Teachers can manage students in their classes
ALTER TABLE class_students ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Teachers can view students in their classes"
  ON class_students FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM classes
    WHERE classes.id = class_students.class_id
    AND classes.teacher_id = auth.uid()
  ));

CREATE POLICY "Teachers can add students to their classes"
  ON class_students FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM classes
    WHERE classes.id = class_students.class_id
    AND classes.teacher_id = auth.uid()
  ));

CREATE POLICY "Teachers can remove students from their classes"
  ON class_students FOR DELETE
  USING (EXISTS (
    SELECT 1 FROM classes
    WHERE classes.id = class_students.class_id
    AND classes.teacher_id = auth.uid()
  ));

-- Materials: Teachers can CRUD their own materials
ALTER TABLE materials ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Teachers can view their own materials"
  ON materials FOR SELECT
  USING (auth.uid() = teacher_id);

CREATE POLICY "Teachers can create materials"
  ON materials FOR INSERT
  WITH CHECK (auth.uid() = teacher_id);

CREATE POLICY "Teachers can update their own materials"
  ON materials FOR UPDATE
  USING (auth.uid() = teacher_id);

CREATE POLICY "Teachers can delete their own materials"
  ON materials FOR DELETE
  USING (auth.uid() = teacher_id);

-- Exams: Teachers can CRUD their own exams
ALTER TABLE exams ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Teachers can view their own exams"
  ON exams FOR SELECT
  USING (auth.uid() = teacher_id);

CREATE POLICY "Teachers can create exams"
  ON exams FOR INSERT
  WITH CHECK (auth.uid() = teacher_id);

CREATE POLICY "Teachers can update their own exams"
  ON exams FOR UPDATE
  USING (auth.uid() = teacher_id);

CREATE POLICY "Teachers can delete their own exams"
  ON exams FOR DELETE
  USING (auth.uid() = teacher_id);

-- Questions: Teachers can CRUD questions for their own exams
ALTER TABLE questions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Teachers can view questions for their exams"
  ON questions FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM exams
    WHERE exams.id = questions.exam_id
    AND exams.teacher_id = auth.uid()
  ));

CREATE POLICY "Teachers can create questions for their exams"
  ON questions FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM exams
    WHERE exams.id = questions.exam_id
    AND exams.teacher_id = auth.uid()
  ));

CREATE POLICY "Teachers can update questions for their exams"
  ON questions FOR UPDATE
  USING (EXISTS (
    SELECT 1 FROM exams
    WHERE exams.id = questions.exam_id
    AND exams.teacher_id = auth.uid()
  ));

CREATE POLICY "Teachers can delete questions for their exams"
  ON questions FOR DELETE
  USING (EXISTS (
    SELECT 1 FROM exams
    WHERE exams.id = questions.exam_id
    AND exams.teacher_id = auth.uid()
  ));

-- Exam Submissions: Teachers can view submissions for their exams
ALTER TABLE exam_submissions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Teachers can view submissions for their exams"
  ON exam_submissions FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM exams
    WHERE exams.id = exam_submissions.exam_id
    AND exams.teacher_id = auth.uid()
  ));

-- Submission Answers: Teachers can view answers for submissions to their exams
ALTER TABLE submission_answers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Teachers can view answers for submissions to their exams"
  ON submission_answers FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM exam_submissions
    JOIN exams ON exams.id = exam_submissions.exam_id
    WHERE exam_submissions.id = submission_answers.submission_id
    AND exams.teacher_id = auth.uid()
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
CREATE TRIGGER update_profiles_updated_at
BEFORE UPDATE ON profiles
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_classes_updated_at
BEFORE UPDATE ON classes
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_materials_updated_at
BEFORE UPDATE ON materials
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
