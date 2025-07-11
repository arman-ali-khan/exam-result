'use client';

import { useState } from 'react';
import { Printer as Print, Shield, Cpu, Zap } from 'lucide-react';
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
            DOWNLOAD RESULT
          </Button>
        </div>

        {/* Print Area */}
        <div className="print-area">
          {/* Header */}
          <div className="print-header cyber-print-header">
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
                <p className="print-tagline">QUANTUM-VERIFIED RESULT CERTIFICATE</p>
              </div>
              <div className="print-verification-badges">
                <div className="print-badge">
                  <Cpu className="h-4 w-4" />
                  <span>VERIFIED</span>
                </div>
                <div className="print-badge">
                  <Shield className="h-4 w-4" />
                  <span>SECURED</span>
                </div>
              </div>
            </div>
          </div>

          <div className="print-content">
            {/* Student Information */}
            <div className="student-info cyber-grid-three">
              <div className="info-panel">
                <div className="info-section">
                  <h3 className="section-title">
                    <span className="section-icon">👤</span>
                    STUDENT PROFILE
                  </h3>
                  <div className="info-grid">
                    <div className="info-item">
                      <span className="info-label">NAME:</span>
                      <span className="info-value">{student.name}</span>
                    </div>
                    <div className="info-item">
                      <span className="info-label">ROLL:</span>
                      <span className="info-value">{student.roll_number}</span>
                    </div>
                    <div className="info-item">
                      <span className="info-label">REGISTRATION:</span>
                      <span className="info-value">{student.registration_number}</span>
                    </div>
                    <div className="info-item">
                      <span className="info-label">FATHER'S NAME:</span>
                      <span className="info-value">{student.father_name}</span>
                    </div>
                    <div className="info-item">
                      <span className="info-label">MOTHER'S NAME:</span>
                      <span className="info-value">{student.mother_name}</span>
                    </div>
                    <div className="info-item">
                      <span className="info-label">DATE OF BIRTH:</span>
                      <span className="info-value">{new Date(student.date_of_birth).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="info-panel">
                <div className="info-section">
                  <h3 className="section-title">
                    <span className="section-icon">🏫</span>
                    EXAMINATION DETAILS
                  </h3>
                  <div className="info-grid">
                    <div className="info-item">
                      <span className="info-label">INSTITUTE:</span>
                      <span className="info-value">{student.institute_name}</span>
                    </div>
                    <div className="info-item">
                      <span className="info-label">BOARD:</span>
                      <span className="info-value">{student.education_boards.name}</span>
                    </div>
                    <div className="info-item">
                      <span className="info-label">EXAM TYPE:</span>
                      <span className="info-value">{student.exam_type}</span>
                    </div>
                    <div className="info-item">
                      <span className="info-label">SESSION:</span>
                      <span className="info-value">{student.exam_sessions.name} - {student.exam_sessions.year}</span>
                    </div>
                  </div>
                </div>
              </div>

              
              <div className="info-panel">
                <div className="info-section">
                  <h3 className="section-title">
                    <span className="section-icon">📊</span>
                    PERFORMANCE ANALYSIS
                  </h3>
                  <div className="performance-grid">
                    <div className="performance-item">
                      <span className="performance-label">RESULT STATUS</span>
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
                      <span className="performance-label">TOTAL MARKS</span>
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
                SUBJECT PERFORMANCE MATRIX
              </h3>
              <table className="print-table cyber-table">
                <thead>
                  <tr className="table-header">
                    <th className="table-header-cell">CODE</th>
                    <th className="table-header-cell">SUBJECT NAME</th>
                    <th className="table-header-cell center">GRADE</th>
                    <th className="table-header-cell center">MARKS</th>
                  </tr>
                </thead>
                <tbody>
                  {subjects.map((subject, index) => (
                    <tr key={subject.id} className="table-row">
                      <td className="table-cell code-cell">{subject.subjects?.code}</td>
                      <td className="table-cell subject-cell">{subject.subjects?.name}</td>
                      <td className="table-cell center grade-cell">
                        <span className="grade-badge">{subject.grade}</span>
                      </td>
                      <td className="table-cell center marks-cell">{subject.marks}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Footer */}
            <div className="print-footer cyber-footer">
              <div className="footer-content">
                <div className="footer-info">
                  <p className="footer-title">OFFICIAL RESULT CERTIFICATE</p>
                  <p className="footer-subtitle">Issued by {student.education_boards.name}</p>
                  <p className="footer-date">Generated: {new Date().toLocaleDateString()}</p>
                </div>
                <div className="footer-signatures">
                  <div className="signature-block">
                    <div className="signature-line"></div>
                    <p className="signature-title">CONTROLLER OF EXAMINATIONS</p>
                  </div>
                  <div className="signature-block">
                    <div className="signature-line"></div>
                    <p className="signature-title">CHAIRMAN</p>
                  </div>
                </div>
                <div className="footer-tech">
                  <div className="tech-badge">
                    <Zap className="h-3 w-3" />
                    <span>QUANTUM VERIFIED</span>
                  </div>
                  <div className="tech-badge">
                    <Shield className="h-3 w-3" />
                    <span>BLOCKCHAIN SECURED</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
  );
}