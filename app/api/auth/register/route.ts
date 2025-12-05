import { NextRequest } from 'next/server';
import { connectDB } from '@/lib/db';
import { User } from '@/lib/models/User';
import { hashPassword, comparePassword } from '@/lib/utils/password';
import { generateToken } from '@/lib/utils/jwt';
import { sendSuccess, sendError } from '@/lib/utils/api';
import { validateEmail } from '@/lib/utils/helpers';

export async function POST(request: NextRequest) {
  try {
    await connectDB();

    const body = await request.json();
    const { username, email, password, name } = body;

    // Validation
    if (!username || !email || !password || !name) {
      return sendError('All fields are required', 400);
    }

    if (!validateEmail(email)) {
      return sendError('Invalid email format', 400);
    }

    if (password.length < 6) {
      return sendError('Password must be at least 6 characters', 400);
    }

    // Check if user exists
    const existingUser = await User.findOne({
      $or: [{ email }, { username }],
    });

    if (existingUser) {
      return sendError('User already exists', 400);
    }

    // Hash password and create user
    const hashedPassword = await hashPassword(password);
    const user = await User.create({
      username,
      email,
      password: hashedPassword,
      name,
    });

    const token = generateToken({
      userId: user._id.toString(),
      email: user.email,
      role: user.role,
    });

    return sendSuccess(
      {
        user: {
          id: user._id,
          username: user.username,
          email: user.email,
          name: user.name,
          role: user.role,
        },
        token,
      },
      'Registration successful',
      201
    );
  } catch (error) {
    console.error('Register error:', error);
    return sendError('Internal server error', 500);
  }
}
