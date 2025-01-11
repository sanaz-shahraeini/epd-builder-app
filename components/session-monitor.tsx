'use client';

import { useEffect } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';

export function SessionMonitor() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === 'unauthenticated') {
      // Redirect to signin page when session expires
      router.push('/signin');
    }
  }, [status, router]);

  return null; // This is a utility component, it doesn't render anything
}
