import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    // Fetch Google account from database
    const googleAccount = await prisma.googleAccount.findUnique({
      where: { userId },
      select: {
        id: true,
        email: true,
        accessToken: true,
        refreshToken: true,
        expiresAt: true,
        scope: true,
        updatedAt: true
      }
    });

    if (!googleAccount) {
      return NextResponse.json(
        { error: 'Google account not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(googleAccount);

  } catch (error) {
    console.error('Error fetching Google account:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
