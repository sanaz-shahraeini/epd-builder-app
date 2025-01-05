"use client";

import { useState } from 'react';
import SignInForm from '@/components/sign/SignInForm';

export default function SignInPage() {
  const [isOpen, setIsOpen] = useState(true);

  const handleClose = () => {
    setIsOpen(false);
  };

  const handleShowSignUp = (show: boolean) => {
    // Implement sign-up navigation or modal logic if needed
  };

  return (
    <SignInForm 
      open={isOpen} 
      onClose={handleClose} 
      setShowSignUp={handleShowSignUp} 
    />
  );
}