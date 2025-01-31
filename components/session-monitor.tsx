'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';
import { useToast } from '@/components/ui/use-toast';

// Constants for session management
const SESSION_TIMEOUT = Number(process.env.NEXT_PUBLIC_SESSION_TIMEOUT) || 2 * 60 * 60 * 1000; // 2 hours default
const WARNING_TIME = 5 * 60 * 1000; // 5 minutes before timeout

export function SessionMonitor() {
  const { data: session, status, update } = useSession();
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    if (status === 'unauthenticated') {
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

  return null; // This is a utility component, it doesn't render anything
}
