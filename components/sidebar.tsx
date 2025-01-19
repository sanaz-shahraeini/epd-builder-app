'use client'

import Link from "next/link"
import { useRouter, usePathname } from "next/navigation"
import { BarChart2, FileText, Settings, Search, MessageSquare, LogOut, Menu } from 'lucide-react'
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { ModeToggle } from "@/components/mode-toggle"
import { useTranslations } from 'next-intl'
import { signOut } from "next-auth/react"
import { useUserStore } from '@/lib/store/user'
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

interface SidebarProps {
  className?: string;
}

export function Sidebar({ className }: SidebarProps) {
  return (
    <>
      {/* Mobile Menu */}
      <div className={`fixed top-4 right-4 flex items-center gap-2 md:hidden ${className}`}>
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon">
              <Menu className="h-6 w-6" />
              <span className="sr-only">Toggle Menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-64 p-0 bg-white dark:bg-black border-r dark:border-gray-800">
            <SidebarContent isMobile={true} />
          </SheetContent>
        </Sheet>
        <ModeToggle />
      </div>

      {/* Desktop Sidebar */}
      <div className={`hidden md:block w-64 h-screen bg-white dark:bg-black border-r dark:border-gray-800 fixed ${className}`}>
        <SidebarContent isMobile={false} />
      </div>
    </>
  )
}

// Extract sidebar content to a separate component for reuse
function SidebarContent({ isMobile }: { isMobile?: boolean }) {
  const router = useRouter()
  const pathname = usePathname()
  const n = useTranslations('navigation')
  const { user } = useUserStore()

  console.log('Current user in sidebar:', user)

  const isLinkActive = (path: string) => {
    if (!pathname) return false;
    
    // Map German paths to their English equivalents for checking
    const germanToEnglishPaths = {
      '/dashboard/posteingang': '/dashboard/inbox',
      '/dashboard/profil': '/dashboard/profile',
      '/dashboard/epd-vorschau': '/dashboard/epd-preview'
    };

    // Get the current path without locale prefix
    const currentPath = pathname.replace(/^\/[a-z]{2}/, '');
    
    // Special handling for administrative section
    if (path === '/dashboard/profile') {
      // Consider profile, inbox, and EPD pages as part of administrative section
      return currentPath.includes('/dashboard/profile') || 
             currentPath.includes('/dashboard/inbox') ||
             currentPath.includes('/dashboard/epd') ||
             currentPath.includes('/dashboard/epd-preview') ||
             currentPath.includes('/dashboard/profil') ||
             currentPath.includes('/dashboard/posteingang') ||
             currentPath.includes('/dashboard/epd-vorschau');
    }

    // Check if current path matches either English or German version
    return currentPath === path || 
           currentPath === germanToEnglishPaths[path as keyof typeof germanToEnglishPaths] ||
           Object.entries(germanToEnglishPaths).find(([de, en]) => 
             (currentPath.includes(de) && path.includes(en)) || 
             (currentPath.includes(en) && path.includes(de))
           ) !== undefined;
  };

  const getLinkClassName = (path: string) => {
    const baseClasses = "flex items-center space-x-3 px-3 py-2 rounded-lg"
    const isActive = isLinkActive(path)
    
    return `${baseClasses} ${
      isActive
        ? "text-teal-600 dark:text-teal-400 bg-teal-50 dark:bg-black"
        : "text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-900"
    }`
  }

  const handleLogout = async () => {
    try {
      await signOut({ 
        redirect: true, 
        callbackUrl: '/signin' 
      });
    } catch (error) {
      console.error('Logout failed:', error);
      // Optionally show an error toast or message
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className={`${isMobile ? 'p-6' : 'p-6'}`}>
        <img 
          src="/assets/images/logo.png" 
          alt="TerraNEXT" 
          className="h-8" 
        />
      </div>

      {/* User Info */}
      <div className={`${isMobile ? 'p-4' : 'p-4'} flex items-center space-x-3`}>
        <Avatar className="w-8 h-8">
          {user?.profile_picture_url ? (
            <AvatarImage 
              src={user.profile_picture_url} 
              alt={user?.username || 'User'} 
              className="object-cover"
            />
          ) : (
            <AvatarFallback className="bg-gray-200 dark:bg-gray-800 text-gray-600 dark:text-gray-400">
              {user?.username?.[0]?.toUpperCase() || '👤'}
            </AvatarFallback>
          )}
        </Avatar>
        <div>
          <div className="font-medium text-gray-900 dark:text-gray-100">
            {user?.username || n('userName')}
          </div>
          <div className="text-sm text-gray-500 dark:text-gray-400">
            {user?.company_name || n('companyName')}
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4">
        <div className="space-y-2">
          <Link 
            href="/dashboard/product-portfolio" 
            className={getLinkClassName('/dashboard/product-portfolio')}
          >
            <BarChart2 className="h-5 w-5" />
            <span>{n('productPortfolio')}</span>
          </Link>
          <Link 
            href="/dashboard/project-management" 
            className={getLinkClassName('/dashboard/project-management')}
          >
            <FileText className="h-5 w-5" />
            <span>{n('projectManagement')}</span>
          </Link>
          <Link 
            href="/dashboard/profile" 
            className={getLinkClassName('/dashboard/profile')}
          >
            <Settings className="h-5 w-5" />
            <span>{n('administrative')}</span>
          </Link>
          <Link 
            href="/dashboard/epd-preview" 
            className={getLinkClassName('/dashboard/epd-preview')}
          >
            <Search className="h-5 w-5" />
            <span>{n('epdPreview')}</span>
          </Link>
          <Link 
            href="#" 
            className={getLinkClassName('/dashboard/requests')}
          >
            <MessageSquare className="h-5 w-5" />
            <span>{n('requests')}</span>
            <span className="ml-auto bg-teal-100 dark:bg-black text-teal-600 dark:text-teal-400 text-xs px-2 py-0.5 rounded-full">2</span>
          </Link>
        </div>

        {/* Logout Button */}
        <div className={`absolute bottom-4 left-4 right-4 ${isMobile ? '' : ''}`}>
          <button 
            onClick={handleLogout}
            className="w-full flex items-center space-x-3 px-3 py-2 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-900 rounded-lg"
          >
            <LogOut className="h-5 w-5" />
            <span>{n('logout')}</span>
          </button>
        </div>
      </nav>
    </div>
  )
}