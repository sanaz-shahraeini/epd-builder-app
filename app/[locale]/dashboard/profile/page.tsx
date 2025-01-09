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
import { useTranslations } from "next-intl"
import { cn } from "@/lib/utils"
import { useRouter } from '@/i18n/navigation'
import { getUserProfile, updateUserProfile, type UserProfile } from "@/lib/api/auth"
import { useToast } from "@/components/ui/use-toast"
import { useState, useEffect, useRef } from "react"
import { ModeToggle } from "@/components/mode-toggle"
import { Sidebar } from "@/components/sidebar"
import { LanguageSwitcher } from '@/components/language-switcher'

const tabs = ["myEPDs", "inbox", "dataDirectory", "myProfile"] as const

const countries = [
  { value: "afghanistan", label: "Afghanistan" },
  { value: "albania", label: "Albania" },
  { value: "algeria", label: "Algeria" },
  { value: "andorra", label: "Andorra" },
  { value: "angola", label: "Angola" },
  { value: "antigua_and_barbuda", label: "Antigua and Barbuda" },
  { value: "argentina", label: "Argentina" },
  { value: "armenia", label: "Armenia" },
  { value: "australia", label: "Australia" },
  { value: "austria", label: "Austria" },
  { value: "azerbaijan", label: "Azerbaijan" },
  { value: "bahamas", label: "Bahamas" },
  { value: "bahrain", label: "Bahrain" },
  { value: "bangladesh", label: "Bangladesh" },
  { value: "barbados", label: "Barbados" },
  { value: "belarus", label: "Belarus" },
  { value: "belgium", label: "Belgium" },
  { value: "belize", label: "Belize" },
  { value: "benin", label: "Benin" },
  { value: "bhutan", label: "Bhutan" },
  { value: "bolivia", label: "Bolivia" },
  { value: "bosnia_and_herzegovina", label: "Bosnia and Herzegovina" },
  { value: "botswana", label: "Botswana" },
  { value: "brazil", label: "Brazil" },
  { value: "brunei", label: "Brunei" },
  { value: "bulgaria", label: "Bulgaria" },
  { value: "burkina_faso", label: "Burkina Faso" },
  { value: "burundi", label: "Burundi" },
  { value: "cambodia", label: "Cambodia" },
  { value: "cameroon", label: "Cameroon" },
  { value: "canada", label: "Canada" },
  { value: "cape_verde", label: "Cape Verde" },
  { value: "central_african_republic", label: "Central African Republic" },
  { value: "chad", label: "Chad" },
  { value: "chile", label: "Chile" },
  { value: "china", label: "China" },
  { value: "colombia", label: "Colombia" },
  { value: "comoros", label: "Comoros" },
  { value: "congo", label: "Congo" },
  { value: "costa_rica", label: "Costa Rica" },
  { value: "croatia", label: "Croatia" },
  { value: "cuba", label: "Cuba" },
  { value: "cyprus", label: "Cyprus" },
  { value: "czech_republic", label: "Czech Republic" },
  { value: "denmark", label: "Denmark" },
  { value: "djibouti", label: "Djibouti" },
  { value: "dominica", label: "Dominica" },
  { value: "dominican_republic", label: "Dominican Republic" },
  { value: "east_timor", label: "East Timor" },
  { value: "ecuador", label: "Ecuador" },
  { value: "egypt", label: "Egypt" },
  { value: "el_salvador", label: "El Salvador" },
  { value: "equatorial_guinea", label: "Equatorial Guinea" },
  { value: "eritrea", label: "Eritrea" },
  { value: "estonia", label: "Estonia" },
  { value: "ethiopia", label: "Ethiopia" },
  { value: "fiji", label: "Fiji" },
  { value: "finland", label: "Finland" },
  { value: "france", label: "France" },
  { value: "gabon", label: "Gabon" },
  { value: "gambia", label: "Gambia" },
  { value: "georgia", label: "Georgia" },
  { value: "germany", label: "Germany" },
  { value: "ghana", label: "Ghana" },
  { value: "greece", label: "Greece" },
  { value: "grenada", label: "Grenada" },
  { value: "guatemala", label: "Guatemala" },
  { value: "guinea", label: "Guinea" },
  { value: "guinea_bissau", label: "Guinea-Bissau" },
  { value: "guyana", label: "Guyana" },
  { value: "haiti", label: "Haiti" },
  { value: "honduras", label: "Honduras" },
  { value: "hungary", label: "Hungary" },
  { value: "iceland", label: "Iceland" },
  { value: "india", label: "India" },
  { value: "indonesia", label: "Indonesia" },
  { value: "iran", label: "Iran" },
  { value: "iraq", label: "Iraq" },
  { value: "ireland", label: "Ireland" },
  { value: "israel", label: "Israel" },
  { value: "italy", label: "Italy" },
  { value: "ivory_coast", label: "Ivory Coast" },
  { value: "jamaica", label: "Jamaica" },
  { value: "japan", label: "Japan" },
  { value: "jordan", label: "Jordan" },
  { value: "kazakhstan", label: "Kazakhstan" },
  { value: "kenya", label: "Kenya" },
  { value: "kiribati", label: "Kiribati" },
  { value: "north_korea", label: "North Korea" },
  { value: "south_korea", label: "South Korea" },
  { value: "kuwait", label: "Kuwait" },
  { value: "kyrgyzstan", label: "Kyrgyzstan" },
  { value: "laos", label: "Laos" },
  { value: "latvia", label: "Latvia" },
  { value: "lebanon", label: "Lebanon" },
  { value: "lesotho", label: "Lesotho" },
  { value: "liberia", label: "Liberia" },
  { value: "libya", label: "Libya" },
  { value: "liechtenstein", label: "Liechtenstein" },
  { value: "lithuania", label: "Lithuania" },
  { value: "luxembourg", label: "Luxembourg" },
  { value: "macedonia", label: "Macedonia" },
  { value: "madagascar", label: "Madagascar" },
  { value: "malawi", label: "Malawi" },
  { value: "malaysia", label: "Malaysia" },
  { value: "maldives", label: "Maldives" },
  { value: "mali", label: "Mali" },
  { value: "malta", label: "Malta" },
  { value: "marshall_islands", label: "Marshall Islands" },
  { value: "mauritania", label: "Mauritania" },
  { value: "mauritius", label: "Mauritius" },
  { value: "mexico", label: "Mexico" },
  { value: "micronesia", label: "Micronesia" },
  { value: "moldova", label: "Moldova" },
  { value: "monaco", label: "Monaco" },
  { value: "mongolia", label: "Mongolia" },
  { value: "montenegro", label: "Montenegro" },
  { value: "morocco", label: "Morocco" },
  { value: "mozambique", label: "Mozambique" },
  { value: "myanmar", label: "Myanmar" },
  { value: "namibia", label: "Namibia" },
  { value: "nauru", label: "Nauru" },
  { value: "nepal", label: "Nepal" },
  { value: "netherlands", label: "Netherlands" },
  { value: "new_zealand", label: "New Zealand" },
  { value: "nicaragua", label: "Nicaragua" },
  { value: "niger", label: "Niger" },
  { value: "nigeria", label: "Nigeria" },
  { value: "norway", label: "Norway" },
  { value: "oman", label: "Oman" },
  { value: "pakistan", label: "Pakistan" },
  { value: "palau", label: "Palau" },
  { value: "panama", label: "Panama" },
  { value: "papua_new_guinea", label: "Papua New Guinea" },
  { value: "paraguay", label: "Paraguay" },
  { value: "peru", label: "Peru" },
  { value: "philippines", label: "Philippines" },
  { value: "poland", label: "Poland" },
  { value: "portugal", label: "Portugal" },
  { value: "qatar", label: "Qatar" },
  { value: "romania", label: "Romania" },
  { value: "russia", label: "Russia" },
  { value: "rwanda", label: "Rwanda" },
  { value: "saint_kitts_and_nevis", label: "Saint Kitts and Nevis" },
  { value: "saint_lucia", label: "Saint Lucia" },
  { value: "saint_vincent", label: "Saint Vincent and the Grenadines" },
  { value: "samoa", label: "Samoa" },
  { value: "san_marino", label: "San Marino" },
  { value: "sao_tome", label: "Sao Tome and Principe" },
  { value: "saudi_arabia", label: "Saudi Arabia" },
  { value: "senegal", label: "Senegal" },
  { value: "serbia", label: "Serbia" },
  { value: "seychelles", label: "Seychelles" },
  { value: "sierra_leone", label: "Sierra Leone" },
  { value: "singapore", label: "Singapore" },
  { value: "slovakia", label: "Slovakia" },
  { value: "slovenia", label: "Slovenia" },
  { value: "solomon_islands", label: "Solomon Islands" },
  { value: "somalia", label: "Somalia" },
  { value: "south_africa", label: "South Africa" },
  { value: "spain", label: "Spain" },
  { value: "sri_lanka", label: "Sri Lanka" },
  { value: "sudan", label: "Sudan" },
  { value: "suriname", label: "Suriname" },
  { value: "swaziland", label: "Swaziland" },
  { value: "sweden", label: "Sweden" },
  { value: "switzerland", label: "Switzerland" },
  { value: "syria", label: "Syria" },
  { value: "taiwan", label: "Taiwan" },
  { value: "tajikistan", label: "Tajikistan" },
  { value: "tanzania", label: "Tanzania" },
  { value: "thailand", label: "Thailand" },
  { value: "togo", label: "Togo" },
  { value: "tonga", label: "Tonga" },
  { value: "trinidad_and_tobago", label: "Trinidad and Tobago" },
  { value: "tunisia", label: "Tunisia" },
  { value: "turkey", label: "Turkey" },
  { value: "turkmenistan", label: "Turkmenistan" },
  { value: "tuvalu", label: "Tuvalu" },
  { value: "uganda", label: "Uganda" },
  { value: "ukraine", label: "Ukraine" },
  { value: "united_arab_emirates", label: "United Arab Emirates" },
  { value: "united_kingdom", label: "United Kingdom" },
  { value: "united_states", label: "United States" },
  { value: "uruguay", label: "Uruguay" },
  { value: "uzbekistan", label: "Uzbekistan" },
  { value: "vanuatu", label: "Vanuatu" },
  { value: "vatican_city", label: "Vatican City" },
  { value: "venezuela", label: "Venezuela" },
  { value: "vietnam", label: "Vietnam" },
  { value: "yemen", label: "Yemen" },
  { value: "zambia", label: "Zambia" },
  { value: "zimbabwe", label: "Zimbabwe" }
] as const;

type CountryValue = typeof countries[number]['value'];

export default function ProfilePage() {
  const [mounted, setMounted] = useState(false)
  const [activeTab, setActiveTab] = useState<typeof tabs[number]>("myProfile")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { toast } = useToast()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const mobileMenuRef = useRef<HTMLDivElement>(null)
  const [password, setPassword] = useState("••••••••")
  const [showPassword, setShowPassword] = useState(false)
  const [formData, setFormData] = useState<Partial<UserProfile>>({
    first_name: "",
    last_name: "",
    email: "",
    country: "",
    city: "",
    profile_picture: null
  })

  const t = useTranslations()
  const n = useTranslations('navigation')
  const p = useTranslations('profile')
  const router = useRouter()

  const fetchUserProfile = async () => {
    try {
      setLoading(true)
      const profile = await getUserProfile()
      setFormData({
        first_name: profile.first_name || "",
        last_name: profile.last_name || "",
        email: profile.email || "",
        country: profile.country || "",
        city: profile.profile?.city || "",
      })
      if (profile.profile?.profile_picture_url) {
        setAvatarUrl(profile.profile.profile_picture_url)
      }
    } catch (error) {
      console.error('Error fetching profile:', error)
      toast({
        title: "Error",
        description: "Failed to load profile",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      const url = URL.createObjectURL(file)
      setAvatarUrl(url)
      setFormData(prev => ({
        ...prev,
        profile_picture: file
      }))
    }
  }

  const handleAvatarClick = () => {
    fileInputRef.current?.click()
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleSubmit = async () => {
    try {
      setLoading(true)
      await updateUserProfile(formData)
      toast({
        title: "Success",
        description: "Profile updated successfully",
      })
    } catch (error) {
      console.error('Error updating profile:', error)
      toast({
        title: "Error",
        description: "Failed to update profile",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    setMounted(true)
    fetchUserProfile()
  }, [])

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (mobileMenuRef.current && !mobileMenuRef.current.contains(event.target as Node)) {
        setIsMobileMenuOpen(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [])

  // Only render content after mounting to avoid hydration issues
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
      <div 
        ref={mobileMenuRef}
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-64 bg-white dark:bg-black transition-transform duration-300 ease-in-out border-r border-gray-100 dark:border-gray-800 md:hidden",
          isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
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
                    <input
                      type="file"
                      ref={fileInputRef}
                      className="hidden"
                      accept="image/*"
                      onChange={handleFileChange}
                    />
                    <Avatar 
                      className="h-20 md:h-28 w-20 md:w-28 ring-4 ring-white dark:ring-gray-800 shadow-lg relative cursor-pointer"
                      onClick={handleAvatarClick}
                    >
                      <AvatarImage 
                        src={avatarUrl || formData.profile?.profile_picture_url || "/placeholder.svg"}
                        alt={formData.first_name || "User"}
                        className="object-cover"
                      />
                      <AvatarFallback className="text-xl">
                        {(formData.first_name?.[0] || "U") + (formData.last_name?.[0] || "N")}
                      </AvatarFallback>
                      <div className="absolute -bottom-2 -right-2 bg-[#8CC63F] text-white text-xs rounded-full h-6 w-6 flex items-center justify-center">
                        <Camera className="w-4 h-4" />
                      </div>
                    </Avatar>
                  </div>
                </div>

                <div className="space-y-8">
                  <div className="bg-white dark:bg-black rounded-2xl shadow-sm p-6">
                    <div className="flex items-center justify-between mb-8">
                      <h2 className="text-lg font-semibold">{p('personalInfo')}</h2>
                    </div>
                    <div className="grid gap-6">
                      <div className="grid sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium mb-2">
                            {p('firstName')}
                          </label>
                          <Input 
                            className="bg-gray-50 border-gray-100 dark:bg-gray-900/50 dark:border-gray-700" 
                            value={formData.first_name || ''}
                            onChange={(e) => handleInputChange('first_name', e.target.value)}
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-2">
                            {p('lastName')}
                          </label>
                          <Input 
                            className="bg-gray-50 border-gray-100 dark:bg-gray-900/50 dark:border-gray-700" 
                            value={formData.last_name || ''}
                            onChange={(e) => handleInputChange('last_name', e.target.value)}
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2">
                          {p('email')}
                        </label>
                        <Input 
                          className="bg-gray-50 border-gray-100 dark:bg-gray-900/50 dark:border-gray-700" 
                          type="email"
                          value={formData.email || ''}
                          onChange={(e) => handleInputChange('email', e.target.value)}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2">
                          {p('country')}
                        </label>
                        <Select 
                          value={formData.country || ''} 
                          onValueChange={(value) => handleInputChange('country', value)}
                        >
                          <SelectTrigger className="bg-gray-50 border-gray-100 dark:bg-gray-900/50 dark:border-gray-700">
                            <SelectValue placeholder={p('selectCountry')} />
                          </SelectTrigger>
                          <SelectContent>
                            {countries.map((country) => (
                              <SelectItem key={country.value} value={country.value}>
                                {country.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2">
                          {p('city')}
                        </label>
                        <Input 
                          className="bg-gray-50 border-gray-100 dark:bg-gray-900/50 dark:border-gray-700" 
                          value={formData.city || ''}
                          onChange={(e) => handleInputChange('city', e.target.value)}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2">
                          {p('password')}
                        </label>
                        <div className="relative">
                          <Input 
                            type={showPassword ? "text" : "password"}
                            className="bg-gray-50 border-gray-100 pr-10 dark:bg-gray-900/50 dark:border-gray-700" 
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            disabled
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute inset-y-0 right-0 flex items-center px-3 text-gray-400 hover:text-gray-600"
                          >
                            {showPassword ? (
                              <EyeOff className="h-4 w-4" />
                            ) : (
                              <Eye className="h-4 w-4" />
                            )}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white dark:bg-black rounded-2xl shadow-sm p-6">
                    <div className="flex items-center justify-between mb-8">
                      <h2 className="text-lg font-semibold">{p('passwordManager')}</h2>
                    </div>
                    <div className="space-y-4">
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
                    disabled={loading}
                  >
                    {loading ? (
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        {p('saving')}
                      </div>
                    ) : (
                      p('saveChanges')
                    )}
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
