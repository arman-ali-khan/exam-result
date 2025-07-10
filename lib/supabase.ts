import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables. Please check your .env.local file.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
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
  try {
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error) {
      console.error('Error getting current user:', error);
      return null;
    }
    return user;
  } catch (error) {
    console.error('Error in getCurrentUser:', error);
    return null;
  }
};

export const getSession = async () => {
  try {
    const { data: { session }, error } = await supabase.auth.getSession();
    if (error) {
      console.error('Error getting session:', error);
      return null;
    }
    return session;
  } catch (error) {
    console.error('Error in getSession:', error);
    return null;
  }
};

export const signOut = async () => {
  const { error } = await supabase.auth.signOut();
  if (error) {
    console.error('Error signing out:', error);
  }
  return user;
};

export const getUserProfile = async (userId: string) => {
  try {
    console.log('Getting user profile for:', userId);
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .maybeSingle();
    
    if (error) {
      console.error('Error getting user profile:', error);
    }
    
    console.log('User profile data:', data);
    return { data, error };
  } catch (error) {
    console.error('Error in getUserProfile:', error);
    return { data: null, error };
  }
};

export const isAdmin = async (userId: string) => {
  try {
    const { data, error } = await getUserProfile(userId);
    if (error || !data) {
      console.log('No profile found or error, checking if this is the first admin user');
      // If no profile exists, this might be the first user - make them admin
      return false;
    }
    const isUserAdmin = data.role === 'admin';
    console.log('User role check result:', isUserAdmin);
    return isUserAdmin;
  } catch (error) {
    console.error('Error in isAdmin:', error);
    return false;
  }
};