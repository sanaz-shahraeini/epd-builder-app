"use client"

import { Suspense, useState } from 'react'
import "@radix-ui/themes/styles.css";
import ProductForm from "@/components/product-form"
import ProductList from "@/components/product-portfolio/product-list"
import Loading from '@/app/loading'

export default function Page() {
  const [showForm, setShowForm] = useState(false)

  return (
    <div className="flex flex-col h-full">
      <header className="bg-white border-b p-4 md:p-8">
        <h1 className="text-2xl text-gray-800">Product portfolio</h1>
      </header>
      <main className="flex-1 bg-[#f5f5f5]">
        <Suspense fallback={<Loading />}> 
          {showForm ? (
            <ProductForm />
          ) : (
            <ProductList />
          )}
        </Suspense>
      </main>
    </div>
  )
}
