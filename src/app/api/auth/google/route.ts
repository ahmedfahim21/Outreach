import { NextRequest, NextResponse } from 'next/server';
import { getGoogleAuthUrl } from '@/lib/google-auth';

export async function POST(request: NextRequest) {
  try {
    const { userId, feature } = await request.json();

    if (!userId || !feature) {
      return NextResponse.json(
        { error: 'userId and feature are required' },
        { status: 400 }
      );
    }

    const authUrl = getGoogleAuthUrl(feature, userId);
    
    return NextResponse.json({ authUrl });
  } catch (error) {
    console.error('Error generating Google auth URL:', error);
    return NextResponse.json(
      { error: 'Failed to generate auth URL' },
      { status: 500 }
    );
  }
}
