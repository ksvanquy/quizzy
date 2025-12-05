import { NextRequest } from 'next/server';
import { connectDB } from '@/lib/db';
import { Category } from '@/lib/models/Category';
import { Quiz } from '@/lib/models/Quiz';
import { sendSuccess, sendError, withAuth } from '@/lib/utils/api';

export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const categories = await Category.find().sort({ displayOrder: 1 });
    
    // Count quizzes for each category
    const categoriesWithCount = await Promise.all(
      categories.map(async (cat) => {
        let quizCount = await Quiz.countDocuments({ category: cat._id });
        
        // If parent category, add quizzes from children
        if (cat.parentId === null) {
          const childCategories = categories.filter(c => c.parentId === cat.displayOrder);
          for (const child of childCategories) {
            const childQuizCount = await Quiz.countDocuments({ category: child._id });
            quizCount += childQuizCount;
          }
        }
        
        return {
          ...cat.toObject(),
          quizCount,
        };
      })
    );

    return sendSuccess(categoriesWithCount);
  } catch (error) {
    console.error('Get categories error:', error);
    return sendError('Internal server error', 500);
  }
}

export async function POST(request: NextRequest) {
  return withAuth(request, async (req, payload) => {
    try {
      await connectDB();

      const body = await request.json();
      const { name, description, icon, color } = body;

      if (!name) {
        return sendError('Name is required', 400);
      }

      const slug = name.toLowerCase().replace(/\s+/g, '-');

      const category = await Category.create({
        name,
        slug,
        description,
        icon,
        color,
      });

      return sendSuccess(category, 'Category created', 201);
    } catch (error) {
      console.error('Create category error:', error);
      return sendError('Internal server error', 500);
    }
  });
}
