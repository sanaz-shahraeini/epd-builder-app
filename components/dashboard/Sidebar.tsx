"use client"

import { useEffect } from 'react'
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { LayoutDashboard, FileText, Settings, Search, MessageSquare, LogOut } from 'lucide-react'
import Link from "next/link"
import { usePathname } from 'next/navigation'
import { useTranslations } from 'next-intl'
import Image from 'next/image'
import { useUserStore } from '@/lib/store/user'
import { getUserProfile } from '@/lib/api/auth'
import { ROUTES } from '@/i18n/navigation'

const getNavigationItems = (t: (key: string) => string) => [
  {
    name: t('navigation.dashboard.portfolio'),
    href: ROUTES.DASHBOARD_ROUTES.PORTFOLIO,
    icon: LayoutDashboard
  },
  {
    name: t('navigation.dashboard.projects'),
    href: ROUTES.DASHBOARD_ROUTES.PROJECTS,
    icon: FileText
  },
  {
    name: t('navigation.dashboard.admin'),
    href: ROUTES.DASHBOARD_ROUTES.ADMIN,
    icon: Settings
  },
  {
    name: t('navigation.dashboard.epd'),
    href: ROUTES.DASHBOARD_ROUTES.EPD,
    icon: Search
  },
  {
    name: t('navigation.dashboard.requests'),
    href: ROUTES.DASHBOARD_ROUTES.REQUESTS,
    icon: MessageSquare,
    badge: 2
  }
]

export function Sidebar() {
  const pathname = usePathname()
  const t = useTranslations('navigation')
  const navigation = getNavigationItems(t)
  const { user, setUser } = useUserStore()

  console.log('Current user in Sidebar:', user)

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        console.log('Fetching user profile...')
        const userProfile = await getUserProfile()
        console.log('Raw user profile from API:', userProfile)
        
        if (userProfile) {
          const userData = {
            id: userProfile.id,
            first_name: userProfile.first_name || "",
            last_name: userProfile.last_name || "",
            email: userProfile.email || "",
            user_type: userProfile.user_type || "regular",
            profile_picture_url: userProfile.profile?.profile_picture_url || "",
            company_name: userProfile.company_name || "",
            username: userProfile.username || "",
          }
          console.log('Setting user data in store:', userData)
          setUser(userData)
        }
      } catch (error) {
        console.error('Error fetching user profile in sidebar:', error)
      }
    }

    fetchUserData()
  }, [setUser]) // Remove user from dependencies to always fetch on mount

  return (
    <div className="flex flex-col h-full bg-white border-r w-64 py-6">
      <div className="px-6 mb-8">
        <Image
          src="/terraNEXT-logo.png"
          alt="TerraNEXT"
          width={150}
          height={40}
          priority
        />
      </div>

      <div className="px-6 mb-6">
        <div className="flex items-center gap-3">
          <Avatar className="h-8 w-8">
            {user?.profile_picture_url ? (
              <AvatarImage 
                src={user.profile_picture_url} 
                alt={user?.username || 'User'} 
                className="object-cover"
              />
            ) : (
              <AvatarFallback className="bg-gray-100 text-gray-600 text-sm">
                {user?.username?.[0]?.toUpperCase() || 'U'}
              </AvatarFallback>
            )}
          </Avatar>
          <div className="flex flex-col">
            <span className="text-[14px] font-normal text-gray-900">
              {user?.username || 'User Name'}
            </span>
            <span className="text-[12px] text-gray-500">
              {user?.company_name || 'Company Name'}
            </span>
          </div>
        </div>
      </div>

      <nav className="flex-1 px-3">
        {navigation.map((item) => {
          const isActive = pathname.startsWith(item.href)
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2 text-sm rounded-md mb-1 relative ${
                isActive 
                  ? "text-[#00A499] bg-[#E6F6F5]" 
                  : "text-gray-700 hover:bg-gray-100"
              }`}
            >
              <item.icon className="h-5 w-5" />
              <span>{item.name}</span>
              {item.badge && (
                <span className="absolute right-3 bg-[#8CC63F] text-white text-xs px-1.5 py-0.5 rounded-full">
                  {item.badge}
                </span>
              )}
            </Link>
          )
        })}
      </nav>

      <div className="px-3 mt-auto">
        <Link
          href="/auth/signout"
          className="flex items-center gap-3 px-3 py-2 text-sm text-gray-700 rounded-md hover:bg-gray-100"
        >
          <LogOut className="h-5 w-5" />
          <span>{t('logout')}</span>
        </Link>
      </div>
    </div>
  )
}
