import { NextRequest } from 'next/server';
import { connectDB } from '@/lib/db';
import { Question } from '@/lib/models/Question';
import { Option } from '@/lib/models/Option';
import { Category } from '@/lib/models/Category';
import { User } from '@/lib/models/User';
import { sendSuccess, sendError, withAuth } from '@/lib/utils/api';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    const { id } = await params;

    const question = await Question.findById(id).populate('optionIds');
    if (!question) {
      return sendError('Question not found', 404);
    }

    return sendSuccess(question);
  } catch (error) {
    console.error('Get question error:', error);
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
      const question = await Question.findByIdAndUpdate(id, body, { new: true }).populate(
        'optionIds'
      );

      if (!question) {
        return sendError('Question not found', 404);
      }

      return sendSuccess(question, 'Question updated');
    } catch (error) {
      console.error('Update question error:', error);
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

      const question = await Question.findByIdAndDelete(id);
      if (!question) {
        return sendError('Question not found', 404);
      }

      return sendSuccess(null, 'Question deleted');
    } catch (error) {
      console.error('Delete question error:', error);
      return sendError('Internal server error', 500);
    }
  });
}
