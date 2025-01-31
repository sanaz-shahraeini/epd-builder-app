'use client';

import { useState } from 'react';
import SignInForm from '@/components/sign/SignInForm';
import { useRouter } from '@/i18n/navigation';
import { useLocale } from 'next-intl';
import { useSearchParams } from 'next/navigation';

export default function SignInPage() {
  const [isOpen, setIsOpen] = useState(true);
  const router = useRouter();
  const locale = useLocale();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams?.get('callbackUrl') || '/dashboard/profile';

  const handleClose = () => {
    setIsOpen(false);
    router.push(`/${locale}`);
  };

  const handleShowSignUp = (show: boolean) => {
    if (show) {
      router.push(`/${locale}/signup${callbackUrl ? `?callbackUrl=${encodeURIComponent(callbackUrl)}` : ''}`);
    }
  };

  return (
    <SignInForm 
      open={isOpen} 
      onClose={handleClose} 
      setShowSignUp={handleShowSignUp}
      callbackUrl={callbackUrl}
    />
  );
}