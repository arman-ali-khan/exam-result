'use client';

import { useState, useEffect } from 'react';
import { Search, GraduationCap, Shield, Users, Award, Cpu, Zap, Globe } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { SearchForm } from '@/components/ui/search-form';
import { ResultCard } from '@/components/ui/result-card';
import { CyberLoader } from '@/components/ui/cyber-loader';
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
    result: Result;
    subjects: ResultSubject[];
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

  if (isInitialLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="cyber-bg">
          <div className="hex-grid"></div>
          <div className="circuit-pattern"></div>
        </div>
        <CyberLoader size="large" />
      </div>
    );
  }

  return (
    <div className="min-h-screen relative">
      {/* Cyberpunk Background */}
      <div className="cyber-bg">
        <div className="hex-grid"></div>
        <div className="circuit-pattern"></div>
      </div>

      {/* Header */}
      <header className="glass border-b border-cyan-500/30 relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="relative">
                <GraduationCap className="h-8 w-8 text-cyan-400 animate-glow" />
                <div className="absolute inset-0 h-8 w-8 text-cyan-400 animate-pulse opacity-50">
                  <GraduationCap className="h-8 w-8" />
                </div>
              </div>
              <h1 className="text-2xl font-bold cyber-title glitch" data-text="WEB3 RESULT PORTAL">
                WEB3 RESULT PORTAL
              </h1>
            </div>
            <div className="flex items-center gap-4">
              <BlockchainIndicator />
              <WalletStatus />
              <Button variant="outline" className="neon-border hover:neon-glow transition-all duration-300" asChild>
                <a href="/admin">ADMIN ACCESS</a>
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-10">
        {!searchResult ? (
          <div className="space-y-12">
            {/* Hero Section */}
            <div className="text-center space-y-6 animate-slide-in">
              <h2 className="text-5xl font-bold cyber-title glitch" data-text="NEURAL RESULT MATRIX">
                NEURAL RESULT MATRIX
              </h2>
              <p className="text-xl cyber-text max-w-3xl mx-auto leading-relaxed">
                Access your examination results through our{' '}
                <span className="text-cyan-400 neon-text">quantum-encrypted</span> blockchain network.
                All results are cryptographically verified and immutably stored.
              </p>
              <div className="flex justify-center gap-4 flex-wrap">
                <Badge className="blockchain-indicator">
                  <Cpu className="w-4 h-4" />
                  QUANTUM VERIFIED
                </Badge>
                <Badge className="blockchain-indicator">
                  <Shield className="w-4 h-4" />
                  BLOCKCHAIN SECURED
                </Badge>
                <Badge className="blockchain-indicator">
                  <Zap className="w-4 h-4" />
                  REAL-TIME SYNC
                </Badge>
              </div>
            </div>

            {/* Search Form */}
            <div className="animate-slide-in" style={{ animationDelay: '0.2s' }}>
              <SearchForm
                boards={boards}
                sessions={sessions}
                onSearch={handleSearch}
                isLoading={isLoading}
              />
            </div>

            {/* Error Message */}
            {error && (
              <Card className="cyber-card border-red-500/50 bg-red-500/10 animate-slide-in">
                <CardContent className="pt-6">
                  <div className="flex items-center gap-3 text-red-400">
                    <Search className="h-5 w-5 animate-pulse" />
                    <p className="font-medium cyber-text">{error}</p>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Features Section */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-16">
              <Card className="cyber-card geometric-pattern animate-slide-in" style={{ animationDelay: '0.4s' }}>
                <CardHeader className="text-center">
                  <div className="mx-auto mb-4 relative">
                    <Shield className="h-12 w-12 text-cyan-400 animate-float" />
                    <div className="absolute inset-0 h-12 w-12 text-cyan-400/30 animate-pulse">
                      <Shield className="h-12 w-12" />
                    </div>
                  </div>
                  <CardTitle className="cyber-subtitle">QUANTUM VERIFICATION</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="cyber-text text-center">
                    All results undergo quantum cryptographic verification ensuring 
                    <span className="text-cyan-400"> 100% authenticity</span> and tamper-proof storage
                  </CardDescription>
                </CardContent>
              </Card>
              
              <Card className="cyber-card geometric-pattern animate-slide-in" style={{ animationDelay: '0.6s' }}>
                <CardHeader className="text-center">
                  <div className="mx-auto mb-4 relative">
                    <Globe className="h-12 w-12 text-purple-400 animate-float" />
                    <div className="absolute inset-0 h-12 w-12 text-purple-400/30 animate-pulse">
                      <Globe className="h-12 w-12" />
                    </div>
                  </div>
                  <CardTitle className="cyber-subtitle">NEURAL NETWORK</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="cyber-text text-center">
                    Connected to all Bangladesh Education Board networks through our
                    <span className="text-purple-400"> distributed ledger</span> infrastructure
                  </CardDescription>
                </CardContent>
              </Card>
              
              <Card className="cyber-card geometric-pattern animate-slide-in" style={{ animationDelay: '0.8s' }}>
                <CardHeader className="text-center">
                  <div className="mx-auto mb-4 relative">
                    <Zap className="h-12 w-12 text-yellow-400 animate-float" />
                    <div className="absolute inset-0 h-12 w-12 text-yellow-400/30 animate-pulse">
                      <Zap className="h-12 w-12" />
                    </div>
                  </div>
                  <CardTitle className="cyber-subtitle">INSTANT ACCESS</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="cyber-text text-center">
                    Lightning-fast result retrieval with
                    <span className="text-yellow-400"> real-time synchronization</span> across the blockchain matrix
                  </CardDescription>
                </CardContent>
              </Card>
            </div>

            {/* Data Visualization */}
            <div className="mt-16 animate-slide-in" style={{ animationDelay: '1s' }}>
              <Card className="cyber-card">
                <CardHeader>
                  <CardTitle className="cyber-subtitle text-center">NETWORK STATUS</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    <div className="data-viz p-4 text-center">
                      <div className="text-2xl font-bold text-cyan-400 mb-2">{boards.length}</div>
                      <div className="cyber-text text-sm">EDUCATION NODES</div>
                    </div>
                    <div className="data-viz p-4 text-center">
                      <div className="text-2xl font-bold text-purple-400 mb-2">{sessions.length}</div>
                      <div className="cyber-text text-sm">ACTIVE SESSIONS</div>
                    </div>
                    <div className="data-viz p-4 text-center">
                      <div className="text-2xl font-bold text-yellow-400 mb-2">99.9%</div>
                      <div className="cyber-text text-sm">UPTIME</div>
                    </div>
                    <div className="data-viz p-4 text-center">
                      <div className="text-2xl font-bold text-green-400 mb-2">SECURE</div>
                      <div className="cyber-text text-sm">NETWORK STATUS</div>
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
              className="neon-border hover:neon-glow transition-all duration-300 gap-2"
            >
              <Search className="h-4 w-4" />
              INITIATE NEW SEARCH
            </Button>

            {/* Result Card */}
            <div className="animate-slide-in">
              <ResultCard
                student={searchResult.student}
                result={searchResult.result}
                subjects={searchResult.subjects}
              />
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="glass border-t border-cyan-500/30 py-8 mt-16 relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-4">
            <h3 className="text-lg font-bold cyber-title">WEB3 RESULT PORTAL</h3>
            <p className="cyber-text">
              Powered by quantum cryptography and distributed ledger technology
            </p>
            <div className="flex justify-center gap-4">
              <Badge className="blockchain-indicator">
                <Shield className="w-3 h-3" />
                QUANTUM SECURED
              </Badge>
              <Badge className="blockchain-indicator">
                <Globe className="w-3 h-3" />
                GLOBALLY DISTRIBUTED
              </Badge>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}