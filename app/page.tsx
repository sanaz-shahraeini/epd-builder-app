"use client";

import { useState } from 'react'
import { Suspense } from 'react'
import { useSession } from "next-auth/react";
import "@radix-ui/themes/styles.css";
import { Sidebar } from "@/components/sidebar"
import ProductForm  from "@/components/product-form"
import Loading from './loading'
import SignInForm from "@/components/sign/SignInForm"
import { Button } from "@/components/ui/button"

export default function Page() {
  const { data: session, status } = useSession();
  const [isSignInOpen, setIsSignInOpen] = useState(false);
  const [showSignUp, setShowSignUp] = useState(false);

  if (status === "loading") {
    return <Loading />;
  }

  // If user is authenticated, show the dashboard
  if (session) {
    return (
      <div className="flex min-h-screen bg-gray-50 dark:bg-black">
        {/* <Sidebar /> */}
        <main className="flex-1 md:ml-64 p-4 md:p-8">
          <Suspense fallback={<Loading />}>
            <ProductForm />
          </Suspense>
        </main>
      </div>
    );
  }

  // If user is not authenticated, show the landing page
  return (
    <>
      {isSignInOpen && (
        <SignInForm 
          open={isSignInOpen} 
          onClose={() => setIsSignInOpen(false)}
          setShowSignUp={setShowSignUp}
        />
      )}
      
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-black">
        {/* Hero Section */}
        <section className="pt-20 pb-16 px-4 text-center">
          <div className="max-w-6xl mx-auto">
            <h1 className="text-5xl md:text-6xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-green-500 mb-6">
              EPD Builder Web App
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-2xl mx-auto">
              Create and manage Environmental Product Declarations efficiently with our powerful web-based platform
            </p>
            <Button
              onClick={() => setIsSignInOpen(true)}
              variant="default"
              size="lg"
            >
              Get Started
            </Button>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-16 px-4 bg-gray-50 dark:bg-gray-900">
          <div className="max-w-6xl mx-auto">
            <div className="grid md:grid-cols-3 gap-8">
              <div className="p-6 bg-white dark:bg-gray-800 rounded-xl shadow-sm">
                <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center mb-4">
                  <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold mb-2">Easy Data Entry</h3>
                <p className="text-gray-600 dark:text-gray-300">Streamlined interface for quick and accurate EPD data input</p>
              </div>
              <div className="p-6 bg-white dark:bg-gray-800 rounded-xl shadow-sm">
                <div className="w-12 h-12 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center mb-4">
                  <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2 1 3 3 3h10c2 0 3-1 3-3V7c0-2-1-3-3-3H7C5 4 4 5 4 7z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold mb-2">Excel Integration</h3>
                <p className="text-gray-600 dark:text-gray-300">Import and export data seamlessly with Excel compatibility</p>
              </div>
              <div className="p-6 bg-white dark:bg-gray-800 rounded-xl shadow-sm">
                <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900 rounded-lg flex items-center justify-center mb-4">
                  <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold mb-2">Advanced Analytics</h3>
                <p className="text-gray-600 dark:text-gray-300">Comprehensive tools for analyzing and visualizing EPD data</p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16 px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl font-bold mb-4">Ready to Build Your EPD?</h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 mb-8">
              Join our platform and streamline your EPD creation process today
            </p>
            <Button
              onClick={() => setIsSignInOpen(true)}
              variant="default"
              size="lg"
            >
              Start Now
            </Button>
          </div>
        </section>
      </div>
    </>
  );
}
