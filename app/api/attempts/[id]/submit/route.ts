import { NextRequest } from 'next/server';
import { connectDB } from '@/lib/db';
import { Attempt } from '@/lib/models/Attempt';
import { Quiz } from '@/lib/models/Quiz';
import { Question } from '@/lib/models/Question';
import { User } from '@/lib/models/User';
import { sendSuccess, sendError, withAuth } from '@/lib/utils/api';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  return withAuth(request, async (req, payload) => {
    try {
      await connectDB();
      const resolved = await params;
      const id = resolved.id;

      const attempt = await Attempt.findById(id);
      if (!attempt) {
        return sendError('Attempt not found', 404);
      }

      if (attempt.userId.toString() !== payload.userId) {
        return sendError('Unauthorized', 403);
      }

      if (attempt.status !== 'in_progress') {
        return sendError('Attempt already submitted', 400);
      }

      const quiz = await Quiz.findById(attempt.quizId);
      if (!quiz) {
        return sendError('Quiz not found', 404);
      }

      // Calculate total score
      const totalScore = attempt.answers.reduce(
        (sum: number, answer: any) => sum + (answer.pointsEarned || 0),
        0
      );

      const isPassed = totalScore >= quiz.passingScore;

      attempt.submittedAt = new Date();
      attempt.status = 'graded';
      attempt.totalScore = totalScore;
      attempt.isPassed = isPassed;

      await attempt.save();

      return sendSuccess(
        {
          attemptId: attempt._id,
          totalScore,
          isPassed,
          passingScore: quiz.passingScore,
          totalPoints: quiz.totalPoints,
        },
        'Quiz submitted'
      );
    } catch (error) {
      console.error('Submit quiz error:', error);
      return sendError('Internal server error', 500);
    }
  });
}
