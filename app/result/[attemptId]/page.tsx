'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Header } from '@/app/components/home/Header';
import { useAuth } from '@/lib/contexts/AuthContext';

interface Answer {
  questionId: string;
  userAnswer: any;
  isCorrect: boolean;
  pointsEarned: number;
}

interface Question {
  _id: string;
  text: string;
  type: string;
  correctOptionId?: string;
  correctOptionIds?: string[];
  correctBoolean?: boolean;
  correctAnswers?: string[];
  correctNumber?: number;
  correctOrder?: any[];
  correctPairs?: Record<string, string>;
  points: number;
  optionIds?: any[];
  items?: Array<{ id: string; text: string }>;
  leftItems?: Array<{ id: string; text: string }>;
  rightItems?: Array<{ id: string; text: string }>;
}

interface Quiz {
  _id: string;
  title: string;
  description: string;
  totalPoints: number;
  passingScore: number;
  duration: number;
  questionIds: Question[];
}

interface AttemptData {
  _id: string;
  userId: string;
  quizId: Quiz;
  answers: Answer[];
  totalScore: number;
  isPassed: boolean;
  status: string;
  startedAt: string;
  submittedAt: string;
  createdAt: string;
}

export default function ResultPage() {
  const params = useParams();
  const router = useRouter();
  const { token } = useAuth();
  const attemptId = params?.attemptId as string;

  const [attempt, setAttempt] = useState<AttemptData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!attemptId) return;

    const fetchAttempt = async () => {
      try {
        const headers: HeadersInit = { 'Content-Type': 'application/json' };
        if (token) {
          headers['Authorization'] = `Bearer ${token}`;
        }

        const response = await fetch(`/api/attempts/${attemptId}`, { headers });
        if (!response.ok) throw new Error('Failed to fetch attempt');
        const data = await response.json();
        setAttempt(data.data || data);
      } catch (err) {
        console.error('Error fetching attempt:', err);
        setError('Không thể tải kết quả bài thi');
      } finally {
        setLoading(false);
      }
    };

    fetchAttempt();
  }, [attemptId, token]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center text-gray-600">Đang tải kết quả...</div>
        </div>
      </div>
    );
  }

  if (error || !attempt) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6">
            <p className="text-red-700 font-semibold">{error || 'Không tìm thấy kết quả'}</p>
          </div>
        </div>
      </div>
    );
  }

  const quiz = attempt.quizId as any;
  
  // Calculate actual max points from questions
  const actualMaxPoints = quiz?.questionIds?.reduce((sum: number, q: any) => sum + (q.points || 0), 0) || quiz?.totalPoints || 0;
  
  // Calculate percentage based on actual max points
  const percentage = actualMaxPoints ? Math.round((attempt.totalScore / actualMaxPoints) * 100) : 0;
  
  const timeSpent = attempt.submittedAt && attempt.startedAt 
    ? Math.max(0, Math.floor((new Date(attempt.submittedAt).getTime() - new Date(attempt.startedAt).getTime()) / 1000))
    : 0;
  const minutes = Math.floor(timeSpent / 60);
  const seconds = timeSpent % 60;

  // Helper to get item text by ID from question.items
  const getItemText = (itemId: string, question: Question): string => {
    const item = question.items?.find((i: any) => i.id === itemId);
    return item?.text || itemId;
  };

  // Helper to get matching text by ID
  const getMatchingText = (itemId: string, items: Array<{ id: string; text: string }> | undefined): string => {
    const item = items?.find((i: any) => i.id === itemId);
    return item?.text || itemId;
  };

  const getCorrectAnswerText = (question: Question, answer: Answer) => {
    switch (question.type) {
      case 'single_choice':
      case 'multi_choice': {
        const optionIds = question.type === 'single_choice' 
          ? [question.correctOptionId]
          : question.correctOptionIds;
        return question.optionIds
          ?.filter((opt: any) => optionIds?.includes(opt._id))
          .map((opt: any) => opt.text)
          .join(', ') || 'N/A';
      }
      case 'true_false':
        return question.correctBoolean ? 'Đúng' : 'Sai';
      case 'fill_blank':
      case 'cloze_test': {
        const answers = question.correctAnswers || [];
        if (answers.length === 0) return 'N/A';
        if (answers.length === 1) return answers[0];
        return `${answers[0]} (hoặc ${answers.slice(1).join(', ')})`;
      }
      case 'numeric_input':
        return String(question.correctNumber);
      case 'ordering':
        return Array.isArray(question.correctOrder)
          ? question.correctOrder
              .map((itemId: string, idx: number) => `${idx + 1}. ${getItemText(itemId, question)}`)
              .join(' → ')
          : 'Xem đáp án đúng';
      case 'matching':
        return typeof question.correctPairs === 'object' && question.correctPairs
          ? Object.entries(question.correctPairs)
              .map(([leftId, rightId]: any) => 
                `${getMatchingText(leftId, question.leftItems)} → ${getMatchingText(rightId, question.rightItems)}`
              )
              .join('; ')
          : 'Xem đáp án đúng';
      default:
        return 'N/A';
    }
  };

  const getUserAnswerText = (question: Question, answer: Answer) => {
    if (!answer.userAnswer) return '(Không trả lời)';
    
    switch (question.type) {
      case 'single_choice':
      case 'multi_choice': {
        const optionIds = Array.isArray(answer.userAnswer) ? answer.userAnswer : [answer.userAnswer];
        return question.optionIds
          ?.filter((opt: any) => optionIds.includes(opt._id))
          .map((opt: any) => opt.text)
          .join(', ') || '(Không trả lời)';
      }
      case 'true_false': {
        // Handle both string and boolean values
        const isTruthy = answer.userAnswer === true || answer.userAnswer === 'true';
        return isTruthy ? 'Đúng' : 'Sai';
      }
      case 'fill_blank':
      case 'cloze_test': {
        if (!answer.userAnswer) return '(Không trả lời)';
        return `"${answer.userAnswer}"`;
      }
      case 'numeric_input':
        return String(answer.userAnswer);
      case 'ordering':
        return Array.isArray(answer.userAnswer)
          ? answer.userAnswer
              .map((itemId: string, idx: number) => `${idx + 1}. ${getItemText(itemId, question)}`)
              .join(' → ')
          : '(Không trả lời)';
      case 'matching':
        return typeof answer.userAnswer === 'object' && answer.userAnswer
          ? Object.entries(answer.userAnswer)
              .map(([leftId, rightId]: any) => 
                `${getMatchingText(leftId, question.leftItems)} → ${getMatchingText(rightId, question.rightItems)}`
              )
              .join('; ')
          : '(Không trả lời)';
      default:
        return String(answer.userAnswer);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="container mx-auto px-4 py-8">
        {/* Header Section */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">{quiz?.title || 'Bài thi'}</h1>
          <p className="text-gray-600">{quiz?.description}</p>
        </div>

        {/* Score Section */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          {/* Main Score Card */}
          <div className={`md:col-span-2 rounded-lg shadow-md p-8 text-white ${attempt.isPassed ? 'bg-green-500' : 'bg-red-500'}`}>
            <div className="text-center">
              <p className="text-sm font-semibold opacity-90 mb-2">KẾT QUẢ</p>
              <div className="text-6xl font-bold mb-2">{percentage}%</div>
              <p className="text-2xl font-semibold mb-4">
                {attempt.totalScore}/{actualMaxPoints} điểm
              </p>
              <div className="text-lg">
                {attempt.isPassed ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="text-2xl">✓</span> Vượt qua
                  </span>
                ) : (
                  <span className="flex items-center justify-center gap-2">
                    <span className="text-2xl">✗</span> Không vượt qua
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Info Cards */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <p className="text-sm text-gray-600 mb-1">Điểm cần vượt qua</p>
            <p className="text-2xl font-bold text-gray-900">{quiz?.passingScore || 0}</p>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <p className="text-sm text-gray-600 mb-1">Thời gian hoàn thành</p>
            <p className="text-2xl font-bold text-gray-900">{minutes}:{seconds.toString().padStart(2, '0')}</p>
          </div>
        </div>

        {/* Results Grid */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden mb-8">
          <div className="px-6 py-4 bg-gray-100 border-b border-gray-200">
            <h2 className="text-xl font-bold text-gray-900">Chi tiết từng câu</h2>
          </div>
          
          <div className="divide-y divide-gray-200">
            {attempt.answers.map((answer, index) => {
              const question = quiz?.questionIds?.find((q: any) => q._id === answer.questionId) || {
                _id: answer.questionId,
                text: 'Câu hỏi không tìm thấy',
                type: 'unknown',
                points: 0,
              } as Question;

              return (
                <div key={`result-${index}`} className="px-6 py-6 hover:bg-gray-50 transition-colors">
                  {/* Question Number and Title */}
                  <div className="flex items-start gap-4 mb-4">
                    <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center font-bold text-white ${answer.isCorrect ? 'bg-green-500' : 'bg-red-500'}`}>
                      {answer.isCorrect ? '✓' : '✗'}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="text-sm text-gray-500">Câu {index + 1}</p>
                        <span className={`text-xs font-semibold px-2 py-1 rounded ${question.type === 'single_choice' ? 'bg-blue-100 text-blue-800' : question.type === 'multi_choice' ? 'bg-purple-100 text-purple-800' : question.type === 'true_false' ? 'bg-indigo-100 text-indigo-800' : question.type === 'fill_blank' ? 'bg-yellow-100 text-yellow-800' : question.type === 'numeric_input' ? 'bg-orange-100 text-orange-800' : question.type === 'ordering' ? 'bg-pink-100 text-pink-800' : question.type === 'matching' ? 'bg-teal-100 text-teal-800' : 'bg-gray-100 text-gray-800'}`}>
                          {question.type === 'single_choice' ? 'Một lựa chọn' : question.type === 'multi_choice' ? 'Nhiều lựa chọn' : question.type === 'true_false' ? 'Đúng/Sai' : question.type === 'fill_blank' ? 'Điền vào chỗ trống' : question.type === 'numeric_input' ? 'Nhập số' : question.type === 'ordering' ? 'Sắp xếp' : question.type === 'matching' ? 'Ghép đôi' : question.type}
                        </span>
                      </div>
                      <p className="text-gray-900 font-semibold">{question.text}</p>
                    </div>
                    <div className="flex-shrink-0 text-right">
                      <p className="text-sm font-bold">
                        {answer.pointsEarned}/{question.points} điểm
                      </p>
                    </div>
                  </div>

                  {/* Answers Comparison */}
                  <div className="ml-14 space-y-3">
                    <div className={`p-3 rounded-lg border ${answer.isCorrect ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
                      <p className="text-xs text-gray-600 font-semibold mb-1">CÂU TRẢ LỜI CỦA BẠN</p>
                      <p className={`text-sm ${answer.isCorrect ? 'text-green-900' : 'text-red-900'}`}>
                        {getUserAnswerText(question, answer)}
                      </p>
                    </div>

                    {!answer.isCorrect && (
                      <div className="p-3 rounded-lg border bg-blue-50 border-blue-200">
                        <p className="text-xs text-gray-600 font-semibold mb-1">ĐÁP ÁN ĐÚNG</p>
                        <p className="text-sm text-blue-900">
                          {getCorrectAnswerText(question, answer)}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-4 justify-center">
          <button
            onClick={() => router.push(`/quiz/${quiz?._id}/attempt`)}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors"
          >
            Thử lại
          </button>
          <button
            onClick={() => router.push('/')}
            className="px-6 py-3 bg-gray-600 text-white rounded-lg font-semibold hover:bg-gray-700 transition-colors"
          >
            Quay về Trang Chủ
          </button>
        </div>
      </div>
    </div>
  );
}
