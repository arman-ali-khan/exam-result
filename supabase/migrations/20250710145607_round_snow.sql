/*
  # Fix Type Conflicts Migration

  1. Handle Existing Types
    - Check if custom types exist before creating them
    - Use IF NOT EXISTS where possible
    - Drop and recreate types if needed

  2. Create Missing Tables and Functions
    - Ensure all required tables exist
    - Create the admin check function
    - Set up proper RLS policies
*/

-- Create custom types only if they don't exist
DO $$ BEGIN
    CREATE TYPE exam_type AS ENUM ('Regular', 'Irregular');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE result_status AS ENUM ('Passed', 'Failed', 'Critical');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE user_role AS ENUM ('admin', 'student', 'teacher');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE grade_point AS ENUM ('A+', 'A', 'A-', 'B', 'C', 'D', 'F');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Create admin check function to avoid RLS recursion
CREATE OR REPLACE FUNCTION is_admin()
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  );
END;
$$;

-- Education Boards Table
CREATE TABLE IF NOT EXISTS education_boards (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE,
  code text NOT NULL UNIQUE,
  description text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Exam Sessions Table
CREATE TABLE IF NOT EXISTS exam_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  exam_type text NOT NULL,
  year integer NOT NULL,
  board_id uuid REFERENCES education_boards(id),
  is_published boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Subjects Table
CREATE TABLE IF NOT EXISTS subjects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text NOT NULL UNIQUE,
  name text NOT NULL,
  description text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Students Table
CREATE TABLE IF NOT EXISTS students (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  roll_number text NOT NULL,
  registration_number text NOT NULL,
  father_name text NOT NULL,
  mother_name text NOT NULL,
  date_of_birth date NOT NULL,
  institute_name text NOT NULL,
  board_id uuid REFERENCES education_boards(id),
  session_id uuid REFERENCES exam_sessions(id),
  exam_type exam_type DEFAULT 'Regular',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Add unique constraint if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'students_roll_number_registration_number_session_id_key'
  ) THEN
    ALTER TABLE students ADD CONSTRAINT students_roll_number_registration_number_session_id_key 
    UNIQUE(roll_number, registration_number, session_id);
  END IF;
END $$;

-- Results Table
CREATE TABLE IF NOT EXISTS results (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id uuid REFERENCES students(id) ON DELETE CASCADE,
  session_id uuid REFERENCES exam_sessions(id),
  result_status result_status DEFAULT 'Passed',
  gpa decimal(3,2) DEFAULT 0.00,
  total_marks integer DEFAULT 0,
  is_published boolean DEFAULT false,
  result_hash text, -- For Web3 verification
  blockchain_tx_hash text, -- For Web3 verification
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Add unique constraint if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'results_student_id_session_id_key'
  ) THEN
    ALTER TABLE results ADD CONSTRAINT results_student_id_session_id_key 
    UNIQUE(student_id, session_id);
  END IF;
END $$;

-- Result Subjects Junction Table
CREATE TABLE IF NOT EXISTS result_subjects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  result_id uuid REFERENCES results(id) ON DELETE CASCADE,
  subject_id uuid REFERENCES subjects(id),
  grade grade_point NOT NULL,
  marks integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- Add unique constraint if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'result_subjects_result_id_subject_id_key'
  ) THEN
    ALTER TABLE result_subjects ADD CONSTRAINT result_subjects_result_id_subject_id_key 
    UNIQUE(result_id, subject_id);
  END IF;
END $$;

-- User Profiles Table
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text NOT NULL,
  full_name text,
  role user_role DEFAULT 'student',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE education_boards ENABLE ROW LEVEL SECURITY;
ALTER TABLE exam_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE subjects ENABLE ROW LEVEL SECURITY;
ALTER TABLE students ENABLE ROW LEVEL SECURITY;
ALTER TABLE results ENABLE ROW LEVEL SECURITY;
ALTER TABLE result_subjects ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist and recreate them
DROP POLICY IF EXISTS "Education boards are viewable by everyone" ON education_boards;
DROP POLICY IF EXISTS "Education boards are manageable by admins" ON education_boards;
DROP POLICY IF EXISTS "Exam sessions are viewable by everyone" ON exam_sessions;
DROP POLICY IF EXISTS "Exam sessions are manageable by admins" ON exam_sessions;
DROP POLICY IF EXISTS "Subjects are viewable by everyone" ON subjects;
DROP POLICY IF EXISTS "Subjects are manageable by admins" ON subjects;
DROP POLICY IF EXISTS "Students are viewable by everyone for published results" ON students;
DROP POLICY IF EXISTS "Students are manageable by admins" ON students;
DROP POLICY IF EXISTS "Published results are viewable by everyone" ON results;
DROP POLICY IF EXISTS "Results are manageable by admins" ON results;
DROP POLICY IF EXISTS "Published result subjects are viewable by everyone" ON result_subjects;
DROP POLICY IF EXISTS "Result subjects are manageable by admins" ON result_subjects;
DROP POLICY IF EXISTS "Users can view their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON profiles;

-- RLS Policies for Education Boards
CREATE POLICY "Education boards are viewable by everyone"
  ON education_boards
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Education boards are manageable by admins"
  ON education_boards
  FOR ALL
  TO authenticated
  USING (is_admin());

-- RLS Policies for Exam Sessions
CREATE POLICY "Exam sessions are viewable by everyone"
  ON exam_sessions
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Exam sessions are manageable by admins"
  ON exam_sessions
  FOR ALL
  TO authenticated
  USING (is_admin());

-- RLS Policies for Subjects
CREATE POLICY "Subjects are viewable by everyone"
  ON subjects
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Subjects are manageable by admins"
  ON subjects
  FOR ALL
  TO authenticated
  USING (is_admin());

-- RLS Policies for Students
CREATE POLICY "Students are viewable by everyone for published results"
  ON students
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Students are manageable by admins"
  ON students
  FOR ALL
  TO authenticated
  USING (is_admin());

-- RLS Policies for Results
CREATE POLICY "Published results are viewable by everyone"
  ON results
  FOR SELECT
  TO public
  USING (is_published = true);

CREATE POLICY "Results are manageable by admins"
  ON results
  FOR ALL
  TO authenticated
  USING (is_admin());

-- RLS Policies for Result Subjects
CREATE POLICY "Published result subjects are viewable by everyone"
  ON result_subjects
  FOR SELECT
  TO public
  USING (
    EXISTS (
      SELECT 1 FROM results
      WHERE results.id = result_subjects.result_id
      AND results.is_published = true
    )
  );

CREATE POLICY "Result subjects are manageable by admins"
  ON result_subjects
  FOR ALL
  TO authenticated
  USING (is_admin());

-- RLS Policies for Profiles
CREATE POLICY "Users can view their own profile"
  ON profiles
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Admins can view all profiles"
  ON profiles
  FOR SELECT
  TO authenticated
  USING (is_admin());

-- Insert default education boards (only if they don't exist)
INSERT INTO education_boards (name, code, description) 
SELECT * FROM (VALUES
  ('Dhaka Education Board', 'DEB', 'Dhaka Education Board'),
  ('Dinajpur Education Board', 'DINB', 'Dinajpur Education Board'),
  ('Jessore Education Board', 'JEB', 'Jessore Education Board'),
  ('Comilla Education Board', 'CEB', 'Comilla Education Board'),
  ('Chittagong Education Board', 'CTGB', 'Chittagong Education Board'),
  ('Sylhet Education Board', 'SEB', 'Sylhet Education Board'),
  ('Rajshahi Education Board', 'REB', 'Rajshahi Education Board'),
  ('Barisal Education Board', 'BEB', 'Barisal Education Board'),
  ('Madrasah Education Board', 'MEB', 'Madrasah Education Board'),
  ('Technical Education Board', 'TEB', 'Technical Education Board')
) AS v(name, code, description)
WHERE NOT EXISTS (SELECT 1 FROM education_boards WHERE code = v.code);

-- Insert default subjects (only if they don't exist)
INSERT INTO subjects (code, name, description) 
SELECT * FROM (VALUES
  ('101', 'Bangla 1st Paper', 'Bangla First Paper'),
  ('102', 'Bangla 2nd Paper', 'Bangla Second Paper'),
  ('107', 'English 1st Paper', 'English First Paper'),
  ('108', 'English 2nd Paper', 'English Second Paper'),
  ('109', 'Mathematics', 'Mathematics'),
  ('110', 'General Science', 'General Science'),
  ('111', 'Social Science', 'Social Science'),
  ('112', 'Islam and Moral Education', 'Islam and Moral Education'),
  ('113', 'Physical Education', 'Physical Education'),
  ('114', 'ICT', 'Information and Communication Technology'),
  ('115', 'Physics', 'Physics'),
  ('116', 'Chemistry', 'Chemistry'),
  ('117', 'Biology', 'Biology'),
  ('118', 'Higher Mathematics', 'Higher Mathematics'),
  ('119', 'Accounting', 'Accounting'),
  ('120', 'Business Studies', 'Business Studies'),
  ('121', 'Economics', 'Economics'),
  ('122', 'History', 'History'),
  ('123', 'Geography', 'Geography'),
  ('124', 'Civics', 'Civics')
) AS v(code, name, description)
WHERE NOT EXISTS (SELECT 1 FROM subjects WHERE code = v.code);

-- Function to calculate GPA
CREATE OR REPLACE FUNCTION calculate_gpa(result_id_param uuid)
RETURNS decimal AS $$
DECLARE
  total_points decimal := 0;
  total_subjects integer := 0;
  grade_value decimal;
  gpa_result decimal;
BEGIN
  SELECT 
    SUM(
      CASE 
        WHEN grade = 'A+' THEN 5.0
        WHEN grade = 'A' THEN 4.0
        WHEN grade = 'A-' THEN 3.5
        WHEN grade = 'B' THEN 3.0
        WHEN grade = 'C' THEN 2.0
        WHEN grade = 'D' THEN 1.0
        ELSE 0.0
      END
    ),
    COUNT(*)
  INTO total_points, total_subjects
  FROM result_subjects
  WHERE result_id = result_id_param;
  
  IF total_subjects > 0 THEN
    gpa_result := total_points / total_subjects;
    -- Cap GPA at 5.0
    IF gpa_result > 5.0 THEN
      gpa_result := 5.0;
    END IF;
  ELSE
    gpa_result := 0.0;
  END IF;
  
  -- Update the result table
  UPDATE results 
  SET gpa = gpa_result,
      result_status = CASE 
        WHEN gpa_result = 0.0 THEN 'Failed'
        WHEN gpa_result < 2.0 THEN 'Critical'
        ELSE 'Passed'
      END
  WHERE id = result_id_param;
  
  RETURN gpa_result;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-calculate GPA when result subjects are updated
CREATE OR REPLACE FUNCTION trigger_calculate_gpa()
RETURNS TRIGGER AS $$
BEGIN
  PERFORM calculate_gpa(NEW.result_id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS auto_calculate_gpa ON result_subjects;

CREATE TRIGGER auto_calculate_gpa
  AFTER INSERT OR UPDATE ON result_subjects
  FOR EACH ROW
  EXECUTE FUNCTION trigger_calculate_gpa();

-- Function to create user profile on sign up
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, email, full_name, role)
  VALUES (NEW.id, NEW.email, NEW.raw_user_meta_data->>'full_name', 'student');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_user();