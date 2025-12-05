'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Header } from '@/app/components/home/Header';
import { useAuth } from '@/lib/contexts/AuthContext';

interface QuizAttempt {
  _id: string;
  quizId: {
    _id: string;
    title: string;
    description: string;
    difficulty: string;
    totalPoints: number;
    questionIds?: any[];
  };
  totalScore: number;
  isPassed: boolean;
  createdAt: string;
  submittedAt: string;
  startedAt: string;
}

export default function HistoryPage() {
  const router = useRouter();
  const { token, loading: authLoading } = useAuth();
  const [attempts, setAttempts] = useState<QuizAttempt[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Wait for auth to finish loading
    if (authLoading) {
      return;
    }

    if (!token) {
      setError('Vui lòng đăng nhập');
      setLoading(false);
      return;
    }

    const fetchAttempts = async () => {
      try {
        const headers: HeadersInit = {
          'Authorization': `Bearer ${token}`,
        };

        const response = await fetch('/api/attempts', { headers });
        if (!response.ok) throw new Error('Failed to fetch attempts');

        const data = await response.json();
        const attemptsData = data.data?.attempts || data.data || [];
        
        // Sort by most recent first
        const sorted = attemptsData.sort((a: any, b: any) => 
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
        
        setAttempts(sorted);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
        console.error('Error fetching attempts:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchAttempts();
  }, [token, authLoading]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy':
        return 'text-green-400';
      case 'medium':
        return 'text-yellow-400';
      case 'hard':
        return 'text-red-400';
      default:
        return 'text-gray-400';
    }
  };

  const getDifficultyText = (difficulty: string) => {
    switch (difficulty) {
      case 'easy':
        return 'Dễ';
      case 'medium':
        return 'Trung bình';
      case 'hard':
        return 'Khó';
      default:
        return difficulty;
    }
  };

  const calculatePercentage = (score: number, maxPoints: number) => {
    return maxPoints ? Math.round((score / maxPoints) * 100) : 0;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      <Header />
      <main className="max-w-6xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">Lịch Sử Làm Bài</h1>
          <p className="text-gray-400">Xem lại các bài thi bạn đã hoàn thành</p>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500 mx-auto"></div>
            <p className="text-gray-400 mt-4">Đang tải...</p>
          </div>
        ) : authLoading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500 mx-auto"></div>
            <p className="text-gray-400 mt-4">Đang xác thực...</p>
          </div>
        ) : error ? (
          <div className="bg-red-500/20 border border-red-500 rounded-lg p-6 text-red-200">
            {error}
          </div>
        ) : attempts.length === 0 ? (
          <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-12 text-center">
            <p className="text-gray-400 text-lg">📝 Bạn chưa làm bài thi nào cả</p>
            <button
              onClick={() => router.push('/')}
              className="mt-4 inline-block bg-indigo-500 hover:bg-indigo-600 text-white font-semibold py-2 px-6 rounded-lg transition"
            >
              Khám phá bài thi →
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {attempts.map((attempt) => {
              // Calculate actual max points from questions like the result page does
              const actualMaxPoints = attempt.quizId.questionIds?.reduce((sum: number, q: any) => sum + (q.points || 0), 0) || attempt.quizId.totalPoints || 0;
              const percentage = calculatePercentage(attempt.totalScore, actualMaxPoints);
              const statusColor = attempt.isPassed
                ? 'bg-green-500/10 border-green-500/30'
                : 'bg-red-500/10 border-red-500/30';
              const statusText = attempt.isPassed ? 'Vượt qua' : 'Không vượt qua';
              const statusTextColor = attempt.isPassed ? 'text-green-400' : 'text-red-400';

              return (
                <div
                  key={attempt._id}
                  className={`border rounded-lg p-6 ${statusColor} backdrop-blur-sm hover:shadow-lg transition`}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-xl font-bold text-white">
                          {attempt.quizId.title}
                        </h3>
                        <span className={getDifficultyColor(attempt.quizId.difficulty)}>
                          {getDifficultyText(attempt.quizId.difficulty)}
                        </span>
                      </div>
                      <p className="text-gray-400 text-sm line-clamp-1">
                        {attempt.quizId.description}
                      </p>
                    </div>
                    <div className="text-right flex-shrink-0 ml-4">
                      <div className="text-3xl font-bold text-white mb-1">
                        {percentage}%
                      </div>
                      <div className={`text-sm font-semibold ${statusTextColor}`}>
                        {statusText}
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4 py-4 border-t border-gray-700">
                    <div>
                      <p className="text-gray-400 text-xs">Điểm</p>
                      <p className="text-white font-semibold">
                        {attempt.totalScore}/{actualMaxPoints}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-400 text-xs">Ngày làm</p>
                      <p className="text-white font-semibold text-sm">
                        {formatDate(attempt.createdAt)}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-400 text-xs">Trạng thái</p>
                      <p className={`font-semibold text-sm ${statusTextColor}`}>
                        {statusText}
                      </p>
                    </div>
                    <div className="text-right">
                      <button
                        onClick={() => router.push(`/result/${attempt._id}`)}
                        className="inline-block bg-indigo-500 hover:bg-indigo-600 text-white font-semibold py-2 px-4 rounded-lg transition text-sm"
                      >
                        Xem chi tiết →
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
