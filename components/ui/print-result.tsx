'use client';

import { useReactToPrint } from "react-to-print";
import { useState,useRef } from 'react';
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
  // ✅ Move them here
  const contentRef = useRef<HTMLDivElement>(null);
  const reactToPrintFn = useReactToPrint({
    content: () => contentRef.current,
  });

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
        return 'bg-green-100 text-green-800 border-green-300 print:bg-green-50 print:text-green-900 print:border-green-400';
      case 'A':
        return 'bg-blue-100 text-blue-800 border-blue-300 print:bg-blue-50 print:text-blue-900 print:border-blue-400';
      case 'A-':
        return 'bg-cyan-100 text-cyan-800 border-cyan-300 print:bg-cyan-50 print:text-cyan-900 print:border-cyan-400';
      case 'B':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300 print:bg-yellow-50 print:text-yellow-900 print:border-yellow-400';
      case 'C':
        return 'bg-orange-100 text-orange-800 border-orange-300 print:bg-orange-50 print:text-orange-900 print:border-orange-400';
      case 'D':
        return 'bg-red-100 text-red-800 border-red-300 print:bg-red-50 print:text-red-900 print:border-red-400';
      case 'F':
        return 'bg-red-200 text-red-900 border-red-400 print:bg-red-100 print:text-red-900 print:border-red-500';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300 print:bg-gray-50 print:text-gray-900 print:border-gray-400';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Passed':
        return 'text-green-600 print:text-green-800';
      case 'Failed':
        return 'text-red-600 print:text-red-800';
      case 'Critical':
        return 'text-yellow-600 print:text-yellow-800';
      default:
        return 'text-gray-600 print:text-gray-800';
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Print Button - Hidden in print */}
      <div className="flex justify-end print:hidden no-print">
        <Button onClick={handlePrint} className="gap-2 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-400 hover:to-purple-400 text-white font-bold shadow-lg">
          <Print className="h-4 w-4" />
          Download Result
        </Button>
      </div>

      {/* Print Area */}
      <div ref={contentRef} className="print-area bg-white">
        {/* Header */}
        <div className="print-header border-b-4 border-blue-600 pb-6 mb-8">
          <div className="flex items-center justify-between">
            {/* Logo Section */}
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center shadow-lg">
                <Shield className="h-10 w-10 text-white" />
              </div>
              <div>
                <div className="text-sm text-blue-600 font-semibold uppercase tracking-wide">Government of Bangladesh</div>
                <div className="text-xs text-gray-600 mt-1">Ministry of Education</div>
              </div>
            </div>

            {/* Title Section */}
            <div className="text-center flex-1 mx-8">
              <h1 className="text-3xl font-bold text-gray-800 mb-2">
                {student.education_boards.name}
              </h1>
              <h2 className="text-xl font-semibold text-blue-600 mb-1">
                {student.exam_sessions.name} - {student.exam_sessions.year}
              </h2>
            </div>

            {/* Verification Section */}
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-2 px-3 py-1 bg-green-50 border border-green-200 rounded-full">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <span className="text-xs font-semibold text-green-700">Verified</span>
              </div>
              <div className="flex items-center gap-2 px-3 py-1 bg-blue-50 border border-blue-200 rounded-full">
                <Shield className="h-4 w-4 text-blue-600" />
                <span className="text-xs font-semibold text-blue-700">Secured</span>
              </div>
            </div>
          </div>
        </div>

        <div className="print-content space-y-8">
          {/* Single Row Layout for Student Info, Performance, and Exam Details */}
          <div className="grid grid-cols-3 gap-6">
            {/* Student Information */}
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-lg p-6">
              <h3 className="text-lg font-bold text-blue-800 mb-4 flex items-center gap-2 border-b border-blue-300 pb-2">
                <span className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm">👤</span>
                Student Information
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm font-medium text-gray-600">Name:</span>
                  <span className="text-sm font-bold text-gray-900">{student.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm font-medium text-gray-600">Roll:</span>
                  <span className="text-sm font-bold text-blue-700">{student.roll_number}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm font-medium text-gray-600">Registration:</span>
                  <span className="text-sm font-bold text-blue-700">{student.registration_number}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm font-medium text-gray-600">Father:</span>
                  <span className="text-sm font-semibold text-gray-800">{student.father_name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm font-medium text-gray-600">Mother:</span>
                  <span className="text-sm font-semibold text-gray-800">{student.mother_name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm font-medium text-gray-600">DOB:</span>
                  <span className="text-sm font-semibold text-gray-800">{new Date(student.date_of_birth).toLocaleDateString()}</span>
                </div>
              </div>
            </div>

            {/* Performance Summary */}
            <div className="bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-200 rounded-lg p-6">
              <h3 className="text-lg font-bold text-green-800 mb-4 flex items-center gap-2 border-b border-green-300 pb-2">
                <span className="w-6 h-6 bg-green-600 text-white rounded-full flex items-center justify-center text-sm">📊</span>
                Performance Summary
              </h3>
              <div className="space-y-4">
                {/* Result Status */}
                <div className="text-center">
                  <div className="text-sm font-medium text-gray-600 mb-2">Result Status</div>
                  <div className={`text-2xl font-bold ${getStatusColor(result.result_status)} flex items-center justify-center gap-2`}>
                    <span className="text-3xl">{getResultStatusIcon(result.result_status)}</span>
                    {result.result_status}
                  </div>
                </div>
                
                {/* GPA Display */}
                <div className="text-center bg-white rounded-lg p-4 border border-green-200">
                  <div className="text-sm font-medium text-gray-600 mb-2">Grade Point Average</div>
                  <div className="text-4xl font-bold text-green-600">
                    {result.gpa.toFixed(2)}
                  </div>
                  <div className="text-xs text-gray-500 mt-1">out of 5.00</div>
                </div>
                
                {/* Total Marks */}
                <div className="text-center">
                  <div className="text-sm font-medium text-gray-600 mb-2">Total Marks</div>
                  <div className="text-2xl font-bold text-green-600">
                    {result.total_marks}
                  </div>
                </div>
              </div>
            </div>

            {/* Examination Details */}
            <div className="bg-gradient-to-br from-purple-50 to-violet-50 border-2 border-purple-200 rounded-lg p-6">
              <h3 className="text-lg font-bold text-purple-800 mb-4 flex items-center gap-2 border-b border-purple-300 pb-2">
                <span className="w-6 h-6 bg-purple-600 text-white rounded-full flex items-center justify-center text-sm">🏫</span>
                Examination Details
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm font-medium text-gray-600">Institute:</span>
                  <span className="text-sm font-bold text-gray-900 text-right">{student.institute_name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm font-medium text-gray-600">Board:</span>
                  <span className="text-sm font-bold text-purple-700">{student.education_boards.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm font-medium text-gray-600">Exam Type:</span>
                  <span className="text-sm font-semibold text-gray-800">{student.exam_type}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm font-medium text-gray-600">Session:</span>
                  <span className="text-sm font-bold text-purple-700">{student.exam_sessions.name} - {student.exam_sessions.year}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm font-medium text-gray-600">Generated:</span>
                  <span className="text-sm font-semibold text-gray-800">{new Date().toLocaleDateString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm font-medium text-gray-600">Time:</span>
                  <span className="text-sm font-semibold text-gray-800">{new Date().toLocaleTimeString()}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Subjects Table */}
          <div className="bg-gradient-to-r from-gray-50 to-blue-50 border-2 border-gray-200 rounded-lg p-6">
            <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2 border-b-2 border-gray-300 pb-3">
              <span className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-full flex items-center justify-center">📚</span>
              Subject-wise Performance
            </h3>
            <div className="overflow-hidden rounded-lg border-2 border-gray-300">
              <table className="w-full">
                <thead>
                  <tr className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
                    <th className="px-4 py-3 text-left font-bold text-sm">Subject Code</th>
                    <th className="px-4 py-3 text-left font-bold text-sm">Subject Name</th>
                    <th className="px-4 py-3 text-center font-bold text-sm">Grade</th>
                    <th className="px-4 py-3 text-center font-bold text-sm">Marks</th>
                  </tr>
                </thead>
                <tbody>
                  {subjects.map((subject, index) => (
                    <tr key={subject.id} className={`${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'} border-b border-gray-200 hover:bg-blue-50 transition-colors`}>
                      <td className="px-4 py-3 font-bold text-blue-700 text-sm">
                        {subject.subjects?.code}
                      </td>
                      <td className="px-4 py-3 font-semibold text-gray-900 text-sm">
                        {subject.subjects?.name}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold border ${getGradeColor(subject.grade)}`}>
                          {subject.grade}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center font-bold text-gray-900 text-sm">
                        {subject.marks}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Footer */}
          <div className="border-t-4 border-blue-600 pt-6 mt-8">
            <div className="grid grid-cols-3 gap-8 items-end">
              {/* Left - Certificate Info */}
              <div className="space-y-2">
                <p className="text-sm text-blue-600 font-semibold">Issued by {student.education_boards.name}</p>
                <p className="text-xs text-gray-600">Generated: {new Date().toLocaleDateString()} at {new Date().toLocaleTimeString()}</p>
              </div>
              
              {/* Center - Signatures */}
              <div className="flex justify-around gap-4">
                <div className="text-center">
                  <div className="w-24 h-px bg-gray-800 mb-2 mx-auto"></div>
                  <p className="text-xs font-semibold text-gray-700">Controller of Examinations</p>
                </div>
                <div className="text-center">
                  <div className="w-24 h-px bg-gray-800 mb-2 mx-auto"></div>
                  <p className="text-xs font-semibold text-gray-700">Chairman</p>
                </div>
              </div>
              
              {/* Right - Security Features */}
              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-2 px-3 py-1 bg-green-50 border border-green-300 rounded-full">
                  <CheckCircle className="h-3 w-3 text-green-600" />
                  <span className="text-xs font-semibold text-green-700">Digitally Verified</span>
                </div>
                <div className="flex items-center gap-2 px-3 py-1 bg-blue-50 border border-blue-300 rounded-full">
                  <Shield className="h-3 w-3 text-blue-600" />
                  <span className="text-xs font-semibold text-blue-700">Digitally Secured</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}