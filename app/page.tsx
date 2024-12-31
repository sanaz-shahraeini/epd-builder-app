import { Suspense } from 'react'
import "@radix-ui/themes/styles.css";
import { Sidebar } from "@/components/sidebar"
import { ProductForm } from "@/components/product-form"
import Loading from './loading'

export default function Page() {
  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-black">
      <Sidebar />
      <main className="flex-1 md:ml-64 p-4 md:p-8">
        <Suspense fallback={<Loading />}>
          <ProductForm />
        </Suspense>
      </main>
    </div>
  )
}
