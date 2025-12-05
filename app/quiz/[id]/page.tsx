'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Header } from '@/app/components/home/Header';
import { useBookmarkWatchlist } from '@/app/hooks/useBookmarkWatchlist';
import { useAuth } from '@/lib/contexts/AuthContext';

interface QuizDetail {
  _id: string;
  title: string;
  description: string;
  category: { _id: string; name: string };
  difficulty: string;
  duration: number;
  totalPoints: number;
  passingScore: number;
  createdBy: { _id: string; name: string };
  questionIds?: any[];
}

export default function QuizDetailPage() {
  const params = useParams();
  const router = useRouter();
  const quizId = params?.id as string;
  const { token } = useAuth();
  const { toggleBookmark, toggleWatchlist, loading: actionLoading } = useBookmarkWatchlist();
  
  const [quiz, setQuiz] = useState<QuizDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [isInWatchlist, setIsInWatchlist] = useState(false);

  useEffect(() => {
    if (!quizId) return;

    const fetchQuiz = async () => {
      try {
        const response = await fetch(`/api/quizzes/${quizId}`);
        if (!response.ok) throw new Error('Failed to fetch quiz');
        const responseData = await response.json();
        const quizData = responseData.data || responseData;
        setQuiz(quizData);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchQuiz();
  }, [quizId]);

  // Fetch bookmark/watchlist status
  useEffect(() => {
    if (!quizId || !token) return;

    const fetchStatus = async () => {
      try {
        const headers: HeadersInit = {
          'Authorization': `Bearer ${token}`,
        };

        const [bookmarksRes, watchlistRes] = await Promise.all([
          fetch('/api/bookmarks', { headers }),
          fetch('/api/watchlist', { headers }),
        ]);

        if (bookmarksRes.ok) {
          const bookmarksData = await bookmarksRes.json();
          const bookmarkIds = (bookmarksData.data?.bookmarks || []).map((b: any) => 
            typeof b.quizId === 'string' ? b.quizId : b.quizId?._id
          );
          setIsBookmarked(bookmarkIds.includes(quizId));
        }

        if (watchlistRes.ok) {
          const watchlistData = await watchlistRes.json();
          const watchlistIds = (watchlistData.data?.watchlist || []).map((w: any) => 
            typeof w.quizId === 'string' ? w.quizId : w.quizId?._id
          );
          setIsInWatchlist(watchlistIds.includes(quizId));
        }
      } catch (err) {
        console.error('Error fetching bookmark/watchlist status:', err);
      }
    };

    fetchStatus();
  }, [quizId, token]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
        <Header />
        <main className="max-w-4xl mx-auto px-4 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-700 rounded mb-4 w-1/3"></div>
            <div className="h-4 bg-gray-700 rounded mb-8 w-2/3"></div>
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-20 bg-gray-700 rounded"></div>
              ))}
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (error || !quiz) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
        <Header />
        <main className="max-w-4xl mx-auto px-4 py-8">
          <div className="bg-red-500/20 border border-red-500 rounded-lg p-6 text-red-200">
            {error || 'Quiz not found'}
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      <Header />
      <main className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-gradient-to-br from-indigo-500/10 to-purple-600/10 border border-indigo-500/30 rounded-xl p-8 mb-8">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h1 className="text-4xl font-bold text-white mb-2">{quiz.title}</h1>
              <p className="text-gray-300">{quiz.description}</p>
            </div>
            <div className="text-right">
              <span className="inline-block bg-indigo-500/20 text-indigo-200 px-3 py-1 rounded-full text-sm font-medium">
                {quiz.difficulty === 'easy' ? 'Dễ' : quiz.difficulty === 'medium' ? 'Trung bình' : 'Khó'}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 py-6 border-t border-b border-indigo-500/20">
            <div>
              <p className="text-gray-400 text-sm">Thể loại</p>
              <p className="text-white font-semibold">{quiz.category.name}</p>
            </div>
            <div>
              <p className="text-gray-400 text-sm">Thời gian</p>
              <p className="text-white font-semibold">{quiz.duration} phút</p>
            </div>
            <div>
              <p className="text-gray-400 text-sm">Điểm tối đa</p>
              <p className="text-white font-semibold">{quiz.totalPoints}</p>
            </div>
            <div>
              <p className="text-gray-400 text-sm">Điểm qua</p>
              <p className="text-white font-semibold">{quiz.passingScore}</p>
            </div>
          </div>

          <div className="mt-6 flex gap-4">
            <button 
              onClick={() => router.push(`/quiz/${quizId}/attempt`)}
              className="flex-1 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-semibold py-3 px-6 rounded-lg transition"
            >
              Bắt Đầu Thi →
            </button>
            <button 
              onClick={async () => {
                const newState = await toggleBookmark(quizId, isBookmarked);
                setIsBookmarked(newState);
              }}
              disabled={actionLoading}
              className={`px-6 py-3 border rounded-lg font-semibold transition ${
                isBookmarked
                  ? 'bg-yellow-500/20 border-yellow-500/50 text-yellow-200 hover:bg-yellow-500/30'
                  : 'border-indigo-500/30 hover:bg-indigo-500/10 text-indigo-200'
              } disabled:opacity-50`}
            >
              {actionLoading ? '...' : isBookmarked ? '⭐ Đã lưu' : '☆ Lưu'}
            </button>
            <button 
              onClick={async () => {
                const newState = await toggleWatchlist(quizId, isInWatchlist);
                setIsInWatchlist(newState);
              }}
              disabled={actionLoading}
              className={`px-6 py-3 border rounded-lg font-semibold transition ${
                isInWatchlist
                  ? 'bg-blue-500/20 border-blue-500/50 text-blue-200 hover:bg-blue-500/30'
                  : 'border-indigo-500/30 hover:bg-indigo-500/10 text-indigo-200'
              } disabled:opacity-50`}
            >
              {actionLoading ? '...' : isInWatchlist ? '👁 Đang theo dõi' : '👁 Theo dõi'}
            </button>
          </div>
        </div>

        {/* Quiz Info Section */}
        <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-6 mb-6">
          <h2 className="text-xl font-bold text-white mb-4">Thông tin bài thi</h2>
          <ul className="space-y-2 text-gray-300">
            <li>📋 Được tạo bởi: <span className="text-white">{quiz.createdBy.name}</span></li>
            <li>🎯 Loại: <span className="text-white">Multiple Choice</span></li>
            <li>📝 Số câu hỏi: <span className="text-white">{quiz.questionIds?.length || 0}</span></li>
          </ul>
        </div>

        {/* Guidelines Section */}
        <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-6">
          <h2 className="text-xl font-bold text-white mb-4">Hướng dẫn làm bài</h2>
          <ul className="space-y-2 text-gray-300 list-disc list-inside">
            <li>Bạn có {quiz.duration} phút để hoàn thành bài thi</li>
            <li>Bạn không thể quay lại sau khi gửi câu trả lời</li>
            <li>Phải đạt ít nhất {quiz.passingScore} điểm để qua bài thi</li>
            <li>Kết quả sẽ được lưu vào hồ sơ của bạn</li>
          </ul>
        </div>
      </main>
    </div>
  );
}
