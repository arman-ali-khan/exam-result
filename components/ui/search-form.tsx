'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Search, Loader2, Zap, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { searchSchema, type SearchFormData } from '@/lib/validations';
import { EducationBoard, ExamSession } from '@/lib/supabase';

interface SearchFormProps {
  boards: EducationBoard[];
  sessions: ExamSession[];
  onSearch: (data: SearchFormData) => Promise<void>;
  isLoading?: boolean;
}

export function SearchForm({ boards, sessions, onSearch, isLoading }: SearchFormProps) {
  const form = useForm<SearchFormData>({
    resolver: zodResolver(searchSchema),
    defaultValues: {
      rollNumber: '',
      registrationNumber: '',
      boardId: '',
      sessionId: '',
    },
  });

  const handleSubmit = async (data: SearchFormData) => {
    await onSearch(data);
  };

  return (
    <Card className="modern-card max-w-4xl mx-auto">
      <CardHeader className="text-center">
          <CardTitle className="text-3xl font-bold modern-title mb-2">
            Search for Results
          </CardTitle>
          <CardDescription className="modern-text text-lg">
            Enter your information to access your examination results
          </CardDescription>
          <div className="flex justify-center gap-4 mt-4">
            <div className="flex items-center gap-2 text-blue-600 text-sm">
              <Shield className="w-4 h-4" />
              <span className="font-medium">Secure</span>
            </div>
            <div className="flex items-center gap-2 text-green-600 text-sm">
              <Zap className="w-4 h-4" />
              <span className="font-medium">Real-time</span>
            </div>
          </div>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-8">
            {/* Credential Input Section */}
            <div className="space-y-6">
              <div className="text-center">
                <h3 className="modern-subtitle text-lg mb-4">Student Information</h3>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="rollNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="modern-subtitle text-sm">Roll Number</FormLabel>
                      <FormControl>
                          <Input
                            placeholder="Enter roll number"
                            {...field}
                            className="modern-input h-12"
                          />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="registrationNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="modern-subtitle text-sm">Registration Number</FormLabel>
                      <FormControl>
                          <Input
                            placeholder="Enter registration number"
                            {...field}
                            className="modern-input h-12"
                          />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <div className="text-center">
                <p className="modern-text text-sm">
                  <span className="text-blue-600 font-medium">Note:</span> Provide either Roll Number OR Registration Number
                </p>
              </div>
            </div>

            {/* Network Selection Section */}
            <div className="space-y-6">
              <div className="text-center">
                <h3 className="modern-subtitle text-lg mb-4">Examination Details</h3>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="boardId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="modern-subtitle text-sm">Education Board</FormLabel>
                      <FormControl>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <SelectTrigger className="modern-input h-12">
                            <SelectValue placeholder="Select education board" />
                          </SelectTrigger>
                          <SelectContent className="modern-card">
                            {boards.map((board) => (
                              <SelectItem 
                                key={board.id} 
                                value={board.id}
                                className="hover:bg-gray-50"
                              >
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
                  name="sessionId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="modern-subtitle text-sm">Exam Session</FormLabel>
                      <FormControl>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <SelectTrigger className="modern-input h-12">
                            <SelectValue placeholder="Select exam session" />
                          </SelectTrigger>
                          <SelectContent className="modern-card">
                            {sessions.map((session) => (
                              <SelectItem 
                                key={session.id} 
                                value={session.id}
                                className="hover:bg-gray-50"
                              >
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
              </div>
            </div>

            {/* Search Button */}
            <div className="text-center pt-4">
              <Button
                type="submit"
                className="w-full md:w-auto px-12 h-14 modern-button text-lg font-semibold"
                disabled={isLoading}
              >
                {isLoading ? (
                  <div className="flex items-center gap-3">
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Searching...</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-3">
                    <Search className="h-5 w-5" />
                    <span>Search Results</span>
                    <Zap className="h-5 w-5" />
                  </div>
                )}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}