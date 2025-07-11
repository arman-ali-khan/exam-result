'use client';

import { useState, useEffect } from 'react';
import { Users, GraduationCap, BookOpen, FileText, TrendingUp, Calendar, Shield, Cpu, Zap, Activity } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { supabase } from '@/lib/supabase';

interface DashboardStats {
  totalStudents: number;
  totalResults: number;
  publishedResults: number;
  totalSubjects: number;
  totalBoards: number;
  totalSessions: number;
}

export function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    totalStudents: 0,
    totalResults: 0,
    publishedResults: 0,
    totalSubjects: 0,
    totalBoards: 0,
    totalSessions: 0,
  });
  const [recentResults, setRecentResults] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      // Fetch statistics
      const [
        studentsCount,
        resultsCount,
        publishedResultsCount,
        subjectsCount,
        boardsCount,
        sessionsCount,
      ] = await Promise.all([
        supabase.from('students').select('*', { count: 'exact', head: true }),
        supabase.from('results').select('*', { count: 'exact', head: true }),
        supabase.from('results').select('*', { count: 'exact', head: true }).eq('is_published', true),
        supabase.from('subjects').select('*', { count: 'exact', head: true }),
        supabase.from('education_boards').select('*', { count: 'exact', head: true }),
        supabase.from('exam_sessions').select('*', { count: 'exact', head: true }),
      ]);

      setStats({
        totalStudents: studentsCount.count || 0,
        totalResults: resultsCount.count || 0,
        publishedResults: publishedResultsCount.count || 0,
        totalSubjects: subjectsCount.count || 0,
        totalBoards: boardsCount.count || 0,
        totalSessions: sessionsCount.count || 0,
      });

      // Fetch recent results
      const { data: recentData } = await supabase
        .from('results')
        .select(`
          *,
          students(name, roll_number),
          exam_sessions(name, year)
        `)
        .order('created_at', { ascending: false })
        .limit(5);

      setRecentResults(recentData || []);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const statCards = [
    {
      title: 'Neural Students',
      value: stats.totalStudents.toLocaleString(),
      icon: Users,
      color: 'text-cyan-400',
      bgGradient: 'from-cyan-500/20 to-blue-500/20',
      borderColor: 'border-cyan-500/30',
    },
    {
      title: 'Total Results',
      value: stats.totalResults.toLocaleString(),
      icon: GraduationCap,
      color: 'text-purple-400',
      bgGradient: 'from-purple-500/20 to-pink-500/20',
      borderColor: 'border-purple-500/30',
    },
    {
      title: 'Published Results',
      value: stats.publishedResults.toLocaleString(),
      icon: TrendingUp,
      color: 'text-green-400',
      bgGradient: 'from-green-500/20 to-emerald-500/20',
      borderColor: 'border-green-500/30',
    },
    {
      title: 'Subject Nodes',
      value: stats.totalSubjects.toLocaleString(),
      icon: BookOpen,
      color: 'text-yellow-400',
      bgGradient: 'from-yellow-500/20 to-orange-500/20',
      borderColor: 'border-yellow-500/30',
    },
    {
      title: 'Education Boards',
      value: stats.totalBoards.toLocaleString(),
      icon: FileText,
      color: 'text-pink-400',
      bgGradient: 'from-pink-500/20 to-red-500/20',
      borderColor: 'border-pink-500/30',
    },
    {
      title: 'Exam Sessions',
      value: stats.totalSessions.toLocaleString(),
      icon: Calendar,
      color: 'text-indigo-400',
      bgGradient: 'from-indigo-500/20 to-blue-500/20',
      borderColor: 'border-indigo-500/30',
    },
  ];

  if (isLoading) {
    return (
      <div className="min-h-screen relative">
        {/* Cyberpunk Background */}
        <div className="cyber-bg">
          <div className="hex-grid"></div>
          <div className="circuit-pattern"></div>
        </div>
        
        <div className="space-y-6 relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <Card key={i} className="cyber-card animate-pulse">
                <CardContent className="p-6">
                  <div className="h-20 bg-gray-700/50 rounded"></div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
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

      <div className="space-y-8 relative z-10">
        {/* Header */}
        <div className="flex items-center justify-between animate-slide-in">
          <div>
            <h1 className="text-4xl font-bold cyber-title glitch" data-text="ADMIN NEURAL MATRIX">
              ADMIN NEURAL MATRIX
            </h1>
            <p className="cyber-text mt-2">Quantum-secured administrative interface</p>
          </div>
          <div className="flex items-center gap-4">
            <Badge className="blockchain-indicator">
              <Shield className="w-3 h-3" />
              ADMIN ACCESS
            </Badge>
            <Badge className="blockchain-indicator">
              <Activity className="w-3 h-3" />
              LIVE DATA
            </Badge>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {statCards.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <Card 
                key={index} 
                className={`cyber-card hover:neon-glow transition-all duration-300 ${stat.borderColor} bg-gradient-to-br ${stat.bgGradient} animate-slide-in`}
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium cyber-text opacity-80">{stat.title}</p>
                      <p className={`text-3xl font-bold cyber-title ${stat.color}`}>{stat.value}</p>
                    </div>
                    <div className={`p-3 rounded-full bg-black/30 border ${stat.borderColor}`}>
                      <Icon className={`h-6 w-6 ${stat.color} animate-float`} />
                    </div>
                  </div>
                  <div className="mt-4 flex items-center gap-2">
                    <Cpu className={`w-3 h-3 ${stat.color}`} />
                    <span className="text-xs cyber-text opacity-60">QUANTUM VERIFIED</span>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Recent Results */}
        <Card className="cyber-card metallic-gradient animate-slide-in" style={{ animationDelay: '0.6s' }}>
          <CardHeader className="relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/10 via-purple-500/10 to-cyan-500/10" />
            <div className="relative z-10">
              <CardTitle className="cyber-subtitle text-cyan-400 flex items-center gap-2">
                <Zap className="w-5 h-5" />
                RECENT NEURAL RESULTS
              </CardTitle>
              <CardDescription className="cyber-text">
                Latest examination results processed through the quantum matrix
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent className="relative">
            {recentResults.length === 0 ? (
              <div className="text-center py-12">
                <div className="cyber-loader mx-auto mb-4"></div>
                <p className="cyber-text">
                  No results found. Initialize the neural network with examination data.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="border-cyan-500/30">
                      <TableHead className="cyber-subtitle text-cyan-400">STUDENT</TableHead>
                      <TableHead className="cyber-subtitle text-cyan-400">ROLL ID</TableHead>
                      <TableHead className="cyber-subtitle text-cyan-400">SESSION</TableHead>
                      <TableHead className="cyber-subtitle text-cyan-400">GPA</TableHead>
                      <TableHead className="cyber-subtitle text-cyan-400">STATUS</TableHead>
                      <TableHead className="cyber-subtitle text-cyan-400">PUBLISHED</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {recentResults.map((result, index) => (
                      <TableRow 
                        key={result.id} 
                        className="border-cyan-500/20 hover:bg-cyan-500/5 transition-colors animate-slide-in"
                        style={{ animationDelay: `${index * 0.1}s` }}
                      >
                        <TableCell className="font-medium cyber-text">
                          {result.students?.name || 'UNKNOWN_ENTITY'}
                        </TableCell>
                        <TableCell className="font-mono text-purple-400">
                          {result.students?.roll_number || 'N/A'}
                        </TableCell>
                        <TableCell className="cyber-text">
                          {result.exam_sessions?.name} {result.exam_sessions?.year}
                        </TableCell>
                        <TableCell>
                          <span className="font-bold text-cyan-400 font-mono text-lg">
                            {result.gpa.toFixed(2)}
                          </span>
                        </TableCell>
                        <TableCell>
                          <Badge
                            className={
                              result.result_status === 'Passed' 
                                ? 'bg-green-500/20 text-green-400 border-green-500/50' 
                                : result.result_status === 'Critical'
                                ? 'bg-yellow-500/20 text-yellow-400 border-yellow-500/50'
                                : 'bg-red-500/20 text-red-400 border-red-500/50'
                            }
                          >
                            {result.result_status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge 
                            className={
                              result.is_published 
                                ? 'bg-cyan-500/20 text-cyan-400 border-cyan-500/50' 
                                : 'bg-gray-500/20 text-gray-400 border-gray-500/50'
                            }
                          >
                            {result.is_published ? 'LIVE' : 'DRAFT'}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
            
            {/* Decorative Elements */}
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-cyan-500 via-purple-500 to-cyan-500 opacity-50" />
            <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-purple-500 via-cyan-500 to-purple-500 opacity-50" />
          </CardContent>
        </Card>

        {/* System Status */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-slide-in" style={{ animationDelay: '0.8s' }}>
          <Card className="cyber-card border-cyan-500/30">
            <CardContent className="p-6 text-center">
              <Shield className="w-8 h-8 text-cyan-400 mx-auto mb-2 animate-float" />
              <div className="text-lg font-bold text-cyan-400 font-mono">SECURE</div>
              <div className="text-sm cyber-text">Quantum Encryption</div>
            </CardContent>
          </Card>
          
          <Card className="cyber-card border-purple-500/30">
            <CardContent className="p-6 text-center">
              <Activity className="w-8 h-8 text-purple-400 mx-auto mb-2 animate-pulse" />
              <div className="text-lg font-bold text-purple-400 font-mono">ONLINE</div>
              <div className="text-sm cyber-text">Neural Network</div>
            </CardContent>
          </Card>
          
          <Card className="cyber-card border-green-500/30">
            <CardContent className="p-6 text-center">
              <Zap className="w-8 h-8 text-green-400 mx-auto mb-2 animate-bounce" />
              <div className="text-lg font-bold text-green-400 font-mono">SYNCED</div>
              <div className="text-sm cyber-text">Blockchain Ledger</div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}