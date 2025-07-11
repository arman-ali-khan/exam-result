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
import { CyberLoader } from '@/components/ui/cyber-loader';

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
    <Card className="cyber-card max-w-4xl mx-auto metallic-gradient">
      <CardHeader className="text-center relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/10 via-purple-500/10 to-cyan-500/10 animate-pulse" />
        <div className="relative z-10">
          <CardTitle className="text-3xl font-bold cyber-title mb-2">
            NEURAL SEARCH INTERFACE
          </CardTitle>
          <CardDescription className="cyber-text text-lg">
            Enter your credentials to access the quantum result matrix
          </CardDescription>
          <div className="flex justify-center gap-4 mt-4">
            <div className="flex items-center gap-2 text-cyan-400 text-sm">
              <Shield className="w-4 h-4" />
              <span className="font-mono">ENCRYPTED</span>
            </div>
            <div className="flex items-center gap-2 text-purple-400 text-sm">
              <Zap className="w-4 h-4" />
              <span className="font-mono">REAL-TIME</span>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="relative">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-8">
            {/* Credential Input Section */}
            <div className="space-y-6">
              <div className="text-center">
                <h3 className="cyber-subtitle text-lg mb-4">AUTHENTICATION CREDENTIALS</h3>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="rollNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="cyber-subtitle text-sm">ROLL NUMBER</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Input
                            placeholder="Enter roll number"
                            {...field}
                            className="cyber-card border-cyan-500/30 bg-black/50 text-cyan-400 placeholder:text-cyan-400/50 font-mono h-12 focus:border-cyan-400 focus:ring-cyan-400/30"
                          />
                          <div className="absolute inset-0 border border-cyan-500/20 rounded-md pointer-events-none animate-pulse" />
                        </div>
                      </FormControl>
                      <FormMessage className="text-red-400" />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="registrationNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="cyber-subtitle text-sm">REGISTRATION ID</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Input
                            placeholder="Enter registration number"
                            {...field}
                            className="cyber-card border-purple-500/30 bg-black/50 text-purple-400 placeholder:text-purple-400/50 font-mono h-12 focus:border-purple-400 focus:ring-purple-400/30"
                          />
                          <div className="absolute inset-0 border border-purple-500/20 rounded-md pointer-events-none animate-pulse" />
                        </div>
                      </FormControl>
                      <FormMessage className="text-red-400" />
                    </FormItem>
                  )}
                />
              </div>
              
              <div className="text-center">
                <p className="cyber-text text-sm">
                  <span className="text-cyan-400">PROTOCOL:</span> Provide either Roll Number OR Registration ID
                </p>
              </div>
            </div>

            {/* Network Selection Section */}
            <div className="space-y-6">
              <div className="text-center">
                <h3 className="cyber-subtitle text-lg mb-4">NETWORK PARAMETERS</h3>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="boardId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="cyber-subtitle text-sm">EDUCATION NODE</FormLabel>
                      <FormControl>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <SelectTrigger className="cyber-card border-cyan-500/30 bg-black/50 text-cyan-400 h-12 font-mono">
                            <SelectValue placeholder="Select education board" />
                          </SelectTrigger>
                          <SelectContent className="cyber-card border-cyan-500/30 bg-black/90">
                            {boards.map((board) => (
                              <SelectItem 
                                key={board.id} 
                                value={board.id}
                                className="text-cyan-400 hover:bg-cyan-500/20 font-mono"
                              >
                                {board.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </FormControl>
                      <FormMessage className="text-red-400" />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="sessionId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="cyber-subtitle text-sm">SESSION MATRIX</FormLabel>
                      <FormControl>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <SelectTrigger className="cyber-card border-purple-500/30 bg-black/50 text-purple-400 h-12 font-mono">
                            <SelectValue placeholder="Select exam session" />
                          </SelectTrigger>
                          <SelectContent className="cyber-card border-purple-500/30 bg-black/90">
                            {sessions.map((session) => (
                              <SelectItem 
                                key={session.id} 
                                value={session.id}
                                className="text-purple-400 hover:bg-purple-500/20 font-mono"
                              >
                                {session.name} - {session.year}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </FormControl>
                      <FormMessage className="text-red-400" />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* Search Button */}
            <div className="text-center pt-4">
              <Button
                type="submit"
                className="w-full md:w-auto px-12 h-14 bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-400 hover:to-purple-400 text-black font-bold text-lg cyber-subtitle transition-all duration-300 transform hover:scale-105 neon-glow"
                disabled={isLoading}
              >
                {isLoading ? (
                  <div className="flex items-center gap-3">
                    <CyberLoader size="small" />
                    <span>ACCESSING MATRIX...</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-3">
                    <Search className="h-5 w-5" />
                    <span>INITIATE SEARCH</span>
                    <Zap className="h-5 w-5" />
                  </div>
                )}
              </Button>
            </div>
          </form>
        </Form>
        
        {/* Decorative Elements */}
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-cyan-500 via-purple-500 to-cyan-500 opacity-50" />
        <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-purple-500 via-cyan-500 to-purple-500 opacity-50" />
      </CardContent>
    </Card>
  );
}