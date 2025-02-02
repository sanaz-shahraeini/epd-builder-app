"use client"

import { useState, useEffect } from "react"
import { Search, Info, Plus, ChevronDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { useRouter } from 'next/navigation';

interface Product {
  category_name: string
  industry_solution: string
  product_name: string
  description: string
  image_url: string
  pdf_url: string
  geo: string
  company_name: string
  item_no: string
  created_at: string
}

interface ApiResponse {
  count: number
  next: string | null
  previous: string | null
  results: Product[]
}

export default function ProductPortfolio() {
  const [view, setView] = useState<"grid" | "list">("grid")
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter();

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await fetch("https://epd-fullstack-project.vercel.app/api/products/", {
          method: "GET",
          headers: {
            Accept: "application/json",
          },
        })

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }

        const data: ApiResponse = await response.json()
        setProducts(data.results)
        setLoading(false)
      } catch (err) {
        console.error("Fetch error:", err)
        setError(`Error fetching products: ${err instanceof Error ? err.message : String(err)}`)
        setLoading(false)
      }
    }

    fetchProducts()
  }, [])

  const handleViewChange = (view: string) => {
    if (view === 'Grid') {
      router.push('/product-portfolio/product-grid');
    } else if (view === 'List') {
      router.push('/product-portfolio/product-list');
    }
  };

  if (loading) return <div className="text-center p-8">Loading...</div>
  if (error) return <div className="text-center p-8 text-red-500">{error}</div>

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* <div className="mb-8"> */}
        {/* <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-semibold">Product portfolio</h1>

          <div className="flex items-center gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input placeholder="Search here" className="pl-10 w-[300px]" />
            </div>

            {/* <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="gap-2">
                  Grid <ChevronDown className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={() => handleViewChange("grid")}>Grid</DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleViewChange("list")}>List</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu> */}
          {/* </div>
        </div> */}

        {/* <div className="flex justify-between items-center">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="gap-2">
                All products <ChevronDown className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem>All products</DropdownMenuItem>
              <DropdownMenuItem>My products</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu> */}
{/* 
          <Button className="gap-2 bg-green-600 hover:bg-green-700">
            <Plus className="h-4 w-4" /> New Product
          </Button>
        </div>
      </div>  */}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {products.map((product) => (
          <div key={product.item_no} className="border rounded-lg p-4 space-y-4">
            <div className="aspect-video bg-gray-100 rounded-md overflow-hidden">
              <img
                src={product.image_url || "/placeholder.svg"}
                alt={product.product_name}
                className="w-full h-full object-cover"
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <h3 className="font-medium">{product.product_name}</h3>
                  <Info className="h-4 w-4 text-gray-400" />
                </div>
                <span className="text-sm text-gray-500">{new Date(product.created_at).getFullYear()}</span>
              </div>

              <div className="space-y-1 text-sm">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-gray-200" />
                  <span className="text-gray-600">Industry Solutions</span>
                  <span>{product.industry_solution}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-gray-200" />
                  <span className="text-gray-600">Country</span>
                  <span>{product.geo}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-gray-200" />
                  <span className="text-gray-600">ID</span>
                  <span className="bg-yellow-100 px-2 py-0.5 rounded">{product.item_no}</span>
                </div>
              </div>

              <p className="text-sm text-gray-500 line-clamp-2">{product.description}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

