import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
});

// Types for our database tables
export interface EducationBoard {
  id: string;
  name: string;
  code: string;
  description?: string;
  created_at: string;
  updated_at: string;
}

export interface ExamSession {
  id: string;
  name: string;
  exam_type: string;
  year: number;
  board_id: string;
  is_published: boolean;
  created_at: string;
  updated_at: string;
  education_boards?: EducationBoard;
}

export interface Subject {
  id: string;
  code: string;
  name: string;
  description?: string;
  created_at: string;
  updated_at: string;
}

export interface Student {
  id: string;
  name: string;
  roll_number: string;
  registration_number: string;
  father_name: string;
  mother_name: string;
  date_of_birth: string;
  institute_name: string;
  board_id: string;
  session_id: string;
  exam_type: 'Regular' | 'Irregular';
  created_at: string;
  updated_at: string;
  education_boards?: EducationBoard;
  exam_sessions?: ExamSession;
}

export interface Result {
  id: string;
  student_id: string;
  session_id: string;
  result_status: 'Passed' | 'Failed' | 'Critical';
  gpa: number;
  total_marks: number;
  is_published: boolean;
  result_hash?: string;
  blockchain_tx_hash?: string;
  created_at: string;
  updated_at: string;
  students?: Student;
  exam_sessions?: ExamSession;
}

export interface ResultSubject {
  id: string;
  result_id: string;
  subject_id: string;
  grade: 'A+' | 'A' | 'A-' | 'B' | 'C' | 'D' | 'F';
  marks: number;
  created_at: string;
  subjects?: Subject;
}

export interface Profile {
  id: string;
  email: string;
  full_name?: string;
  role: 'admin' | 'student' | 'teacher';
  created_at: string;
  updated_at: string;
}

// Helper functions
export const getCurrentUser = async () => {
  const { data: { user } } = await supabase.auth.getUser();
  return user;
};

export const getUserProfile = async (userId: string) => {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .maybeSingle();
  
  return { data, error };
};

export const isAdmin = async (userId: string) => {
  const { data } = await getUserProfile(userId);
  return data?.role === 'admin';
};