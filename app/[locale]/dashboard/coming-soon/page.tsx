"use client"

import { useTranslations } from "next-intl"
import { Button } from "@/components/ui/button"
import { useRouter } from '@/i18n/navigation'
import { Sidebar } from "@/components/sidebar"
import { ModeToggle } from "@/components/mode-toggle"
import { LanguageSwitcher } from '@/components/language-switcher'
import { Menu } from 'lucide-react'
import { useState, useRef } from "react"

export default function ComingSoonPage() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const mobileMenuRef = useRef<HTMLDivElement>(null)
  const t = useTranslations('ComingSoon')
  const router = useRouter()

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-14 items-center justify-between">
          <div className="flex items-center gap-2 md:gap-4">
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              <Menu className="h-5 w-5" />
            </Button>
          </div>
          <div className="flex items-center gap-2">
            <LanguageSwitcher />
            <ModeToggle />
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <Sidebar
          isMobileMenuOpen={isMobileMenuOpen}
          setIsMobileMenuOpen={setIsMobileMenuOpen}
          mobileMenuRef={mobileMenuRef}
        />

        {/* Main Content */}
        <main className="flex-1 p-6 md:p-8 lg:p-12">
          <div className="flex min-h-[calc(100vh-8rem)] flex-col items-center justify-center text-center">
            <h1 className="mb-4 text-4xl font-bold">🚧 {t('title')}</h1>
            <p className="mb-8 text-xl text-muted-foreground">
              {t('description')}
              <br />
              Stay tuned for updates!
            </p>
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                {t('subtext')}
              </p>
              <Button
                variant="outline"
                onClick={() => router.back()}
              >
                {t('goBack')}
              </Button>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
