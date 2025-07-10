'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Save, Loader2, Plus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { resultSchema, type ResultFormData } from '@/lib/validations';
import { supabase, Result, Student, ExamSession, Subject } from '@/lib/supabase';

interface ResultFormProps {
  result?: Result | null;
  students: Student[];
  sessions: ExamSession[];
  onSuccess: () => void;
}

export function ResultForm({ result, students, sessions, onSuccess }: ResultFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [existingSubjects, setExistingSubjects] = useState<any[]>([]);

  const form = useForm<ResultFormData>({
    resolver: zodResolver(resultSchema),
    defaultValues: {
      studentId: result?.student_id || '',
      sessionId: result?.session_id || '',
      resultStatus: result?.result_status || 'Passed',
      totalMarks: result?.total_marks || 0,
      isPublished: result?.is_published || false,
      subjects: [],
    },
  });

  useEffect(() => {
    fetchSubjects();
    if (result) {
      fetchExistingSubjects();
    }
  }, [result]);

  const fetchSubjects = async () => {
    try {
      const { data, error } = await supabase
        .from('subjects')
        .select('*')
        .order('code');

      if (error) throw error;
      setSubjects(data || []);
    } catch (error) {
      console.error('Error fetching subjects:', error);
    }
  };

  const fetchExistingSubjects = async () => {
    if (!result) return;

    try {
      const { data, error } = await supabase
        .from('result_subjects')
        .select(`
          *,
          subjects(*)
        `)
        .eq('result_id', result.id);

      if (error) throw error;
      
      setExistingSubjects(data || []);
      
      // Set form subjects
      const formSubjects = (data || []).map(item => ({
        subjectId: item.subject_id,
        grade: item.grade,
        marks: item.marks,
      }));
      
      form.setValue('subjects', formSubjects);
    } catch (error) {
      console.error('Error fetching existing subjects:', error);
    }
  };

  const handleAddSubject = () => {
    const currentSubjects = form.getValues('subjects');
    form.setValue('subjects', [
      ...currentSubjects,
      { subjectId: '', grade: 'A+', marks: 0 },
    ]);
  };

  const handleRemoveSubject = (index: number) => {
    const currentSubjects = form.getValues('subjects');
    form.setValue('subjects', currentSubjects.filter((_, i) => i !== index));
  };

  const handleSubmit = async (data: ResultFormData) => {
    setIsLoading(true);
    setError(null);

    try {
      const resultData = {
        student_id: data.studentId,
        session_id: data.sessionId,
        result_status: data.resultStatus,
        total_marks: data.totalMarks,
        is_published: data.isPublished,
      };

      let resultId = result?.id;

      if (result) {
        // Update existing result
        const { error: updateError } = await supabase
          .from('results')
          .update(resultData)
          .eq('id', result.id);

        if (updateError) throw updateError;
      } else {
        // Create new result
        const { data: newResult, error: insertError } = await supabase
          .from('results')
          .insert([resultData])
          .select()
          .single();

        if (insertError) throw insertError;
        resultId = newResult.id;
      }

      // Delete existing result subjects
      if (result) {
        await supabase
          .from('result_subjects')
          .delete()
          .eq('result_id', result.id);
      }

      // Insert new result subjects
      const subjectData = data.subjects.map(subject => ({
        result_id: resultId,
        subject_id: subject.subjectId,
        grade: subject.grade,
        marks: subject.marks,
      }));

      if (subjectData.length > 0) {
        const { error: subjectError } = await supabase
          .from('result_subjects')
          .insert(subjectData);

        if (subjectError) throw subjectError;
      }

      onSuccess();
    } catch (error: any) {
      console.error('Error saving result:', error);
      setError(error.message || 'An error occurred while saving the result');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="studentId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Student</FormLabel>
                <FormControl>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select student" />
                    </SelectTrigger>
                    <SelectContent>
                      {students.map((student) => (
                        <SelectItem key={student.id} value={student.id}>
                          {student.name} ({student.roll_number})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="sessionId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Exam Session</FormLabel>
                <FormControl>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select session" />
                    </SelectTrigger>
                    <SelectContent>
                      {sessions.map((session) => (
                        <SelectItem key={session.id} value={session.id}>
                          {session.name} - {session.year}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="resultStatus"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Result Status</FormLabel>
                <FormControl>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Passed">Passed</SelectItem>
                      <SelectItem value="Failed">Failed</SelectItem>
                      <SelectItem value="Critical">Critical</SelectItem>
                    </SelectContent>
                  </Select>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="totalMarks"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Total Marks</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    placeholder="Enter total marks"
                    {...field}
                    onChange={(e) => field.onChange(parseInt(e.target.value, 10))}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="isPublished"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                <FormLabel className="text-base">Publish Result</FormLabel>
                <div className="text-sm text-gray-500">
                  Make this result visible to students
                </div>
              </div>
              <FormControl>
                <Switch
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
            </FormItem>
          )}
        />

        {/* Subjects Section */}
        <Card>
          <CardHeader>
            <CardTitle>Subject Grades</CardTitle>
            <CardDescription>
              Add subject-wise grades for this result
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {form.watch('subjects').map((_, index) => (
                <div key={index} className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 border rounded-lg">
                  <FormField
                    control={form.control}
                    name={`subjects.${index}.subjectId`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Subject</FormLabel>
                        <FormControl>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <SelectTrigger>
                              <SelectValue placeholder="Select subject" />
                            </SelectTrigger>
                            <SelectContent>
                              {subjects.map((subject) => (
                                <SelectItem key={subject.id} value={subject.id}>
                                  {subject.code} - {subject.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name={`subjects.${index}.grade`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Grade</FormLabel>
                        <FormControl>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <SelectTrigger>
                              <SelectValue placeholder="Select grade" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="A+">A+</SelectItem>
                              <SelectItem value="A">A</SelectItem>
                              <SelectItem value="A-">A-</SelectItem>
                              <SelectItem value="B">B</SelectItem>
                              <SelectItem value="C">C</SelectItem>
                              <SelectItem value="D">D</SelectItem>
                              <SelectItem value="F">F</SelectItem>
                            </SelectContent>
                          </Select>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name={`subjects.${index}.marks`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Marks</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            placeholder="Enter marks"
                            {...field}
                            onChange={(e) => field.onChange(parseInt(e.target.value, 10))}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="flex items-end">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => handleRemoveSubject(index)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}

              <Button
                type="button"
                variant="outline"
                onClick={handleAddSubject}
                className="w-full"
              >
                <Plus className="mr-2 h-4 w-4" />
                Add Subject
              </Button>
            </div>
          </CardContent>
        </Card>

        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="flex justify-end gap-2">
          <Button type="submit" disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Save Result
              </>
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
}