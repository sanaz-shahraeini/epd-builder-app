"use client";

import { useState } from 'react'
import { Suspense } from 'react'
import { useSession } from "next-auth/react";
import "@radix-ui/themes/styles.css";
import { Sidebar } from "@/components/sidebar"
import ProductForm  from "@/components/product-form"
import Loading from './loading'
import SignInForm from "@/components/sign/SignInForm"

export default function Page() {
  const { data: session, status } = useSession();
  const [isSignInOpen, setIsSignInOpen] = useState(true);
  const [showSignUp, setShowSignUp] = useState(false);

  // Show loading while checking session
  if (status === "loading") {
    return <Loading />;
  }

  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-black">
      {session ? (
        <>
          <Sidebar />
          <main className="flex-1 md:ml-64 p-4 md:p-8">
            <Suspense fallback={<Loading />}>
              <ProductForm />
            </Suspense>
          </main>
        </>
       ) : (
        <main className="flex-1 flex items-center justify-center p-4">
          <SignInForm 
            open={isSignInOpen} 
            onClose={() => setIsSignInOpen(false)}
            setShowSignUp={setShowSignUp}
          />
        </main>
       )}
    </div>
  )
}
