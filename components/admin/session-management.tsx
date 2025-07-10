'use client';

import { useState, useEffect } from 'react';
import { Plus, Search, Edit, Trash2, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Switch } from '@/components/ui/switch';
import { SessionForm } from '@/components/admin/session-form';
import { supabase, ExamSession, EducationBoard } from '@/lib/supabase';

export function SessionManagement() {
  const [sessions, setSessions] = useState<ExamSession[]>([]);
  const [boards, setBoards] = useState<EducationBoard[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [selectedSession, setSelectedSession] = useState<ExamSession | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [sessionsData, boardsData] = await Promise.all([
        supabase
          .from('exam_sessions')
          .select(`
            *,
            education_boards(name)
          `)
          .order('year', { ascending: false }),
        supabase
          .from('education_boards')
          .select('*')
          .order('name'),
      ]);

      if (sessionsData.error) throw sessionsData.error;
      if (boardsData.error) throw boardsData.error;

      setSessions(sessionsData.data || []);
      setBoards(boardsData.data || []);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this exam session?')) return;

    try {
      const { error } = await supabase
        .from('exam_sessions')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setSessions(sessions.filter(session => session.id !== id));
    } catch (error) {
      console.error('Error deleting session:', error);
    }
  };

  const handlePublishToggle = async (id: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('exam_sessions')
        .update({ is_published: !currentStatus })
        .eq('id', id);

      if (error) throw error;

      setSessions(sessions.map(session => 
        session.id === id 
          ? { ...session, is_published: !currentStatus }
          : session
      ));
    } catch (error) {
      console.error('Error updating session:', error);
    }
  };

  const handleDialogClose = () => {
    setIsDialogOpen(false);
    setSelectedSession(null);
    fetchData();
  };

  const filteredSessions = sessions.filter(session =>
    session.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    session.exam_type.toLowerCase().includes(searchTerm.toLowerCase()) ||
    session.year.toString().includes(searchTerm)
  );

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
        <h1 className="text-3xl font-bold text-gray-900">Exam Session Management</h1>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Add Session
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {selectedSession ? 'Edit Exam Session' : 'Add New Exam Session'}
              </DialogTitle>
            </DialogHeader>
            <SessionForm
              session={selectedSession}
              boards={boards}
              onSuccess={handleDialogClose}
            />
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Exam Sessions</CardTitle>
          <CardDescription>
            Manage exam sessions and their publication status
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search sessions by name, exam type, or year..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {filteredSessions.length === 0 ? (
            <p className="text-center text-gray-500 py-8">
              No exam sessions found. Add your first session to get started.
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Exam Type</TableHead>
                  <TableHead>Year</TableHead>
                  <TableHead>Board</TableHead>
                  <TableHead>Published</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredSessions.map((session) => (
                  <TableRow key={session.id}>
                    <TableCell className="font-medium">{session.name}</TableCell>
                    <TableCell>{session.exam_type}</TableCell>
                    <TableCell>{session.year}</TableCell>
                    <TableCell>
                      {(session as any).education_boards?.name || 'All Boards'}
                    </TableCell>
                    <TableCell>
                      <Switch
                        checked={session.is_published}
                        onCheckedChange={() => handlePublishToggle(session.id, session.is_published)}
                      />
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setSelectedSession(session);
                            setIsDialogOpen(true);
                          }}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDelete(session.id)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
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