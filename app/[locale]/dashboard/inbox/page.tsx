"use client"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Eye, EyeOff, Camera, Menu } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { useRouter, usePathname } from '@/i18n/navigation'
import { useState, useEffect } from "react"
import { ModeToggle } from "@/components/mode-toggle"
import { LanguageSwitcher } from "@/components/language-switcher"
import { Sidebar } from "@/components/sidebar"
import { cn } from "@/lib/utils"
import { MessageList } from "@/components/message-list"
import { MessageView } from "@/components/message-view"
import { AdminSidebar } from "@/app/components/dashboard/AdminSidebar"
import { useUsers } from "@/lib/context/UsersContext"
import { useUserStore } from "@/lib/store/user"
import Header from '@/components/Header';

const tabs = ["myEPDs", "inbox", "dataDirectory", "myProfile"] as const

export default function InboxPage() {
  const [mounted, setMounted] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const { users, isLoading: isLoadingUsers } = useUsers()
  const user = useUserStore((state) => state.user)

  const filteredUsers = users.filter(user =>
    user.first_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.last_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.job_title?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const t = useTranslations()
  const n = useTranslations('navigation')
  const p = useTranslations('profile')
  const router = useRouter()

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return null
  }

  return (
    <div className="flex flex-col lg:flex-row gap-6">
      {/* Message List Column */}
      <div className="w-full lg:w-[450px] bg-white dark:bg-black overflow-auto">
        <MessageList />
      </div>

      {/* Message View Column */}
      <div className="flex-1 bg-white dark:bg-black overflow-y-auto">
        <MessageView />
      </div>
    </div>
  );
}
