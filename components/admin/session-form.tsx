'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Save, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Switch } from '@/components/ui/switch';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { sessionSchema, type SessionFormData } from '@/lib/validations';
import { supabase, ExamSession, EducationBoard } from '@/lib/supabase';

interface SessionFormProps {
  session?: ExamSession | null;
  boards: EducationBoard[];
  onSuccess: () => void;
}

export function SessionForm({ session, boards, onSuccess }: SessionFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const form = useForm<SessionFormData>({
    resolver: zodResolver(sessionSchema),
    defaultValues: {
      name: session?.name || '',
      examType: session?.exam_type || '',
      year: session?.year || new Date().getFullYear(),
      boardId: session?.board_id || '',
      isPublished: session?.is_published || false,
    },
  });

  const handleSubmit = async (data: SessionFormData) => {
    setIsLoading(true);
    setError(null);

    try {
      const sessionData = {
        name: data.name,
        exam_type: data.examType,
        year: data.year,
        board_id: data.boardId,
        is_published: data.isPublished,
      };

      if (session) {
        // Update existing session
        const { error } = await supabase
          .from('exam_sessions')
          .update(sessionData)
          .eq('id', session.id);

        if (error) throw error;
      } else {
        // Create new session
        const { error } = await supabase
          .from('exam_sessions')
          .insert([sessionData]);

        if (error) throw error;
      }

      onSuccess();
    } catch (error: any) {
      console.error('Error saving session:', error);
      setError(error.message || 'An error occurred while saving the exam session');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Session Name</FormLabel>
              <FormControl>
                <Input placeholder="Enter session name (e.g., SSC 2025)" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="examType"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Exam Type</FormLabel>
              <FormControl>
                <Input placeholder="Enter exam type (e.g., SSC, HSC, JSC)" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="year"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Year</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  placeholder="Enter year"
                  {...field}
                  onChange={(e) => field.onChange(parseInt(e.target.value, 10))}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="boardId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Education Board</FormLabel>
              <FormControl>
                <Select onValueChange={field.onChange} value={field.value}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select education board" />
                  </SelectTrigger>
                  <SelectContent>
                    {boards.map((board) => (
                      <SelectItem key={board.id} value={board.id}>
                        {board.name}
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
          name="isPublished"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                <FormLabel className="text-base">Publish Session</FormLabel>
                <div className="text-sm text-gray-500">
                  Make this session available for result search
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
                Save Session
              </>
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
}