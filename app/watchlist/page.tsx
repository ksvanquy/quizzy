'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Header } from '@/app/components/home/Header';
import { useBookmarkWatchlist } from '@/app/hooks/useBookmarkWatchlist';

interface WatchlistQuiz {
  _id: string;
  quizId: {
    _id: string;
    title: string;
    description: string;
    difficulty: string;
    totalPoints: number;
    category: { name: string };
  };
  createdAt: string;
}

export default function WatchlistPage() {
  const router = useRouter();
  const { getWatchlist, toggleWatchlist, loading, error } = useBookmarkWatchlist();
  const [watchlist, setWatchlist] = useState<WatchlistQuiz[]>([]);
  const [pageLoading, setPageLoading] = useState(true);

  useEffect(() => {
    const fetchWatchlist = async () => {
      try {
        const data = await getWatchlist();
        setWatchlist(data);
      } finally {
        setPageLoading(false);
      }
    };

    fetchWatchlist();
  }, [getWatchlist]);

  const handleRemoveFromWatchlist = async (quizId: string) => {
    await toggleWatchlist(quizId, true);
    setWatchlist(prev => prev.filter(w => w.quizId._id !== quizId));
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      <Header />
      <main className="max-w-6xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">Bài thi đang theo dõi</h1>
          <p className="text-gray-400">Danh sách các bài thi bạn đang theo dõi để chuẩn bị</p>
        </div>

        {pageLoading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500 mx-auto"></div>
            <p className="text-gray-400 mt-4">Đang tải...</p>
          </div>
        ) : watchlist.length === 0 ? (
          <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-12 text-center">
            <p className="text-gray-400 text-lg">👁 Bạn chưa theo dõi bài thi nào cả</p>
            <button
              onClick={() => router.push('/')}
              className="mt-4 inline-block bg-indigo-500 hover:bg-indigo-600 text-white font-semibold py-2 px-6 rounded-lg transition"
            >
              Khám phá bài thi →
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {watchlist.map((item) => (
              <div
                key={item._id}
                className="bg-gray-800/50 border border-gray-700 rounded-lg overflow-hidden hover:border-blue-500/50 transition group cursor-pointer"
              >
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <h3 className="text-xl font-bold text-white group-hover:text-blue-400 transition">
                      {item.quizId.title}
                    </h3>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRemoveFromWatchlist(item.quizId._id);
                      }}
                      disabled={loading}
                      className="text-blue-400 hover:text-blue-300 disabled:opacity-50"
                    >
                      👁
                    </button>
                  </div>

                  <p className="text-gray-400 text-sm mb-4 line-clamp-2">
                    {item.quizId.description}
                  </p>

                  <div className="flex items-center gap-4 mb-4 text-sm text-gray-400">
                    <span className={getDifficultyColor(item.quizId.difficulty)}>
                      {getDifficultyText(item.quizId.difficulty)}
                    </span>
                    <span>•</span>
                    <span>{item.quizId.totalPoints} điểm</span>
                    <span>•</span>
                    <span>{item.quizId.category.name}</span>
                  </div>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      router.push(`/quiz/${item.quizId._id}`);
                    }}
                    className="w-full bg-indigo-500 hover:bg-indigo-600 text-white font-semibold py-2 px-4 rounded-lg transition"
                  >
                    Xem chi tiết
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
