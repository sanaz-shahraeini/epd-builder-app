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
import { useState, useEffect } from "react"
import { ModeToggle } from "@/components/mode-toggle"
import { Sidebar } from "@/components/sidebar"
import { LanguageSwitcher } from '@/components/language-switcher';
import { cn } from "@/lib/utils"
import { useRouter } from '@/i18n/navigation'

const tabs = ["myEPDs", "inbox", "dataDirectory", "myProfile"] as const

export default function ProfilePage() {
  const [mounted, setMounted] = useState(false)
  const [activeTab, setActiveTab] = useState<typeof tabs[number]>("myProfile")
  const [password, setPassword] = useState("••••••••")
  const [showPassword, setShowPassword] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    country: "spain",
    city: "madrid"
  })
  
  const t = useTranslations()
  const n = useTranslations('navigation')
  const p = useTranslations('profile')
  const router = useRouter()

  useEffect(() => {
    setMounted(true)
  }, [])

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleSubmit = async () => {
    // TODO: Implement form submission
    console.log('Form data:', formData)
  }

  if (!mounted) {
    return null
  }

  return (
    <div className="flex h-screen bg-gray-50/50 dark:bg-black/50">
      {/* Desktop Sidebar */}
      <div className="fixed inset-y-0 left-0 z-50 hidden md:block">
        <Sidebar className="h-full" />
      </div>

      {/* Mobile Sidebar */}
      <div className={cn(
        "fixed inset-y-0 left-0 z-50 w-64 bg-white dark:bg-black transition-transform duration-300 ease-in-out border-r border-gray-100 dark:border-gray-800 md:hidden",
        isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <Sidebar className="h-full" />
      </div>

      {/* Mobile Overlay */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 md:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      <div className="flex-1 flex flex-col md:ml-64">
        <header className="sticky top-0 z-40 bg-white/95 dark:bg-black/95 backdrop-blur-sm border-b border-gray-100 dark:border-gray-800">
          <div className="flex items-center h-14 px-4 md:px-8">
            <button
              onClick={() => setIsMobileMenuOpen(true)}
              className="p-2 -ml-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors md:hidden"
              aria-label="Open menu"
            >
              <Menu className="w-5 h-5 text-gray-500" />
            </button>
            <div className="flex items-center gap-2.5 ml-2 md:ml-0">
              <Avatar className="h-8 w-8 ring-2 ring-gray-50 dark:ring-gray-800">
                <AvatarImage src="/placeholder.svg" />
                <AvatarFallback className="bg-gray-100 dark:bg-gray-800">
                  UN
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="text-sm font-medium text-gray-900 dark:text-gray-100">User name</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">Admin</p>
              </div>
            </div>
            <div className="flex items-center gap-1.5 ml-auto">
              <div className="flex items-center">
              <LanguageSwitcher />
                <div className="w-px h-4 bg-gray-200 dark:bg-gray-700 mx-2" />
                <ModeToggle />
          
              </div>
            </div>
          </div>
          <nav className="px-4 md:px-8 overflow-x-auto">
            <div className="flex min-w-max">
              {tabs.map((tab) => (
                <button
                  key={tab}
                  onClick={() => {
                    if (tab === "inbox") {
                      router.push('/dashboard/inbox')
                    } else {
                      setActiveTab(tab)
                    }
                  }}
                  className={`text-sm py-3.5 px-3 md:px-4 relative transition-colors hover:text-teal-500 ${
                    activeTab === tab
                      ? "text-teal-600 dark:text-teal-500 font-medium"
                      : "text-gray-600 dark:text-gray-400"
                  }`}
                >
                  {n(tab)}
                  {activeTab === tab && (
                    <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-teal-600 dark:bg-teal-500" />
                  )}
                </button>
              ))}
            </div>
          </nav>
        </header>

        <main className="flex-1 overflow-y-auto">
          <div className="max-w-[1600px] mx-auto px-8 py-6">
            <div className="flex flex-col lg:flex-row gap-6 lg:gap-16">
              <div className="flex-1 max-w-full lg:max-w-[1000px]">
                <div className="relative group mb-8 md:mb-12">
                  <div className="flex items-center justify-center">
                    <Avatar className="h-20 md:h-28 w-20 md:w-28 ring-4 ring-white dark:ring-gray-800 shadow-lg relative">
                      <AvatarImage 
                        src="/placeholder.svg" 
                        alt={formData.firstName || "User"}
                        className="object-cover"
                      />
                      <AvatarFallback className="text-xl">
                        {(formData.firstName?.[0] || "U") + (formData.lastName?.[0] || "N")}
                      </AvatarFallback>
                      <div className="absolute -bottom-2 -right-2 bg-[#8CC63F] text-white text-xs rounded-full h-6 w-6 flex items-center justify-center">
                        01
                      </div>
                    </Avatar>
                    <button className="absolute bottom-0 right-1/2 translate-x-12 translate-y-2 bg-white dark:bg-gray-800 p-2 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity">
                      <Camera className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                    </button>
                  </div>
                </div>

                <div className="space-y-8">
                  <div className="bg-white dark:bg-black rounded-2xl shadow-sm p-6">
                    <div className="flex items-center justify-between mb-8">
                      <h2 className="text-lg font-semibold">{p('personalInformation')}</h2>
                    </div>
                    <div className="grid gap-6">
                      <div className="grid sm:grid-cols-2 gap-4">
                        <div>
                          <Input 
                            className="bg-gray-50 border-gray-100 dark:bg-gray-900/50 dark:border-gray-700" 
                            placeholder={p('firstName')}
                            value={formData.firstName}
                            onChange={(e) => handleInputChange('firstName', e.target.value)}
                          />
                        </div>
                        <div>
                          <Input 
                            className="bg-gray-50 border-gray-100 dark:bg-gray-900/50 dark:border-gray-700" 
                            placeholder={p('lastName')}
                            value={formData.lastName}
                            onChange={(e) => handleInputChange('lastName', e.target.value)}
                          />
                        </div>
                      </div>
                      <div>
                        <Input 
                          className="bg-gray-50 border-gray-100 dark:bg-gray-900/50 dark:border-gray-700" 
                          placeholder={p('email')}
                          type="email"
                          value={formData.email}
                          onChange={(e) => handleInputChange('email', e.target.value)}
                        />
                      </div>
                      <div className="grid sm:grid-cols-2 gap-4">
                        <Select 
                          value={formData.country}
                          onValueChange={(value) => handleInputChange('country', value)}
                        >
                          <SelectTrigger className="bg-gray-50 border-gray-100 dark:bg-gray-900/50 dark:border-gray-700">
                            <SelectValue placeholder={p('country')} />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="spain">Spain</SelectItem>
                            <SelectItem value="france">France</SelectItem>
                            <SelectItem value="germany">Germany</SelectItem>
                          </SelectContent>
                        </Select>
                        <Select
                          value={formData.city}
                          onValueChange={(value) => handleInputChange('city', value)}
                        >
                          <SelectTrigger className="bg-gray-50 border-gray-100 dark:bg-gray-900/50 dark:border-gray-700">
                            <SelectValue placeholder={p('city')} />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="madrid">Madrid</SelectItem>
                            <SelectItem value="barcelona">Barcelona</SelectItem>
                            <SelectItem value="valencia">Valencia</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white dark:bg-black rounded-2xl shadow-sm p-6">
                    <div className="flex items-center justify-between mb-8">
                      <h2 className="text-lg font-semibold">{p('passwordManager')}</h2>
                    </div>
                    <div className="space-y-4">
                      <div className="relative">
                        <Input 
                          type={showPassword ? "text" : "password"}
                          className="bg-gray-50 border-gray-100 pr-10 dark:bg-gray-900/50 dark:border-gray-700" 
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                        />
                        <button
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-teal-500"
                          onClick={() => setShowPassword(!showPassword)}
                        >
                          {showPassword ? (
                            <EyeOff className="h-4 w-4" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
                        </button>
                      </div>
                      <button
                        className="text-teal-500 text-sm hover:underline"
                      >
                        {p('changePassword')}
                      </button>
                    </div>
                  </div>

                  <Button 
                    className="w-full bg-teal-600 hover:bg-teal-500 text-white" 
                    onClick={handleSubmit}
                  >
                    {p('saveChanges')}
                  </Button>
                </div>
              </div>
              
              {/* User List Section */}
              <div className="w-full lg:w-[300px] bg-white dark:bg-black rounded-2xl shadow-sm p-4 md:p-6 flex-shrink-0 h-fit order-first lg:order-last">
                <div className="flex items-center gap-3 mb-6">
                  <div className="h-10 w-10 rounded-full bg-gray-100 flex items-center justify-center">
                    <svg className="w-5 h-5 text-gray-500" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M12 12C14.7614 12 17 9.76142 17 7C17 4.23858 14.7614 2 12 2C9.23858 2 7 4.23858 7 7C7 9.76142 9.23858 12 12 12Z" fill="currentColor"/>
                      <path d="M12 14C7.58172 14 4 17.5817 4 22H20C20 17.5817 16.4183 14 12 14Z" fill="currentColor"/>
                    </svg>
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold">{p('companyName')}</h2>
                    <p className="text-sm text-gray-500">{p('users')} User</p>
                  </div>
                </div>
                
                <div className="space-y-3 md:space-y-4">
                  {[...Array(8)].map((_, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback className="bg-gray-100">
                          {`U${i + 1}`}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{p('userName')} {String(i + 1).padStart(2, '0')}</p>
                        <p className="text-xs text-gray-500 truncate">{p('position')}</p>
                      </div>
                      {i === 0 && (
                        <span className="text-xs text-teal-500 font-medium flex-shrink-0">
                          {p('new')}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
                
                <Button 
                  className="w-full mt-6 bg-teal-600 hover:bg-teal-500 text-white font-medium" 
                  onClick={() => console.log('Add new user')}
                >
                  + {p('addNewUser')}
                </Button>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
