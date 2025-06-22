import { NextRequest, NextResponse } from 'next/server';
import { getGoogleAccountInfo } from '@/lib/google-auth';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json(
        { error: 'userId is required' },
        { status: 400 }
      );
    }

    const googleAccount = await getGoogleAccountInfo(userId);
    
    return NextResponse.json({
      connected: !!googleAccount,
      email: googleAccount?.email || null,
      name: googleAccount?.name || null,
      scope: googleAccount?.scope || null
    });
  } catch (error) {
    console.error('Error checking Google account status:', error);
    return NextResponse.json(
      { error: 'Failed to check Google account status' },
      { status: 500 }
    );
  }
}
