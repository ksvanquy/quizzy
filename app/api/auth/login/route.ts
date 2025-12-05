import { NextRequest } from 'next/server';
import { connectDB } from '@/lib/db';
import { User } from '@/lib/models/User';
import { comparePassword } from '@/lib/utils/password';
import { generateToken } from '@/lib/utils/jwt';
import { sendSuccess, sendError } from '@/lib/utils/api';

export async function POST(request: NextRequest) {
  try {
    await connectDB();

    const body = await request.json();
    const { email, password } = body;

    if (!email || !password) {
      return sendError('Email and password are required', 400);
    }

    const user = await User.findOne({ email });
    if (!user) {
      return sendError('Invalid email or password', 401);
    }

    const isPasswordValid = await comparePassword(password, user.password);
    if (!isPasswordValid) {
      return sendError('Invalid email or password', 401);
    }

    // Update last login
    user.lastLogin = new Date();
    await user.save();

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
      'Login successful'
    );
  } catch (error) {
    console.error('Login error:', error);
    return sendError('Internal server error', 500);
  }
}
