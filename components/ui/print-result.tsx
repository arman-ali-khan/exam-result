'use client';

import { useState } from 'react';
import { Printer as Print, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Separator } from '@/components/ui/separator';
import { Student, Result, ResultSubject, ExamSession, EducationBoard } from '@/lib/supabase';

interface PrintResultProps {
  student: Student & {
    education_boards: EducationBoard;
    exam_sessions: ExamSession;
  };
  result: Result;
  subjects: ResultSubject[];
}

export function PrintResult({ student, result, subjects }: PrintResultProps) {
  const handlePrint = () => {
    window.print();
  };

  const getResultStatusIcon = (status: string) => {
    switch (status) {
      case 'Passed':
        return '✓';
      case 'Failed':
        return '✗';
      case 'Critical':
        return '⚠';
      default:
        return '';
    }
  };

  const getGradeColor = (grade: string) => {
    switch (grade) {
      case 'A+':
        return 'bg-green-100 text-green-800 print:bg-gray-100 print:text-black';
      case 'A':
        return 'bg-blue-100 text-blue-800 print:bg-gray-100 print:text-black';
      case 'A-':
        return 'bg-cyan-100 text-cyan-800 print:bg-gray-100 print:text-black';
      case 'B':
        return 'bg-yellow-100 text-yellow-800 print:bg-gray-100 print:text-black';
      case 'C':
        return 'bg-orange-100 text-orange-800 print:bg-gray-100 print:text-black';
      case 'D':
        return 'bg-red-100 text-red-800 print:bg-gray-100 print:text-black';
      case 'F':
        return 'bg-red-200 text-red-900 print:bg-gray-200 print:text-black';
      default:
        return 'bg-gray-100 text-gray-800 print:bg-gray-100 print:text-black';
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
        {/* Print Button - Hidden in print */}
        <div className="flex justify-end print:hidden no-print">
          <Button onClick={handlePrint} className="gap-2">
            <Print className="h-4 w-4" />
            Print Result
          </Button>
        </div>

        {/* Print Area */}
        <div className="print-area">
          {/* Header */}
          <div className="print-header">
            <h1 className="text-2xl font-bold text-center mb-2">
              {student.education_boards.name}
            </h1>
            <h2 className="text-lg text-center">
              {student.exam_sessions.name} - {student.exam_sessions.year}
            </h2>
            <p className="text-center text-sm mt-2">Official Result Certificate</p>
          </div>

          <div className="print-content">
            {/* Student Information */}
            <div className="student-info">
              <div>
                <div className="info-section">
                  <h3 className="font-bold text-lg mb-3 border-b border-gray-300 pb-1">
                    Student Information
                  </h3>
                  <div className="space-y-2">
                    <div>
                      <span className="info-label">Name:</span>
                      <span>{student.name}</span>
                    </div>
                    <div>
                      <span className="info-label">Roll Number:</span>
                      <span>{student.roll_number}</span>
                    </div>
                    <div>
                      <span className="info-label">Registration:</span>
                      <span>{student.registration_number}</span>
                    </div>
                    <div>
                      <span className="info-label">Father's Name:</span>
                      <span>{student.father_name}</span>
                    </div>
                    <div>
                      <span className="info-label">Mother's Name:</span>
                      <span>{student.mother_name}</span>
                    </div>
                    <div>
                      <span className="info-label">Date of Birth:</span>
                      <span>{new Date(student.date_of_birth).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
              </div>
              
              <div>
                <div className="info-section">
                  <h3 className="font-bold text-lg mb-3 border-b border-gray-300 pb-1">
                    Exam Information
                  </h3>
                  <div className="space-y-2">
                    <div>
                      <span className="info-label">Institute:</span>
                      <span>{student.institute_name}</span>
                    </div>
                    <div>
                      <span className="info-label">Board:</span>
                      <span>{student.education_boards.name}</span>
                    </div>
                    <div>
                      <span className="info-label">Exam Type:</span>
                      <span>{student.exam_type}</span>
                    </div>
                    <div>
                      <span className="info-label">Session:</span>
                      <span>{student.exam_sessions.name} - {student.exam_sessions.year}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Result Summary */}
            <div className="result-summary">
              <h3 className="font-bold text-lg mb-2">Result Summary</h3>
              <div className="flex justify-center items-center gap-4">
                <div>
                  <span className="font-medium">Result:</span>
                  <span className="ml-2 font-bold">
                    {getResultStatusIcon(result.result_status)} {result.result_status}
                  </span>
                </div>
                <div className="gpa-display">
                  GPA: {result.gpa.toFixed(2)}
                </div>
                <div>
                  <span className="font-medium">Total Marks:</span>
                  <span className="ml-2 font-bold">{result.total_marks}</span>
                </div>
              </div>
            </div>

            {/* Subjects Table */}
            <div>
              <h3 className="font-bold text-lg mb-3 border-b border-gray-300 pb-1">
                Subject-wise Results
              </h3>
              <table className="print-table">
                <thead>
                  <tr>
                    <th>Subject Code</th>
                    <th>Subject Name</th>
                    <th>Grade</th>
                    <th>Marks</th>
                  </tr>
                </thead>
                <tbody>
                  {subjects.map((subject, index) => (
                    <tr key={subject.id}>
                      <td className="font-medium">{subject.subjects?.code}</td>
                      <td>{subject.subjects?.name}</td>
                      <td className="text-center font-bold">{subject.grade}</td>
                      <td className="text-center">{subject.marks}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Verification Section */}
            {result.result_hash && (
              <div className="mt-6 p-4 border border-gray-300">
                <h4 className="font-bold mb-2">Verification Information</h4>
                <div className="text-xs space-y-1">
                  <div>
                    <span className="font-medium">Result Hash:</span>
                    <span className="ml-2 font-mono">{result.result_hash}</span>
                  </div>
                  {result.blockchain_tx_hash && (
                    <div>
                      <span className="font-medium">Blockchain TX:</span>
                      <span className="ml-2 font-mono">{result.blockchain_tx_hash}</span>
                    </div>
                  )}
                  <p className="text-xs mt-2 italic">
                    This result is cryptographically verified and tamper-proof.
                  </p>
                </div>
              </div>
            )}

            {/* Footer */}
            <div className="mt-8 text-center text-xs">
              <div className="border-t border-gray-300 pt-4">
                <p>This is an official result certificate issued by {student.education_boards.name}</p>
                <p className="mt-1">Generated on: {new Date().toLocaleDateString()}</p>
                <div className="mt-4 flex justify-between">
                  <div>
                    <div className="border-t border-gray-400 w-32 mx-auto"></div>
                    <p className="mt-1">Controller of Examinations</p>
                  </div>
                  <div>
                    <div className="border-t border-gray-400 w-32 mx-auto"></div>
                    <p className="mt-1">Chairman</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
  );
}