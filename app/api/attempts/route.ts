import { NextRequest } from 'next/server';
import { connectDB } from '@/lib/db';
import { Attempt } from '@/lib/models/Attempt';
import { Quiz } from '@/lib/models/Quiz';
import { Question } from '@/lib/models/Question';
import { Option } from '@/lib/models/Option';
import { User } from '@/lib/models/User';
import { FillBlank } from '@/lib/models/FillBlank';
import { NumericInput } from '@/lib/models/NumericInput';
import { Ordering } from '@/lib/models/Ordering';
import { Matching } from '@/lib/models/Matching';
import { sendSuccess, sendError, withAuth } from '@/lib/utils/api';

async function checkAnswer(question: any, userAnswer: any): Promise<boolean> {
  // If no user answer provided, return false
  if (userAnswer === null || userAnswer === undefined || userAnswer === '') {
    return false;
  }

  switch (question.type) {
    case 'single_choice':
      return userAnswer === question.correctOptionId?.toString();

    case 'multi_choice':
      if (!Array.isArray(userAnswer)) return false;
      if (userAnswer.length === 0) return false;
      const correctIds = question.correctOptionIds?.map((id: any) => id.toString()) || [];
      if (correctIds.length === 0) return false;
      return (
        userAnswer.length === correctIds.length &&
        userAnswer.every((id: string) => correctIds.includes(id))
      );

    case 'true_false':
      // Convert string to boolean if needed
      let userBool = userAnswer;
      if (typeof userAnswer === 'string') {
        userBool = userAnswer === 'true';
      }
      return userBool === question.correctBoolean;

    case 'fill_blank':
    case 'cloze_test': {
      const answers = question.correctAnswers || [];
      if (answers.length === 0) return false;
      if (question.caseSensitive) {
        return answers.includes(userAnswer);
      }
      return answers
        .map((a: string) => a.toLowerCase())
        .includes(userAnswer?.toLowerCase?.() ?? '');
    }

    case 'numeric_input': {
      const tolerance = question.tolerance || 0;
      const userNum = parseFloat(userAnswer);
      if (isNaN(userNum)) return false;
      const diff = Math.abs(userNum - question.correctNumber);
      return diff <= tolerance;
    }

    case 'ordering': {
      const userOrder = JSON.stringify(userAnswer);
      const correctOrder = JSON.stringify(question.correctOrder);
      return userOrder === correctOrder;
    }

    case 'matching': {
      const userPairs = JSON.stringify(userAnswer);
      const correctPairs = JSON.stringify(question.correctPairs);
      return userPairs === correctPairs;
    }

    default:
      return false;
  }
}

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
      const { quizId, answers } = body;

      if (!quizId) {
        return sendError('Quiz ID is required', 400);
      }

      if (!answers || typeof answers !== 'object') {
        return sendError('Answers object is required', 400);
      }

      const quiz = await Quiz.findById(quizId).lean() as any;
      if (!quiz) {
        return sendError('Quiz not found', 404);
      }

      // Fetch all questions from all collections (like quiz detail API)
      const [regularQuestions, fillBlanks, numericInputs, orderings, matchings] = await Promise.all([
        Question.find({ _id: { $in: quiz.questionIds } })
          .select('+optionIds')
          .populate('optionIds')
          .lean(),
        FillBlank.find({ _id: { $in: quiz.questionIds } }).lean(),
        NumericInput.find({ _id: { $in: quiz.questionIds } }).lean(),
        Ordering.find({ _id: { $in: quiz.questionIds } }).lean(),
        Matching.find({ _id: { $in: quiz.questionIds } }).lean(),
      ]);

      const allQuestions = [...regularQuestions, ...fillBlanks, ...numericInputs, ...orderings, ...matchings];

      // Map questions and add type field for non-regular questions
      const mappedQuestions = quiz.questionIds.map((qId: any) => {
        const question = allQuestions.find((q: any) => q._id.toString() === qId.toString());
        if (!question) return null;

        if (!question.type) {
          if (fillBlanks.some((q: any) => q._id.toString() === qId.toString())) {
            question.type = 'fill_blank';
          } else if (numericInputs.some((q: any) => q._id.toString() === qId.toString())) {
            question.type = 'numeric_input';
          } else if (orderings.some((q: any) => q._id.toString() === qId.toString())) {
            question.type = 'ordering';
          } else if (matchings.some((q: any) => q._id.toString() === qId.toString())) {
            question.type = 'matching';
          }
        }
        return question;
      }).filter(Boolean);

      // Score all answers
      let totalScore = 0;
      const scoredAnswers: any[] = [];

      for (const question of mappedQuestions) {
        try {
          const questionId = question._id.toString();
          const userAnswer = answers[questionId];
          const isCorrect = await checkAnswer(question, userAnswer);
          const pointsEarned = isCorrect ? (question.points || 0) : 0;
          totalScore += pointsEarned;

          scoredAnswers.push({
            questionId: question._id,
            userAnswer,
            isCorrect,
            pointsEarned,
          });
        } catch (qErr) {
          console.error(`Error checking answer for question ${question._id}:`, qErr);
          // Continue with marking as incorrect if error
          scoredAnswers.push({
            questionId: question._id,
            userAnswer: answers[question._id.toString()],
            isCorrect: false,
            pointsEarned: 0,
          });
        }
      }

      const isPassed = totalScore >= (quiz.passingScore || 0);

      // Create attempt with scored answers
      const attempt = await Attempt.create({
        userId: payload.userId,
        quizId,
        answers: scoredAnswers,
        totalScore,
        isPassed,
        status: 'graded',
        startedAt: body.startedAt ? new Date(body.startedAt) : new Date(),
        submittedAt: new Date(),
      });

      // Populate references separately
      await attempt.populate('quizId');
      await attempt.populate('userId', 'username name');

      return sendSuccess(attempt, 'Quiz submitted successfully', 201);
    } catch (error) {
      console.error('Create attempt error:', error);
      return sendError('Internal server error', 500);
    }
  });
}
