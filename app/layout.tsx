import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Providers } from './providers'
import { getServerSession } from 'next-auth'
import { nextAuthOptions } from './api/auth/[...nextauth]/route'
import { getMessages } from 'next-intl/server'
import { Toaster } from "@/components/ui/toaster"

const defaultLocale = 'en';

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'EPD Builder',
  description: 'Create and manage Environmental Product Declarations',
}

export default async function RootLayout({
  children,
  params: { locale }
}: {
  children: React.ReactNode
  params: { locale: string }
}) {
  // Ensure locale is always set, default to 'en' if not provided
  const safeLocale = locale || defaultLocale;
  
  const session = await getServerSession(nextAuthOptions);
  const messages = await getMessages();

  return (
    <html lang={safeLocale} suppressHydrationWarning>
      <body className={inter.className}>
        <Providers 
          session={session} 
          messages={messages}
          locale={safeLocale}
        >
          {children}
          <Toaster />
        </Providers>
      </body>
    </html>
  )
}
