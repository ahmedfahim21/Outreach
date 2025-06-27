import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import prisma from '@/lib/prisma';

interface SaveCredentialsRequest {
  email: string;
  credentials: {
    access_token: string;
    refresh_token: string;
    client_id: string;
    client_secret: string;
  };
  session_id?: string; // Optional, can be derived from user context
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json() as SaveCredentialsRequest;
    const { email, credentials, session_id } = body;

    // Validate required fields
    if (!email || !credentials) {
      return NextResponse.json(
        { error: 'Missing required fields: email and credentials' },
        { status: 400 }
      );
    }

    if (!credentials.access_token || !credentials.refresh_token) {
      return NextResponse.json(
        { error: 'Missing required credential fields: access_token and refresh_token' },
        { status: 400 }
      );
    }

    // Get user from wallet address or session
    const walletAddress = request.headers.get('x-wallet-address');
    let userId = session_id;

    if (!userId && walletAddress) {
      const user = await prisma.user.findUnique({
        where: { walletAddress }
      });
      userId = user?.id;
    }

    if (!userId) {
      return NextResponse.json(
        { error: 'No valid session or user found' },
        { status: 401 }
      );
    }

    // Prepare the external API request
    const externalApiUrl = process.env.NEXT_PUBLIC_PYTHON_AI_URL || 'https://your-external-api.com';
    const endpoint = `${externalApiUrl}/save_oauth_credentials/${userId}`;

    console.log('Saving credentials to external API:', endpoint);

    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email,
        credentials: {
            access_token: credentials.access_token,
            refresh_token: credentials.refresh_token// This will be handled on the server side
        }
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('External API error:', response.status, errorText);
      return NextResponse.json(
        { 
          error: 'Failed to save credentials to external service',
          details: response.status === 401 ? 'Unauthorized' : 'Service unavailable'
        },
        { status: response.status === 401 ? 401 : 502 }
      );
    }

    const result = await response.json();

    return NextResponse.json({
      status: 'success',
      message: 'Credentials saved successfully',
      external_response: result
    });

  } catch (error) {
    console.error('Save credentials error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Optional: GET method to check if credentials exist
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;
    const email = searchParams.get('email');
    const walletAddress = request.headers.get('x-wallet-address');

    if (!email && !walletAddress) {
      return NextResponse.json(
        { error: 'Email or wallet address required' },
        { status: 400 }
      );
    }

    let user = null;
    if (walletAddress) {
      user = await prisma.user.findUnique({
        where: { walletAddress },
        include: { googleAccount: true }
      });
    }

    const hasCredentials = user?.googleAccount ? true : false;

    return NextResponse.json({
      hasCredentials,
      email: user?.googleAccount?.email || null
    });

  } catch (error) {
    console.error('Check credentials error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}