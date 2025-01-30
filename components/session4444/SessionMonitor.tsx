'use client';

import { useEffect, useRef } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { refreshAccessToken } from '@/lib/api/auth';
import { useRouter } from 'next/navigation';

const SESSION_CHECK_INTERVAL = 5 * 60 * 1000; // Check every 5 minutes
const TOKEN_REFRESH_THRESHOLD = 10 * 60 * 1000; // Refresh if less than 10 minutes left

export function SessionMonitor() {
  const { data: session, update } = useSession();
  const router = useRouter();
  const checkInterval = useRef<NodeJS.Timeout>();

  useEffect(() => {
    const checkAndRefreshSession = async () => {
      try {
        if (!session?.user) {
          console.log('No active session found');
          return;
        }

        const tokenExpiry = session.expires ? new Date(session.expires).getTime() : 0;
        const timeUntilExpiry = tokenExpiry - Date.now();

        // If token is about to expire, try to refresh it
        if (timeUntilExpiry < TOKEN_REFRESH_THRESHOLD) {
          console.log('Token needs refresh, attempting to refresh...');
          
          if (session.refreshToken) {
            try {
              const refreshedToken = await refreshAccessToken(session.refreshToken);
              if (refreshedToken) {
                await update(refreshedToken);
                console.log('Token refreshed successfully');
                return;
              }
            } catch (error) {
              console.error('Failed to refresh token:', error);
            }
          }

          // If refresh failed or no refresh token, sign out and redirect
          console.log('Session expired, signing out...');
          await signOut({ redirect: false });
          router.push('/signin');
        }
      } catch (error) {
        console.error('Error checking session:', error);
      }
    };

    // Set up periodic session check
    checkInterval.current = setInterval(checkAndRefreshSession, SESSION_CHECK_INTERVAL);

    // Initial check
    checkAndRefreshSession();

    return () => {
      if (checkInterval.current) {
        clearInterval(checkInterval.current);
      }
    };
  }, [session, update, router]);

  // This is a background component, no UI needed
  return null;
}
