import { useSession } from "next-auth/react";
import ProductList from "@/components/product-portfolio/product-list";
import { Skeleton } from "@/components/ui/skeleton";

export default function ProductListPage() {
  const { data: session, status } = useSession();

  if (status === "loading") {
    return (
      <div className="p-4 md:p-8 space-y-6">
        {/* Header skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-10 w-full max-w-[600px]" />
          <Skeleton className="h-10 w-24 ml-auto" />
        </div>

        {/* Table skeleton */}
        <div className="mt-6 space-y-2">
          <Skeleton className="h-12 w-full" /> {/* Header */}
          {[...Array(5)].map((_, i) => (
            <Skeleton key={i} className="h-16 w-full" />
          ))}
        </div>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-2">
            Authentication Required
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            You need to be authenticated to view this page.
          </p>
        </div>
      </div>
    );
  }

  return <ProductList />;
}
