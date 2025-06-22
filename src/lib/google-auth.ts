import { google } from 'googleapis';
import prisma from './prisma';

export const googleOAuth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.GOOGLE_REDIRECT_URI
);

export const GOOGLE_SCOPES = {
  profile: ['openid', 'email', 'profile'],
  calendar: ['https://www.googleapis.com/auth/calendar']
};

export function getGoogleAuthUrl(feature: string, userId: string) {
  const scopes = [...GOOGLE_SCOPES.profile];
  
  if (feature === 'calendar') scopes.push(...GOOGLE_SCOPES.calendar);

  return googleOAuth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: scopes,
    state: JSON.stringify({ userId, feature }),
    prompt: 'consent'
  });
}

export async function refreshGoogleTokens(userId: string) {
  const googleAccount = await prisma.googleAccount.findUnique({
    where: { userId }
  });

  if (!googleAccount || !googleAccount.refreshToken) {
    throw new Error('No refresh token available');
  }

  googleOAuth2Client.setCredentials({
    refresh_token: googleAccount.refreshToken
  });

  try {
    const { credentials } = await googleOAuth2Client.refreshAccessToken();
    
    // Update tokens in database
    await prisma.googleAccount.update({
      where: { userId },
      data: {
        accessToken: credentials.access_token || googleAccount.accessToken,
        expiresAt: credentials.expiry_date ? new Date(credentials.expiry_date) : null,
        updatedAt: new Date(),
      }
    });

    return credentials;
  } catch (error) {
    console.error('Token refresh failed:', error);
    throw error;
  }
}

export async function getGoogleAccountInfo(userId: string) {
  const googleAccount = await prisma.googleAccount.findUnique({
    where: { userId }
  });

  if (!googleAccount) {
    return null;
  }

  // Check if token needs refresh
  if (googleAccount.expiresAt && googleAccount.expiresAt < new Date()) {
    try {
      await refreshGoogleTokens(userId);
      // Refetch updated account info
      return await prisma.googleAccount.findUnique({
        where: { userId }
      });
    } catch (error) {
      console.error('Failed to refresh tokens:', error);
      return null;
    }
  }

  return googleAccount;
}

export async function getGoogleClient(userId: string) {
  const googleAccount = await getGoogleAccountInfo(userId);
  
  if (!googleAccount) {
    throw new Error('No Google account found');
  }

  googleOAuth2Client.setCredentials({
    access_token: googleAccount.accessToken,
    refresh_token: googleAccount.refreshToken,
  });

  return googleOAuth2Client;
}
