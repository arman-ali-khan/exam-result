import { z } from 'zod';

// Search form validation
export const searchSchema = z.object({
  rollNumber: z.string().optional(),
  registrationNumber: z.string().optional(),
  boardId: z.string().min(1, 'Please select an education board'),
  sessionId: z.string().min(1, 'Please select an exam session'),
}).refine((data) => {
  return data.rollNumber || data.registrationNumber;
}, {
  message: "Please provide either roll number or registration number",
  path: ["rollNumber"]
});

// Student form validation
export const studentSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  rollNumber: z.string().min(1, 'Roll number is required'),
  registrationNumber: z.string().min(1, 'Registration number is required'),
  fatherName: z.string().min(2, 'Father\'s name must be at least 2 characters'),
  motherName: z.string().min(2, 'Mother\'s name must be at least 2 characters'),
  dateOfBirth: z.string().min(1, 'Date of birth is required'),
  instituteName: z.string().min(2, 'Institute name must be at least 2 characters'),
  boardId: z.string().min(1, 'Please select an education board'),
  sessionId: z.string().min(1, 'Please select an exam session'),
  examType: z.enum(['Regular', 'Irregular']),
});

// Board form validation
export const boardSchema = z.object({
  name: z.string().min(2, 'Board name must be at least 2 characters'),
  code: z.string().min(2, 'Board code must be at least 2 characters'),
  description: z.string().optional(),
});

// Session form validation
export const sessionSchema = z.object({
  name: z.string().min(2, 'Session name must be at least 2 characters'),
  examType: z.string().min(2, 'Exam type must be at least 2 characters'),
  year: z.number().int().min(2000).max(2050),
  boardId: z.string().min(1, 'Please select an education board'),
  isPublished: z.boolean().default(false),
});

// Subject form validation
export const subjectSchema = z.object({
  code: z.string().min(1, 'Subject code is required'),
  name: z.string().min(2, 'Subject name must be at least 2 characters'),
  description: z.string().optional(),
});

// Result form validation
export const resultSchema = z.object({
  studentId: z.string().min(1, 'Please select a student'),
  sessionId: z.string().min(1, 'Please select an exam session'),
  resultStatus: z.enum(['Passed', 'Failed', 'Critical']),
  totalMarks: z.number().int().min(0).max(1000),
  isPublished: z.boolean().default(false),
  subjects: z.array(z.object({
    subjectId: z.string().min(1, 'Please select a subject'),
    grade: z.enum(['A+', 'A', 'A-', 'B', 'C', 'D', 'F']),
    marks: z.number().int().min(0).max(100),
  })).min(1, 'At least one subject is required'),
});

// Auth form validation
export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

export const signUpSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  fullName: z.string().min(2, 'Full name must be at least 2 characters'),
});

// Search form types
export type SearchFormData = z.infer<typeof searchSchema>;
export type StudentFormData = z.infer<typeof studentSchema>;
export type BoardFormData = z.infer<typeof boardSchema>;
export type SessionFormData = z.infer<typeof sessionSchema>;
export type SubjectFormData = z.infer<typeof subjectSchema>;
export type ResultFormData = z.infer<typeof resultSchema>;
export type LoginFormData = z.infer<typeof loginSchema>;
export type SignUpFormData = z.infer<typeof signUpSchema>;