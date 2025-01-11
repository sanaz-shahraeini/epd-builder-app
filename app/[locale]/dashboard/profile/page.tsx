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
import { Eye, EyeOff, Camera, Menu, Loader2 } from 'lucide-react'
import { useTranslations } from "next-intl"
import { cn } from "@/lib/utils"
import { useRouter } from '@/i18n/navigation'
import { getUserProfile, updateUserProfile, getCompanyUsers, type UserProfile } from "@/lib/api/auth"
import { useToast } from "@/components/ui/use-toast"
import { useState, useEffect, useRef } from "react"
import { ModeToggle } from "@/components/mode-toggle"
import { Sidebar } from "@/components/sidebar"
import { LanguageSwitcher } from '@/components/language-switcher'
import { signOut, useSession } from "next-auth/react"
import { useUserStore } from '@/lib/store/user'

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
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [avatarUrl, setAvatarUrl] = useState<string>("")
  const [avatarKey, setAvatarKey] = useState(0)
  const [users, setUsers] = useState<UserProfile[]>([])
  const [usersLoading, setUsersLoading] = useState(false)
  const [usersError, setUsersError] = useState<string | null>(null)
  const { toast } = useToast()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const mobileMenuRef = useRef<HTMLDivElement>(null)
  const [password, setPassword] = useState("••••••••")
  const [showPassword, setShowPassword] = useState(false)
  const [formData, setFormData] = useState<{
    id: number;
    first_name: string;
    last_name: string;
    email: string;
    country: string;
    city: string;
    company_name: string;
    user_type: 'regular' | 'company' | 'admin';
    profile_picture?: File;
  }>({
    id: 0,
    first_name: "",
    last_name: "",
    email: "",
    country: "",
    city: "",
    company_name: "",
    user_type: "regular",
    profile_picture: undefined
  })

  const t = useTranslations()
  const n = useTranslations('navigation')
  const p = useTranslations('profile')
  const router = useRouter()

  const { updateUser } = useUserStore()

  const [originalProfile, setOriginalProfile] = useState<UserProfile | null>(null)

  const [profileVersion, setProfileVersion] = useState(0)

  // Fetch profile data whenever profileVersion changes
  useEffect(() => {
    fetchUserProfile()
  }, [profileVersion])

  const fetchUserProfile = async () => {
    try {
      setIsLoading(true)
      const profile = await getUserProfile()
      console.log('Fetched profile data:', profile)

      // Redirect regular users to a different page
      if (profile.user_type === 'regular') {
        console.log('Regular user detected, redirecting...')
        router.push('/dashboard/coming-soon')
        return
      }

      const profileData = {
        id: profile.id,
        first_name: profile.first_name || "",
        last_name: profile.last_name || "",
        email: profile.email || "",
        country: profile.country || "",
        city: profile.profile?.city || "",
        company_name: profile.company_name || "",
        user_type: profile.user_type || "regular",
        profile_picture: undefined
      }

      console.log('Setting form data:', profileData)
      setFormData(profileData)
      setOriginalProfile(profile)

      // Set avatar URL if present
      if (profile.profile?.profile_picture_url) {
        const timestamp = new Date().getTime()
        const newAvatarUrl = `${profile.profile.profile_picture_url}?t=${timestamp}`
        console.log('Setting initial avatar URL to:', newAvatarUrl)
        setAvatarUrl(newAvatarUrl)
        setAvatarKey(prev => prev + 1)
      }
    } catch (error) {
      console.error('Error fetching profile:', error)
      toast({
        title: "Error",
        description: "Failed to load profile",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmit = async () => {
    try {
      setIsSaving(true)
      
      // Only include fields that have changed
      const changedFields = {} as Partial<UserProfile>
      const profileChanges = {} as any

      if (formData.first_name !== originalProfile?.first_name) {
        changedFields.first_name = formData.first_name
      }
      if (formData.last_name !== originalProfile?.last_name) {
        changedFields.last_name = formData.last_name
      }
      if (formData.country !== originalProfile?.country) {
        changedFields.country = formData.country
      }
      if (formData.city !== originalProfile?.city) {
        profileChanges.city = formData.city
      }
      if (formData.company_name !== originalProfile?.company_name) {
        changedFields.company_name = formData.company_name
      }
      if (formData.email !== originalProfile?.email) {
        changedFields.email = formData.email
      }

      // Add profile picture if it exists
      if (formData.profile_picture) {
        profileChanges.profile_picture = formData.profile_picture
      }

      // Only add profile to changedFields if there are profile changes
      if (Object.keys(profileChanges).length > 0) {
        changedFields.profile = profileChanges
      }

      console.log('Sending update with fields:', changedFields)

      // Only proceed if there are changes
      if (Object.keys(changedFields).length === 0) {
        toast({
          title: "No Changes",
          description: "No changes were made to your profile",
        })
        setIsSaving(false)
        return
      }

      // Add a delay before fetching updated profile to ensure database save is complete
      const updatedProfile = await updateUserProfile(changedFields)
      console.log('Server response:', updatedProfile)

      // Wait a moment to ensure the file is processed
      await new Promise(resolve => setTimeout(resolve, 1000))

      if (updatedProfile?.profile?.profile_picture_url) {
        // Add timestamp to URL to prevent caching
        const timestamp = new Date().getTime()
        const newAvatarUrl = `${updatedProfile.profile.profile_picture_url}?t=${timestamp}`
        console.log('Setting new avatar URL:', newAvatarUrl)
        setAvatarUrl(newAvatarUrl)
        setAvatarKey(prev => prev + 1)
      }

      // Update form data with fresh data from server
      setFormData({
        id: updatedProfile.id,
        first_name: updatedProfile.first_name || "",
        last_name: updatedProfile.last_name || "",
        email: updatedProfile.email || "",
        country: updatedProfile.country || "",
        city: updatedProfile.profile?.city || "",
        company_name: updatedProfile.company_name || "",
        user_type: updatedProfile.user_type || "regular",
        profile_picture: undefined // Reset the file input
      })

      // Update original profile
      setOriginalProfile(updatedProfile)

      // Update user store with new profile data
      updateUser({
        first_name: updatedProfile.first_name || "",
        last_name: updatedProfile.last_name || "",
        email: updatedProfile.email || "",
        company_name: updatedProfile.company_name || "",
        profile_picture_url: updatedProfile.profile?.profile_picture_url ? 
          `${updatedProfile.profile.profile_picture_url}?t=${Date.now()}` : undefined
      })

      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }

      toast({
        title: "Success",
        description: "Profile updated successfully",
      })
    } catch (error) {
      console.error('Error updating profile:', error)
      
      // Handle token expiration
      if (error instanceof Error && error.message.includes('token_not_valid')) {
        toast({
          title: "Session Expired",
          description: "Your session has expired. Please sign in again.",
          variant: "destructive",
        })
        // Sign out and redirect to sign in
        await signOut({ redirect: true, callbackUrl: '/signin' })
        return
      }

      // Handle database connection errors
      if (error instanceof Error && 
          (error.message.includes('connection') || 
           error.message.includes('server closed') ||
           error.message.includes('OperationalError'))) {
        toast({
          title: "Connection Error",
          description: "Unable to connect to the server. Please try again in a few moments.",
          variant: "destructive",
          duration: 5000,
        })
        return
      }

      // Handle specific API errors
      if (error instanceof Error && error.message.includes('email')) {
        toast({
          title: "Error",
          description: "This email is already in use by another account",
          variant: "destructive",
        })
        return
      }

      toast({
        title: "Error",
        description: "Failed to update profile. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      // Create a preview URL for the selected file
      const previewUrl = URL.createObjectURL(file)
      setAvatarUrl(previewUrl)
      setAvatarKey(prev => prev + 1)
      
      setFormData(prev => ({
        ...prev,
        profile_picture: file
      }))
    }
  }

  const handleAvatarClick = () => {
    fileInputRef.current?.click()
  }

  const handleInputChange = (field: keyof typeof formData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  // Fetch company users
  const fetchUsers = async () => {
    try {
      setUsersLoading(true);
      const data = await getCompanyUsers();
      console.log('Fetched users:', data);
      
      if (Array.isArray(data)) {
        setUsers(data);
      } else {
        console.error('Unexpected users data format:', data);
        setUsers([]);
        setUsersError('Invalid data format received');
      }
    } catch (error) {
      console.error('Error fetching users:', error);
      setUsers([]);
      setUsersError(error instanceof Error ? error.message : 'Failed to fetch users');
    } finally {
      setUsersLoading(false);
    }
  };

  useEffect(() => {
    if (formData.user_type === 'company') {
      fetchUsers();
    } else {
      setUsers([]);
      setUsersError(null);
    }
  }, [formData.user_type]);



  useEffect(() => {
    setMounted(true)
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
          "fixed inset-y-0 left-0 z-50 w-64 bg-white dark:bg-gray-900 transform transition-transform duration-200 ease-in-out md:hidden",
          isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <Sidebar className="h-full" />
      </div>

      {/* Main Content */}
      <div className="flex-1 md:ml-64">
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
                <AvatarImage src={avatarUrl || "/placeholder.svg"} />
                <AvatarFallback className="bg-gray-100 dark:bg-gray-800">
                  {(formData.first_name?.[0] || "U") + (formData.last_name?.[0] || "N")}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                  {formData.first_name} {formData.last_name}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {formData.user_type === 'company' ? 'Company User' : formData.user_type === 'admin' ? 'Admin User' : 'Regular User'}
                </p>
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

        <main className="p-4 md:p-8">
          <div className="flex flex-col lg:flex-row gap-6">
            <div className="flex-1">
              <div className="space-y-6">
                {/* Avatar Section */}
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
                      {avatarUrl ? (
                        <AvatarImage 
                          src={avatarUrl}
                          alt="Profile picture"
                          key={avatarKey}
                        />
                      ) : (
                        <AvatarFallback className="text-xl">
                          {(formData.first_name?.[0] || "U") + (formData.last_name?.[0] || "N")}
                        </AvatarFallback>
                      )}
                      <div className="absolute -bottom-2 -right-2 bg-[#8CC63F] text-white text-xs rounded-full h-6 w-6 flex items-center justify-center">
                        <Camera className="w-4 h-4" />
                      </div>
                    </Avatar>
                  </div>
                </div>

                {/* Form Section */}
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
                    className="w-full bg-teal-600 hover:bg-teal-500 text-white font-medium" 
                    onClick={handleSubmit}
                    disabled={isSaving}
                  >
                    {isSaving ? (
                      <div className="flex items-center justify-center gap-2">
                        <div className="w-5 h-5 border-3 border-white border-t-transparent rounded-full animate-spin" />
                        <span>{p('saving')}</span>
                      </div>
                    ) : (
                      p('saveChanges')
                    )}
                  </Button>
                </div>
              </div>
            </div>

            {/* Right side - User List */}
            <div className="w-full lg:w-[300px] bg-white dark:bg-black rounded-2xl shadow-sm p-4 md:p-6 flex-shrink-0 h-fit order-first lg:order-last">
              {/* Company Header */}
              <div className="flex items-center gap-3 mb-6">
                <Avatar className="h-10 w-10">
                  <AvatarImage src={avatarUrl || "/placeholder.svg"} />
                  <AvatarFallback className="bg-gray-100">
                    {(formData.first_name?.[0] || "U") + (formData.last_name?.[0] || "N")}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h2 className="text-base font-medium">{formData.company_name || "Company Name"}</h2>
                  <p className="text-medium-gray-500">Users User</p>
                </div>
              </div>
              
              <div className="space-y-3 md:space-y-4">
                {usersLoading ? (
                  // Loading skeleton
                  [...Array(3)].map((_, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded-full bg-gray-100 animate-pulse" />
                      <div className="flex-1">
                        <div className="h-4 w-24 bg-gray-100 rounded animate-pulse mb-1" />
                        <div className="h-3 w-16 bg-gray-100 rounded animate-pulse" />
                      </div>
                    </div>
                  ))
                ) : users.map((user) => (
                  <div key={user.id} className="flex items-center gap-3">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={user.profile?.profile_picture || "/placeholder.svg"} />
                      <AvatarFallback className="bg-gray-100">
                        {(user.first_name?.[0] || "U") + (user.last_name?.[0] || "N")}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">
                        {user.first_name} {user.last_name}
                      </p>
                      <p className="text-xs text-gray-500 truncate">
                        {user.job_title || "Position"}
                      </p>
                    </div>
                    {user.id === formData.id && (
                      <span className="text-xs text-teal-500 font-medium flex-shrink-0">
                        You
                      </span>
                    )}
                  </div>
                ))}
              </div>
              
              <Button 
                className="w-full mt-6 bg-teal-600 hover:bg-teal-500 text-white font-medium" 
                onClick={() => console.log('Add new user')}
              >
                + Add New User
              </Button>
            </div>

            {/* Users List */}
        
          </div>
        </main>
      </div>
    </div>
  )
}
