'use client';

import { useState, useEffect } from 'react';
import { Users, GraduationCap, BookOpen, FileText, TrendingUp, Calendar,CheckCircle , Shield, Cpu, Zap, Activity } from 'lucide-react';
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
      <div className="min-h-screen modern-bg">
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <Card key={i} className="modern-card animate-pulse">
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
    <div className="min-h-screen modern-bg">
      <div className="space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between animate-fade-in">
          <div>
            <h1 className="text-4xl font-bold modern-title">
              Admin Dashboard
            </h1>
            <p className="modern-text mt-2">Manage your education system</p>
          </div>
          <div className="flex items-center gap-4">
            <Badge className="modern-badge modern-badge-success">
              <Shield className="w-3 h-3" />
              Admin Access
            </Badge>
            <Badge className="modern-badge modern-badge-success">
              <Activity className="w-3 h-3" />
              Live Data
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
                className="modern-card transition-all duration-300 animate-fade-in"
              >
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium modern-text">{stat.title}</p>
                      <p className="text-3xl font-bold text-blue-600">{stat.value}</p>
                    </div>
                    <div className="p-3 rounded-full bg-blue-50 border border-blue-200">
                      <Icon className="h-6 w-6 text-blue-600" />
                    </div>
                  </div>
                  <div className="mt-4 flex items-center gap-2">
                    <CheckCircle className="w-3 h-3 text-green-600" />
                    <span className="text-xs modern-text">Verified Data</span>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Recent Results */}
        <Card className="modern-card animate-fade-in">
          <CardHeader>
              <CardTitle className="modern-subtitle text-blue-600 flex items-center gap-2">
                <FileText className="w-5 h-5" />
                Recent Results
              </CardTitle>
              <CardDescription className="modern-text">
                Latest examination results in the system
              </CardDescription>
          </CardHeader>
          <CardContent>
            {recentResults.length === 0 ? (
              <div className="text-center py-12">
                <div className="modern-loader mx-auto mb-4"></div>
                <p className="modern-text">
                  No results found. Add examination data to get started.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table className="modern-table">
                  <TableHeader>
                    <TableRow>
                      <TableHead className="modern-subtitle">Student</TableHead>
                      <TableHead className="modern-subtitle">Roll Number</TableHead>
                      <TableHead className="modern-subtitle">Session</TableHead>
                      <TableHead className="modern-subtitle">GPA</TableHead>
                      <TableHead className="modern-subtitle">Status</TableHead>
                      <TableHead className="modern-subtitle">Published</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {recentResults.map((result, index) => (
                      <TableRow 
                        key={result.id} 
                        className="hover:bg-gray-50 transition-colors"
                      >
                        <TableCell className="font-medium">
                          {result.students?.name || 'Unknown'}
                        </TableCell>
                        <TableCell className="font-mono text-gray-600">
                          {result.students?.roll_number || 'N/A'}
                        </TableCell>
                        <TableCell className="modern-text">
                          {result.exam_sessions?.name} {result.exam_sessions?.year}
                        </TableCell>
                        <TableCell>
                          <span className="font-bold text-blue-600 font-mono text-lg">
                            {result.gpa.toFixed(2)}
                          </span>
                        </TableCell>
                        <TableCell>
                          <Badge
                            className={
                              result.result_status === 'Passed' 
                                ? 'modern-badge-success' 
                                : result.result_status === 'Critical'
                                ? 'modern-badge-warning'
                                : 'modern-badge-error'
                            }
                          >
                            {result.result_status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge 
                            className={
                              result.is_published 
                                ? 'modern-badge-success' 
                                : 'modern-badge'
                            }
                          >
                            {result.is_published ? 'Published' : 'Draft'}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* System Status */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-fade-in">
          <Card className="modern-card">
            <CardContent className="p-6 text-center">
              <Shield className="w-8 h-8 text-blue-600 mx-auto mb-2" />
              <div className="text-lg font-bold text-blue-600">Secure</div>
              <div className="text-sm modern-text">Digital Encryption</div>
            </CardContent>
          </Card>
          
          <Card className="modern-card">
            <CardContent className="p-6 text-center">
              <Activity className="w-8 h-8 text-green-600 mx-auto mb-2" />
              <div className="text-lg font-bold text-green-600">Online</div>
              <div className="text-sm modern-text">System Status</div>
            </CardContent>
          </Card>
          
          <Card className="modern-card">
            <CardContent className="p-6 text-center">
              <CheckCircle className="w-8 h-8 text-green-600 mx-auto mb-2" />
              <div className="text-lg font-bold text-green-600">Synced</div>
              <div className="text-sm modern-text">Data Status</div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}