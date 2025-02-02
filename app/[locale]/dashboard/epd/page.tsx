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
import { useUsers } from "@/lib/context/UsersContext"
import { type UserProfile } from "@/lib/api/auth"
import { useState, useEffect, useMemo } from "react"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Search, Image, Info } from 'lucide-react'
import { AdminSidebar } from "@/app/components/dashboard/AdminSidebar"
import { useDebounce } from "@/lib/hooks/useDebounce"
import { ProductComparison as ProductComparisonComponent } from "@/app/components/comparison/ProductComparison"
import { API_ROUTES, buildApiUrl } from "@/lib/api/config";

interface Product {
  id: string;
  name: string;
  industry: string;
  country: string;
  description: string;
  verificationYear: string;
}

interface IbuData {
  uuid: string
  name: string
  version: string
  geo: string
  latitude?: number
  longitude?: number
  classific: string
  classific_system: string
  type: string
  pdf_url: string | null
  ref_year: string
  valid_until: number
  owner: string
  sub_type: string
  reg_no: string
  node_id: string
  ds_type: string
  created_at: string
  updated_at: string
  languages: Record<string, any>
  status?: 'verified' | 'pending' | null
  // Core Environmental Impact
  gwp?: string  // Global Warming Potential
  odp?: string  // Ozone Depletion
  ap?: string   // Acidification
  ep?: string   // Eutrophication
  // Resource Use
  renewable_energy?: string
  nonrenewable_energy?: string
  water_usage?: string
  waste?: string
}

interface PaginatedResponse {
  count: number
  next: string | null
  previous: string | null
  results: IbuData[]
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

const PAGE_SIZE = 9;

export default function EPDPage() {
  const t = useTranslations('EPD');
  const { data: session } = useSession()
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedClassification, setSelectedClassification] = useState<string>("all")
  const [selectedUser, setSelectedUser] = useState<string>("all")
  const [selectedYear, setSelectedYear] = useState<string>("all")
  const [selectedStatus, setSelectedStatus] = useState<string>("all")
  const user = useUserStore((state) => state.user)
  const { users } = useUsers()
  const [ibuData, setIbuData] = useState<IbuData[]>([])
  const [loading, setLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalItems, setTotalItems] = useState(0)

  // Debounce search query to avoid too many API calls
  const debouncedSearchQuery = useDebounce(searchQuery, 300);

  const fetchIbuData = async () => {
    try {
      setLoading(true);
      let queryParams = new URLSearchParams();
      
      // Add pagination
      queryParams.append('page', currentPage.toString());
      queryParams.append('page_size', PAGE_SIZE.toString());
      
      // Add filters to query parameters
      if (searchQuery) {
        queryParams.append('search', searchQuery);
      }
      
      if (selectedClassification && selectedClassification !== 'all') {
        queryParams.append('classific', selectedClassification);
      }
      
      if (selectedUser && selectedUser !== 'all') {
        queryParams.append('owner', selectedUser);
      }
      
      if (selectedYear && selectedYear !== 'all') {
        queryParams.append('year', selectedYear);
      }
      
      // Don't add status filter since all are verified in current API
      
      const response = await fetch(
        buildApiUrl(`${API_ROUTES.PRODUCTS.IBU_DATA}/?${queryParams.toString()}`)
      );
      const data = await response.json();
      
      // Handle status filtering only (since API doesn't support it yet)
      let results = data.results;
      let totalCount = data.count;
      
      if (selectedStatus === 'pending') {
        results = [];
        totalCount = 0;
      }
      
      setIbuData(results);
      setTotalItems(totalCount);
      setTotalPages(Math.ceil(totalCount / PAGE_SIZE));
      
      // If current page is beyond total pages, reset to page 1
      if (currentPage > Math.ceil(totalCount / PAGE_SIZE)) {
        setCurrentPage(1);
      }
    } catch (error) {
      console.error('Error fetching IBU data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Get unique values for select boxes from the unfiltered data
  const getUniqueValues = async () => {
    try {
      const response = await fetch(
        buildApiUrl(`${API_ROUTES.PRODUCTS.IBU_DATA}/?page_size=1000`)
      );
      const data = await response.json();
      
      // Fix the classifications array type handling
      const classificationSet = new Set(data.results.map((item: IbuData) => item.classific));
      const classifications = Array.from(classificationSet)
        .filter(Boolean)
        .sort() as string[];
        
      setUniqueClassifications(classifications);

      // Fix the years array type handling
      const yearsSet = new Set(
        data.results.map((item: IbuData) => parseInt(item.ref_year))
      );
      const years = Array.from(yearsSet)
        .filter((year): year is number => typeof year === 'number' && !isNaN(year))
        .sort((a, b) => b - a);
        
      setUniqueYears(years);
    } catch (error) {
      console.error('Error fetching unique values:', error);
    }
  };

  // State for unique values
  const [uniqueClassifications, setUniqueClassifications] = useState<string[]>([]);
  const [uniqueYears, setUniqueYears] = useState<number[]>([]);

  // Fetch unique values on component mount
  useEffect(() => {
    getUniqueValues();
  }, []);

  // Reset to page 1 when filters change
  useEffect(() => {
    if (currentPage !== 1) {
      setCurrentPage(1);
    } else {
      fetchIbuData();
    }
  }, [selectedClassification, selectedUser, selectedYear, selectedStatus, debouncedSearchQuery]);

  // Fetch data when page changes
  useEffect(() => {
    fetchIbuData();
  }, [currentPage]);

  const handleFilterChange = (
    filterType: 'classification' | 'user' | 'year' | 'status',
    value: string
  ) => {
    // Update the corresponding filter
    switch (filterType) {
      case 'classification':
        setSelectedClassification(value);
        break;
      case 'user':
        setSelectedUser(value);
        break;
      case 'year':
        setSelectedYear(value);
        break;
      case 'status':
        setSelectedStatus(value);
        break;
    }
  };

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  const [isComparing, setIsComparing] = useState(false)
  const [selectedForComparison, setSelectedForComparison] = useState<IbuData[]>([])

  const handleCompareClick = () => {
    if (selectedForComparison.length >= 2) {
      setIsComparing(prev => !prev)
    }
  }

  const handleAddToComparison = (product: IbuData) => {
    if (selectedForComparison.length < 3) {
      setSelectedForComparison(prev => {
        if (prev.some(p => p.uuid === product.uuid)) {
          return prev.filter(p => p.uuid !== product.uuid)
        }
        return [...prev, product]
      })
    }
  }

  const handleRemoveFromComparison = (productId: string) => {
    setSelectedForComparison(prev => prev.filter(p => p.uuid !== productId))
    if (selectedForComparison.length <= 2) {
      setIsComparing(false)
    }
  }

  const handleAddProduct = () => {
    setIsComparing(false)
  }

  return (
    <div className="flex flex-col gap-6 mb-4">
      {isComparing ? (
        <div className="bg-white rounded-lg p-6">
          <ProductComparisonComponent
            selectedProducts={selectedForComparison}
            onRemoveProduct={handleRemoveFromComparison}
            onAddProduct={handleAddProduct}
            selectedClassification={selectedClassification}
          />
        </div>
      ) : (
        <>
          {/* Header Section */}
          <div className="flex flex-col gap-4">
            {/* Filters Row - Now scrollable on mobile */}
            <ScrollArea className="w-full pb-4">
              <div className="flex items-center gap-4 min-w-max">
                {/* Projects/Classifications Select */}
                <Select
                  value={selectedClassification}
                  onValueChange={(value) => handleFilterChange('classification', value)}
                >
                  <SelectTrigger className="w-[180px] md:w-[200px] bg-white border border-gray-200">
                    <SelectValue placeholder={t('filters.classification.placeholder')} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">{t('filters.classification.all')}</SelectItem>
                    {uniqueClassifications.map(classific => (
                      <SelectItem key={classific} value={classific}>{classific}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {/* Users Select */}
                <Select
                  value={selectedUser}
                  onValueChange={(value) => handleFilterChange('user', value)}
                >
                  <SelectTrigger className="w-[180px] md:w-[200px] bg-white border">
                    <SelectValue placeholder={t('filters.users.placeholder')} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">{t('filters.users.all')}</SelectItem>
                    {users.map(user => (
                      <SelectItem key={user.id} value={user.id.toString()}>{user.username || user.email}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {/* Dates Select */}
                <Select
                  value={selectedYear}
                  onValueChange={(value) => handleFilterChange('year', value)}
                >
                  <SelectTrigger className="w-[180px] md:w-[200px] bg-white border border-gray-200">
                    <SelectValue placeholder={t('filters.year.placeholder')} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">{t('filters.year.all')}</SelectItem>
                    {uniqueYears.map(year => (
                      <SelectItem key={year} value={year.toString()}>{year}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {/* Status Select */}
                <Select
                  value={selectedStatus}
                  onValueChange={(value) => handleFilterChange('status', value)}
                >
                  <SelectTrigger className="w-[180px] md:w-[200px] bg-white border border-gray-200">
                    <SelectValue placeholder={t('filters.status.placeholder')} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">{t('filters.status.all')}</SelectItem>
                    <SelectItem value="verified">{t('filters.status.verified')}</SelectItem>
                    <SelectItem value="pending">{t('filters.status.pending')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </ScrollArea>

            {/* Search and Compare Row - Stack on mobile */}
            <div className="flex flex-col sm:flex-row gap-4 sm:justify-between sm:items-center">
              <div className="relative w-full sm:w-[300px]">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <Input
                  type="text"
                  placeholder={t('filters.search.placeholder')}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 bg-white border border-gray-200"
                />
              </div>
              <Button 
                className="px-6 w-full sm:w-1/3 bg-teal-600 hover:bg-teal-700 text-white text-sm lg:text-base"
                onClick={handleCompareClick}
                disabled={selectedForComparison.length < 2}
              >
                {t('comparison.button', { count: selectedForComparison.length })}
              </Button>
            </div>
          </div>

          {/* EPD Cards Grid - Adjust columns for mobile */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {loading ? (
              // Loading skeletons
              Array.from({ length: 6 }).map((_, index) => (
                <Card key={index} className="bg-white border border-gray-200">
                  <div className="w-full h-[140px] bg-gray-100 animate-pulse" />
                  <div className="p-4 space-y-4">
                    <div className="h-6 bg-gray-100 animate-pulse rounded" />
                    <div className="space-y-2">
                      <div className="h-4 bg-gray-100 animate-pulse rounded" />
                      <div className="h-4 bg-gray-100 animate-pulse rounded" />
                      <div className="h-4 bg-gray-100 animate-pulse rounded" />
                    </div>
                  </div>
                </Card>
              ))
            ) : ibuData.length === 0 ? (
              <div className="col-span-full text-center py-12">
                <p className="text-gray-500">
                  {selectedStatus === 'pending' 
                    ? t('noResults.pending')
                    : t('noResults.filtered')}
                </p>
              </div>
            ) : (
              ibuData.map((item) => (
                <Card key={item.uuid} className="relative bg-white border border-gray-200 overflow-hidden">
                  {/* Selection Checkbox */}
                  <div className="absolute right-4 top-4 z-10">
                    <input
                      type="checkbox"
                      checked={selectedForComparison.some(p => p.uuid === item.uuid)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          handleAddToComparison(item)
                        } else {
                          handleRemoveFromComparison(item.uuid)
                        }
                      }}
                      disabled={selectedForComparison.length >= 3 && !selectedForComparison.some(p => p.uuid === item.uuid)}
                      className="h-5 w-5 rounded border-gray-300 text-teal-500 focus:ring-teal-500 focus:ring-offset-0 cursor-pointer disabled:cursor-not-allowed disabled:opacity-50 accent-teal-500"
                    />
                  </div>

                  {/* Product Image */}
                  <div className="w-full h-[140px] bg-[#E7F1F1] flex items-center justify-center">
                    <Image className="w-20 h-20 text-teal-500" />
                  </div>

                  {/* Content */}
                  <div className="p-4 space-y-4">
                    {/* Header */}
                    <div className="flex justify-between items-start gap-4">
                      <div className="flex items-center gap-2 min-w-0">
                        <h3 className="text-sm font-medium truncate" title={item.name} style={{ maxWidth: '200px' }}>
                          {item.name}
                        </h3>
                        <button className="text-gray-400 hover:text-gray-600 shrink-0">
                          <Info size={14} />
                        </button>
                      </div>
                      <div className="text-xs whitespace-nowrap">
                        <span className={`font-medium ${item.status === 'pending' ? 'text-amber-600' : 'text-emerald-600'}`}>
                          {item.status === 'pending' ? 'Pending' : 'Verified'}
                        </span>
                        {" "}
                        <span>{item.ref_year}</span>
                      </div>
                    </div>

                    {/* Details List */}
                    <ul className="space-y-2">
                      <li className="flex items-center gap-2 min-w-0">
                        <span className="w-1.5 h-1.5 rounded-full bg-gray-400 shrink-0"></span>
                        <span className="text-xs text-gray-500 shrink-0">{t('card.industry')}</span>
                        <span className="ml-auto truncate text-xs text-gray-900" title={item.classific} style={{ maxWidth: '150px' }}>
                          {item.classific}
                        </span>
                      </li>
                      <li className="flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-gray-400 shrink-0"></span>
                        <span className="text-xs text-gray-500 shrink-0">{t('card.country')}</span>
                        <span className="ml-auto text-xs text-gray-900">{item.geo}</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-gray-400 shrink-0"></span>
                        <span className="text-xs text-gray-500 shrink-0">{t('card.id')}</span>
                        <span className="ml-auto px-2 py-0.5 rounded bg-[#E8F5E9] text-xs text-gray-900 font-mono">
                          {item.uuid.slice(0, 8)}
                        </span>
                      </li>
                    </ul>

                    {item.pdf_url && (
                      <div className="pt-2">
                        <a 
                          href={item.pdf_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center justify-center gap-2 w-full text-xs text-teal-600 hover:text-teal-700 border border-teal-600 hover:border-teal-700 rounded-md py-1.5 transition-colors"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/>
                            <polyline points="14 2 14 8 20 8"/>
                          </svg>
                          View PDF
                        </a>
                      </div>
                    )}
                  </div>
                </Card>
              ))
            )}
          </div>

          {/* Pagination - Adjust for mobile */}
          {totalPages > 0 && (
            <div className="flex justify-center items-center gap-1 mt-8 px-2 max-w-full overflow-x-auto">
              {/* Previous button */}
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="p-2 rounded-lg hover:bg-teal-50 text-teal-500 disabled:opacity-50 disabled:pointer-events-none"
                aria-label="Previous page"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="m15 18-6-6 6-6"/>
                </svg>
              </button>

              {/* Page numbers */}
              <div className="flex items-center gap-1">
                {(() => {
                  let pages = [];
                  const maxVisible = 7;
                  const halfVisible = Math.floor(maxVisible / 2);
                  
                  // Calculate range
                  let startPage = Math.max(1, currentPage - halfVisible);
                  let endPage = Math.min(totalPages, startPage + maxVisible - 1);
                  
                  // Adjust if at the end
                  if (endPage - startPage + 1 < maxVisible) {
                    startPage = Math.max(1, endPage - maxVisible + 1);
                  }
                  
                  // Always show first page
                  if (startPage > 1) {
                    pages.push(
                      <button
                        key={1}
                        onClick={() => handlePageChange(1)}
                        className="w-10 h-10 rounded-lg hover:bg-teal-50 text-teal-500 flex items-center justify-center"
                      >
                        1
                      </button>
                    );
                    if (startPage > 2) {
                      pages.push(
                        <span key="dots1" className="px-2 text-gray-400">...</span>
                      );
                    }
                  }
                  
                  // Add visible pages
                  for (let i = startPage; i <= endPage; i++) {
                    pages.push(
                      <button
                        key={i}
                        onClick={() => handlePageChange(i)}
                        className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                          currentPage === i 
                            ? 'bg-teal-500 text-white' 
                            : 'hover:bg-teal-50 text-teal-500'
                        }`}
                      >
                        {i}
                      </button>
                    );
                  }
                  
                  // Always show last page
                  if (endPage < totalPages) {
                    if (endPage < totalPages - 1) {
                      pages.push(
                        <span key="dots2" className="px-2 text-gray-400">...</span>
                      );
                    }
                    pages.push(
                      <button
                        key={totalPages}
                        onClick={() => handlePageChange(totalPages)}
                        className="w-10 h-10 rounded-lg hover:bg-teal-50 text-teal-500 flex items-center justify-center"
                      >
                        {totalPages}
                      </button>
                    );
                  }
                  
                  return pages;
                })()}
              </div>

              {/* Next button */}
              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="p-2 rounded-lg hover:bg-teal-50 text-teal-500 disabled:opacity-50 disabled:pointer-events-none"
                aria-label="Next page"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="m9 6 6 6-6 6"/>
                </svg>
              </button>
            </div>
          )}

          {/* Total Items Count */}
          {!loading && (
            <div className="text-center text-xs sm:text-sm text-gray-500 mt-2 px-2">
              {t('pagination.showing', {
                start: Math.min(totalItems, ((currentPage - 1) * PAGE_SIZE) + 1),
                end: Math.min(currentPage * PAGE_SIZE, totalItems),
                total: totalItems
              })}
            </div>
          )}
        </>
      )}
    </div>
  );
}

interface ProductComparisonProps {
  selectedProducts: IbuData[];
  onRemoveProduct: (productId: string) => void;
  onAddProduct: () => void;
  selectedClassification: string;
}

function ProductComparison({
  selectedProducts,
  onRemoveProduct,
  onAddProduct,
  selectedClassification,
}: ProductComparisonProps) {
  return (
    <div className="flex flex-col gap-6">
      <h2 className="text-lg font-medium">Product Comparison</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        {selectedProducts.map((product) => (
          <Card key={product.uuid} className="bg-white border border-gray-200 overflow-hidden">
            {/* Product Image */}
            <div className="w-full h-[140px] bg-[#E7F1F1] flex items-center justify-center">
              <Image className="w-20 h-20 text-teal-500" />
            </div>

            {/* Content */}
            <div className="p-4 space-y-4">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-medium line-clamp-2 mb-1" title={product.name}>
                    {product.name}
                  </h3>
                </div>
                <div className="flex flex-col items-end gap-1 ml-4 text-sm shrink-0">
                  <span className="text-emerald-600 font-medium">Verified</span>
                  <span className="text-gray-500">{product.ref_year}</span>
                </div>
              </div>
              
              <div className="flex items-center justify-between gap-4">
                <span className="text-sm text-gray-500 shrink-0">ID</span>
                <p className="text-sm font-mono bg-[#E7F1F1] px-2 py-0.5 rounded shrink-0">
                  {product.uuid.slice(0, 8)}
                </p>
              </div>

              <div className="flex items-center justify-between gap-4">
                <span className="text-sm text-gray-500 shrink-0">Classification</span>
                <p className="text-sm text-gray-700 text-right line-clamp-1" title={product.classific}>
                  {product.classific}
                </p>
              </div>

              {product.pdf_url && (
                <div className="pt-2">
                  <a 
                    href={product.pdf_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2 w-full text-sm text-teal-600 hover:text-teal-700 border border-teal-600 hover:border-teal-700 rounded-md py-1.5 transition-colors"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/>
                      <polyline points="14 2 14 8 20 8"/>
                    </svg>
                    View PDF
                  </a>
                </div>
              )}
            </div>
          </Card>
        ))}
      </div>

      {/* Update buttons layout for mobile */}
      <div className="flex flex-col sm:flex-row gap-4 sm:gap-0 sm:justify-between sm:items-center">
        <Button 
          className="w-full sm:w-auto bg-teal-500 hover:bg-teal-600 text-white px-6"
          onClick={onAddProduct}
        >
          Add more products
        </Button>
        <Button 
          className="w-full sm:w-auto bg-teal-500 hover:bg-teal-600 text-white px-6"
          onClick={() => onRemoveProduct(selectedProducts[0].uuid)}
        >
          Remove product
        </Button>
      </div>
    </div>
  );
}

