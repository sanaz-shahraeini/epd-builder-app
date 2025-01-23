'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';
import { useToast } from '@/components/ui/use-toast';

export function SessionMonitor() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    if (status === 'unauthenticated') {
      // Redirect to signin page when session expires
      router.push('/signin');
    }
  }, [status, router]);

  useEffect(() => {
    let inactivityTimeout: NodeJS.Timeout;
    let lastActivity = Date.now();

    // Function to handle user activity
    const updateActivity = () => {
      lastActivity = Date.now();
    };

    // Function to check inactivity
    const checkInactivity = () => {
      const inactiveTime = Date.now() - lastActivity;
      const twoHours = 2 * 60 * 60 * 1000; // 2 hours in milliseconds

      if (inactiveTime >= twoHours) {
        // User has been inactive for 2 hours
        signOut({ redirect: false }).then(() => {
          toast({
            title: "Session Expired",
            description: "You have been logged out due to inactivity.",
            variant: "destructive",
          });
          router.push('/signin');
        });
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

    return () => {
      // Clean up
      events.forEach(event => {
        window.removeEventListener(event, updateActivity);
      });
      clearInterval(inactivityTimeout);
    };
  }, [router, toast]);

  return null; // This is a utility component, it doesn't render anything
}
