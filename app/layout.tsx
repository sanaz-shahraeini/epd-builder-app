import type { Metadata } from "next"
import { Inter } from 'next/font/google'
import { Providers } from "./providers"
import "./globals.css"
import '@radix-ui/themes/styles.css';
import { Theme } from "@radix-ui/themes";

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "TerraNEXT - Product Creation",
  description: "Create and manage your products",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <Theme>
          <div className="min-h-screen bg-gray-50">
            {children}
          </div>
        </Theme>
      </body>
    </html>
  )
}
