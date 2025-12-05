import { NextRequest } from 'next/server';
import { connectDB } from '@/lib/db';
import { Category } from '@/lib/models/Category';
import { sendSuccess, sendError } from '@/lib/utils/api';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    await connectDB();
    const { slug } = await params;

    const category = await Category.findOne({ slug });
    if (!category) {
      return sendError('Category not found', 404);
    }

    return sendSuccess(category);
  } catch (error) {
    console.error('Get category error:', error);
    return sendError('Internal server error', 500);
  }
}
