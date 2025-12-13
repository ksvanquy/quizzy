'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { apiCall } from '@/lib/hooks/useFetch';

interface AttemptResult {
  _id: string;
  quizId: { title: string; _id: string };
  totalScore: number;
  isPassed: boolean;
  submittedAt: string;
}

export default function AttemptsPage() {
  const { token, isAuthenticated } = useAuth();
  const router = useRouter();
  const [attempts, setAttempts] = useState<AttemptResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/auth/login');
      return;
    }

    const fetchAttempts = async () => {
      try {
        setLoading(true);
        const data = await apiCall(
          `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'}/api/attempts`,
          {
            method: 'GET',
            headers: {
              Authorization: `Bearer ${token || ''}`,
            },
          }
        ) as any;
        setAttempts(data.attempts || []);
        setError('');
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load attempts');
      } finally {
        setLoading(false);
      }
    };

    fetchAttempts();
  }, [isAuthenticated, router, token]);

  if (!isAuthenticated) return null;

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <Link href="/" className="text-2xl font-bold text-blue-600">
              Quizzy
            </Link>
            <Link href="/quizzes" className="text-blue-600 hover:text-blue-800">
              Back to Quizzes
            </Link>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="text-4xl font-bold mb-8">My Attempts</h1>

        {loading && <p className="text-gray-600">Loading attempts...</p>}
        {error && <p className="text-red-600">{error}</p>}

        <div className="overflow-x-auto">
          <table className="w-full bg-white rounded-lg shadow-md">
            <thead className="bg-blue-600 text-white">
              <tr>
                <th className="px-6 py-3 text-left">Quiz</th>
                <th className="px-6 py-3 text-left">Score</th>
                <th className="px-6 py-3 text-left">Status</th>
                <th className="px-6 py-3 text-left">Date</th>
              </tr>
            </thead>
            <tbody>
              {attempts.map((attempt) => (
                <tr key={attempt._id} className="border-b hover:bg-gray-50">
                  <td className="px-6 py-3">{attempt.quizId?.title}</td>
                  <td className="px-6 py-3">{attempt.totalScore}</td>
                  <td className="px-6 py-3">
                    <span
                      className={`px-3 py-1 rounded-full text-sm font-bold ${
                        attempt.isPassed
                          ? 'bg-green-200 text-green-800'
                          : 'bg-red-200 text-red-800'
                      }`}
                    >
                      {attempt.isPassed ? 'PASSED' : 'FAILED'}
                    </span>
                  </td>
                  <td className="px-6 py-3">
                    {new Date(attempt.submittedAt).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {!loading && attempts.length === 0 && (
          <p className="text-center text-gray-600 mt-8">No attempts yet. Start a quiz!</p>
        )}
      </div>
    </div>
  );
}
