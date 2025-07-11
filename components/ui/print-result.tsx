'use client';

import { useState } from 'react';
import { Printer as Print, Shield, Cpu, Zap,CheckCircle  } from 'lucide-react';
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
          <Button onClick={handlePrint} className="gap-2 bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-400 hover:to-purple-400 text-black font-bold">
            <Print className="h-4 w-4" />
            Download Result
          </Button>
        </div>

        {/* Print Area */}
        <div className="print-area">
          {/* Header */}
          <div className="print-header">
            <div className="print-logo-section">
              <div className="print-logo">
                <Shield className="h-8 w-8" />
              </div>
              <div className="print-title-section">
                <h1 className="print-main-title">
                  {student.education_boards.name}
                </h1>
                <h2 className="print-subtitle">
                  {student.exam_sessions.name} - {student.exam_sessions.year}
                </h2>
                <p className="print-tagline">OFFICIAL RESULT CERTIFICATE</p>
              </div>
              <div className="print-verification-badges">
                <div className="print-badge">
                  <CheckCircle className="h-4 w-4" />
                  <span>Verified</span>
                </div>
                <div className="print-badge">
                  <Shield className="h-4 w-4" />
                  <span>Secured</span>
                </div>
              </div>
            </div>
          </div>

          <div className="print-content">
            {/* Student Information */}
            <div className="student-info">
              <div className="info-panel">
                <div className="info-section">
                  <h3 className="section-title">
                    <span className="section-icon">👤</span>
                    Student Information
                  </h3>
                  <div className="info-grid">
                    <div className="info-item">
                      <span className="info-label">Name:</span>
                      <span className="info-value">{student.name}</span>
                    </div>
                    <div className="info-item">
                      <span className="info-label">Roll:</span>
                      <span className="info-value">{student.roll_number}</span>
                    </div>
                    <div className="info-item">
                      <span className="info-label">Registration:</span>
                      <span className="info-value">{student.registration_number}</span>
                    </div>
                    <div className="info-item">
                      <span className="info-label">Father's Name:</span>
                      <span className="info-value">{student.father_name}</span>
                    </div>
                    <div className="info-item">
                      <span className="info-label">Mother's Name:</span>
                      <span className="info-value">{student.mother_name}</span>
                    </div>
                    <div className="info-item">
                      <span className="info-label">Date of Birth:</span>
                      <span className="info-value">{new Date(student.date_of_birth).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="info-panel">
                <div className="info-section">
                  <h3 className="section-title">
                    <span className="section-icon">🏫</span>
                    Examination Details
                  </h3>
                  <div className="info-grid">
                    <div className="info-item">
                      <span className="info-label">Institute:</span>
                      <span className="info-value">{student.institute_name}</span>
                    </div>
                    <div className="info-item">
                      <span className="info-label">Board:</span>
                      <span className="info-value">{student.education_boards.name}</span>
                    </div>
                    <div className="info-item">
                      <span className="info-label">Exam Type:</span>
                      <span className="info-value">{student.exam_type}</span>
                    </div>
                    <div className="info-item">
                      <span className="info-label">Session:</span>
                      <span className="info-value">{student.exam_sessions.name} - {student.exam_sessions.year}</span>
                    </div>
                  </div>
                </div>
              </div>

              
              <div className="info-panel">
                <div className="info-section">
                  <h3 className="section-title">
                    <span className="section-icon">📊</span>
                    Performance Summary
                  </h3>
                  <div className="performance-grid">
                    <div className="performance-item">
                      <span className="performance-label">Result Status</span>
                      <div className="performance-value status-value">
                        <span className="status-icon">{getResultStatusIcon(result.result_status)}</span>
                        <span className="status-text">{result.result_status}</span>
                      </div>
                    </div>
                    <div className="performance-item">
                      <span className="performance-label">GPA</span>
                      <div className="gpa-display-compact">
                        <span className="gpa-value-compact">{result.gpa.toFixed(2)}</span>
                        <span className="gpa-scale-compact">/ 5.00</span>
                      </div>
                    </div>
                    <div className="performance-item">
                      <span className="performance-label">Total Marks</span>
                      <div className="performance-value marks-value">{result.total_marks}</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Subjects Table */}
            <div className="subjects-section">
              <h3 className="section-title subjects-title">
                <span className="section-icon">📚</span>
                Subject Performance
              </h3>
              <table className="print-table">
                <thead>
                  <tr>
                    <th>Code</th>
                    <th>Subject Name</th>
                    <th className="text-center">Grade</th>
                    <th className="text-center">Marks</th>
                  </tr>
                </thead>
                <tbody>
                  {subjects.map((subject, index) => (
                    <tr key={subject.id}>
                      <td className="font-mono font-semibold">{subject.subjects?.code}</td>
                      <td>{subject.subjects?.name}</td>
                      <td className="text-center">
                        <span className="inline-block px-2 py-1 border rounded font-semibold">{subject.grade}</span>
                      </td>
                      <td className="text-center font-mono font-semibold">{subject.marks}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Footer */}
            <div className="print-footer">
              <div className="footer-content">
                <div className="footer-info">
                  <p className="footer-title">Official Result Certificate</p>
                  <p className="footer-subtitle">Issued by {student.education_boards.name}</p>
                  <p className="footer-date">Generated: {new Date().toLocaleDateString()}</p>
                </div>
                <div className="footer-signatures">
                  <div className="signature-block">
                    <div className="signature-line"></div>
                    <p className="signature-title">Controller of Examinations</p>
                  </div>
                  <div className="signature-block">
                    <div className="signature-line"></div>
                    <p className="signature-title">Chairman</p>
                  </div>
                </div>
                <div className="footer-tech">
                  <div className="tech-badge">
                    <CheckCircle className="h-3 w-3" />
                    <span>Digitally Verified</span>
                  </div>
                  <div className="tech-badge">
                    <Shield className="h-3 w-3" />
                    <span>Digitally Secured</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
    </div>
  );
}