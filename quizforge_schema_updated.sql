-- QuizForge Database Schema (Updated)
-- This schema includes all tables, relationships, functions, and RLS policies
-- for the QuizForge application with the updated workflow where only teachers need accounts

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Set up storage for file uploads
INSERT INTO storage.buckets (id, name, public) VALUES ('documents', 'documents', false);
INSERT INTO storage.buckets (id, name, public) VALUES ('avatars', 'avatars', true);

-- Create custom types
CREATE TYPE exam_status AS ENUM ('draft', 'published', 'completed');
CREATE TYPE question_type AS ENUM ('multiple_choice', 'true_false', 'short_answer', 'essay');

-- Create tables
-- Teachers table (extends Supabase auth.users)
CREATE TABLE teachers (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  avatar_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Classes table
CREATE TABLE classes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  teacher_id UUID NOT NULL REFERENCES teachers(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Students table (no authentication required)
CREATE TABLE students (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  matric_number TEXT NOT NULL,
  email TEXT,
  class_id UUID REFERENCES classes(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(matric_number)
);

-- Materials table (documents uploaded for classes)
CREATE TABLE materials (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  class_id UUID NOT NULL REFERENCES classes(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  file_path TEXT NOT NULL,
  file_type TEXT NOT NULL,
  file_size INTEGER NOT NULL,
  uploaded_by UUID NOT NULL REFERENCES teachers(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Exams table
CREATE TABLE exams (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT,
  class_id UUID NOT NULL REFERENCES classes(id) ON DELETE CASCADE,
  status exam_status NOT NULL DEFAULT 'draft',
  access_code TEXT,
  question_count INTEGER NOT NULL DEFAULT 0,
  time_limit INTEGER NOT NULL DEFAULT 60, -- in minutes
  deadline TIMESTAMPTZ,
  shuffle_questions BOOLEAN NOT NULL DEFAULT true,
  shuffle_answers BOOLEAN NOT NULL DEFAULT true,
  strict_timing BOOLEAN NOT NULL DEFAULT false,
  published_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Questions table
CREATE TABLE questions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  exam_id UUID NOT NULL REFERENCES exams(id) ON DELETE CASCADE,
  question_text TEXT NOT NULL,
  question_type question_type NOT NULL,
  options JSONB, -- For multiple choice questions
  correct_answer TEXT, -- For multiple choice and true/false questions
  points INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Exam attempts table (for students, no auth required)
CREATE TABLE exam_attempts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  exam_id UUID NOT NULL REFERENCES exams(id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  score INTEGER,
  max_score INTEGER,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Student answers table
CREATE TABLE student_answers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  attempt_id UUID NOT NULL REFERENCES exam_attempts(id) ON DELETE CASCADE,
  question_id UUID NOT NULL REFERENCES questions(id) ON DELETE CASCADE,
  answer TEXT,
  is_correct BOOLEAN,
  points_awarded INTEGER,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(attempt_id, question_id)
);

-- AI-generated content table (for storing chunks of processed documents)
CREATE TABLE ai_content (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  material_id UUID REFERENCES materials(id) ON DELETE CASCADE,
  content_type TEXT NOT NULL,
  content TEXT NOT NULL,
  metadata JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX idx_classes_teacher ON classes(teacher_id);
CREATE INDEX idx_students_class ON students(class_id);
CREATE INDEX idx_materials_class ON materials(class_id);
CREATE INDEX idx_exams_class ON exams(class_id);
CREATE INDEX idx_exams_status ON exams(status);
CREATE INDEX idx_exams_access_code ON exams(access_code);
CREATE INDEX idx_questions_exam ON questions(exam_id);
CREATE INDEX idx_attempts_exam ON exam_attempts(exam_id);
CREATE INDEX idx_attempts_student ON exam_attempts(student_id);
CREATE INDEX idx_answers_attempt ON student_answers(attempt_id);
CREATE INDEX idx_answers_question ON student_answers(question_id);
CREATE INDEX idx_ai_content_material ON ai_content(material_id);

-- Create views for easier querying
-- View for class details with teacher info and student count
CREATE OR REPLACE VIEW class_details AS
SELECT 
  c.id,
  c.name,
  c.description,
  c.teacher_id,
  t.name AS teacher_name,
  t.email AS teacher_email,
  COUNT(DISTINCT s.id) AS student_count,
  c.created_at,
  c.updated_at
FROM 
  classes c
JOIN 
  teachers t ON c.teacher_id = t.id
LEFT JOIN 
  students s ON c.id = s.class_id
GROUP BY 
  c.id, t.id;

-- View for exam details with class info and question count
CREATE OR REPLACE VIEW exam_details AS
SELECT 
  e.id,
  e.title,
  e.description,
  e.class_id,
  c.name AS class_name,
  e.status,
  e.access_code,
  e.question_count,
  e.time_limit,
  e.deadline,
  e.shuffle_questions,
  e.shuffle_answers,
  e.strict_timing,
  COUNT(q.id) AS actual_question_count,
  e.published_at,
  e.created_at,
  e.updated_at
FROM 
  exams e
JOIN 
  classes c ON e.class_id = c.id
LEFT JOIN 
  questions q ON e.id = q.exam_id
GROUP BY 
  e.id, c.id;

-- Create functions for common operations
-- Function to get all students in a class
CREATE OR REPLACE FUNCTION get_class_students(class_id UUID)
RETURNS TABLE (
  id UUID,
  name TEXT,
  matric_number TEXT,
  email TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    s.id, s.name, s.matric_number, s.email
  FROM 
    students s
  WHERE 
    s.class_id = get_class_students.class_id
  ORDER BY 
    s.name;
END;
$$ LANGUAGE plpgsql;

-- Function to get all exams for a class
CREATE OR REPLACE FUNCTION get_class_exams(class_id UUID)
RETURNS TABLE (
  id UUID,
  title TEXT,
  status exam_status,
  question_count INTEGER,
  published_at TIMESTAMPTZ,
  attempt_count INTEGER
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    e.id,
    e.title,
    e.status,
    e.question_count,
    e.published_at,
    COUNT(DISTINCT ea.id) AS attempt_count
  FROM 
    exams e
  LEFT JOIN 
    exam_attempts ea ON e.id = ea.exam_id
  WHERE 
    e.class_id = get_class_exams.class_id
  GROUP BY 
    e.id
  ORDER BY 
    e.created_at DESC;
END;
$$ LANGUAGE plpgsql;

-- Function to calculate exam statistics
CREATE OR REPLACE FUNCTION get_exam_statistics(exam_id UUID)
RETURNS TABLE (
  total_students INTEGER,
  attempts_count INTEGER,
  completed_count INTEGER,
  average_score NUMERIC,
  highest_score INTEGER,
  lowest_score INTEGER,
  pass_rate NUMERIC
) AS $$
BEGIN
  RETURN QUERY
  WITH stats AS (
    SELECT
      COUNT(DISTINCT s.id) AS total_students,
      COUNT(DISTINCT ea.id) AS attempts_count,
      COUNT(DISTINCT CASE WHEN ea.completed_at IS NOT NULL THEN ea.id END) AS completed_count,
      AVG(CASE WHEN ea.completed_at IS NOT NULL THEN ea.score END) AS average_score,
      MAX(ea.score) AS highest_score,
      MIN(CASE WHEN ea.completed_at IS NOT NULL THEN ea.score END) AS lowest_score,
      CASE 
        WHEN COUNT(DISTINCT CASE WHEN ea.completed_at IS NOT NULL THEN ea.id END) = 0 THEN 0
        ELSE ROUND(
          COUNT(DISTINCT CASE WHEN ea.completed_at IS NOT NULL AND ea.score >= 0.6 * ea.max_score THEN ea.id END)::NUMERIC /
          COUNT(DISTINCT CASE WHEN ea.completed_at IS NOT NULL THEN ea.id END)::NUMERIC * 100, 2
        )
      END AS pass_rate
    FROM
      exams e
    JOIN
      classes c ON e.class_id = c.id
    LEFT JOIN
      students s ON c.id = s.class_id
    LEFT JOIN
      exam_attempts ea ON e.id = ea.exam_id AND s.id = ea.student_id
    WHERE
      e.id = get_exam_statistics.exam_id
  )
  SELECT
    total_students,
    attempts_count,
    completed_count,
    COALESCE(average_score, 0),
    COALESCE(highest_score, 0),
    COALESCE(lowest_score, 0),
    COALESCE(pass_rate, 0)
  FROM
    stats;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for automatic updates
-- Trigger to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply the update_timestamp trigger to all tables with updated_at
CREATE TRIGGER update_teachers_timestamp
BEFORE UPDATE ON teachers
FOR EACH ROW EXECUTE FUNCTION update_timestamp();

CREATE TRIGGER update_classes_timestamp
BEFORE UPDATE ON classes
FOR EACH ROW EXECUTE FUNCTION update_timestamp();

CREATE TRIGGER update_students_timestamp
BEFORE UPDATE ON students
FOR EACH ROW EXECUTE FUNCTION update_timestamp();

CREATE TRIGGER update_materials_timestamp
BEFORE UPDATE ON materials
FOR EACH ROW EXECUTE FUNCTION update_timestamp();

CREATE TRIGGER update_exams_timestamp
BEFORE UPDATE ON exams
FOR EACH ROW EXECUTE FUNCTION update_timestamp();

CREATE TRIGGER update_questions_timestamp
BEFORE UPDATE ON questions
FOR EACH ROW EXECUTE FUNCTION update_timestamp();

CREATE TRIGGER update_exam_attempts_timestamp
BEFORE UPDATE ON exam_attempts
FOR EACH ROW EXECUTE FUNCTION update_timestamp();

CREATE TRIGGER update_student_answers_timestamp
BEFORE UPDATE ON student_answers
FOR EACH ROW EXECUTE FUNCTION update_timestamp();

-- Trigger to update question count in exams
CREATE OR REPLACE FUNCTION update_exam_question_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE exams SET question_count = question_count + 1 WHERE id = NEW.exam_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE exams SET question_count = question_count - 1 WHERE id = OLD.exam_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_exam_question_count_trigger
AFTER INSERT OR DELETE ON questions
FOR EACH ROW EXECUTE FUNCTION update_exam_question_count();

-- Trigger to calculate score when an exam attempt is completed
CREATE OR REPLACE FUNCTION calculate_exam_score()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.completed_at IS NOT NULL AND OLD.completed_at IS NULL THEN
    -- Calculate the score
    WITH scores AS (
      SELECT
        SUM(CASE WHEN sa.is_correct THEN q.points ELSE 0 END) AS earned_points,
        SUM(q.points) AS total_points
      FROM
        student_answers sa
      JOIN
        questions q ON sa.question_id = q.id
      WHERE
        sa.attempt_id = NEW.id
    )
    UPDATE exam_attempts
    SET
      score = scores.earned_points,
      max_score = scores.total_points
    FROM
      scores
    WHERE
      id = NEW.id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER calculate_exam_score_trigger
AFTER UPDATE ON exam_attempts
FOR EACH ROW EXECUTE FUNCTION calculate_exam_score();

-- Set up Row Level Security (RLS) policies
-- Enable RLS on all tables
ALTER TABLE teachers ENABLE ROW LEVEL SECURITY;
ALTER TABLE classes ENABLE ROW LEVEL SECURITY;
ALTER TABLE students ENABLE ROW LEVEL SECURITY;
ALTER TABLE materials ENABLE ROW LEVEL SECURITY;
ALTER TABLE exams ENABLE ROW LEVEL SECURITY;
ALTER TABLE questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE exam_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE student_answers ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_content ENABLE ROW LEVEL SECURITY;

-- Create policies for teachers table
-- Teachers can see their own profile
CREATE POLICY teachers_select ON teachers
  FOR SELECT
  USING (auth.uid() = id);

-- Teachers can update their own profile
CREATE POLICY teachers_update ON teachers
  FOR UPDATE
  USING (auth.uid() = id);

-- Create policies for classes table
-- Teachers can see all classes they created
CREATE POLICY classes_teacher_select ON classes
  FOR SELECT
  USING (teacher_id = auth.uid());

-- Teachers can create, update, and delete their own classes
CREATE POLICY classes_teacher_insert ON classes
  FOR INSERT
  WITH CHECK (teacher_id = auth.uid());

CREATE POLICY classes_teacher_update ON classes
  FOR UPDATE
  USING (teacher_id = auth.uid());

CREATE POLICY classes_teacher_delete ON classes
  FOR DELETE
  USING (teacher_id = auth.uid());

-- Create policies for students table
-- Teachers can see students in their classes
CREATE POLICY students_teacher_select ON students
  FOR SELECT
  USING (
    class_id IN (
      SELECT id
      FROM classes
      WHERE teacher_id = auth.uid()
    )
  );

-- Teachers can manage students in their classes
CREATE POLICY students_teacher_insert ON students
  FOR INSERT
  WITH CHECK (
    class_id IN (
      SELECT id
      FROM classes
      WHERE teacher_id = auth.uid()
    )
  );

CREATE POLICY students_teacher_update ON students
  FOR UPDATE
  USING (
    class_id IN (
      SELECT id
      FROM classes
      WHERE teacher_id = auth.uid()
    )
  );

CREATE POLICY students_teacher_delete ON students
  FOR DELETE
  USING (
    class_id IN (
      SELECT id
      FROM classes
      WHERE teacher_id = auth.uid()
    )
  );

-- Create policies for materials table
-- Teachers can see materials for their classes
CREATE POLICY materials_teacher_select ON materials
  FOR SELECT
  USING (
    class_id IN (
      SELECT id
      FROM classes
      WHERE teacher_id = auth.uid()
    )
  );

-- Teachers can manage materials for their classes
CREATE POLICY materials_teacher_insert ON materials
  FOR INSERT
  WITH CHECK (
    class_id IN (
      SELECT id
      FROM classes
      WHERE teacher_id = auth.uid()
    ) AND
    uploaded_by = auth.uid()
  );

CREATE POLICY materials_teacher_update ON materials
  FOR UPDATE
  USING (
    class_id IN (
      SELECT id
      FROM classes
      WHERE teacher_id = auth.uid()
    )
  );

CREATE POLICY materials_teacher_delete ON materials
  FOR DELETE
  USING (
    class_id IN (
      SELECT id
      FROM classes
      WHERE teacher_id = auth.uid()
    )
  );

-- Create policies for exams table
-- Teachers can see exams for their classes
CREATE POLICY exams_teacher_select ON exams
  FOR SELECT
  USING (
    class_id IN (
      SELECT id
      FROM classes
      WHERE teacher_id = auth.uid()
    )
  );

-- Teachers can manage exams for their classes
CREATE POLICY exams_teacher_insert ON exams
  FOR INSERT
  WITH CHECK (
    class_id IN (
      SELECT id
      FROM classes
      WHERE teacher_id = auth.uid()
    )
  );

CREATE POLICY exams_teacher_update ON exams
  FOR UPDATE
  USING (
    class_id IN (
      SELECT id
      FROM classes
      WHERE teacher_id = auth.uid()
    )
  );

CREATE POLICY exams_teacher_delete ON exams
  FOR DELETE
  USING (
    class_id IN (
      SELECT id
      FROM classes
      WHERE teacher_id = auth.uid()
    )
  );

-- Create policies for questions table
-- Teachers can see questions for their exams
CREATE POLICY questions_teacher_select ON questions
  FOR SELECT
  USING (
    exam_id IN (
      SELECT e.id
      FROM exams e
      JOIN classes c ON e.class_id = c.id
      WHERE c.teacher_id = auth.uid()
    )
  );

-- Teachers can manage questions for their exams
CREATE POLICY questions_teacher_insert ON questions
  FOR INSERT
  WITH CHECK (
    exam_id IN (
      SELECT e.id
      FROM exams e
      JOIN classes c ON e.class_id = c.id
      WHERE c.teacher_id = auth.uid()
    )
  );

CREATE POLICY questions_teacher_update ON questions
  FOR UPDATE
  USING (
    exam_id IN (
      SELECT e.id
      FROM exams e
      JOIN classes c ON e.class_id = c.id
      WHERE c.teacher_id = auth.uid()
    )
  );

CREATE POLICY questions_teacher_delete ON questions
  FOR DELETE
  USING (
    exam_id IN (
      SELECT e.id
      FROM exams e
      JOIN classes c ON e.class_id = c.id
      WHERE c.teacher_id = auth.uid()
    )
  );

-- Create policies for exam_attempts table
-- Teachers can see attempts for their exams
CREATE POLICY attempts_teacher_select ON exam_attempts
  FOR SELECT
  USING (
    exam_id IN (
      SELECT e.id
      FROM exams e
      JOIN classes c ON e.class_id = c.id
      WHERE c.teacher_id = auth.uid()
    )
  );

-- Create policies for student_answers table
-- Teachers can see answers for their exams
CREATE POLICY answers_teacher_select ON student_answers
  FOR SELECT
  USING (
    attempt_id IN (
      SELECT ea.id
      FROM exam_attempts ea
      JOIN exams e ON ea.exam_id = e.id
      JOIN classes c ON e.class_id = c.id
      WHERE c.teacher_id = auth.uid()
    )
  );

-- Create policies for ai_content table
-- Teachers can see AI content for their materials
CREATE POLICY ai_content_teacher_select ON ai_content
  FOR SELECT
  USING (
    material_id IN (
      SELECT m.id
      FROM materials m
      JOIN classes c ON m.class_id = c.id
      WHERE c.teacher_id = auth.uid()
    )
  );

-- Create service role policies for public access to exams
-- Allow anonymous access to published exams with access code
CREATE POLICY exams_public_access ON exams
  FOR SELECT
  TO anon
  USING (status = 'published' AND access_code IS NOT NULL);

-- Allow anonymous access to questions for published exams
CREATE POLICY questions_public_access ON questions
  FOR SELECT
  TO anon
  USING (
    exam_id IN (
      SELECT id
      FROM exams
      WHERE status = 'published' AND access_code IS NOT NULL
    )
  );

-- Allow anonymous creation of exam attempts
CREATE POLICY attempts_public_insert ON exam_attempts
  FOR INSERT
  TO anon
  WITH CHECK (
    exam_id IN (
      SELECT id
      FROM exams
      WHERE status = 'published' AND access_code IS NOT NULL
    )
  );

-- Allow anonymous creation of student answers
CREATE POLICY answers_public_insert ON student_answers
  FOR INSERT
  TO anon
  WITH CHECK (
    attempt_id IN (
      SELECT ea.id
      FROM exam_attempts ea
      JOIN exams e ON ea.exam_id = e.id
      WHERE e.status = 'published' AND e.access_code IS NOT NULL
    )
  );

-- Create initial admin user (you'll need to set the password via Supabase dashboard)
-- Replace 'admin@quizforge.com' with your actual admin email
INSERT INTO auth.users (id, email, email_confirmed_at, role)
VALUES (
  uuid_generate_v4(),
  'admin@quizforge.com',
  NOW(),
  'authenticated'
) ON CONFLICT DO NOTHING;

-- Add the admin user to the teachers table
INSERT INTO teachers (id, name, email)
SELECT 
  id, 
  'Admin User', 
  email
FROM 
  auth.users 
WHERE 
  email = 'admin@quizforge.com'
ON CONFLICT DO NOTHING;
