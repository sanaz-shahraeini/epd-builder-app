'use client';

import { useEffect, useRef } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { refreshAccessToken } from '@/lib/api/auth';
import { useRouter } from 'next/navigation';
import { useToast } from '@/components/ui/use-toast';

// Constants for session management
const SESSION_CHECK_INTERVAL = 5 * 60 * 1000; // Check every 5 minutes
const TOKEN_REFRESH_THRESHOLD = 10 * 60 * 1000; // Refresh if less than 10 minutes left
const SESSION_TIMEOUT = Number(process.env.NEXT_PUBLIC_SESSION_TIMEOUT) || 2 * 60 * 60 * 1000; // 2 hours default
const WARNING_TIME = 5 * 60 * 1000; // 5 minutes before timeout

export function SessionMonitor() {
  const { data: session, status, update } = useSession();
  const router = useRouter();
  const { toast } = useToast();
  const checkInterval = useRef<NodeJS.Timeout>();

  useEffect(() => {
    if (status === 'unauthenticated' && !window.location.pathname.includes('/signin')) {
      console.log('User is unauthenticated, redirecting to signin...');
      // Force a complete navigation to signin to clear session state
      window.location.href = '/signin';
      return;
    }
  }, [status]);

  useEffect(() => {
    let inactivityTimeout: NodeJS.Timeout;
    let warningTimeout: NodeJS.Timeout;
    let lastActivity = Date.now();

    const handleSessionExpired = async () => {
      console.log('Session expired, signing out...');
      await signOut({
        redirect: false,
        callbackUrl: '/signin'
      });
      
      toast({
        title: "Session Expired",
        description: "You have been logged out due to inactivity.",
        variant: "destructive",
      });
      
      // Force navigation to clear session state
      window.location.href = '/signin';
    };

    // Function to handle user activity
    const updateActivity = () => {
      lastActivity = Date.now();
      // Refresh the session
      update().catch((error) => {
        console.error('Session refresh failed:', error);
        handleSessionExpired();
      });
    };

    const showWarning = () => {
      toast({
        title: "Session Warning",
        description: "Your session will expire in 5 minutes. Please save your work.",
        variant: "default",
        duration: 10000,
      });
    };

    // Function to check inactivity
    const checkInactivity = () => {
      const inactiveTime = Date.now() - lastActivity;

      if (inactiveTime >= SESSION_TIMEOUT) {
        handleSessionExpired();
      } else if (inactiveTime >= (SESSION_TIMEOUT - WARNING_TIME) && session) {
        showWarning();
      }
    };

    // Set up activity listeners
    const events = [
      'mousedown',
      'mousemove',
      'keypress',
      'scroll',
      'touchstart',
      'click',
    ];

    // Add event listeners
    events.forEach(event => {
      window.addEventListener(event, updateActivity);
    });

    // Start inactivity check
    inactivityTimeout = setInterval(checkInactivity, 60000); // Check every minute

    // Set up warning timeout
    warningTimeout = setInterval(() => {
      const inactiveTime = Date.now() - lastActivity;
      if (inactiveTime >= (SESSION_TIMEOUT - WARNING_TIME) && session) {
        showWarning();
      }
    }, WARNING_TIME);

    return () => {
      // Clean up
      events.forEach(event => {
        window.removeEventListener(event, updateActivity);
      });
      clearInterval(inactivityTimeout);
      clearInterval(warningTimeout);
    };
  }, [router, toast, session, update]);

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
