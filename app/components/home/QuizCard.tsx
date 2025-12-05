'use client';

import Link from 'next/link';

interface QuizCardProps {
  quiz: {
    _id: string;
    title: string;
    description?: string;
    difficulty: 'easy' | 'medium' | 'hard';
    duration: number;
    totalPoints: number;
    passingScore: number;
  };
}

const getDifficultyBadge = (difficulty: string) => {
  const styles: Record<string, string> = {
    easy: 'bg-green-100 text-green-700',
    medium: 'bg-yellow-100 text-yellow-700',
    hard: 'bg-red-100 text-red-700'
  };
  const labels: Record<string, string> = {
    easy: 'Dễ',
    medium: 'Trung bình',
    hard: 'Khó'
  };
  return (
    <span className={`px-2 py-1 rounded text-xs font-medium ${styles[difficulty] || ''}`}>
      {labels[difficulty] || difficulty}
    </span>
  );
};

export function QuizCard({ quiz }: QuizCardProps) {
  return (
    <Link href={`/quiz/${quiz._id}`}>
      <div className="group bg-white rounded-lg shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-200 hover:border-indigo-300 flex flex-col">
        {/* Card Header - Gradient Background */}
        <div className="bg-gradient-to-br from-indigo-500 to-purple-600 p-4 text-white relative">
          <div className="flex items-start justify-between mb-3">
            <div>{getDifficultyBadge(quiz.difficulty)}</div>
            
            {/* Bookmark & Watchlist Icons */}
            <div className="flex gap-1.5 flex-shrink-0">
              <button
                onClick={(e) => e.preventDefault()}
                className="p-1.5 rounded-full bg-white/20 hover:bg-white/30 transition backdrop-blur-sm"
                title="Thêm bookmark"
              >
                <svg className="w-4 h-4 stroke-white fill-none" viewBox="0 0 20 20" strokeWidth="2">
                  <path d="M10 2l2.5 6.5L19 9l-5 4.5L15 20l-5-3.5L5 20l1-6.5L1 9l6.5-.5L10 2z" />
                </svg>
              </button>
              <button
                onClick={(e) => e.preventDefault()}
                className="p-1.5 rounded-full bg-white/20 hover:bg-white/30 transition backdrop-blur-sm"
                title="Thêm vào watchlist"
              >
                <svg className="w-4 h-4 stroke-white fill-none" viewBox="0 0 20 20" strokeWidth="2">
                  <path d="M10 18l-1.45-1.32C3.4 12.36 0 9.28 0 5.5 0 2.42 2.42 0 5.5 0c1.74 0 3.41.81 4.5 2.09C11.09.81 12.76 0 14.5 0 17.58 0 20 2.42 20 5.5c0 3.78-3.4 6.86-8.55 11.18L10 18z" />
                </svg>
              </button>
            </div>
          </div>
          
          <h3 className="font-bold text-base line-clamp-2 min-h-[2.5rem] group-hover:text-indigo-100 transition">
            {quiz.title}
          </h3>
        </div>

        {/* Card Body */}
        <div className="p-4 flex-1 flex flex-col">
          {quiz.description && (
            <p className="text-gray-600 text-xs mb-3 line-clamp-2">
              {quiz.description}
            </p>
          )}
          
          <div className="space-y-2 text-xs text-gray-600 mt-auto">
            <div className="flex items-center gap-2">
              <span>⏱️</span>
              <span>{quiz.duration} phút</span>
            </div>
            <div className="flex items-center gap-2">
              <span>📝</span>
              <span>{quiz.totalPoints} điểm</span>
            </div>
            <div className="flex items-center gap-2">
              <span>🎯</span>
              <span>Điểm đạt: {quiz.passingScore}</span>
            </div>
          </div>
        </div>

        {/* Card Footer */}
        <div className="px-4 pb-4">
          <div className="bg-indigo-600 text-white text-center py-2 rounded-lg font-medium text-sm group-hover:bg-indigo-700 transition">
            Bắt Đầu Thi →
          </div>
        </div>
      </div>
    </Link>
  );
}
