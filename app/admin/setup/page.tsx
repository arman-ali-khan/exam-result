'use client';

import { CreateAdminUser } from '../create-admin';

export default function AdminSetupPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-green-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-green-700 mb-2">
            Admin Setup
          </h1>
          <p className="text-gray-600">
            Create your first admin user to get started
          </p>
        </div>
        <CreateAdminUser />
      </div>
    </div>
  );
}