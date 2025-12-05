import { NextRequest } from 'next/server';
import { connectDB } from '@/lib/db';
import { Watchlist } from '@/lib/models/Watchlist';
import { sendSuccess, sendError, withAuth } from '@/lib/utils/api';

// GET - Get user's watchlist
export async function GET(request: NextRequest) {
  return withAuth(request, async (req, payload) => {
    try {
      await connectDB();

      const watchlist = await Watchlist.find({ userId: payload.userId })
        .populate('quizId', 'title description category difficulty totalPoints')
        .sort({ createdAt: -1 })
        .lean();

      return sendSuccess({ watchlist });
    } catch (error) {
      console.error('Get watchlist error:', error);
      return sendError('Internal server error', 500);
    }
  });
}

// POST - Add or remove from watchlist
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
        // Check if already in watchlist
        const existing = await Watchlist.findOne({
          userId: payload.userId,
          quizId,
        });

        if (existing) {
          return sendError('Quiz already in watchlist', 400);
        }

        const watchlistItem = await Watchlist.create({
          userId: payload.userId,
          quizId,
        });

        return sendSuccess(watchlistItem, 'Quiz added to watchlist successfully', 201);
      } else if (action === 'remove') {
        const result = await Watchlist.deleteOne({
          userId: payload.userId,
          quizId,
        });

        if (result.deletedCount === 0) {
          return sendError('Watchlist item not found', 404);
        }

        return sendSuccess(null, 'Removed from watchlist successfully');
      } else {
        return sendError('Invalid action', 400);
      }
    } catch (error) {
      console.error('Watchlist error:', error);
      return sendError('Internal server error', 500);
    }
  });
}
