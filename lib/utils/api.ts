import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from './jwt';

export async function withAuth(
  request: NextRequest,
  handler: (req: NextRequest, payload: any) => Promise<NextResponse>
) {
  const authHeader = request.headers.get('authorization');
  const token = authHeader?.replace('Bearer ', '');

  if (!token) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const payload = verifyToken(token);
  if (!payload) {
    return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
  }

  return handler(request, payload);
}

export function sendSuccess(data: any, message: string = 'Success', status: number = 200) {
  return NextResponse.json(
    { success: true, message, data },
    { status }
  );
}

export function sendError(error: string, status: number = 400) {
  return NextResponse.json(
    { success: false, error },
    { status }
  );
}
