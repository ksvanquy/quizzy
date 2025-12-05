import { NextRequest } from 'next/server';
import { connectDB } from '@/lib/db';
import { Bookmark } from '@/lib/models/Bookmark';
import { sendSuccess, sendError, withAuth } from '@/lib/utils/api';

// GET - Get user's bookmarks
export async function GET(request: NextRequest) {
  return withAuth(request, async (req, payload) => {
    try {
      await connectDB();

      const bookmarks = await Bookmark.find({ userId: payload.userId })
        .populate('quizId', 'title description category difficulty totalPoints')
        .sort({ createdAt: -1 })
        .lean();

      return sendSuccess({ bookmarks });
    } catch (error) {
      console.error('Get bookmarks error:', error);
      return sendError('Internal server error', 500);
    }
  });
}

// POST - Add or remove bookmark
export async function POST(request: NextRequest) {
  return withAuth(request, async (req, payload) => {
    try {
      await connectDB();

      const body = await request.json();
      const { quizId, action } = body;

      if (!quizId) {
        return sendError('Quiz ID is required', 400);
      }

      if (action === 'add') {
        // Check if already bookmarked
        const existing = await Bookmark.findOne({
          userId: payload.userId,
          quizId,
        });

        if (existing) {
          return sendError('Quiz already bookmarked', 400);
        }

        const bookmark = await Bookmark.create({
          userId: payload.userId,
          quizId,
        });

        return sendSuccess(bookmark, 'Quiz bookmarked successfully', 201);
      } else if (action === 'remove') {
        const result = await Bookmark.deleteOne({
          userId: payload.userId,
          quizId,
        });

        if (result.deletedCount === 0) {
          return sendError('Bookmark not found', 404);
        }

        return sendSuccess(null, 'Bookmark removed successfully');
      } else {
        return sendError('Invalid action', 400);
      }
    } catch (error) {
      console.error('Bookmark error:', error);
      return sendError('Internal server error', 500);
    }
  });
}
