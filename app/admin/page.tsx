'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { AdminLayout } from '@/components/ui/admin-layout';
import { AdminDashboard } from '@/components/admin/dashboard';
import { StudentManagement } from '@/components/admin/student-management';
import { ResultManagement } from '@/components/admin/result-management';
import { SubjectManagement } from '@/components/admin/subject-management';
import { BoardManagement } from '@/components/admin/board-management';
import { SessionManagement } from '@/components/admin/session-management';
import { ExcelUpload } from '@/components/admin/excel-upload';
import { AdminLogin } from '@/components/admin/admin-login';
import { supabase, getCurrentUser, isAdmin } from '@/lib/supabase';
import { Loader2 } from 'lucide-react';

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [user, setUser] = useState<any>(null);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    checkAuthAndRole();
  }, []);

  const checkAuthAndRole = async () => {
    try {
      console.log('Checking authentication and role...');
      
      const currentUser = await getCurrentUser();
      console.log('Current user:', currentUser);
      
      if (!currentUser) {
        console.log('No user found');
        setIsLoading(false);
        return;
      }

      setUser(currentUser);
      
      const isUserAdmin = await isAdmin(currentUser.id);
      console.log('Is user admin?', isUserAdmin);
      
      if (!isUserAdmin) {
        console.log('User is not admin, redirecting to home');
        router.push('/');
        return;
      }

      console.log('User is admin, setting role');
      setUserRole('admin');
    } catch (error) {
      console.error('Error checking auth:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLoginSuccess = () => {
    console.log('Login success callback triggered');
    checkAuthAndRole();
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!user || userRole !== 'admin') {
    return <AdminLogin onLoginSuccess={handleLoginSuccess} />;
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <AdminDashboard />;
      case 'students':
        return <StudentManagement />;
      case 'results':
        return <ResultManagement />;
      case 'subjects':
        return <SubjectManagement />;
      case 'boards':
        return <BoardManagement />;
      case 'sessions':
        return <SessionManagement />;
      case 'upload':
        return <ExcelUpload />;
      default:
        return <AdminDashboard />;
    }
  };

  return (
    <AdminLayout activeTab={activeTab} onTabChange={setActiveTab}>
      {renderContent()}
    </AdminLayout>
  );
}