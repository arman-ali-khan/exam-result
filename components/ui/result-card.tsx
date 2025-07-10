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
        return 'bg-green-900/50 text-green-400 border-green-400';
      case 'Failed':
        return 'bg-red-900/50 text-red-400 border-red-400';
      case 'Critical':
        return 'bg-yellow-900/50 text-yellow-400 border-yellow-400';
      default:
        return 'bg-gray-900/50 text-gray-400 border-gray-400';
    }
  };

  const getGradeColor = (grade: string) => {
    switch (grade) {
      case 'A+':
        return 'bg-green-900/50 text-green-400 border-green-400';
      case 'A':
        return 'bg-blue-900/50 text-blue-400 border-blue-400';
      case 'A-':
        return 'bg-cyan-900/50 text-cyan-400 border-cyan-400';
      case 'B':
        return 'bg-yellow-900/50 text-yellow-400 border-yellow-400';
      case 'C':
        return 'bg-orange-900/50 text-orange-400 border-orange-400';
      case 'D':
        return 'bg-red-900/50 text-red-400 border-red-400';
      case 'F':
        return 'bg-red-900/70 text-red-300 border-red-300';
      default:
        return 'bg-gray-900/50 text-gray-400 border-gray-400';
    }
  };

  if (showPrintView) {
    return <PrintResult student={student} result={result} subjects={subjects} />;
  }

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
      <Card className="print:shadow-none print:border-0 bg-black border-2 border-cyan-400 shadow-2xl shadow-cyan-400/20 relative overflow-hidden">
        {/* Cyberpunk background effects */}
        <div className="absolute inset-0 bg-gradient-to-br from-purple-900/20 via-black to-cyan-900/20 pointer-events-none" />
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-cyan-400 to-transparent animate-pulse" />
        <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-purple-400 to-transparent animate-pulse" />
        
        <CardHeader className="bg-gradient-to-r from-purple-900 via-black to-cyan-900 text-cyan-100 print:bg-white print:text-black relative z-10 border-b border-cyan-400/30">
          {/* Glitch effect overlay */}
          <div className="absolute inset-0 bg-gradient-to-r from-cyan-400/10 to-purple-400/10 animate-pulse" />
          <CardTitle className="text-center text-2xl font-bold">
            {student.education_boards.name}
          </CardTitle>
          <p className="text-center text-lg text-cyan-300 font-mono print:opacity-100 tracking-wider">
            {student.exam_sessions.name} - {student.exam_sessions.year}
          </p>
          {/* Cyberpunk decorative elements */}
          <div className="absolute top-2 right-2 w-3 h-3 bg-cyan-400 rounded-full animate-ping" />
          <div className="absolute bottom-2 left-2 w-2 h-2 bg-purple-400 rounded-full animate-pulse" />
        </CardHeader>
        <CardContent className="p-6 bg-black/90 text-cyan-100 relative z-10">
          {/* Matrix-style background pattern */}
          <div className="absolute inset-0 opacity-5 bg-[url('data:image/svg+xml,%3Csvg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="none" fill-rule="evenodd"%3E%3Cg fill="%2300ffff" fill-opacity="0.1"%3E%3Cpath d="M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] pointer-events-none" />
          
          {/* Student Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div className="space-y-4">
              <div>
                <h3 className="font-bold text-cyan-400 mb-4 text-lg tracking-wider border-b border-cyan-400/30 pb-2 font-mono">
                  STUDENT_DATA.exe
                </h3>
                <div className="space-y-3">
                  <p className="font-mono text-sm"><span className="text-purple-400 font-bold">&gt; NAME:</span> <span className="text-cyan-300">{student.name}</span></p>
                  <p className="font-mono text-sm"><span className="text-purple-400 font-bold">&gt; ROLL_ID:</span> <span className="text-green-400">{student.roll_number}</span></p>
                  <p className="font-mono text-sm"><span className="text-purple-400 font-bold">&gt; REG_NUM:</span> <span className="text-green-400">{student.registration_number}</span></p>
                  <p className="font-mono text-sm"><span className="text-purple-400 font-bold">&gt; FATHER:</span> <span className="text-cyan-300">{student.father_name}</span></p>
                  <p className="font-mono text-sm"><span className="text-purple-400 font-bold">&gt; MOTHER:</span> <span className="text-cyan-300">{student.mother_name}</span></p>
                  <p className="font-mono text-sm"><span className="text-purple-400 font-bold">&gt; DOB:</span> <span className="text-yellow-400">{new Date(student.date_of_birth).toLocaleDateString()}</span></p>
                </div>
              </div>
            </div>
            
            <div className="space-y-4">
              <div>
                <h3 className="font-bold text-cyan-400 mb-4 text-lg tracking-wider border-b border-cyan-400/30 pb-2 font-mono">
                  EXAM_INFO.sys
                </h3>
                <div className="space-y-3">
                  <p className="font-mono text-sm"><span className="text-purple-400 font-bold">&gt; INSTITUTE:</span> <span className="text-cyan-300">{student.institute_name}</span></p>
                  <p className="font-mono text-sm"><span className="text-purple-400 font-bold">&gt; BOARD:</span> <span className="text-cyan-300">{student.education_boards.name}</span></p>
                  <p className="font-mono text-sm"><span className="text-purple-400 font-bold">&gt; TYPE:</span> <span className="text-yellow-400">{student.exam_type}</span></p>
                  <div className="flex items-center gap-2">
                    <span className="text-purple-400 font-bold font-mono text-sm">&gt; STATUS:</span>
                    <Badge className={`${getResultStatusColor(result.result_status)} border border-current shadow-lg shadow-current/30`}>
                      <span className="flex items-center gap-1">
                        {getResultStatusIcon(result.result_status)}
                        {result.result_status}
                      </span>
                    </Badge>
                  </div>
                  <div className="bg-gradient-to-r from-purple-900/50 to-cyan-900/50 p-4 rounded border border-cyan-400/30 mt-4">
                    <p className="font-mono text-sm"><span className="text-purple-400 font-bold">&gt; GPA:</span> 
                      <span className="text-4xl font-bold text-transparent bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text ml-2 animate-pulse">
                        {result.gpa.toFixed(2)}
                      </span>
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="my-6 h-px bg-gradient-to-r from-transparent via-cyan-400 to-transparent" />

          {/* Subjects Table */}
          <div>
            <h3 className="font-bold text-cyan-400 mb-6 text-lg tracking-wider font-mono flex items-center gap-2">
              <span className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse"></span>
              SUBJECT_MATRIX.db
              <span className="w-2 h-2 bg-purple-400 rounded-full animate-pulse"></span>
            </h3>
            <div className="border border-cyan-400/30 rounded-lg overflow-hidden bg-black/50">
            <Table className="font-mono">
              <TableHeader>
                <TableRow className="border-b border-cyan-400/30 bg-gradient-to-r from-purple-900/30 to-cyan-900/30">
                  <TableHead className="w-24 text-purple-400 font-bold">CODE</TableHead>
                  <TableHead className="text-purple-400 font-bold">SUBJECT_NAME</TableHead>
                  <TableHead className="text-center w-24 text-purple-400 font-bold">GRADE</TableHead>
                  <TableHead className="text-center w-24 text-purple-400 font-bold">MARKS</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {subjects.map((subject) => (
                  <TableRow key={subject.id} className="border-b border-cyan-400/20 hover:bg-cyan-400/5 transition-colors">
                    <TableCell className="font-bold text-green-400">{subject.subjects?.code}</TableCell>
                    <TableCell className="text-cyan-300">{subject.subjects?.name}</TableCell>
                    <TableCell className="text-center">
                      <Badge className={`${getGradeColor(subject.grade)} border border-current shadow-lg shadow-current/30 font-bold`}>
                        {subject.grade}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-center font-bold text-yellow-400">{subject.marks}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            </div>
          </div>

          {/* Blockchain Verification */}
          {result.result_hash && (
            <div className="mt-8">
              <Alert className="bg-gradient-to-r from-purple-900/50 to-cyan-900/50 border-2 border-cyan-400/50 shadow-lg shadow-cyan-400/20">
                <Shield className="h-5 w-5 text-cyan-400 animate-pulse" />
                <AlertDescription>
                  <div className="font-mono text-cyan-300">
                    <div className="text-purple-400 font-bold mb-2">[BLOCKCHAIN_VERIFIED]</div>
                    <div className="text-sm">HASH: <span className="text-green-400 break-all">{result.result_hash.substring(0, 16)}...</span></div>
                  {result.blockchain_tx_hash && (
                    <div className="mt-2">
                      <span className="text-purple-400">TX_HASH: </span>
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
                        className="text-cyan-400 hover:text-cyan-300 underline font-bold animate-pulse"
                      >
                        [ACCESS_BLOCKCHAIN] ↗
                      </a>
                    </div>
                  )}
                  </div>
                </AlertDescription>
              </Alert>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}