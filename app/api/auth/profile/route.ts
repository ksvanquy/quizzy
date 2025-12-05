import { NextRequest } from 'next/server';
import { connectDB } from '@/lib/db';
import { User } from '@/lib/models/User';
import { withAuth, sendSuccess, sendError } from '@/lib/utils/api';

export async function GET(request: NextRequest) {
  return withAuth(request, async (req, payload) => {
    try {
      await connectDB();

      const user = await User.findById(payload.userId);
      if (!user) {
        return sendError('User not found', 404);
      }

      return sendSuccess({
        id: user._id,
        username: user.username,
        email: user.email,
        name: user.name,
        role: user.role,
        avatar: user.avatar,
        bio: user.bio,
        phone: user.phone,
        address: user.address,
      });
    } catch (error) {
      console.error('Profile error:', error);
      return sendError('Internal server error', 500);
    }
  });
}

export async function PUT(request: NextRequest) {
  return withAuth(request, async (req, payload) => {
    try {
      await connectDB();

      const body = await request.json();
      const { name, bio, phone, address, avatar } = body;

      const user = await User.findByIdAndUpdate(
        payload.userId,
        {
          ...(name && { name }),
          ...(bio !== undefined && { bio }),
          ...(phone !== undefined && { phone }),
          ...(address !== undefined && { address }),
          ...(avatar && { avatar }),
        },
        { new: true }
      );

      if (!user) {
        return sendError('User not found', 404);
      }

      return sendSuccess(
        {
          id: user._id,
          username: user.username,
          email: user.email,
          name: user.name,
          role: user.role,
          avatar: user.avatar,
          bio: user.bio,
          phone: user.phone,
          address: user.address,
        },
        'Profile updated'
      );
    } catch (error) {
      console.error('Update profile error:', error);
      return sendError('Internal server error', 500);
    }
  });
}
