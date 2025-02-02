"use client"

import { useEffect, useState } from "react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Avatar } from "@/components/ui/avatar"
import { Info, ImageIcon, LayoutGrid } from "lucide-react"

interface Request {
  id: string
  name: string
  description: string
  category: string
  industrySolution: string
  user: {
    name: string
    email: string
  }
  country: string
  date: string
}

export default function RequestGrid() {
  const [requests, setRequests] = useState<Request[]>([])
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchRequests = async () => {
      try {
        const response = await fetch("https://epd-fullstack-project.vercel.app/api/products/")
        if (!response.ok) {
          throw new Error("Failed to fetch requests")
        }
        const data = await response.json()
        setRequests(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to fetch requests")
      }
    }

    fetchRequests()
  }, [])

  if (error) {
    return <div className="p-6 text-center text-red-500">Error: {error}</div>
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <h1 className="text-2xl font-semibold mb-6">Requested</h1>

      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
        <Select>
          <SelectTrigger>
            <SelectValue placeholder="Product category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            {Array.from(new Set(requests.map((r) => r.category))).map((category) => (
              <SelectItem key={category} value={category}>
                {category}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select>
          <SelectTrigger>
            <SelectValue placeholder="Industry Solution" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            {Array.from(new Set(requests.map((r) => r.industrySolution))).map((solution) => (
              <SelectItem key={solution} value={solution}>
                {solution}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select>
          <SelectTrigger>
            <SelectValue placeholder="User" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            {Array.from(new Set(requests.map((r) => r.user.name))).map((name) => (
              <SelectItem key={name} value={name}>
                {name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select>
          <SelectTrigger>
            <SelectValue placeholder="Date" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            {Array.from(new Set(requests.map((r) => r.date))).map((date) => (
              <SelectItem key={date} value={date}>
                {new Date(date).toLocaleDateString()}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <div className="flex gap-2">
          <Button className="flex-1 bg-teal-600 hover:bg-teal-700">Apply filters</Button>
          <Button variant="outline" size="icon">
            <LayoutGrid className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Request Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {requests.map((request) => (
          <Card key={request.id} className="overflow-hidden">
            <div className="p-4">
              <div className="flex items-center gap-3 mb-4">
                <Avatar>
                  <div className="w-10 h-10 rounded-full bg-teal-100 flex items-center justify-center">
                    <span className="text-teal-600">{request.user.name.charAt(0)}</span>
                  </div>
                </Avatar>
                <div>
                  <h3 className="font-medium">{request.user.name}</h3>
                  <p className="text-sm text-gray-500">{request.user.email}</p>
                </div>
              </div>

              <div className="bg-[#F8F8F6] aspect-video rounded-lg flex items-center justify-center mb-4">
                <ImageIcon className="h-12 w-12 text-gray-400" />
              </div>

              <div className="flex items-center gap-2 mb-3">
                <h2 className="font-medium">{request.name}</h2>
                <Info className="h-4 w-4 text-gray-400" />
              </div>

              <div className="space-y-1 mb-4">
                <div className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-teal-500" />
                  <span className="text-sm">{request.industrySolution}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-teal-500" />
                  <span className="text-sm">{request.country}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-teal-500" />
                  <span className="text-sm">{new Date(request.date).toLocaleDateString()}</span>
                </div>
              </div>

              <Button className="w-full bg-teal-600 hover:bg-teal-700">Add to my requests</Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  )
}

