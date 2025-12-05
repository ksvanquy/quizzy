'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Header } from '@/app/components/home/Header';
import QuestionRenderer from '@/app/components/questions/QuestionRenderer';
import { useAuth } from '@/lib/contexts/AuthContext';

interface Question {
  _id: string;
  text: string;
  type: string;
  optionIds?: any[];
  difficulty: string;
  points: number;
}

interface QuizAttempt {
  _id: string;
  title: string;
  duration: number;
  questionIds: Question[];
  totalPoints: number;
  passingScore: number;
}

export default function QuizAttemptPage() {
  const params = useParams();
  const router = useRouter();
  const { token } = useAuth();
  const quizId = params?.id as string;
  
  const [quiz, setQuiz] = useState<QuizAttempt | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [startedAt] = useState(new Date());

  useEffect(() => {
    if (!quizId) return;

    const fetchQuiz = async () => {
      try {
        const response = await fetch(`/api/quizzes/${quizId}`);
        if (!response.ok) throw new Error('Failed to fetch quiz');
        const responseData = await response.json();
        const quizData = responseData.data || responseData;
        setQuiz(quizData);
        setTimeRemaining(quizData.duration * 60); // Convert to seconds
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchQuiz();
  }, [quizId]);

  // Timer
  useEffect(() => {
    if (!quiz || isSubmitted) return;

    const timer = setInterval(() => {
      setTimeRemaining(prev => {
        if (prev <= 0) {
          handleSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [quiz, isSubmitted]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const currentQuestion = quiz?.questionIds[currentQuestionIndex];

  const handleAnswerChange = (value: any) => {
    if (!currentQuestion) return;
    setAnswers(prev => ({
      ...prev,
      [currentQuestion._id]: value
    }));
  };

  const handleNext = () => {
    if (currentQuestionIndex < (quiz?.questionIds.length || 0) - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    }
  };

  const handlePrev = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
    }
  };

  const handleSubmit = async () => {
    // Show confirmation dialog
    const confirmed = window.confirm('Bạn chắc chắn muốn nộp bài? Bạn không thể thay đổi câu trả lời sau khi nộp.');
    
    if (!confirmed) {
      return; // User cancelled
    }

    setIsSubmitted(true);
    setIsSubmitting(true);
    
    try {
      const headers: HeadersInit = { 'Content-Type': 'application/json' };
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const response = await fetch(`/api/attempts`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          quizId,
          answers,
          startedAt: startedAt.toISOString(),
        }),
      });

      const data = await response.json();
      
      if (!response.ok) {
        console.error('Submit response error:', data);
        throw new Error(data.message || 'Failed to submit quiz');
      }
      
      // Redirect to results page
      const attemptId = data.data?._id || data._id;
      if (!attemptId) {
        console.error('No attempt ID in response:', data);
        throw new Error('No attempt ID returned');
      }
      
      router.push(`/result/${attemptId}`);
    } catch (err) {
      console.error('Submit error:', err);
      alert(`Failed to submit quiz: ${err instanceof Error ? err.message : 'Unknown error'}`);
      setIsSubmitted(false);
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center text-gray-600">Đang tải bài thi...</div>
        </div>
      </div>
    );
  }

  if (error || !quiz || !currentQuestion) {
    return (
      <div className="min-h-screen bg-white">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6">
            <p className="text-red-700 font-semibold mb-4">{error || 'Bài thi không tìm thấy'}</p>
            <button
              onClick={() => router.push('/')}
              className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
            >
              Quay về Trang Chủ
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <Header />
      
      <header className="flex justify-between items-center p-3 bg-indigo-50 border-b sticky top-16 z-10">
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-gray-900">{quiz.title}</h1>
        </div>
        <div className={`font-mono text-lg px-4 py-1 rounded-full shadow-lg text-white ${timeRemaining < 300 ? 'bg-red-500' : 'bg-green-500'}`}>
          ⏰ {formatTime(timeRemaining)}
        </div>
      </header>

      <div className="container mx-auto px-4 max-w-6xl py-6">
        <div className="grid grid-cols-12 gap-6">
          {/* Main Question Area */}
          <div className="col-span-9 bg-white p-6 rounded-lg shadow">
            {currentQuestion ? (
              <QuestionRenderer
                question={currentQuestion}
                selectedAnswer={answers[currentQuestion._id]}
                onAnswerChange={handleAnswerChange}
              />
            ) : (
              <div className="text-center text-gray-500">Đang tải câu hỏi...</div>
            )}

            {/* Navigation Footer */}
            <footer className="mt-8 flex justify-between pt-4 border-t">
              <button
                onClick={handlePrev}
                disabled={currentQuestionIndex === 0}
                className={`px-4 py-2 rounded font-semibold transition ${
                  currentQuestionIndex === 0 
                    ? 'bg-gray-200 text-gray-400 cursor-not-allowed' 
                    : 'bg-gray-300 text-gray-800 hover:bg-gray-400'
                }`}
              >
                ← Câu Trước
              </button>
              <button
                onClick={handleNext}
                disabled={currentQuestionIndex === quiz.questionIds.length - 1}
                className={`px-4 py-2 rounded font-semibold transition ${
                  currentQuestionIndex === quiz.questionIds.length - 1 
                    ? 'bg-gray-200 text-gray-400 cursor-not-allowed' 
                    : 'bg-indigo-600 text-white hover:bg-indigo-700'
                }`}
              >
                Câu Tiếp Theo →
              </button>
            </footer>
          </div>

          {/* Sidebar - Question Status */}
          <div className="col-span-3">
            <div className="bg-white p-4 rounded-lg shadow sticky top-24">
              <h4 className="font-semibold text-gray-900 mb-3">Tình trạng bài làm</h4>
              <div className="grid grid-cols-5 gap-2 mb-6">
                {quiz.questionIds.map((q, index) => {
                  const isAnswered = q._id in answers && answers[q._id] !== undefined && answers[q._id] !== '';
                  const isCurrent = index === currentQuestionIndex;
                  
                  return (
                    <button
                      key={`q-${index}`}
                      onClick={() => setCurrentQuestionIndex(index)}
                      className={`w-8 h-8 rounded-full text-sm font-semibold transition ${
                        isCurrent
                          ? 'bg-indigo-700 text-white ring-2 ring-indigo-300'
                          : isAnswered
                          ? 'bg-indigo-500 text-white'
                          : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                      }`}
                    >
                      {index + 1}
                    </button>
                  );
                })}
              </div>
              
              <button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className={`w-full py-3 rounded font-bold text-white transition ${
                  isSubmitting
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-red-600 hover:bg-red-700'
                }`}
              >
                {isSubmitting ? '⏳ Đang nộp bài...' : 'NỘP BÀI'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
