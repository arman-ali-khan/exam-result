'use client';

import { useState, useEffect } from 'react';
import { Search, GraduationCap, Shield, Users, Award, CheckCircle, Zap, Globe } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { SearchForm } from '@/components/ui/search-form';
import { ResultCard } from '@/components/ui/result-card';
import { WalletStatus } from '@/components/ui/wallet-status';
import { BlockchainIndicator } from '@/components/ui/blockchain-indicator';
import { supabase, EducationBoard, ExamSession, Student, Result, ResultSubject } from '@/lib/supabase';
import { SearchFormData } from '@/lib/validations';

export default function Home() {
  const [boards, setBoards] = useState<EducationBoard[]>([]);
  const [sessions, setSessions] = useState<ExamSession[]>([]);
  const [searchResult, setSearchResult] = useState<{
    student: Student & {
      education_boards: EducationBoard;
      exam_sessions: ExamSession;
    };
    results: Array<{
      result: Result & {
        exam_sessions: ExamSession;
      };
      subjects: ResultSubject[];
    }>;
  } | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isInitialLoading, setIsInitialLoading] = useState(true);

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    try {
      // Fetch education boards
      const { data: boardsData, error: boardsError } = await supabase
        .from('education_boards')
        .select('*')
        .order('name');

      if (boardsError) throw boardsError;
      setBoards(boardsData || []);

      // Fetch published exam sessions
      const { data: sessionsData, error: sessionsError } = await supabase
        .from('exam_sessions')
        .select('*, education_boards(*)')
        .eq('is_published', true)
        .order('year', { ascending: false });

      if (sessionsError) throw sessionsError;
      setSessions(sessionsData || []);
    } catch (error) {
      console.error('Error fetching initial data:', error);
    } finally {
      setIsInitialLoading(false);
    }
  };

  const handleSearch = async (searchData: SearchFormData) => {
    setIsLoading(true);
    setError(null);
    setSearchResult(null);

    try {
      // Build search query
      let query = supabase
        .from('students')
        .select(`
          *,
          education_boards(*),
          exam_sessions(*)
        `)
        .eq('board_id', searchData.boardId)
        .eq('session_id', searchData.sessionId);

      // Add roll number or registration number filter
      if (searchData.rollNumber) {
        query = query.eq('roll_number', searchData.rollNumber);
      } else if (searchData.registrationNumber) {
        query = query.eq('registration_number', searchData.registrationNumber);
      }

      const { data: studentData, error: studentError } = await query.maybeSingle();

      if (studentError) {
        throw studentError;
      }

      if (!studentData) {
        // Check if there are any students in the database at all
        const { data: anyStudents, error: countError } = await supabase
          .from('students')
          .select('id', { count: 'exact', head: true });

        if (countError) {
          throw new Error('Database connection error. Please try again.');
        }

        if (!anyStudents || anyStudents.length === 0) {
          throw new Error('No student records found.');
        } else {
          throw new Error('No student records found.');
        }
      }

      // Fetch published result for this student
      const { data: resultsData, error: resultsError } = await supabase
        .from('results')
        .select(`
          *,
          exam_sessions(*)
        `)
        .eq('student_id', studentData.id)
        .eq('is_published', true)
        .order('created_at', { ascending: false });

      if (resultsError) {
        throw resultsError;
      }

      if (!resultsData || resultsData.length === 0) {
        throw new Error('No published results found for this student. Please check back later or contact your institution.');
      }

      // Fetch result subjects for all results
      const resultIds = resultsData.map(r => r.id);
      const { data: allSubjectsData, error: subjectsError } = await supabase
        .from('result_subjects')
        .select(`
          *,
          subjects(*)
        `)
        .in('result_id', resultIds)
        .order('subjects(code)');

      if (subjectsError) throw subjectsError;

      // Group subjects by result_id
      const subjectsByResult = (allSubjectsData || []).reduce((acc, subject) => {
        if (!acc[subject.result_id]) {
          acc[subject.result_id] = [];
        }
        acc[subject.result_id].push(subject);
        return acc;
      }, {} as Record<string, ResultSubject[]>);

      // Create results array with their subjects
      const resultsWithSubjects = resultsData.map(result => ({
        result,
        subjects: subjectsByResult[result.id] || []
      }));

      setSearchResult({
        student: studentData,
        results: resultsWithSubjects,
      });
    } catch (error: any) {
      console.error('Search error:', error.message || error);
      setError(error.message || 'An error occurred while searching');
    } finally {
      setIsLoading(false);
    }
  };

  const resetSearch = () => {
    setSearchResult(null);
    setError(null);
  };

  if (isInitialLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center modern-bg">
        <div className="modern-loader"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen modern-bg">

      {/* Header */}
      <header className="glass border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <GraduationCap className="h-8 w-8 text-blue-600" />
              <h1 className="text-2xl font-bold modern-title">
                Education Result Portal
              </h1>
            </div>
            <div className="flex items-center gap-4">
              <BlockchainIndicator />
              <WalletStatus />
              <Button variant="outline" className="modern-button-outline" asChild>
                <a href="/admin">ADMIN ACCESS</a>
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {!searchResult ? (
          <div className="space-y-12">
            {/* Hero Section */}
            <div className="text-center space-y-6 animate-fade-in">
              <h2 className="text-5xl font-bold modern-title">
                Student Result Portal
              </h2>
              <p className="text-xl modern-text max-w-3xl mx-auto leading-relaxed">
                Access your examination results through our secure and verified system.
                All results are digitally verified and securely stored.
              </p>
              <div className="flex justify-center gap-4 flex-wrap">
                <Badge className="modern-badge modern-badge-success">
                  <CheckCircle className="w-4 h-4" />
                  Verified Results
                </Badge>
                <Badge className="modern-badge modern-badge-success">
                  <Shield className="w-4 h-4" />
                  Secure Access
                </Badge>
                <Badge className="modern-badge modern-badge-success">
                  <Zap className="w-4 h-4" />
                  Real-time Data
                </Badge>
              </div>
            </div>

            {/* Search Form */}
            <div className="animate-fade-in">
              <SearchForm
                boards={boards}
                sessions={sessions}
                onSearch={handleSearch}
                isLoading={isLoading}
              />
            </div>

            {/* Error Message */}
            {error && (
              <Card className="modern-card border-red-200 bg-red-50 animate-fade-in">
                <CardContent className="pt-6">
                  <div className="space-y-3">
                    <div className="flex items-center gap-3 text-red-600">
                      <Search className="h-5 w-5" />
                      <p className="font-medium">{error}</p>
                    </div>
                    {error.includes('No student records found in the database') && (
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <h4 className="font-medium text-blue-900 mb-2">Getting Started</h4>
                        <p className="text-sm text-blue-800 mb-3">
                          To use this system, student data needs to be added first. You can:
                        </p>
                        <ul className="text-sm text-blue-800 space-y-1 mb-3">
                          <li>• Contact your system administrator to add student records</li>
                          <li>• Use the Admin Panel to manually add students or upload Excel data</li>
                        </ul>
                        <Button variant="outline" size="sm" asChild className="text-blue-700 border-blue-300 hover:bg-blue-100">
                          <a href="/admin">Go to Admin Panel</a>
                        </Button>
                      </div>
                    )}
                    {error.includes('Please verify your') && (
                      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                        <h4 className="font-medium text-yellow-900 mb-2">Search Tips</h4>
                        <ul className="text-sm text-yellow-800 space-y-1">
                          <li>• Double-check your roll number or registration number</li>
                          <li>• Ensure you've selected the correct education board</li>
                          <li>• Verify the exam session matches your examination year</li>
                          <li>• Contact your institution if you're sure the information is correct</li>
                        </ul>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Features Section */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-16">
              <Card className="modern-card animate-fade-in">
                <CardHeader className="text-center">
                  <Shield className="h-12 w-12 text-blue-600 mx-auto mb-4" />
                  <CardTitle className="modern-subtitle">Secure Verification</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="modern-text text-center">
                    All results undergo digital verification ensuring 
                    <span className="text-blue-600 font-semibold"> 100% authenticity</span> and secure storage
                  </CardDescription>
                </CardContent>
              </Card>
              
              <Card className="modern-card animate-fade-in">
                <CardHeader className="text-center">
                  <Globe className="h-12 w-12 text-green-600 mx-auto mb-4" />
                  <CardTitle className="modern-subtitle">Connected Network</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="modern-text text-center">
                    Connected to all Bangladesh Education Board networks through our
                    <span className="text-green-600 font-semibold"> secure infrastructure</span>
                  </CardDescription>
                </CardContent>
              </Card>
              
              <Card className="modern-card animate-fade-in">
                <CardHeader className="text-center">
                  <Zap className="h-12 w-12 text-yellow-600 mx-auto mb-4" />
                  <CardTitle className="modern-subtitle">Instant Access</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="modern-text text-center">
                    Lightning-fast result retrieval with
                    <span className="text-yellow-600 font-semibold"> real-time synchronization</span> across all systems
                  </CardDescription>
                </CardContent>
              </Card>
            </div>

            {/* Data Visualization */}
            <div className="mt-16 animate-fade-in">
              <Card className="modern-card">
                <CardHeader>
                  <CardTitle className="modern-subtitle text-center">System Status</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    <div className="data-card">
                      <div className="data-value text-blue-600">{boards.length}</div>
                      <div className="data-label">Education Boards</div>
                    </div>
                    <div className="data-card">
                      <div className="data-value text-green-600">{sessions.length}</div>
                      <div className="data-label">Active Sessions</div>
                    </div>
                    <div className="data-card">
                      <div className="data-value text-yellow-600">99.9%</div>
                      <div className="data-label">System Uptime</div>
                    </div>
                    <div className="data-card">
                      <div className="data-value text-green-600">Secure</div>
                      <div className="data-label">Security Status</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Back Button */}
            <Button
              variant="outline"
              onClick={resetSearch}
              className="modern-button-outline gap-2"
            >
              <Search className="h-4 w-4" />
              New Search
            </Button>

            {/* Result Card */}
            <div className="animate-fade-in">
              <div className="space-y-8">
                {searchResult.results.map((resultData, index) => (
                  <div key={resultData.result.id} className="space-y-4">
                    {searchResult.results.length > 1 && (
                      <div className="text-center">
                        <h3 className="text-2xl font-bold modern-title">
                          {resultData.result.exam_sessions?.name} - {resultData.result.exam_sessions?.year}
                        </h3>
                      </div>
                    )}
                    <ResultCard
                      student={searchResult.student}
                      result={resultData.result}
                      subjects={resultData.subjects}
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="glass border-t border-gray-200 py-8 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-4">
            <h3 className="text-lg font-bold modern-title">Education Result Portal</h3>
            <p className="modern-text">
              Powered by secure digital verification and modern technology
            </p>
            <div className="flex justify-center gap-4">
              <Badge className="modern-badge modern-badge-success">
                <Shield className="w-3 h-3" />
                Digitally Secured
              </Badge>
              <Badge className="modern-badge modern-badge-success">
                <Globe className="w-3 h-3" />
                Nationwide Access
              </Badge>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}