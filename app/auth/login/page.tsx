'use client';

import { useState } from 'react';
import Link from 'next/link';
import { LoginForm } from '@/components/LoginForm';

export default function LoginPage() {
  const [hasAccount, setHasAccount] = useState(true);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center px-4">
      <div className="bg-white rounded-lg shadow-xl p-8 max-w-md w-full">
        <h1 className="text-3xl font-bold text-center mb-8 text-blue-600">Quizzy</h1>
        
        <LoginForm />

        <p className="text-center mt-4 text-gray-600">
          Don't have an account?{' '}
          <Link href="/auth/register" className="text-blue-600 hover:text-blue-800 font-bold">
            Register
          </Link>
        </p>

        <Link href="/" className="block text-center mt-4 text-gray-600 hover:text-gray-800">
          Back to Home
        </Link>
      </div>
    </div>
  );
}
