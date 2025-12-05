import { NextRequest } from 'next/server';
import { connectDB } from '@/lib/db';
import { Quiz } from '@/lib/models/Quiz';
import { User } from '@/lib/models/User';
import { Category } from '@/lib/models/Category';
import { Question } from '@/lib/models/Question';
import { Option } from '@/lib/models/Option';
import { FillBlank } from '@/lib/models/FillBlank';
import { NumericInput } from '@/lib/models/NumericInput';
import { Ordering } from '@/lib/models/Ordering';
import { Matching } from '@/lib/models/Matching';
import { sendSuccess, sendError, withAuth } from '@/lib/utils/api';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    const { id } = await params;

    // Fetch quiz raw without populate first
    const quizRaw = await Quiz.findById(id);

    if (!quizRaw) {
      return sendError('Quiz not found', 404);
    }

    // Convert to plain object early
    let quizObject = quizRaw.toObject();

    console.log(`Quiz before lean: ${quizObject.questionIds?.length || 0} questions`);

    // Manually fetch and populate category
    if (quizObject.category) {
      const category = await Category.findById(quizObject.category).lean();
      quizObject.category = category as any;
    }

    // Manually fetch and populate createdBy
    if (quizObject.createdBy) {
      const user = await User.findById(quizObject.createdBy).select('username name avatar').lean();
      quizObject.createdBy = user as any;
    }

    // Manually fetch all questions with options from different collections
    if (quizObject.questionIds && Array.isArray(quizObject.questionIds)) {
      console.log(`Question IDs length: ${quizObject.questionIds.length}`);
      
      // Fetch from all question type collections
      const [regularQuestions, fillBlanks, numericInputs, orderings, matchings] = await Promise.all([
        Question.find({ _id: { $in: quizObject.questionIds } })
          .select('+optionIds')
          .populate('optionIds')
          .lean(),
        FillBlank.find({ _id: { $in: quizObject.questionIds } }).lean(),
        NumericInput.find({ _id: { $in: quizObject.questionIds } }).lean(),
        Ordering.find({ _id: { $in: quizObject.questionIds } }).lean(),
        Matching.find({ _id: { $in: quizObject.questionIds } }).lean(),
      ]);

      // Combine all questions
      const allQuestions = [...regularQuestions, ...fillBlanks, ...numericInputs, ...orderings, ...matchings];
      console.log(`Total questions found: ${allQuestions.length}`);

      // Maintain order of questionIds and add type field for non-regular questions
      const mappedQuestions = quizObject.questionIds.map((qId: any) => {
        const qIdStr = typeof qId === 'string' ? qId : qId.toString();
        const question = allQuestions.find((q: any) => q._id.toString() === qIdStr);
        
        if (!question) return null;

        // Add type field based on collection
        if (!question.type) {
          if (fillBlanks.some((q: any) => q._id.toString() === qIdStr)) {
            (question as any).type = 'fill_blank';
          } else if (numericInputs.some((q: any) => q._id.toString() === qIdStr)) {
            (question as any).type = 'numeric_input';
          } else if (orderings.some((q: any) => q._id.toString() === qIdStr)) {
            (question as any).type = 'ordering';
          } else if (matchings.some((q: any) => q._id.toString() === qIdStr)) {
            (question as any).type = 'matching';
          }
        }

        return question;
      }).filter(Boolean);

      console.log(`After mapping: ${mappedQuestions.length} questions`);
      quizObject.questionIds = mappedQuestions as any;
    }

    return sendSuccess(quizObject);
  } catch (error) {
    console.error('Get quiz error:', error);
    return sendError('Internal server error', 500);
  }
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
      const quiz = await Quiz.findByIdAndUpdate(id, body, { new: true })
        .populate('category')
        .populate('createdBy', 'username name avatar')
        .populate('questionIds');

      if (!quiz) {
        return sendError('Quiz not found', 404);
      }

      return sendSuccess(quiz, 'Quiz updated');
    } catch (error) {
      console.error('Update quiz error:', error);
      return sendError('Internal server error', 500);
    }
  });
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  return withAuth(request, async (req, payload) => {
    try {
      await connectDB();
      const { id } = await params;

      const quiz = await Quiz.findByIdAndDelete(id);
      if (!quiz) {
        return sendError('Quiz not found', 404);
      }

      return sendSuccess(null, 'Quiz deleted');
    } catch (error) {
      console.error('Delete quiz error:', error);
      return sendError('Internal server error', 500);
    }
  });
}
