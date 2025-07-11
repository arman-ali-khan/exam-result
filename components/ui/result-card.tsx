'use client';

import { useState } from 'react';
import { Printer as Print, Shield, CheckCircle, XCircle, AlertCircle, Download, Eye, Cpu, Zap } from 'lucide-react';
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
          <h1 className="text-3xl font-bold cyber-title glitch" data-text="NEURAL RESULT MATRIX">
            NEURAL RESULT MATRIX
          </h1>
          <p className="cyber-text mt-2">Quantum-verified examination results</p>
        </div>
        <div className="flex gap-3">
          {result.blockchain_tx_hash && (
            <Button
              onClick={handleVerifyBlockchain}
              disabled={isVerifying}
              variant="outline"
              className="neon-border hover:neon-glow transition-all duration-300 gap-2"
            >
              <Shield className="h-4 w-4" />
              {isVerifying ? 'VERIFYING...' : 'BLOCKCHAIN VERIFY'}
            </Button>
          )}
          <Button 
            onClick={handlePrint} 
            className="bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-400 hover:to-purple-400 text-black font-bold gap-2"
          >
            <Print className="h-4 w-4" />
            DOWNLOAD RESULT
          </Button>
        </div>
      </div>

      {/* Main Result Card */}
      <Card className="cyber-card metallic-gradient print:shadow-none print:border-0">
        <CardHeader className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/20 via-purple-500/20 to-cyan-500/20" />
          <div className="relative z-10 text-center">
            <CardTitle className="text-4xl font-bold cyber-title mb-2">
              {student.education_boards.name}
            </CardTitle>
            <p className="text-xl cyber-subtitle text-cyan-400">
              {student.exam_sessions.name} - {student.exam_sessions.year}
            </p>
            <div className="flex justify-center gap-4 mt-4">
              <Badge className="blockchain-indicator">
                <Cpu className="w-3 h-3" />
                QUANTUM VERIFIED
              </Badge>
              <Badge className="blockchain-indicator">
                <Shield className="w-3 h-3" />
                BLOCKCHAIN SECURED
              </Badge>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="p-8">
          {/* Student Information Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            {/* Student Details */}
            <Card className="cyber-card">
              <CardHeader>
                <CardTitle className="cyber-subtitle text-cyan-400 flex items-center gap-2">
                  <Eye className="w-5 h-5" />
                  STUDENT PROFILE
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="cyber-text text-sm opacity-70">NAME</div>
                    <div className="font-bold text-cyan-400 font-mono">{student.name}</div>
                  </div>
                  <div>
                    <div className="cyber-text text-sm opacity-70">ROLL</div>
                    <div className="font-bold text-purple-400 font-mono">{student.roll_number}</div>
                  </div>
                  <div>
                    <div className="cyber-text text-sm opacity-70">REGISTRATION</div>
                    <div className="font-bold text-cyan-400 font-mono">{student.registration_number}</div>
                  </div>
                  <div>
                    <div className="cyber-text text-sm opacity-70">EXAM TYPE</div>
                    <div className="font-bold text-purple-400">{student.exam_type}</div>
                  </div>
                </div>
                <Separator className="bg-cyan-500/30" />
                <div className="space-y-2">
                  <div>
                    <div className="cyber-text text-sm opacity-70">FATHER'S NAME</div>
                    <div className="cyber-text">{student.father_name}</div>
                  </div>
                  <div>
                    <div className="cyber-text text-sm opacity-70">MOTHER'S NAME</div>
                    <div className="cyber-text">{student.mother_name}</div>
                  </div>
                  <div>
                    <div className="cyber-text text-sm opacity-70">INSTITUTE</div>
                    <div className="cyber-text">{student.institute_name}</div>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            {/* Result Summary */}
            <Card className="cyber-card">
              <CardHeader>
                <CardTitle className="cyber-subtitle text-purple-400 flex items-center gap-2">
                  <Zap className="w-5 h-5" />
                  RESULT ANALYSIS
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Status */}
                <div className="text-center">
                  <div className="cyber-text text-sm opacity-70 mb-2">RESULT STATUS</div>
                  <div className={`flex items-center justify-center gap-2 text-2xl font-bold ${getResultStatusClass(result.result_status)}`}>
                    {getResultStatusIcon(result.result_status)}
                    {result.result_status}
                  </div>
                </div>
                
                <Separator className="bg-purple-500/30" />
                
                {/* GPA Display */}
                <div className="text-center">
                  <div className="cyber-text text-sm opacity-70 mb-2">GRADE POINT AVERAGE</div>
                  <div className="text-6xl font-bold cyber-title bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
                    {result.gpa.toFixed(2)}
                  </div>
                  <div className="cyber-text text-sm mt-2">OUT OF 5.00</div>
                </div>
                
                <Separator className="bg-purple-500/30" />
                
                {/* Total Marks */}
                <div className="text-center">
                  <div className="cyber-text text-sm opacity-70 mb-2">TOTAL MARKS</div>
                  <div className="text-3xl font-bold text-yellow-400 font-mono">
                    {result.total_marks}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Subjects Table */}
          <Card className="cyber-card">
            <CardHeader>
              <CardTitle className="cyber-subtitle text-cyan-400 text-xl">
                SUBJECT PERFORMANCE MATRIX
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="border-cyan-500/30">
                      <TableHead className="cyber-subtitle text-cyan-400">CODE</TableHead>
                      <TableHead className="cyber-subtitle text-cyan-400">SUBJECT</TableHead>
                      <TableHead className="cyber-subtitle text-cyan-400 text-center">GRADE</TableHead>
                      <TableHead className="cyber-subtitle text-cyan-400 text-center">MARKS</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {subjects.map((subject, index) => (
                      <TableRow 
                        key={subject.id} 
                        className="border-cyan-500/20 hover:bg-cyan-500/5 transition-colors"
                        style={{ animationDelay: `${index * 0.1}s` }}
                      >
                        <TableCell className="font-mono text-purple-400 font-bold">
                          {subject.subjects?.code}
                        </TableCell>
                        <TableCell className="cyber-text font-medium">
                          {subject.subjects?.name}
                        </TableCell>
                        <TableCell className="text-center">
                          <Badge className={`grade-badge ${getGradeClass(subject.grade)}`}>
                            {subject.grade}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-center font-mono font-bold text-cyan-400">
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
            <Alert className="cyber-card border-cyan-500/50 bg-cyan-500/10">
              <Shield className="h-5 w-5 text-cyan-400" />
              <AlertDescription>
                <div className="space-y-3">
                  <div className="font-bold text-cyan-400 cyber-subtitle">
                    QUANTUM CRYPTOGRAPHIC VERIFICATION
                  </div>
                  <div className="space-y-2 cyber-text text-sm">
                    <div>
                      <span className="text-cyan-400 font-mono">RESULT HASH:</span>
                      <div className="font-mono text-xs break-all mt-1 p-2 bg-black/50 rounded border border-cyan-500/30">
                        {result.result_hash}
                      </div>
                    </div>
                    {result.blockchain_tx_hash && (
                      <div>
                        <span className="text-purple-400 font-mono">BLOCKCHAIN TX:</span>
                        <button 
                          onClick={handleVerifyBlockchain}
                          className="font-mono text-xs break-all mt-1 p-2 bg-black/50 rounded border border-purple-500/30 hover:border-purple-400 transition-colors cursor-pointer w-full text-left"
                        >
                          {result.blockchain_tx_hash}
                        </button>
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-2 text-xs cyber-text">
                    <Cpu className="w-4 h-4 text-cyan-400" />
                    <span>This result is cryptographically verified and immutably stored on the blockchain</span>
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