'use client';

import { useState, useEffect } from 'react';
import { Plus, Search, Edit, Trash2, Eye, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Switch } from '@/components/ui/switch';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ResultForm } from '@/components/admin/result-form';
import { supabase, Result, Student, ExamSession } from '@/lib/supabase';
import { generateResultHash, formatResultForHash, verifyOnBlockchain } from '@/lib/utils/web3';

export function ResultManagement() {
  const [results, setResults] = useState<Result[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [sessions, setSessions] = useState<ExamSession[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [selectedResult, setSelectedResult] = useState<Result | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [verifyingId, setVerifyingId] = useState<string | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [resultsData, studentsData, sessionsData] = await Promise.all([
        supabase
          .from('results')
          .select(`
            *,
            students(name, roll_number, registration_number),
            exam_sessions(name, year)
          `)
          .order('created_at', { ascending: false }),
        supabase
          .from('students')
          .select('*')
          .order('name'),
        supabase
          .from('exam_sessions')
          .select('*')
          .order('year', { ascending: false }),
      ]);

      if (resultsData.error) throw resultsData.error;
      if (studentsData.error) throw studentsData.error;
      if (sessionsData.error) throw sessionsData.error;

      setResults(resultsData.data || []);
      setStudents(studentsData.data || []);
      setSessions(sessionsData.data || []);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this result?')) return;

    try {
      const { error } = await supabase
        .from('results')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setResults(results.filter(result => result.id !== id));
    } catch (error) {
      console.error('Error deleting result:', error);
    }
  };

  const handlePublishToggle = async (id: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('results')
        .update({ is_published: !currentStatus })
        .eq('id', id);

      if (error) throw error;

      setResults(results.map(result => 
        result.id === id 
          ? { ...result, is_published: !currentStatus }
          : result
      ));
    } catch (error) {
      console.error('Error updating result:', error);
    }
  };

  const handleVerifyBlockchain = async (resultId: string) => {
    setVerifyingId(resultId);
    
    try {
      // Get result with all related data
      const { data: resultData, error: resultError } = await supabase
        .from('results')
        .select(`
          *,
          students(*),
          result_subjects(*, subjects(*))
        `)
        .eq('id', resultId)
        .single();

      if (resultError) throw resultError;

      // Format result for hashing
      const formattedResult = formatResultForHash(
        resultData,
        resultData.students,
        resultData.result_subjects
      );

      // Generate hash
      const hash = generateResultHash(formattedResult);

      try {
        // Verify on blockchain (mock)
        const { txHash } = await verifyOnBlockchain(hash);

        console.log('Generated transaction hash:', txHash, 'Length:', txHash.length);
        
        // Validate the generated transaction hash
        if (!txHash || !/^0x[a-fA-F0-9]{64}$/.test(txHash)) {
          throw new Error(`Invalid transaction hash generated: ${txHash} (length: ${txHash ? txHash.length : 0})`);
        }

        // Update result with hash and transaction
        const { error: updateError } = await supabase
          .from('results')
          .update({
            result_hash: hash,
            blockchain_tx_hash: txHash,
          })
          .eq('id', resultId);

        if (updateError) throw updateError;

        // Refresh data
        fetchData();
        
        alert('Result verified and stored on blockchain!');
      } catch (blockchainError) {
        console.error('Blockchain verification error:', blockchainError);
        throw new Error(`Blockchain verification failed: ${blockchainError instanceof Error ? blockchainError.message : 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error verifying result:', error);
      alert(`Error verifying result: ${error instanceof Error ? error.message : 'Please try again.'}`);
    } finally {
      setVerifyingId(null);
    }
  };

  const handleDialogClose = () => {
    setIsDialogOpen(false);
    setSelectedResult(null);
    fetchData();
  };

  const filteredResults = results.filter(result => {
    const student = (result as any).students;
    const session = (result as any).exam_sessions;
    
    return (
      student?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student?.roll_number.includes(searchTerm) ||
      student?.registration_number.includes(searchTerm) ||
      session?.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Result Management</h1>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Add Result
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {selectedResult ? 'Edit Result' : 'Add New Result'}
              </DialogTitle>
              {selectedResult && (
                <p className="text-sm text-gray-600">
                  Editing result for {(selectedResult as any).students?.name || 'Unknown Student'}
                </p>
              )}
            </DialogHeader>
            <ResultForm
              result={selectedResult}
              students={students}
              sessions={sessions}
              onSuccess={handleDialogClose}
            />
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Results</CardTitle>
          <CardDescription>
            Manage student exam results and publication status
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search results by student name, roll number, or session..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {filteredResults.length === 0 ? (
            <p className="text-center text-gray-500 py-8">
              No results found. Add your first result to get started.
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Student</TableHead>
                  <TableHead>Roll Number</TableHead>
                  <TableHead>Session</TableHead>
                  <TableHead>GPA</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Published</TableHead>
                  <TableHead>Verified</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredResults.map((result) => {
                  const student = (result as any).students;
                  const session = (result as any).exam_sessions;
                  
                  return (
                    <TableRow key={result.id}>
                      <TableCell className="font-medium">
                        {student?.name || 'Unknown'}
                      </TableCell>
                      <TableCell>{student?.roll_number || 'N/A'}</TableCell>
                      <TableCell>
                        {session?.name} {session?.year}
                      </TableCell>
                      <TableCell>
                        <span className="font-bold text-green-600">
                          {result.gpa.toFixed(2)}
                        </span>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={result.result_status === 'Passed' ? 'default' : 'destructive'}
                          className={
                            result.result_status === 'Passed' 
                              ? 'bg-green-100 text-green-800' 
                              : result.result_status === 'Critical'
                              ? 'bg-yellow-100 text-yellow-800'
                              : 'bg-red-100 text-red-800'
                          }
                        >
                          {result.result_status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Switch
                          onClick={() => {
                            if (confirm(`Are you sure you want to delete the result for ${(result as any).students?.name || 'this student'}? This action cannot be undone.`)) {
                              handleDelete(result.id);
                            }
                          }}
                          onCheckedChange={() => handlePublishToggle(result.id, result.is_published)}
                        />
                      </TableCell>
                      <TableCell>
                        {result.blockchain_tx_hash ? (
                          <Badge variant="outline" className="text-green-600">
                            <Shield className="h-3 w-3 mr-1" />
                            Verified
                          </Badge>
                        ) : (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleVerifyBlockchain(result.id)}
                            disabled={verifyingId === result.id}
                            className="text-blue-600 hover:text-blue-700"
                          >
                            {verifyingId === result.id ? 'Verifying...' : 'Verify'}
                          </Button>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setSelectedResult(result);
                              setIsDialogOpen(true);
                            }}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDelete(result.id)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Alert>
        <Shield className="h-4 w-4" />
        <AlertDescription>
          Use the "Verify" button to generate cryptographic hashes and store results on the blockchain for tamper-proof verification.
        </AlertDescription>
      </Alert>
    </div>
  );
}