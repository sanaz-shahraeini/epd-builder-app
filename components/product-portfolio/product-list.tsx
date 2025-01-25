"use client"

import { useState, useEffect } from 'react'
import {
  Table,
  Select,
  Button,
  IconButton,
  Box,
} from '@radix-ui/themes'
import * as Form from '@radix-ui/react-form'
import { MagnifyingGlassIcon, DotsVerticalIcon, ReloadIcon } from '@radix-ui/react-icons'
import { API_ROUTES, buildApiUrl } from "@/lib/api/config";

interface GeoData {
  country: string
}

interface Product {
  id: number
  product_name: string
  description: string
  industry_solution: string
  epd_verification_year: number
  geo: GeoData
  category_name: string
}

interface ApiResponse {
  count: number
  next: string | null
  previous: string | null
  results: Product[]
}

export default function ProductList() {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedProducts] = useState('All products')
  const [itemsPerPage] = useState(10)
  const [products, setProducts] = useState<Product[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [totalCount, setTotalCount] = useState(0)
  const [currentPage, setCurrentPage] = useState(1)
  const [nextPage, setNextPage] = useState<string | null>(null)
  const [prevPage, setPrevPage] = useState<string | null>(null)

  const fetchProducts = async (url = buildApiUrl(API_ROUTES.PRODUCTS.LIST)) => {
    try {
      setIsLoading(true)
      setError(null)
      
      console.log('Fetching products from:', url)
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        throw new Error(`Error: ${response.status} ${response.statusText}`)
      }

      const data: ApiResponse = await response.json()
      console.log('API Response:', {
        count: data.count,
        next: data.next,
        previous: data.previous,
        resultsCount: data.results.length,
        firstResult: data.results[0],
      })

      setProducts(data.results)
      setTotalCount(data.count)
      setNextPage(data.next)
      setPrevPage(data.previous)
    } catch (err) {
      console.error('Failed to fetch products:', err)
      setError(err instanceof Error ? err.message : 'Failed to fetch products')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchProducts()
  }, [])

  const filteredProducts = products.filter(product => {
    if (!searchTerm) return true
    
    const productNameStart = product.product_name?.charAt(0)?.toLowerCase() || ''
    const searchStart = searchTerm.charAt(0).toLowerCase()
    
    return productNameStart === searchStart
  })

  const handlePageChange = (url: string | null) => {
    if (url) {
      fetchProducts(url)
    }
  }

  return (
    <div className="p-4 md:p-8 bg-teal-50/30 min-h-screen">
      <div className="space-y-6">
        <div className="flex items-center gap-6">
          <Box className="relative flex-1">
            <input
              type="text"
              className="w-2/3 pl-8 pr-4 py-3 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
              placeholder="Search here"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <MagnifyingGlassIcon
              className="absolute left-2 top-1/2 transform -translate-y-1/2 text-teal-500"
              height="18"
              width="18"
            />
          </Box>
          <Select.Root value="List">
            <Select.Trigger className="bg-white border border-gray-200 rounded-lg px-4 py-3 hover:bg-teal-50 focus:ring-2 focus:ring-teal-500" />
            <Select.Content>
              <Select.Item value="List">List</Select.Item>
              <Select.Item value="Grid">Grid</Select.Item>
            </Select.Content>
          </Select.Root>
        </div>
        
        <div className="flex justify-end items-center gap-4">
          <Select.Root value={selectedProducts}>
            <Select.Trigger className="bg-white border border-gray-200 rounded-lg px-4 py-3 min-w-[180px] hover:bg-teal-50 focus:ring-2 focus:ring-teal-500" />
            <Select.Content>
              <Select.Item value="All products">All products</Select.Item>
              <Select.Item value="My products">My products</Select.Item>
            </Select.Content>
          </Select.Root>
          <Button className="bg-teal-600 text-white px-4 py-3 rounded-lg hover:bg-teal-700 transition-colors">+ New Product</Button>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm mt-6">
        <Table.Root>
          <Table.Header>
            <Table.Row className="bg-teal-50/50">
              <Table.ColumnHeaderCell className="font-semibold text-teal-700 px-6 py-4">Name</Table.ColumnHeaderCell>
              <Table.ColumnHeaderCell className="font-semibold text-teal-700 px-6 py-4">Description</Table.ColumnHeaderCell>
              <Table.ColumnHeaderCell className="font-semibold text-teal-700 px-6 py-4">Industry solution</Table.ColumnHeaderCell>
              <Table.ColumnHeaderCell className="font-semibold text-teal-700 px-6 py-4">Category</Table.ColumnHeaderCell>
              <Table.ColumnHeaderCell className="font-semibold text-teal-700 px-6 py-4">EPD verification year</Table.ColumnHeaderCell>
              <Table.ColumnHeaderCell className="font-semibold text-teal-700 px-6 py-4">Country</Table.ColumnHeaderCell>
              <Table.ColumnHeaderCell className="font-semibold text-teal-700 px-6 py-4"></Table.ColumnHeaderCell>
            </Table.Row>
          </Table.Header>

          <Table.Body>
            {isLoading ? (
              <Table.Row key="loading-row">
                <Table.Cell colSpan={7} className="text-center py-8">
                  <ReloadIcon className="animate-spin inline-block mr-2 text-teal-600" />
                  Loading products...
                </Table.Cell>
              </Table.Row>
            ) : error ? (
              <Table.Row key="error-row">
                <Table.Cell colSpan={7} className="text-center py-8 text-red-500">
                  {error}
                  <Button 
                    variant="soft" 
                    className="ml-4 text-teal-600 hover:bg-teal-50"
                    onClick={() => fetchProducts()}
                  >
                    Retry
                  </Button>
                </Table.Cell>
              </Table.Row>
            ) : filteredProducts.length === 0 ? (
              <Table.Row key="empty-row">
                <Table.Cell colSpan={7} className="text-center py-8 text-gray-500">
                  No products found {searchTerm ? 'matching your search' : ''}
                  {error && (
                    <Button 
                      variant="soft" 
                      className="ml-4 text-teal-600 hover:bg-teal-50"
                      onClick={() => fetchProducts()}
                    >
                      Retry
                    </Button>
                  )}
                </Table.Cell>
              </Table.Row>
            ) : (
              filteredProducts.map((product, index) => (
                <Table.Row 
                  key={`product-${product.id || `${product.product_name}-${index}`}`} 
                  className={index % 2 === 0 ? 'hover:bg-teal-50/30' : 'bg-gray-50/50 hover:bg-teal-50/30'}
                >
                  <Table.Cell className="px-6 py-4">{product.product_name}</Table.Cell>
                  <Table.Cell className="px-6 py-4">{product.description}</Table.Cell>
                  <Table.Cell className="px-6 py-4">{product.industry_solution}</Table.Cell>
                  <Table.Cell className="px-6 py-4">{product.category_name}</Table.Cell>
                  <Table.Cell className="px-6 py-4">{product.epd_verification_year}</Table.Cell>
                  <Table.Cell className="px-6 py-4">{product.geo?.country || '-'}</Table.Cell>
                  <Table.Cell className="px-6 py-4">
                    <IconButton variant="ghost" className="text-teal-600 hover:text-teal-700">
                      <DotsVerticalIcon />
                    </IconButton>
                  </Table.Cell>
                </Table.Row>
              ))
            )}
          </Table.Body>
        </Table.Root>
      </div>

      <div className="flex justify-between items-center mt-6">
        <div className="flex items-center gap-4">
          <span className="text-gray-600">Show</span>
          <Select.Root value={itemsPerPage.toString()}>
            <Select.Trigger className="bg-white border border-gray-200 rounded-lg px-4 py-3 hover:bg-teal-50 focus:ring-2 focus:ring-teal-500" />
            <Select.Content>
              <Select.Item value="10">10</Select.Item>
              <Select.Item value="20">20</Select.Item>
              <Select.Item value="50">50</Select.Item>
            </Select.Content>
          </Select.Root>
          <span className="text-gray-600 ml-4">Total: {totalCount} products</span>
        </div>
        <div className="flex items-center gap-4">
          <Button 
            variant="soft" 
            disabled={!prevPage} 
            className={!prevPage ? "text-gray-400" : "text-teal-600 hover:bg-teal-50 px-4 py-3 rounded-lg"}
            onClick={() => handlePageChange(prevPage)}
          >
            Previous
          </Button>
          <Button variant="soft" className="bg-teal-600 text-white px-4 py-3 rounded-lg hover:bg-teal-700">
            {currentPage}
          </Button>
          <Button 
            variant="soft"
            disabled={!nextPage}
            className={!nextPage ? "text-gray-400" : "text-teal-600 hover:bg-teal-50 px-4 py-3 rounded-lg"}
            onClick={() => handlePageChange(nextPage)}
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  )
}
