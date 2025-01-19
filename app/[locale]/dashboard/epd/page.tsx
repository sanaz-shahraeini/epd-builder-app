"use client"

import { useTranslations } from "next-intl"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Sidebar } from "@/components/sidebar"
import { ModeToggle } from "@/components/mode-toggle"
import { LanguageSwitcher } from '@/components/language-switcher'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useSession } from "next-auth/react"
import { useUserStore } from "@/lib/store/user"
import { type UserProfile } from "@/lib/api/auth"
import { useState } from "react"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Search, Image, Info } from 'lucide-react'
import { AdminSidebar } from "@/app/components/dashboard/AdminSidebar"
import { useUsers } from "@/lib/context/UsersContext"

interface Product {
  id: string;
  name: string;
  industry: string;
  country: string;
  description: string;
  verificationYear: string;
}

const mockProducts: Product[] = [
  {
    id: "123456789",
    name: "Product name 01",
    industry: "Industry Solutions",
    country: "Spain",
    description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam.",
    verificationYear: "2024"
  },
  {
    id: "123456789",
    name: "Product name 02",
    industry: "Industry Solutions",
    country: "Spain",
    description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam.",
    verificationYear: "2024"
  },
  // Add more mock products as needed
];

export default function EPDPage() {
  const t = useTranslations()
  const { data: session } = useSession()
  const [searchQuery, setSearchQuery] = useState("")
  const user = useUserStore((state) => state.user)
  const { users, isLoading: isLoadingUsers } = useUsers()

  const filteredUsers = users.filter(user =>
    user.first_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.last_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.job_title?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="flex flex-col gap-6">
      {/* Filters Section */}
      <div className="flex flex-col gap-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 w-full">
          <Select>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Projects" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Projects</SelectItem>
              {/* Add more project options */}
            </SelectContent>
          </Select>

          <Select>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="User name" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Users</SelectItem>
              {/* Add more user options */}
            </SelectContent>
          </Select>

          <Select>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Date" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="newest">Newest First</SelectItem>
              <SelectItem value="oldest">Oldest First</SelectItem>
            </SelectContent>
          </Select>

          <Select>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="verified">Verified</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex flex-col md:flex-row items-center gap-4">
          <div className="relative w-full">
            <Search className="absolute left-2 top-3 h-4 w-4 text-gray-500" />
            <Input
              placeholder="Search for EPDs"
              className="pl-8 w-full"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <Button className="w-full md:w-auto bg-teal-600 hover:bg-teal-700 whitespace-nowrap">
            Product comparison
          </Button>
        </div>
      </div>

      {/* Products Grid */}
      <div className="flex flex-wrap gap-8">
        {mockProducts.map((product, index) => (
          <Card key={index} className="overflow-hidden w-full md:w-[calc(50%-2rem)] lg:w-[calc(45%-2rem)] xl:w-[calc(33.333%-2rem)] aspect-square flex flex-col">
            <div className="bg-teal-50 h-1/2 flex items-center justify-center">
              <Image className="h-20 w-24 text-teal-600" />
            </div>
            <CardContent className="p-6 h-1/2 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3 flex-grow overflow-hidden">
                    <span className="text-sm whitespace-nowrap overflow-ellipsis">{product.name}</span>
                    <Info className="flex-shrink-0 h-5 w-5 text-gray-500" />
                  </div>
                  <span className="text-xs text-gray-600 ml-2 whitespace-nowrap">Verified {product.verificationYear}</span>
                </div>
                <div className="space-y-3 text-base text-gray-600">
                  <div className="flex items-center gap-3">
                    <span>•</span>
                    <span>{product.industry}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span>•</span>
                    <span>{product.country}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span>•</span>
                    <span>ID: {product.id}</span>
                  </div>
                </div>
              </div>
              <p className="mt-3 text-base text-gray-600">
                {product.description}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
