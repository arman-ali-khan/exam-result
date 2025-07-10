'use client';

import { useState, useEffect } from 'react';
import { Users, GraduationCap, BookOpen, FileText, TrendingUp, Calendar } from 'lucide-react';
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
      title: 'Total Students',
      value: stats.totalStudents.toLocaleString(),
      icon: Users,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
    },
    {
      title: 'Total Results',
      value: stats.totalResults.toLocaleString(),
      icon: GraduationCap,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
    },
    {
      title: 'Published Results',
      value: stats.publishedResults.toLocaleString(),
      icon: TrendingUp,
      color: 'text-emerald-600',
      bgColor: 'bg-emerald-50',
    },
    {
      title: 'Total Subjects',
      value: stats.totalSubjects.toLocaleString(),
      icon: BookOpen,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
    },
    {
      title: 'Education Boards',
      value: stats.totalBoards.toLocaleString(),
      icon: FileText,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
    },
    {
      title: 'Exam Sessions',
      value: stats.totalSessions.toLocaleString(),
      icon: Calendar,
      color: 'text-red-600',
      bgColor: 'bg-red-50',
    },
  ];

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-20 bg-gray-200 rounded"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <Badge variant="outline" className="text-green-600">
          Admin Panel
        </Badge>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {statCards.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Card key={index} className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                    <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
                  </div>
                  <div className={`p-3 rounded-full ${stat.bgColor}`}>
                    <Icon className={`h-6 w-6 ${stat.color}`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Recent Results */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Results</CardTitle>
          <CardDescription>
            Latest exam results added to the system
          </CardDescription>
        </CardHeader>
        <CardContent>
          {recentResults.length === 0 ? (
            <p className="text-center text-gray-500 py-8">
              No results found. Start by adding some exam results.
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
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentResults.map((result) => (
                  <TableRow key={result.id}>
                    <TableCell className="font-medium">
                      {result.students?.name || 'Unknown'}
                    </TableCell>
                    <TableCell>{result.students?.roll_number || 'N/A'}</TableCell>
                    <TableCell>
                      {result.exam_sessions?.name} {result.exam_sessions?.year}
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
                      <Badge variant={result.is_published ? 'default' : 'secondary'}>
                        {result.is_published ? 'Published' : 'Draft'}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}