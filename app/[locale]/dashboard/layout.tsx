'use client'

import { Sidebar } from "@/components/sidebar"
import { useEffect } from "react"
import { useUserStore } from "@/lib/store/user"
import { getUserProfile } from "@/lib/api/auth"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { setUser } = useUserStore()

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const userProfile = await getUserProfile()
        console.log('Fetched user profile in dashboard layout:', userProfile)
        
        if (userProfile) {
          setUser({
            id: userProfile.id,
            username: userProfile.username || "",
            first_name: userProfile.first_name || "",
            last_name: userProfile.last_name || "",
            email: userProfile.email || "",
            user_type: userProfile.user_type || "regular",
            profile_picture_url: userProfile.profile?.profile_picture_url || "",
            company_name: userProfile.company_name || "",
            city: userProfile.city || "",
            country: userProfile.country || "",
          })
        }
      } catch (error) {
        console.error('Error fetching user profile in dashboard layout:', error)
      }
    }

    fetchUserData()
  }, [setUser])

  return (
    <div className="relative min-h-screen">
      <Sidebar />
      <main className="min-h-screen">
        {children}
      </main>
    </div>
  )
}
