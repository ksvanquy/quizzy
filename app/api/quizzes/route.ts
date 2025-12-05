import { NextRequest } from 'next/server';
import { connectDB } from '@/lib/db';
import { Quiz } from '@/lib/models/Quiz';
import { User } from '@/lib/models/User';
import { Category } from '@/lib/models/Category';
import { Question } from '@/lib/models/Question';
import { Option } from '@/lib/models/Option';
import { sendSuccess, sendError, withAuth } from '@/lib/utils/api';

export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const difficulty = searchParams.get('difficulty');
    const published = searchParams.get('published');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');

    const filter: any = {};
    if (category) filter.category = category;
    if (difficulty) filter.difficulty = difficulty;
    if (published === 'true') filter.isPublished = true;

    const skip = (page - 1) * limit;

    const quizzes = await Quiz.find(filter)
      .populate('category')
      .populate('createdBy', 'username name avatar')
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 });

    const total = await Quiz.countDocuments(filter);

    return sendSuccess({
      quizzes,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    });
  } catch (error) {
    console.error('Get quizzes error:', error);
    return sendError('Internal server error', 500);
  }
}

export async function POST(request: NextRequest) {
  return withAuth(request, async (req, payload) => {
    try {
      await connectDB();

      const body = await request.json();
      const {
        title,
        description,
        category,
        difficulty,
        duration,
        totalPoints,
        passingScore,
        questionIds,
      } = body;

      if (!title || !category || !difficulty || !duration || !totalPoints || !passingScore) {
        return sendError('Missing required fields', 400);
      }

      const quiz = await Quiz.create({
        title,
        description,
        category,
        difficulty,
        duration,
        totalPoints,
        passingScore,
        questionIds: questionIds || [],
        createdBy: payload.userId,
      });

      await quiz.populate(['category', 'createdBy']);

      return sendSuccess(quiz, 'Quiz created', 201);
    } catch (error) {
      console.error('Create quiz error:', error);
      return sendError('Internal server error', 500);
    }
  });
}
