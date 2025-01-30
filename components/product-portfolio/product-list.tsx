"use client"
import React from 'react'
import { useState, useEffect } from 'react'
import { useTranslations } from 'next-intl'
import {
  Table,
  Select,
  Button,
  IconButton,
  Box,
} from '@radix-ui/themes'

import { MagnifyingGlassIcon, DotsVerticalIcon, ReloadIcon } from '@radix-ui/react-icons'
import { API_ROUTES, buildApiUrl } from "@/lib/api/config"
import ProductForm from "@/components/product-form"
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { LanguageSwitcher } from "../language-switcher"
import { ModeToggle } from '../mode-toggle';

interface GeoData {
  geo: string
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

const TruncatedText = ({ text, maxLength = 100 }: { text: string; maxLength?: number }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const shouldTruncate = text.length > maxLength;
  
  if (!shouldTruncate) {
    return <span>{text}</span>;
  }

  return (
    <div className="relative">
      <span>
        {isExpanded ? text : `${text.slice(0, maxLength)}...`}
      </span>
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="ml-2 text-sm text-[#42B7B0] hover:text-[#3AA19B] dark:text-[#3AA19B] dark:hover:text-[#42B7B0] focus:outline-none"
      >
        {isExpanded ? 'Show less' : 'Show more'}
      </button>
    </div>
  );
};

export default function ProductList() {
  const { data: session } = useSession();
  const router = useRouter();
  const t = useTranslations('productList')
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedProducts] = useState('All products')
  const itemsPerPage = 10; // Fixed items per page
  const [products, setProducts] = useState<Product[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [totalCount, setTotalCount] = useState(0)
  const [currentPage, setCurrentPage] = useState(1)
  const totalPages = Math.ceil(totalCount / itemsPerPage);
  const [showForm, setShowForm] = useState(false)

  const fetchProducts = async (pageUrl?: string) => {
    try {
      setIsLoading(true);
      setError(null);

      // When changing items per page, always start from page 1
      const effectivePage = pageUrl ? currentPage : 1;
      
      let url = pageUrl || `${buildApiUrl(API_ROUTES.PRODUCTS.LIST)}?page_size=${itemsPerPage}&page=${effectivePage}`;
      
      // Ensure the URL ends with a trailing slash before query params
      if (!url.includes('?') && !url.endsWith('/')) {
        url = `${url}/`;
      }

      console.log('Request details:', {
        url,
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${session?.accessToken ? 'present' : 'missing'}`,
          'Content-Type': 'application/json',
        }
      });
      
      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${session?.accessToken}`,
          'Content-Type': 'application/json',
        },
        redirect: 'follow',
      });

      console.log('Response details:', {
        status: response.status,
        statusText: response.statusText,
        headers: Object.fromEntries(response.headers.entries()),
        url: response.url
      });

      if (!response.ok) {
        if (response.status === 401) {
          console.log('Session expired or unauthorized, redirecting to signin...');
          router.push('/signin');
          return;
        }
        
        // Handle 404 specifically for invalid page
        if (response.status === 404) {
          const errorData = await response.json();
          if (errorData.detail === 'Invalid page.') {
            // Reset to page 1 if current page is invalid
            setCurrentPage(1);
            fetchProducts();
            return;
          }
        }
        
        let errorMessage = `Failed to fetch products (Status: ${response.status} ${response.statusText})`;
        try {
          const errorData = await response.json();
          console.error('API Error Response:', errorData);
          errorMessage += `: ${JSON.stringify(errorData)}`;
        } catch (e) {
          console.error('Could not parse error response:', e);
          try {
            const textError = await response.text();
            console.error('Raw error response:', textError);
            errorMessage += ` - ${textError}`;
          } catch (textError) {
            console.error('Could not get error text:', textError);
          }
        }
        
        throw new Error(errorMessage);
      }

      const data: ApiResponse = await response.json();
      console.log('Received data:', {
        count: data.count,
        results: data.results.length,
        next: data.next,
        previous: data.previous
      });
      
      setProducts(data.results);
      setTotalCount(data.count);
      
      // Update current page based on the response data
      if (data.results.length === 0 && currentPage > 1) {
        // If no results and not on first page, go back to page 1
        setCurrentPage(1);
        fetchProducts();
        return;
      }
      
      // Ensure next/prev URLs have the correct page_size
      const updateUrlWithPageSize = (url: string | null) => {
        if (!url) return null;
        const urlObj = new URL(url);
        urlObj.searchParams.set('page_size', itemsPerPage.toString());
        return urlObj.toString();
      };
      
      // setNextPage(updateUrlWithPageSize(data.next));
      // setPrevPage(updateUrlWithPageSize(data.previous));

    } catch (error) {
      console.error('Error fetching products:', error);
      setError(error instanceof Error ? error.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  // Effect to handle session check
  useEffect(() => {
    if (!session?.user) {
      console.log('No active session, redirecting to signin...');
      router.push('/signin');
      return;
    }
  }, [session]);

  // Effect to handle data fetching
  useEffect(() => {
    if (session?.user) {
      // Reset to page 1 when changing items per page
      setCurrentPage(1);
      fetchProducts();
    }
  }, [session?.user]);

  const getVisiblePages = () => {
    const delta = 2;
    const range = [];
    const rangeWithDots = [];
    let l;

    for (let i = 1; i <= Math.min(totalPages, 1 + 2 * delta); i++) {
      range.push(i);
    }
    if (currentPage > delta + 1) {
      range.unshift(1);
    }
    if (currentPage < totalPages - delta) {
      range.push(totalPages);
    }

    range.forEach((i) => {
      if (l) {
        if (i - l === 2) {
          rangeWithDots.push(l + 1);
        } else if (i - l !== 1) {
          rangeWithDots.push('...');
        }
      }
      rangeWithDots.push(i);
      l = i;
    });

    return rangeWithDots;
  };

  const handlePageClick = (page: number) => {
    if (page === currentPage) return;
    setCurrentPage(page);
    const url = `${buildApiUrl(API_ROUTES.PRODUCTS.LIST)}?page_size=${itemsPerPage}&page=${page}`;
    fetchProducts(url);
  };

  const handlePageChange = (url: string | null) => {
    if (url) {
      fetchProducts(url);
    }
  };

  const filteredProducts = products.filter(product => {
    if (!searchTerm) return true
    
    const productNameStart = product.product_name?.charAt(0)?.toLowerCase() || ''
    const searchStart = searchTerm.charAt(0).toLowerCase()
    
    return productNameStart === searchStart
  })

  return (
    <>
      <div className="fixed top-4 right-4 flex items-center gap-2 z-50">
        <LanguageSwitcher />
        <ModeToggle />
      </div>
      {showForm ? (
        <ProductForm onClose={() => setShowForm(false)} />
      ) : (
        <div className="p-8 m-8 md:p-8 bg-white dark:bg-gray-800 min-h-screen">
          <div className="space-y-6">
            <div className="flex items-center justify-between gap-6">
              <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">
                {t('productPortfolio')}
              </h1>
              <Box className="relative w-1/2">
                <input
                  type="text"
                  className="w-full pl-8 pr-4 py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#42B7B0] focus:border-[#42B7B0] dark:text-white"
                  placeholder={t('searchPlaceholder')}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                <MagnifyingGlassIcon
                  className="absolute left-2 top-1/2 transform -translate-y-1/2 text-[#42B7B0]"
                  height="18"
                  width="18"
                />
              </Box>
              <Select.Root value="List">
                <Select.Trigger className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg px-4 py-3 hover:bg-[#A5D3D1]/20 dark:hover:bg-[#1B4242]/20 focus:ring-2 focus:ring-[#42B7B0] dark:text-white" />
                <Select.Content>
                  <Select.Item value="List">{t('viewMode.list')}</Select.Item>
                  <Select.Item value="Grid">{t('viewMode.grid')}</Select.Item>
                </Select.Content>
              </Select.Root>
            </div>
            
            <div className="flex justify-end items-center gap-4">
              <Select.Root value={selectedProducts}>
                <Select.Trigger className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg px-4 py-3 min-w-[180px] hover:bg-[#A5D3D1]/20 dark:hover:bg-[#1B4242]/20 focus:ring-2 focus:ring-[#42B7B0] dark:text-white" />
                <Select.Content>
                  <Select.Item value="All products">{t('filter.allProducts')}</Select.Item>
                  <Select.Item value="My products">{t('filter.myProducts')}</Select.Item>
                </Select.Content>
              </Select.Root>
              <Button 
                onClick={() => setShowForm(true)} 
                className="bg-[#42B7B0] text-white px-4 py-3 rounded-lg hover:bg-[#42B7B0] transition-colors dark:bg-[#1B4242] dark:hover:bg-[#2C5C5C]"
              >
                {t('actions.newProduct')}
              </Button>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm mt-6">
            <Table.Root>
              <Table.Header>
                <Table.Row className="bg-[#A5D3D1]/20 dark:bg-[#1B4242]/20">
                  <Table.ColumnHeaderCell className="font-semibold text-[#1B4242] dark:text-[#42B7B0] px-6 py-4">{t('columns.name')}</Table.ColumnHeaderCell>
                  <Table.ColumnHeaderCell className="font-semibold text-[#1B4242] dark:text-[#42B7B0] px-6 py-4">{t('columns.description')}</Table.ColumnHeaderCell>
                  <Table.ColumnHeaderCell className="font-semibold text-[#1B4242] dark:text-[#42B7B0] px-6 py-4">{t('columns.industrySolution')}</Table.ColumnHeaderCell>
                  <Table.ColumnHeaderCell className="font-semibold text-[#1B4242] dark:text-[#42B7B0] px-6 py-4">{t('columns.category')}</Table.ColumnHeaderCell>
                  <Table.ColumnHeaderCell className="font-semibold text-[#1B4242] dark:text-[#42B7B0] px-6 py-4">{t('columns.verificationYear')}</Table.ColumnHeaderCell>
                  <Table.ColumnHeaderCell className="font-semibold text-[#1B4242] dark:text-[#42B7B0] px-6 py-4">{t('columns.country')}</Table.ColumnHeaderCell>
                  <Table.ColumnHeaderCell className="font-semibold text-[#1B4242] dark:text-[#42B7B0] px-6 py-4"></Table.ColumnHeaderCell>
                </Table.Row>
              </Table.Header>

              <Table.Body>
                {isLoading ? (
                  <Table.Row key="loading-row">
                    <Table.Cell colSpan={7} className="text-center py-8 dark:text-gray-300">
                      <ReloadIcon className="animate-spin inline-block mr-2 text-[#42B7B0] dark:text-[#3AA19B]" />
                      {t('status.loading')}
                    </Table.Cell>
                  </Table.Row>
                ) : error ? (
                  <Table.Row key="error-row">
                    <Table.Cell colSpan={7} className="text-center py-8 text-red-500 dark:text-red-400">
                      {error}
                      <Button 
                        variant="soft" 
                        className="ml-4 text-[#42B7B0] dark:text-[#3AA19B] hover:bg-[#A5D3D1]/20 dark:hover:bg-[#1B4242]/20"
                        onClick={() => fetchProducts()}
                      >
                        {t('actions.retry')}
                      </Button>
                    </Table.Cell>
                  </Table.Row>
                ) : filteredProducts.length === 0 ? (
                  <Table.Row key="empty-row">
                    <Table.Cell colSpan={7} className="text-center py-8 text-[#5C8374] dark:text-[#A5D3D1]">
                      {searchTerm ? t('status.noSearchResults') : t('status.noProducts')}
                      {error && (
                        <Button 
                          variant="soft" 
                          className="ml-4 text-[#42B7B0] dark:text-[#3AA19B] hover:bg-[#A5D3D1]/20 dark:hover:bg-[#1B4242]/20"
                          onClick={() => fetchProducts()}
                        >
                          {t('actions.retry')}
                        </Button>
                      )}
                    </Table.Cell>
                  </Table.Row>
                ) : (
                  filteredProducts.map((product, index) => (
                    <Table.Row 
                      key={`product-${product.id || `${product.product_name}-${index}`}`} 
                      className={`${
                        index % 2 === 0 
                          ? 'hover:bg-[#A5D3D1]/20 dark:hover:bg-[#1B4242]/20' 
                          : 'bg-[#A5D3D1]/10 dark:bg-[#1B4242]/10 hover:bg-[#A5D3D1]/20 dark:hover:bg-[#1B4242]/20'
                      }`}
                    >
                      <Table.Cell className="px-4 py-4 text-[#1B4242] dark:text-[#A5D3D1] max-w-md">
                        <TruncatedText text={product.product_name} maxLength={25} />
                      </Table.Cell>
                      <Table.Cell className="px-6 py-4 text-[#1B4242] dark:text-[#A5D3D1] max-w-md">
                        <TruncatedText text={product.description} maxLength={140} />
                      </Table.Cell>
                      <Table.Cell className="px-6 py-4 text-[#1B4242] dark:text-[#A5D3D1]">{product.industry_solution}</Table.Cell>
                      <Table.Cell className="px-6 py-4 text-[#1B4242] dark:text-[#A5D3D1]">{product.category_name}</Table.Cell>
                      <Table.Cell className="px-2 py-4 text-[#1B4242] dark:text-[#A5D3D1]">{product.epd_verification_year}</Table.Cell>
                      <Table.Cell className="px-6 py-4 text-[#1B4242] dark:text-[#A5D3D1]">
                      {product.geo?.geo || '-'}
                      </Table.Cell>
                      <Table.Cell className="px-6 py-4">
                        <IconButton variant="ghost" className="text-[#42B7B0] dark:text-[#3AA19B] hover:text-[#1B4242] dark:hover:text-[#A5D3D1]">
                          <DotsVerticalIcon />
                        </IconButton>
                      </Table.Cell>
                    </Table.Row>
                  ))
                )}
              </Table.Body>
            </Table.Root>
          </div>

          {totalPages > 1 && (
            <div className="mt-6 flex items-center justify-center gap-2">
              <button
                onClick={() => handlePageClick(currentPage - 1)}
                disabled={currentPage === 1}
                className="flex items-center justify-center w-10 h-10 rounded-lg border border-gray-300 dark:border-gray-600 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                aria-label="Previous page"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>

              <div className="flex items-center gap-2">
                {getVisiblePages().map((page, index) => (
                  <React.Fragment key={index}>
                    {page === '...' ? (
                      <span className="w-10 h-10 flex items-center justify-center text-gray-500">
                        {page}
                      </span>
                    ) : (
                      <button
                        onClick={() => handlePageClick(page as number)}
                        className={`w-10 h-10 rounded-lg border ${
                          currentPage === page
                            ? 'bg-[#3AA19B] text-white border-[#3AA19B]'
                            : 'border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700'
                        } transition-colors`}
                      >
                        {page}
                      </button>
                    )}
                  </React.Fragment>
                ))}
              </div>

              <button
                onClick={() => handlePageClick(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="flex items-center justify-center w-10 h-10 rounded-lg border border-gray-300 dark:border-gray-600 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                aria-label="Next page"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          )}
        </div>
      )}
    </>
  )
}
