"use client";
import React, { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Card } from "@radix-ui/themes";
import { useTranslations } from "next-intl";
import { Skeleton } from "@/components/ui/skeleton";
import Image from "next/image";

interface Product {
  id: number;
  product_name: string;
  description: string;
  industry_solution: string;
  epd_verification_year: number;
  geo: string;
  category_name: string;
  image_url: string;
}

const ProductCard = ({ product }: { product: Product }) => {
  const t = useTranslations("productList");
  const [imageError, setImageError] = useState(false);
  

  return (
    <Card className="p-4 hover:shadow-lg transition-shadow duration-200 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
      <div className="space-y-4">
        <div className="aspect-video relative rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-700">
          <Image
            src={!imageError ? (product.image_url || "/placeholder.jpg") : "/placeholder.jpg"}
            alt={product.product_name}
            fill
            className="object-cover"
            onError={() => setImageError(true)}
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        </div>
        <div className="space-y-3">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white truncate">
            {product.product_name}
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-2">
            {product.description}
          </p>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div>
              <span className="text-gray-500 dark:text-gray-400">{t("columns.industrySolution")}:</span>
              <p className="text-gray-900 dark:text-white">{product.industry_solution}</p>
            </div>
            <div>
              <span className="text-gray-500 dark:text-gray-400">{t("columns.category")}:</span>
              <p className="text-gray-900 dark:text-white">{product.category_name}</p>
            </div>
            <div>
              <span className="text-gray-500 dark:text-gray-400">{t("columns.verificationYear")}:</span>
              <p className="text-gray-900 dark:text-white">{product.epd_verification_year || "N/A"}</p>
            </div>
            <div>
              <span className="text-gray-500 dark:text-gray-400">{t("columns.country")}:</span>
              <p className="text-gray-900 dark:text-white">{product.geo || "-"}</p>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
};

const SkeletonCard = () => (
  <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
    <div className="space-y-4">
      <Skeleton className="aspect-video w-full rounded-lg" />
      <div className="space-y-3">
        <Skeleton className="h-6 w-3/4" />
        <Skeleton className="h-12 w-full" />
        <div className="grid grid-cols-2 gap-2">
          <Skeleton className="h-8 w-full" />
          <Skeleton className="h-8 w-full" />
          <Skeleton className="h-8 w-full" />
          <Skeleton className="h-8 w-full" />
        </div>
      </div>
    </div>
  </div>
);

export default function ProductPortfolio() {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const session = useSession()?.data as { accessToken: string } | null;
  const router = useRouter();

  useEffect(() => {
    const fetchProducts = async () => {
      if (!session?.accessToken) return;

      try {
        setIsLoading(true);
        setError(null);

        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || ''}/api/products`, {
          headers: {
            Authorization: `Bearer ${session.accessToken}`,
            "Content-Type": "application/json",
            Accept: "application/json",
          },
        });

        if (!response.ok) {
          if (response.status === 401) {
            router.push("/signin");
            return;
          }
          
          // Try to get error message from response
          let errorMessage;
          const contentType = response.headers.get("content-type");
          if (contentType && contentType.includes("application/json")) {
            const errorData = await response.json();
            errorMessage = errorData.message || `API Error (${response.status})`;
          } else {
            const text = await response.text();
            console.error("Non-JSON response:", text);
            errorMessage = `API Error (${response.status})`;
          }
          throw new Error(errorMessage);
        }

        // Verify we have JSON response
        const contentType = response.headers.get("content-type");
        if (!contentType || !contentType.includes("application/json")) {
          throw new Error("API did not return JSON");
        }

        const data = await response.json();
        if (!data || !Array.isArray(data.results)) {
          throw new Error("Invalid data format received from API");
        }

        setProducts(data.results);
      } catch (error) {
        console.error("Error fetching products:", error);
        setError(
          error instanceof Error 
            ? error.message 
            : "Failed to fetch products"
        );
      } finally {
        setIsLoading(false);
      }
    };

    fetchProducts();
  }, [session?.accessToken, router]);

  if (error) {
    return (
      <div className="text-center py-8 text-red-500 dark:text-red-400">
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
      {isLoading
        ? Array.from({ length: 6 }, (_, index) => (
            <SkeletonCard key={`skeleton-${index}`} />
          ))
        : products.map((product) => (
            <ProductCard 
              key={`product-${product.id || product.product_name}`} 
              product={product} 
            />
          ))}
      {!isLoading && products.length === 0 && (
        <div className="col-span-full text-center py-8 text-gray-500 dark:text-gray-400">
          No products found
        </div>
      )}
    </div>
  );
}
