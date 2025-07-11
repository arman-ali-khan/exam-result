'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Users, 
  GraduationCap, 
  FileText, 
  Settings, 
  BookOpen, 
  Calendar,
  Upload,
  LogOut,
  Menu,
  X,
  Shield,
  Cpu
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/lib/supabase';

interface AdminLayoutProps {
  children: React.ReactNode;
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const tabs = [
  { id: 'dashboard', label: 'Dashboard', icon: Settings },
  { id: 'students', label: 'Students', icon: Users },
  { id: 'results', label: 'Results', icon: GraduationCap },
  { id: 'subjects', label: 'Subjects', icon: BookOpen },
  { id: 'boards', label: 'Boards', icon: FileText },
  { id: 'sessions', label: 'Sessions', icon: Calendar },
  { id: 'upload', label: 'Upload Excel', icon: Upload },
];

export function AdminLayout({ children, activeTab, onTabChange }: AdminLayoutProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
    } catch (error) {
      console.error('Error during logout:', error);
    }
    router.push('/');
  };

  return (
    <div className="min-h-screen relative flex">
      {/* Cyberpunk Background */}
      <div className="cyber-bg">
        <div className="hex-grid"></div>
        <div className="circuit-pattern"></div>
      </div>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/80 z-40 lg:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`
        fixed inset-y-0 left-0 z-50 w-64 admin-sidebar transform transition-transform duration-300 ease-in-out
        lg:translate-x-0 lg:static lg:inset-0
        ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="flex items-center justify-between h-16 px-4 border-b border-gray-200">
          <div className="flex items-center gap-2">
            <Shield className="h-6 w-6 text-blue-600" />
            <h1 className="text-xl font-bold modern-title text-blue-600">Admin Panel</h1>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="lg:hidden"
            onClick={() => setIsMobileMenuOpen(false)}
          >
            <X className="h-5 w-5 text-gray-600" />
          </Button>
        </div>
        
        <nav className="p-4">
          <div className="space-y-2">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <Button
                  key={tab.id}
                  variant="ghost"
                  className={`w-full justify-start gap-2 admin-nav-item ${
                    activeTab === tab.id 
                      ? 'active' 
                      : ''
                  }`}
                  onClick={() => {
                    onTabChange(tab.id);
                    setIsMobileMenuOpen(false);
                  }}
                >
                  <Icon className="h-4 w-4" />
                  <span className="font-medium">{tab.label}</span>
                </Button>
              );
            })}
          </div>
          
          <Separator className="my-4" />
          
          <Button
            variant="ghost"
            className="w-full justify-start gap-2 text-red-600 hover:bg-red-50 hover:text-red-700"
            onClick={handleLogout}
          >
            <LogOut className="h-4 w-4" />
            <span className="font-medium">Logout</span>
          </Button>
          
          <div className="absolute bottom-4 left-4 right-4">
            <div className="flex items-center gap-2 text-xs modern-text">
              <Shield className="w-3 h-3" />
              <span>Admin Panel v2.0</span>
            </div>
          </div>
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 lg:ml-0 relative z-10">
        {/* Mobile Header */}
        <div className="lg:hidden glass border-b border-gray-200 px-4 py-3">
          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsMobileMenuOpen(true)}
              className="text-gray-600"
            >
              <Menu className="h-5 w-5" />
            </Button>
            <h1 className="text-lg font-semibold modern-subtitle text-blue-600">
              {tabs.find(tab => tab.id === activeTab)?.label}
            </h1>
            <div className="w-8" />
          </div>
        </div>

        {/* Content */}
        <div className="p-4 lg:p-6">
          {children}
        </div>
      </div>
    </div>
  );
}