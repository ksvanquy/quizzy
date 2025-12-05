import { NextRequest } from 'next/server';
import { connectDB } from '@/lib/db';
import { Attempt } from '@/lib/models/Attempt';
import { Quiz } from '@/lib/models/Quiz';
import { Question } from '@/lib/models/Question';
import { Option } from '@/lib/models/Option';
import { User } from '@/lib/models/User';
import { sendSuccess, sendError, withAuth } from '@/lib/utils/api';

export async function GET(request: NextRequest) {
  return withAuth(request, async (req, payload) => {
    try {
      await connectDB();

      const { searchParams } = new URL(request.url);
      const page = parseInt(searchParams.get('page') || '1');
      const limit = parseInt(searchParams.get('limit') || '10');

      const skip = (page - 1) * limit;

      const attempts = await Attempt.find({ userId: payload.userId })
        .populate('quizId')
        .populate('userId', 'username name')
        .skip(skip)
        .limit(limit)
        .sort({ createdAt: -1 });

      const total = await Attempt.countDocuments({ userId: payload.userId });

      return sendSuccess({
        attempts,
        pagination: { page, limit, total, pages: Math.ceil(total / limit) },
      });
    } catch (error) {
      console.error('Get attempts error:', error);
      return sendError('Internal server error', 500);
    }
  });
}

export async function POST(request: NextRequest) {
  return withAuth(request, async (req, payload) => {
    try {
      await connectDB();

      const body = await request.json();
      const { quizId } = body;

      if (!quizId) {
        return sendError('Quiz ID is required', 400);
      }

      const quiz = await Quiz.findById(quizId);
      if (!quiz) {
        return sendError('Quiz not found', 404);
      }

      // Check if user already has an in-progress attempt
      const existingAttempt = await Attempt.findOne({
        userId: payload.userId,
        quizId,
        status: 'in_progress',
      });

      if (existingAttempt) {
        return sendSuccess(existingAttempt, 'Existing attempt retrieved');
      }

      const attempt = await Attempt.create({
        userId: payload.userId,
        quizId,
        answers: quiz.questionIds.map((qId: any) => ({
          questionId: qId,
          userAnswer: null,
        })),
      });

      await attempt.populate('quizId').populate('userId', 'username name');

      return sendSuccess(attempt, 'Attempt started', 201);
    } catch (error) {
      console.error('Create attempt error:', error);
      return sendError('Internal server error', 500);
    }
  });
}
