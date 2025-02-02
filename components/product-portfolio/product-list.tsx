"use client"
import React, { useState, useEffect, Suspense } from 'react'
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

import "@radix-ui/themes/styles.css";
import ProductPortfolio from "@/components/product-portfolio/product-grid"
import Loading from '@/app/loading'

interface GeoData {
  geo: string;
  name: string;  // Adding name property to GeoData interface
}

interface Product {
  id: number
  product_name: string
  description: string
  industry_solution: string
  epd_verification_year: number
  geo: string
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

const safeParseResponse = async (response: Response) => {
  const contentType = response.headers.get('content-type');
  if (contentType?.includes('application/json')) {
    try {
      return await response.json();
    } catch (e) {
      console.error('Failed to parse JSON response:', e);
      throw new Error('Invalid JSON response from server');
    }
  } else {
    const text = await response.text();
    console.error('Received non-JSON response:', text);
    throw new Error('Server returned non-JSON response');
  }
};

export default function ProductListComponent() {
  const session = useSession();
  const router = useRouter();
  const t = useTranslations('productList');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedProducts] = useState('All products');
  const itemsPerPage = 10; // Fixed items per page
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [totalCount, setTotalCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const totalPages = Math.ceil(totalCount / itemsPerPage);
  const [showForm, setShowForm] = useState(false);
  const [view, setView] = useState<"grid" | "list">("list");

  const handleViewChange = (view: string) => {
    setView(view === "Grid" ? "grid" : "list");
  };

  const fetchProducts = async (pageUrl?: string) => {
    try {
      setIsLoading(true);
      setError(null);

      const effectivePage = pageUrl ? currentPage : 1;
      let url = pageUrl || `${buildApiUrl(API_ROUTES.PRODUCTS.LIST)}?page_size=${itemsPerPage}&page=${effectivePage}`;
      
      if (!url.includes('?') && !url.endsWith('/')) {
        url = `${url}/`;
      }

      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${session?.data?.accessToken}`,
          'Content-Type': 'application/json',
        },
        redirect: 'follow',
      });

      if (!response.ok) {
        if (response.status === 401) {
          router.push('/signin');
          return;
        }

        if (response.status === 404) {
          setCurrentPage(1);
          fetchProducts();
          return;
        }

        const errorData = await safeParseResponse(response);
        throw new Error(
          `API Error (${response.status}): ${
            typeof errorData === 'object' ? JSON.stringify(errorData) : 'Unknown error'
          }`
        );
      }

      const data = await safeParseResponse(response);
      setProducts(data.results);
      setTotalCount(data.count);

      if (data.results.length === 0 && currentPage > 1) {
        setCurrentPage(1);
        fetchProducts();
      }

    } catch (error) {
      console.error('Error fetching products:', error);
      setError(error instanceof Error ? error.message : 'Failed to fetch products');
    } finally {
      setIsLoading(false);
    }
  };

  // Effect to handle session check
  useEffect(() => {
    if (!session?.data?.user) {
      console.log('No active session, redirecting to signin...');
      router.push('/signin');
      return;
    }
  }, [session]);

  // Effect to handle data fetching
  useEffect(() => {
    if (session?.data?.user) {
      // Reset to page 1 when changing items per page
      setCurrentPage(1);
      fetchProducts();
    }
  }, [session?.data?.user]);

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
      {!showForm && (
        <div className="fixed top-8 right-6 flex items-center gap-2 z-50">
          <LanguageSwitcher />
          <ModeToggle />
        </div>
      )}
      {showForm ? (
        <ProductForm onClose={() => setShowForm(false)} />
      ) : (
        <div className="p-8 m-8 md:p-8 bg-white dark:bg-black min-h-screen">
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
              <Select.Root onValueChange={handleViewChange} value={view === "grid" ? "Grid" : "List"}>
                <Select.Trigger className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg px-4 py-3 hover:bg-[#A5D3D1]/20 dark:hover:bg-[#1B4242]/20 focus:ring-2 focus:ring-[#42B7B0] dark:text-white" />
                <Select.Content>
                  <Select.Item value="List">List</Select.Item>
                  <Select.Item value="Grid">Grid</Select.Item>
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
                className="bg-[#3AA19B] text-white px-0 py-3 rounded-lg hover:bg-[#2C5C5C] transition-colors dark:bg-[#1B4242] dark:hover:bg-[#2C5C5C]"
              >
                {t('actions.newProduct')}
              </Button>
            </div>
          </div>

          <Suspense fallback={<Loading />}>
            {view === "grid" ? <ProductPortfolio /> : (
              <div className="bg-white dark:bg-black rounded-lg shadow-sm mt-6">
                <Table.Root>
                  <Table.Header>
                    <Table.Row className="bg-[#A5D3D1]/20 dark:bg-[#1B4242]/20">
                      <Table.ColumnHeaderCell className="font-semibold text-[#1B4242] dark:text-[#42B7B0] px-6 py-4">{t('columns.name')}</Table.ColumnHeaderCell>
                      <Table.ColumnHeaderCell className="font-semibold text-[#1B4242] dark:text-[#42B7B0] px-6 py-4">{t('columns.description')}</Table.ColumnHeaderCell>
                      <Table.ColumnHeaderCell className="font-semibold text-[#1B4242] dark:text-[#42B7B0] px-6 py-4">{t('columns.industrySolution')}</Table.ColumnHeaderCell>
                      <Table.ColumnHeaderCell className="font-semibold text-[#1B4242] dark:text-[#42B7B0] px-6 py-4 max-w-[150px]">{t('columns.category')}</Table.ColumnHeaderCell>
                      <Table.ColumnHeaderCell className="font-semibold text-[#1B4242] dark:text-[#42B7B0] px-3 py-4">{t('columns.verificationYear')}</Table.ColumnHeaderCell>
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
                            <TruncatedText text={product.product_name} maxLength={15} />
                          </Table.Cell>
                          <Table.Cell className="px-6 py-4 text-[#1B4242] dark:text-[#A5D3D1] max-w-md">
                            <TruncatedText text={product.description} maxLength={120} />
                          </Table.Cell>
                          <Table.Cell className="px-6 py-4 text-[#1B4242] dark:text-[#A5D3D1]">{product.industry_solution}</Table.Cell>
                          <Table.Cell className="px-6 py-4 text-[#1B4242] dark:text-[#A5D3D1] max-w-[150px]">
                            <TruncatedText text={product.category_name} maxLength={15} />
                          </Table.Cell>
                          <Table.Cell className="px-2 py-4 text-[#1B4242] dark:text-[#A5D3D1] w-24">{product.epd_verification_year || 'N/A'}</Table.Cell>
                          <Table.Cell className="px-6 py-4 text-[#1B4242] dark:text-[#A5D3D1]">
                            {product.geo || '-'}
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
            )}
          </Suspense>

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
