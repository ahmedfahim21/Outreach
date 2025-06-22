import { NextRequest, NextResponse } from 'next/server';
import { google } from 'googleapis';
import { googleOAuth2Client } from '@/lib/google-auth';
import prisma from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;
    const code = searchParams.get('code');
    const state = searchParams.get('state');
    const error = searchParams.get('error');

    if (error) {
      console.error('Google OAuth error:', error);
      return NextResponse.redirect(new URL('/dashboard/configuration?error=oauth_error', request.url));
    }

    if (!code || !state) {
      return NextResponse.redirect(new URL('/dashboard/configuration?error=missing_params', request.url));
    }

    let parsedState;
    try {
      parsedState = JSON.parse(state);
    } catch (e) {
      console.error('Invalid state parameter:', e);
      return NextResponse.redirect(new URL('/dashboard/configuration?error=invalid_state', request.url));
    }

    const { userId, feature } = parsedState;

    if (!userId || !feature) {
      return NextResponse.redirect(new URL('/dashboard/configuration?error=invalid_state', request.url));
    }

    const { tokens } = await googleOAuth2Client.getToken(code);
    googleOAuth2Client.setCredentials(tokens);

    const oauth2 = google.oauth2({ version: 'v2', auth: googleOAuth2Client });
    const { data: googleUser } = await oauth2.userinfo.get();

    if (!googleUser.id || !googleUser.email) {
      return NextResponse.redirect(new URL('/dashboard/configuration?error=user_info_failed', request.url));
    }

    await prisma.googleAccount.upsert({
      where: { userId },
      update: {
        accessToken: tokens.access_token || '',
        refreshToken: tokens.refresh_token || null,
        expiresAt: tokens.expiry_date ? new Date(tokens.expiry_date) : null,
        scope: tokens.scope || null,
        updatedAt: new Date(),
      },
      create: {
        userId,
        googleId: googleUser.id,
        email: googleUser.email,
        name: googleUser.name || null,
        accessToken: tokens.access_token || '',
        refreshToken: tokens.refresh_token || null,
        expiresAt: tokens.expiry_date ? new Date(tokens.expiry_date) : null,
        scope: tokens.scope || null,
      },
    });

    return NextResponse.redirect(new URL(`/dashboard/configuration?success=true&feature=${feature}`, request.url));

  } catch (error) {
    console.error('Google OAuth callback error:', error);
    return NextResponse.redirect(new URL('/dashboard/configuration?error=server_error', request.url));
  }
}
