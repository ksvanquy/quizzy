import { NextRequest } from 'next/server';
import { connectDB } from '@/lib/db';
import { Attempt } from '@/lib/models/Attempt';
import { Quiz } from '@/lib/models/Quiz';
import { Question } from '@/lib/models/Question';
import { Option } from '@/lib/models/Option';
import { User } from '@/lib/models/User';
import { sendSuccess, sendError, withAuth } from '@/lib/utils/api';

async function checkAnswer(question: any, userAnswer: any): Promise<boolean> {
  switch (question.type) {
    case 'single_choice':
      return userAnswer === question.correctOptionId?.toString();

    case 'multi_choice':
      if (!Array.isArray(userAnswer)) return false;
      const correctIds = question.correctOptionIds?.map((id: any) => id.toString()) || [];
      return (
        userAnswer.length === correctIds.length &&
        userAnswer.every((id: string) => correctIds.includes(id))
      );

    case 'true_false':
      return userAnswer === question.correctBoolean;

    case 'fill_blank':
    case 'cloze_test': {
      const answers = question.correctAnswers || [];
      if (question.caseSensitive) {
        return answers.includes(userAnswer);
      }
      return answers.map((a: string) => a.toLowerCase()).includes(userAnswer?.toLowerCase());
    }

    case 'numeric_input': {
      const tolerance = question.tolerance || 0;
      const diff = Math.abs(parseFloat(userAnswer) - question.correctNumber);
      return diff <= tolerance;
    }

    case 'ordering':
      return JSON.stringify(userAnswer) === JSON.stringify(question.correctOrder);

    case 'matching':
      return JSON.stringify(userAnswer) === JSON.stringify(question.correctPairs);

    default:
      return false;
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  return withAuth(request, async (req, payload) => {
    try {
      await connectDB();
      const { id } = await params;

      const attempt = await Attempt.findById(id)
        .populate('quizId')
        .populate({
          path: 'answers.questionId',
          model: 'Question',
        });

      if (!attempt) {
        return sendError('Attempt not found', 404);
      }

      if (attempt.userId.toString() !== payload.userId) {
        return sendError('Unauthorized', 403);
      }

      return sendSuccess(attempt);
    } catch (error) {
      console.error('Get attempt error:', error);
      return sendError('Internal server error', 500);
    }
  });
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  return withAuth(request, async (req, payload) => {
    try {
      await connectDB();
      const { id } = await params;
      const body = await request.json();
      const { questionId, userAnswer } = body;

      if (!questionId || userAnswer === undefined) {
        return sendError('Question ID and user answer are required', 400);
      }

      const attempt = await Attempt.findById(id);
      if (!attempt) {
        return sendError('Attempt not found', 404);
      }

      if (attempt.userId.toString() !== payload.userId) {
        return sendError('Unauthorized', 403);
      }

      if (attempt.status !== 'in_progress') {
        return sendError('Attempt is not in progress', 400);
      }

      const question = await Question.findById(questionId);
      if (!question) {
        return sendError('Question not found', 404);
      }

      const isCorrect = await checkAnswer(question, userAnswer);
      const pointsEarned = isCorrect ? question.points : 0;

      const answerIndex = attempt.answers.findIndex(
        (a: any) => a.questionId.toString() === questionId
      );

      if (answerIndex >= 0) {
        attempt.answers[answerIndex].userAnswer = userAnswer;
        attempt.answers[answerIndex].isCorrect = isCorrect;
        attempt.answers[answerIndex].pointsEarned = pointsEarned;
      }

      await attempt.save();
      await attempt.populate({
        path: 'answers.questionId',
        model: 'Question',
      });

      return sendSuccess(attempt, 'Answer saved');
    } catch (error) {
      console.error('Update answer error:', error);
      return sendError('Internal server error', 500);
    }
  });
}
