'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Save, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { boardSchema, type BoardFormData } from '@/lib/validations';
import { supabase, EducationBoard } from '@/lib/supabase';

interface BoardFormProps {
  board?: EducationBoard | null;
  onSuccess: () => void;
}

export function BoardForm({ board, onSuccess }: BoardFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const form = useForm<BoardFormData>({
    resolver: zodResolver(boardSchema),
    defaultValues: {
      name: board?.name || '',
      code: board?.code || '',
      description: board?.description || '',
    },
  });

  const handleSubmit = async (data: BoardFormData) => {
    setIsLoading(true);
    setError(null);

    try {
      const boardData = {
        name: data.name,
        code: data.code,
        description: data.description,
      };

      if (board) {
        // Update existing board
        const { error } = await supabase
          .from('education_boards')
          .update(boardData)
          .eq('id', board.id);

        if (error) throw error;
      } else {
        // Create new board
        const { error } = await supabase
          .from('education_boards')
          .insert([boardData]);

        if (error) throw error;
      }

      onSuccess();
    } catch (error: any) {
      console.error('Error saving board:', error);
      setError(error.message || 'An error occurred while saving the education board');
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
              <FormLabel>Board Name</FormLabel>
              <FormControl>
                <Input placeholder="Enter board name" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="code"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Board Code</FormLabel>
              <FormControl>
                <Input placeholder="Enter board code (e.g., DEB)" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description (Optional)</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Enter board description"
                  {...field}
                />
              </FormControl>
              <FormMessage />
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
                Save Board
              </>
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
}