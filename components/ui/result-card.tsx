'use client';

import { useState } from 'react';
import { Printer as Print, Shield, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Student, Result, ResultSubject, ExamSession, EducationBoard } from '@/lib/supabase';
import { getBlockchainVerificationLink } from '@/lib/utils/web3';

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

  const handlePrint = () => {
    window.print();
  };

  const handleVerifyBlockchain = async () => {
    if (!result.blockchain_tx_hash) {
      alert('No blockchain transaction hash available for verification');
      return;
    }

    // Validate transaction hash format (should be 64 hexadecimal characters)
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
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case 'Failed':
        return <XCircle className="h-5 w-5 text-red-600" />;
      case 'Critical':
        return <AlertCircle className="h-5 w-5 text-yellow-600" />;
      default:
        return null;
    }
  };

  const getResultStatusColor = (status: string) => {
    switch (status) {
      case 'Passed':
        return 'bg-green-100 text-green-800';
      case 'Failed':
        return 'bg-red-100 text-red-800';
      case 'Critical':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getGradeColor = (grade: string) => {
    switch (grade) {
      case 'A+':
        return 'bg-green-100 text-green-800';
      case 'A':
        return 'bg-blue-100 text-blue-800';
      case 'A-':
        return 'bg-cyan-100 text-cyan-800';
      case 'B':
        return 'bg-yellow-100 text-yellow-800';
      case 'C':
        return 'bg-orange-100 text-orange-800';
      case 'D':
        return 'bg-red-100 text-red-800';
      case 'F':
        return 'bg-red-200 text-red-900';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header with Print Button */}
      <div className="flex justify-between items-center print:hidden">
        <h1 className="text-2xl font-bold text-green-700">Exam Result</h1>
        <div className="flex gap-2">
          {result.blockchain_tx_hash && (
            <Button
              onClick={handleVerifyBlockchain}
              disabled={isVerifying}
              variant="outline"
              className="gap-2"
            >
              <Shield className="h-4 w-4" />
              Verify on Blockchain
            </Button>
          )}
          <Button onClick={handlePrint} className="gap-2">
            <Print className="h-4 w-4" />
            Print Result
          </Button>
        </div>
      </div>

      {/* Result Card */}
      <Card className="print:shadow-none print:border-0">
        <CardHeader className="bg-gradient-to-r from-green-600 to-green-700 text-white print:bg-white print:text-black">
          <CardTitle className="text-center text-2xl font-bold">
            {student.education_boards.name}
          </CardTitle>
          <p className="text-center text-lg opacity-90 print:opacity-100">
            {student.exam_sessions.name} - {student.exam_sessions.year}
          </p>
        </CardHeader>
        <CardContent className="p-6">
          {/* Student Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold text-gray-600 mb-2">Student Information</h3>
                <div className="space-y-2">
                  <p><span className="font-medium">Name:</span> {student.name}</p>
                  <p><span className="font-medium">Roll Number:</span> {student.roll_number}</p>
                  <p><span className="font-medium">Registration:</span> {student.registration_number}</p>
                  <p><span className="font-medium">Father's Name:</span> {student.father_name}</p>
                  <p><span className="font-medium">Mother's Name:</span> {student.mother_name}</p>
                  <p><span className="font-medium">Date of Birth:</span> {new Date(student.date_of_birth).toLocaleDateString()}</p>
                </div>
              </div>
            </div>
            
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold text-gray-600 mb-2">Exam Information</h3>
                <div className="space-y-2">
                  <p><span className="font-medium">Institute:</span> {student.institute_name}</p>
                  <p><span className="font-medium">Board:</span> {student.education_boards.name}</p>
                  <p><span className="font-medium">Exam Type:</span> {student.exam_type}</p>
                  <div className="flex items-center gap-2">
                    <span className="font-medium">Result:</span>
                    <Badge className={getResultStatusColor(result.result_status)}>
                      <span className="flex items-center gap-1">
                        {getResultStatusIcon(result.result_status)}
                        {result.result_status}
                      </span>
                    </Badge>
                  </div>
                  <p><span className="font-medium">GPA:</span> <span className="text-2xl font-bold text-green-600">{result.gpa.toFixed(2)}</span></p>
                </div>
              </div>
            </div>
          </div>

          <Separator className="my-6" />

          {/* Subjects Table */}
          <div>
            <h3 className="font-semibold text-gray-600 mb-4">Subject-wise Results</h3>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-24">Subject Code</TableHead>
                  <TableHead>Subject Name</TableHead>
                  <TableHead className="text-center w-24">Grade</TableHead>
                  <TableHead className="text-center w-24">Marks</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {subjects.map((subject) => (
                  <TableRow key={subject.id}>
                    <TableCell className="font-medium">{subject.subjects?.code}</TableCell>
                    <TableCell>{subject.subjects?.name}</TableCell>
                    <TableCell className="text-center">
                      <Badge className={getGradeColor(subject.grade)}>
                        {subject.grade}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-center font-medium">{subject.marks}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {/* Blockchain Verification */}
          {result.result_hash && (
            <div className="mt-6">
              <Alert>
                <Shield className="h-4 w-4" />
                <AlertDescription>
                  This result is cryptographically verified. Hash: {result.result_hash.substring(0, 16)}...
                  {result.blockchain_tx_hash && (
                    <span className="ml-2">
                      <a 
                        href="#"
                        onClick={(e) => {
                          e.preventDefault();
                          try {
                            // Validate transaction hash format before creating link
                            if (!result.blockchain_tx_hash) {
                              throw new Error('No transaction hash available');
                            }
                            
                            const isValidHash = /^0x[a-fA-F0-9]{64}$/.test(result.blockchain_tx_hash) || 
                                               /^[a-fA-F0-9]{64}$/.test(result.blockchain_tx_hash);
                            
                            if (!isValidHash || result.blockchain_tx_hash.replace('0x', '').length !== 64) {
                              throw new Error('Invalid transaction hash format - hash appears corrupted');
                            }
                            
                            const link = getBlockchainVerificationLink(result.blockchain_tx_hash);
                            window.open(link, '_blank');
                          } catch (error) {
                            alert(`Error: ${error instanceof Error ? error.message : 'Invalid transaction hash'}. Please contact an administrator to re-verify this result.`);
                          }
                        }}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline"
                      >
                        View on Blockchain ↗
                      </a>
                    </span>
                  )}
                </AlertDescription>
              </Alert>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}