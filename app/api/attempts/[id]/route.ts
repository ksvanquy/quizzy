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

// Helper to get correct option text for display
async function getOptionText(optionId: any): Promise<string> {
  try {
    const option = await Option.findById(optionId).lean() as any;
    return option?.text || 'Unknown';
  } catch {
    return 'Unknown';
  }
}

async function checkAnswer(question: any, userAnswer: any): Promise<boolean> {
  switch (question.type) {
    case 'single_choice': {
      // Compare user's selected option ID with correct option ID
      const correctId = question.correctOptionId?.toString();
      const userId = userAnswer?.toString();
      return userId === correctId;
    }

    case 'multi_choice': {
      // For multiple choice, user should select array of option IDs
      if (!Array.isArray(userAnswer)) return false;
      const correctIds = (question.correctOptionIds || [])
        .map((id: any) => id.toString())
        .sort();
      const userIds = (userAnswer || [])
        .map((id: any) => id.toString())
        .sort();
      
      // Check if arrays are equal in length and content
      return (
        userIds.length === correctIds.length &&
        userIds.every((id: string) => correctIds.includes(id))
      );
    }

    case 'true_false':
      // Convert string to boolean if needed
      let userBool = userAnswer;
      if (typeof userAnswer === 'string') {
        userBool = userAnswer === 'true';
      }
      return userBool === question.correctBoolean;

    case 'fill_blank':
    case 'cloze_test': {
      // For fill blank, check if answer matches any of the correct answers
      const answers = question.correctAnswers || [];
      if (question.caseSensitive) {
        return answers.includes(userAnswer);
      }
      return answers
        .map((a: string) => a.toLowerCase())
        .includes(userAnswer?.toLowerCase?.() ?? '');
    }

    case 'numeric_input': {
      // For numeric, check if within tolerance
      const tolerance = question.tolerance || 0;
      const userNum = parseFloat(userAnswer);
      const correctNum = question.correctNumber;
      
      if (isNaN(userNum)) return false;
      const diff = Math.abs(userNum - correctNum);
      return diff <= tolerance;
    }

    case 'ordering': {
      // For ordering, check if user's order matches correct order
      const userOrder = JSON.stringify(userAnswer);
      const correctOrder = JSON.stringify(question.correctOrder);
      return userOrder === correctOrder;
    }

    case 'matching': {
      // For matching, check if user's pairs match correct pairs
      const userPairs = JSON.stringify(userAnswer);
      const correctPairs = JSON.stringify(question.correctPairs);
      return userPairs === correctPairs;
    }

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

      const attempt = await Attempt.findById(id).lean() as any;

      if (!attempt) {
        return sendError('Attempt not found', 404);
      }

      if (attempt.userId.toString() !== payload.userId) {
        return sendError('Unauthorized', 403);
      }

      // Fetch quiz with all its data
      const quiz = await Quiz.findById(attempt.quizId).lean() as any;
      if (quiz) {
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

        // Map questions and add type field
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

        const quizObject = { ...quiz, questionIds: mappedQuestions };
        attempt.quizId = quizObject;
      }

      // Fetch user data
      const user = await User.findById(attempt.userId).select('username name email').lean();
      if (user) {
        attempt.userId = user;
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

