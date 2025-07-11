'use client';

import { useState } from 'react';
import { Printer as Print, Shield, CheckCircle, XCircle, AlertCircle, Download, Eye, User, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Student, Result, ResultSubject, ExamSession, EducationBoard } from '@/lib/supabase';
import { getBlockchainVerificationLink } from '@/lib/utils/web3';
import { PrintResult } from '@/components/ui/print-result';

interface ResultCardProps {
  student: Student & {
    education_boards: EducationBoard;
    exam_sessions: ExamSession;
  };
  result: Result;
  subjects: ResultSubject[];
}

export function ResultCard({ student, result, subjects }: ResultCardProps) {
  const [isVerifying, setIsVerifying] = useState(false);
  const [showPrintView, setShowPrintView] = useState(false);

  const handlePrint = () => {
    setShowPrintView(true);
    setTimeout(() => {
      window.print();
      setShowPrintView(false);
    }, 100);
  };

  const handleVerifyBlockchain = async () => {
    if (!result.blockchain_tx_hash) {
      alert('No blockchain transaction hash available for verification');
      return;
    }

    const isValidHash = /^0x[a-fA-F0-9]{64}$/.test(result.blockchain_tx_hash) || 
                       /^[a-fA-F0-9]{64}$/.test(result.blockchain_tx_hash);
    
    if (!isValidHash || result.blockchain_tx_hash.replace('0x', '').length !== 64) {
      alert(`Invalid blockchain transaction hash format. The stored hash appears to be corrupted (${result.blockchain_tx_hash.length} characters instead of 64). Please contact an administrator to re-verify this result.`);
      return;
    }
    
    setIsVerifying(true);
    try {
      const verificationLink = getBlockchainVerificationLink(result.blockchain_tx_hash);
      window.open(verificationLink, '_blank');
    } catch (error) {
      console.error('Error verifying blockchain:', error);
      alert(`Error: ${error instanceof Error ? error.message : 'Invalid transaction hash'}`);
    } finally {
      setIsVerifying(false);
    }
  };

  const getResultStatusIcon = (status: string) => {
    switch (status) {
      case 'Passed':
        return <CheckCircle className="h-5 w-5 text-cyan-400" />;
      case 'Failed':
        return <XCircle className="h-5 w-5 text-red-400" />;
      case 'Critical':
        return <AlertCircle className="h-5 w-5 text-yellow-400" />;
      default:
        return null;
    }
  };

  const getResultStatusClass = (status: string) => {
    switch (status) {
      case 'Passed':
        return 'status-passed';
      case 'Failed':
        return 'status-failed';
      case 'Critical':
        return 'status-critical';
      default:
        return '';
    }
  };

  const getGradeClass = (grade: string) => {
    switch (grade) {
      case 'A+':
        return 'grade-a-plus';
      case 'A':
        return 'grade-a';
      case 'A-':
        return 'grade-a';
      case 'B':
        return 'grade-b';
      case 'C':
        return 'grade-c';
      case 'D':
      case 'F':
        return 'grade-d';
      default:
        return 'grade-c';
    }
  };

  if (showPrintView) {
    return <PrintResult student={student} result={result} subjects={subjects} />;
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Header with Actions */}
      <div className="flex justify-between items-center print:hidden">
        <div>
          <h1 className="text-3xl font-bold modern-title">
            Examination Result
          </h1>
          <p className="modern-text mt-2">Official examination result certificate</p>
        </div>
        <div className="flex gap-3">
          {result.blockchain_tx_hash && (
            <Button
              onClick={handleVerifyBlockchain}
              disabled={isVerifying}
              variant="outline"
              className="modern-button-outline gap-2"
            >
              <Shield className="h-4 w-4" />
              {isVerifying ? 'Verifying...' : 'Verify Certificate'}
            </Button>
          )}
          <Button 
            onClick={handlePrint} 
            className="modern-button gap-2"
          >
            <Print className="h-4 w-4" />
            Download Result
          </Button>
        </div>
      </div>

      {/* Main Result Card */}
      <Card className="modern-card print:shadow-none print:border-0">
        <CardHeader className="text-center bg-gradient-to-r from-blue-50 to-indigo-50">
            <CardTitle className="text-4xl font-bold modern-title mb-2">
              {student.education_boards.name}
            </CardTitle>
            <p className="text-xl modern-subtitle text-blue-600">
              {student.exam_sessions.name} - {student.exam_sessions.year}
            </p>
            <div className="flex justify-center gap-4 mt-4">
              <Badge className="modern-badge modern-badge-success">
                <CheckCircle className="w-3 h-3" />
                Verified Result
              </Badge>
              <Badge className="modern-badge modern-badge-success">
                <Shield className="w-3 h-3" />
                Digitally Secured
              </Badge>
            </div>
        </CardHeader>
        
        <CardContent className="p-8">
          {/* Student Information Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            {/* Student Details */}
            <Card className="modern-card">
              <CardHeader>
                <CardTitle className="modern-subtitle text-blue-600 flex items-center gap-2">
                  <User className="w-5 h-5" />
                  Student Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="modern-text text-sm font-medium">Name</div>
                    <div className="font-semibold text-gray-900">{student.name}</div>
                  </div>
                  <div>
                    <div className="modern-text text-sm font-medium">Roll Number</div>
                    <div className="font-semibold text-gray-900">{student.roll_number}</div>
                  </div>
                  <div>
                    <div className="modern-text text-sm font-medium">Registration</div>
                    <div className="font-semibold text-gray-900">{student.registration_number}</div>
                  </div>
                  <div>
                    <div className="modern-text text-sm font-medium">Exam Type</div>
                    <div className="font-semibold text-gray-900">{student.exam_type}</div>
                  </div>
                </div>
                <Separator />
                <div className="space-y-2">
                  <div>
                    <div className="modern-text text-sm font-medium">Father's Name</div>
                    <div className="text-gray-900">{student.father_name}</div>
                  </div>
                  <div>
                    <div className="modern-text text-sm font-medium">Mother's Name</div>
                    <div className="text-gray-900">{student.mother_name}</div>
                  </div>
                  <div>
                    <div className="modern-text text-sm font-medium">Institute</div>
                    <div className="text-gray-900">{student.institute_name}</div>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            {/* Result Summary */}
            <Card className="modern-card">
              <CardHeader>
                <CardTitle className="modern-subtitle text-green-600 flex items-center gap-2">
                  <FileText className="w-5 h-5" />
                  Result Summary
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Status */}
                <div className="text-center">
                  <div className="modern-text text-sm font-medium mb-2">Result Status</div>
                  <div className={`flex items-center justify-center gap-2 text-2xl font-bold ${getResultStatusClass(result.result_status)}`}>
                    {getResultStatusIcon(result.result_status)}
                    {result.result_status}
                  </div>
                </div>
                
                <Separator />
                
                {/* GPA Display */}
                <div className="text-center">
                  <div className="modern-text text-sm font-medium mb-2">Grade Point Average</div>
                  <div className="text-6xl font-bold text-blue-600">
                    {result.gpa.toFixed(2)}
                  </div>
                  <div className="modern-text text-sm mt-2">out of 5.00</div>
                </div>
                
                <Separator />
                
                {/* Total Marks */}
                <div className="text-center">
                  <div className="modern-text text-sm font-medium mb-2">Total Marks</div>
                  <div className="text-3xl font-bold text-green-600">
                    {result.total_marks}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Subjects Table */}
          <Card className="modern-card">
            <CardHeader>
              <CardTitle className="modern-subtitle text-blue-600 text-xl">
                Subject-wise Performance
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table className="modern-table">
                  <TableHeader>
                    <TableRow>
                      <TableHead className="modern-subtitle">Code</TableHead>
                      <TableHead className="modern-subtitle">Subject</TableHead>
                      <TableHead className="modern-subtitle text-center">Grade</TableHead>
                      <TableHead className="modern-subtitle text-center">Marks</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {subjects.map((subject, index) => (
                      <TableRow 
                        key={subject.id} 
                        className="hover:bg-gray-50 transition-colors"
                      >
                        <TableCell className="font-mono text-blue-600 font-semibold">
                          {subject.subjects?.code}
                        </TableCell>
                        <TableCell className="text-gray-900 font-medium">
                          {subject.subjects?.name}
                        </TableCell>
                        <TableCell className="text-center">
                          <Badge className={`grade-badge ${getGradeClass(subject.grade)}`}>
                            {subject.grade}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-center font-mono font-semibold text-gray-900">
                          {subject.marks}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>

          {/* Blockchain Verification */}
          {result.result_hash && (
            <Alert className="modern-card border-blue-200 bg-blue-50">
              <Shield className="h-5 w-5 text-blue-600" />
              <AlertDescription>
                <div className="space-y-3">
                  <div className="font-bold text-blue-600 modern-subtitle">
                    Digital Verification
                  </div>
                  <div className="space-y-2 modern-text text-sm">
                    <div>
                      <span className="text-blue-600 font-mono">Result Hash:</span>
                      <div className="font-mono text-xs break-all mt-1 p-2 bg-gray-100 rounded border">
                        {result.result_hash}
                      </div>
                    </div>
                    {result.blockchain_tx_hash && (
                      <div>
                        <span className="text-green-600 font-mono">Verification ID:</span>
                        <button 
                          onClick={handleVerifyBlockchain}
                          className="font-mono text-xs break-all mt-1 p-2 bg-gray-100 rounded border hover:border-gray-300 transition-colors cursor-pointer w-full text-left"
                        >
                          {result.blockchain_tx_hash}
                        </button>
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-2 text-xs modern-text">
                    <Shield className="w-4 h-4 text-blue-600" />
                    <span>This result is digitally verified and securely stored</span>
                  </div>
                </div>
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>
    </div>
  );
}