'use client';

import { useState, useEffect } from 'react';
import { Search, GraduationCap, Shield, Users, Award } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { SearchForm } from '@/components/ui/search-form';
import { ResultCard } from '@/components/ui/result-card';
import { supabase, EducationBoard, ExamSession, Student, Result, ResultSubject } from '@/lib/supabase';
import { SearchFormData } from '@/lib/validations';
import { generateResultHash, formatResultForHash } from '@/lib/utils/web3';

export default function Home() {
  const [boards, setBoards] = useState<EducationBoard[]>([]);
  const [sessions, setSessions] = useState<ExamSession[]>([]);
  const [searchResult, setSearchResult] = useState<{
    student: Student & {
      education_boards: EducationBoard;
      exam_sessions: ExamSession;
    };
    result: Result;
    subjects: ResultSubject[];
  } | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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

      const { data: studentData, error: studentError } = await query.single();

      if (studentError) {
        if (studentError.code === 'PGRST116') {
          throw new Error('No result found with the provided information');
        }
        throw studentError;
      }

      // Fetch published result for this student
      const { data: resultData, error: resultError } = await supabase
        .from('results')
        .select('*')
        .eq('student_id', studentData.id)
        .eq('session_id', searchData.sessionId)
        .eq('is_published', true)
        .single();

      if (resultError) {
        if (resultError.code === 'PGRST116') {
          throw new Error('Result not yet published for this student');
        }
        throw resultError;
      }

      // Fetch result subjects
      const { data: subjectsData, error: subjectsError } = await supabase
        .from('result_subjects')
        .select(`
          *,
          subjects(*)
        `)
        .eq('result_id', resultData.id)
        .order('subjects(code)');

      if (subjectsError) throw subjectsError;

      setSearchResult({
        student: studentData,
        result: resultData,
        subjects: subjectsData || [],
      });
    } catch (error: any) {
      console.error('Search error:', error);
      setError(error.message || 'An error occurred while searching');
    } finally {
      setIsLoading(false);
    }
  };

  const resetSearch = () => {
    setSearchResult(null);
    setError(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-green-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-2">
              <GraduationCap className="h-8 w-8 text-green-600" />
              <h1 className="text-2xl font-bold text-green-700">
                Bangladesh Result Portal
              </h1>
            </div>
            <Button variant="outline" asChild>
              <a href="/admin">Admin Login</a>
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {!searchResult ? (
          <div className="space-y-12">
            {/* Hero Section */}
            <div className="text-center space-y-4">
              <h2 className="text-4xl font-bold text-gray-900">
                Find Your Exam Results
              </h2>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                Search for your SSC, HSC, JSC, or other exam results from all Bangladesh Education Boards
              </p>
            </div>

            {/* Search Form */}
            <SearchForm
              boards={boards}
              sessions={sessions}
              onSearch={handleSearch}
              isLoading={isLoading}
            />

            {/* Error Message */}
            {error && (
              <Card className="border-red-200 bg-red-50">
                <CardContent className="pt-6">
                  <div className="flex items-center gap-2 text-red-700">
                    <Search className="h-5 w-5" />
                    <p className="font-medium">{error}</p>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Features Section */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
              <Card className="text-center">
                <CardHeader>
                  <Shield className="h-12 w-12 mx-auto text-green-600" />
                  <CardTitle>Verified Results</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription>
                    All results are cryptographically verified for authenticity
                  </CardDescription>
                </CardContent>
              </Card>
              
              <Card className="text-center">
                <CardHeader>
                  <Users className="h-12 w-12 mx-auto text-green-600" />
                  <CardTitle>All Boards</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription>
                    Results from all Bangladesh Education Boards in one place
                  </CardDescription>
                </CardContent>
              </Card>
              
              <Card className="text-center">
                <CardHeader>
                  <Award className="h-12 w-12 mx-auto text-green-600" />
                  <CardTitle>Instant Access</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription>
                    Get your results instantly with roll number or registration
                  </CardDescription>
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
              className="gap-2"
            >
              <Search className="h-4 w-4" />
              Search Again
            </Button>

            {/* Result Card */}
            <ResultCard
              student={searchResult.student}
              result={searchResult.result}
              subjects={searchResult.subjects}
            />
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-green-700 text-white py-8 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <p className="text-lg font-semibold">Bangladesh Result Portal</p>
            <p className="text-green-100 mt-2">
              Providing authentic and verified exam results for all Bangladesh Education Boards
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}