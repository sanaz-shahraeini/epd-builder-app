"use client";

import { useEffect, useRef } from "react";
import { useSession, signOut } from "next-auth/react";
import { refreshAccessToken } from "@/lib/api/auth";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/ui/use-toast";

// Constants for session management
const SESSION_CHECK_INTERVAL = 5 * 60 * 1000; // Check every 5 minutes
const TOKEN_REFRESH_THRESHOLD = 10 * 60 * 1000; // Refresh if less than 10 minutes left
const SESSION_TIMEOUT =
  Number(process.env.NEXT_PUBLIC_SESSION_TIMEOUT) || 2 * 60 * 60 * 1000; // 2 hours default
const WARNING_TIME = 5 * 60 * 1000; // 5 minutes before timeout

export function SessionMonitor() {
  const { data: session, status, update } = useSession();
  const router = useRouter();
  const { toast } = useToast();
  const checkInterval = useRef<NodeJS.Timeout>();
  const warningShownRef = useRef(false);

  // Move handleSessionExpired outside useEffect
  const handleSessionExpired = async () => {
    warningShownRef.current = false;
    console.log("Session expired, signing out...");
    await signOut({
      redirect: false,
      callbackUrl: "/signin",
    });

    toast({
      title: "Session Expired",
      description: "You have been logged out due to inactivity.",
      variant: "destructive",
    });

    window.location.href = "/signin";
  };

  useEffect(() => {
    // Only redirect if user is unauthenticated AND we're on a protected route
    if (status === "unauthenticated") {
      const protectedPaths = ["/dashboard", "/profile", "/settings"];
      const isProtectedRoute = protectedPaths.some((path) =>
        window.location.pathname.includes(path)
      );

      if (isProtectedRoute) {
        console.log(
          "User is unauthenticated on protected route, redirecting to signin..."
        );
        window.location.href = "/signin";
        return;
      }
    }
  }, [status]);

  useEffect(() => {
    let inactivityTimeout: NodeJS.Timeout;
    let warningTimeout: NodeJS.Timeout;
    let lastActivity = Date.now();

    const showWarning = () => {
      if (!warningShownRef.current) {
        warningShownRef.current = true;
        toast({
          title: "Session Warning",
          description:
            "Your session will expire in 5 minutes. Please save your work.",
          variant: "default",
          duration: 10000,
        });
      }
    };

    // Function to check inactivity
    const checkInactivity = () => {
      const inactiveTime = Date.now() - lastActivity;

      if (inactiveTime >= SESSION_TIMEOUT) {
        handleSessionExpired();
      } else if (inactiveTime >= SESSION_TIMEOUT - WARNING_TIME && session) {
        showWarning();
      } else {
        // Reset warning state if user became active again
        warningShownRef.current = false;
      }
    };

    // Function to handle user activity
    const updateActivity = () => {
      lastActivity = Date.now();
      warningShownRef.current = false; // Reset warning state on activity
      // Refresh the session
      update().catch((error) => {
        console.error("Session refresh failed:", error);
        handleSessionExpired();
      });
    };

    // Set up activity listeners
    const events = [
      "mousedown",
      "mousemove",
      "keypress",
      "scroll",
      "touchstart",
      "click",
    ];

    // Add event listeners
    events.forEach((event) => {
      window.addEventListener(event, updateActivity);
    });

    // Start inactivity check
    inactivityTimeout = setInterval(checkInactivity, 60000); // Check every minute

    return () => {
      // Clean up
      events.forEach((event) => {
        window.removeEventListener(event, updateActivity);
      });
      clearInterval(inactivityTimeout);
    };
  }, [router, toast, session, update]);

  useEffect(() => {
    const checkAndRefreshSession = async () => {
      try {
        if (!session?.user) {
          console.log("No active session found");
          return;
        }

        const tokenExpiry = session.expires
          ? new Date(session.expires).getTime()
          : 0;
        const timeUntilExpiry = tokenExpiry - Date.now();
        const REFRESH_BUFFER = 30000; // 30 second buffer

        // If token is about to expire or within buffer, try to refresh it
        if (timeUntilExpiry < TOKEN_REFRESH_THRESHOLD + REFRESH_BUFFER) {
          console.log("Token needs refresh, attempting to refresh...");

          if (session.refreshToken) {
            try {
              const refreshedToken = await refreshAccessToken(
                session.refreshToken
              );
              if (refreshedToken) {
                await update(refreshedToken);
                console.log("Token refreshed successfully");
                return;
              }
            } catch (error) {
              console.error("Failed to refresh token:", error);
              // If refresh failed, sign out immediately
              await handleSessionExpired();
              return;
            }
          }

          // If no refresh token, sign out and redirect
          console.log("No refresh token available, signing out...");
          await signOut({ redirect: false });
          router.push("/signin");
        }
      } catch (error) {
        console.error("Error checking session:", error);
      }
    };

    // Set up periodic session check
    checkInterval.current = setInterval(
      checkAndRefreshSession,
      SESSION_CHECK_INTERVAL
    );

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
