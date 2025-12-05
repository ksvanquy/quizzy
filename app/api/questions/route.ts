import { NextRequest } from 'next/server';
import { connectDB } from '@/lib/db';
import { Question } from '@/lib/models/Question';
import { Option } from '@/lib/models/Option';
import { Category } from '@/lib/models/Category';
import { User } from '@/lib/models/User';
import { sendSuccess, sendError, withAuth } from '@/lib/utils/api';

export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const difficulty = searchParams.get('difficulty');
    const topic = searchParams.get('topic');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');

    const filter: any = {};
    if (category) filter.category = category;
    if (difficulty) filter.difficulty = difficulty;
    if (topic) filter.topic = topic;

    const skip = (page - 1) * limit;

    const questions = await Question.find(filter)
      .populate('category')
      .populate('optionIds')
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 });

    const total = await Question.countDocuments(filter);

    return sendSuccess({
      questions,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    });
  } catch (error) {
    console.error('Get questions error:', error);
    return sendError('Internal server error', 500);
  }
}

export async function POST(request: NextRequest) {
  return withAuth(request, async (req, payload) => {
    try {
      await connectDB();

      const body = await request.json();
      const { text, type, topic, category, difficulty, points, correctAnswer, options } = body;

      if (!text || !type || !topic || !difficulty) {
        return sendError('Missing required fields', 400);
      }

      const question = await Question.create({
        text,
        type,
        topic,
        category,
        difficulty,
        points: points || 1,
      });

      // Create options if provided
      if (options && Array.isArray(options)) {
        const createdOptions = await Option.insertMany(
          options.map((opt: any) => ({
            text: opt.text,
            imageUrl: opt.imageUrl,
            questionId: question._id,
          }))
        );

        const optionIds = createdOptions.map((opt) => opt._id);
        question.optionIds = optionIds;

        if (correctAnswer !== undefined) {
          if (type === 'single_choice' || type === 'image_choice') {
            question.correctOptionId = correctAnswer;
          } else if (type === 'multi_choice') {
            question.correctOptionIds = Array.isArray(correctAnswer) ? correctAnswer : [correctAnswer];
          }
        }

        await question.save();
      }

      await question.populate('optionIds');

      return sendSuccess(question, 'Question created', 201);
    } catch (error) {
      console.error('Create question error:', error);
      return sendError('Internal server error', 500);
    }
  });
}
