"use client"

import { Suspense } from 'react'
import "@radix-ui/themes/styles.css";
import ProductList from "@/components/product-portfolio/product-list"
import Loading from '@/app/loading'

export default function Page() {
  return (
    <div className="flex flex-col h-full bg-white">
      <main className="flex-1">
        <Suspense fallback={<Loading />}> 
          <ProductList />
        </Suspense>
      </main>
    </div>
  )
}
