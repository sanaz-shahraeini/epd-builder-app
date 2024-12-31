'use client';

import { SignInForm } from "@/components/sign/SignInForm";
import { useState } from "react";

export default function SignInClient() {
  const [open, setOpen] = useState(true);
  const [showSignUp, setShowSignUp] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);

  return (
    <div className="container flex h-screen w-screen flex-col items-center justify-center">
      <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
        <SignInForm 
          open={open}
          onClose={() => setOpen(false)}
          setShowSignUp={setShowSignUp}
          setShowForgotPassword={setShowForgotPassword}
        />
      </div>
    </div>
  );
}
