import RequestGrid from "@/components/dashboard/RequestGrid"
import { Suspense } from "react"
import RequestGridSkeleton from "@/components/dashboard/RequestGridSkeleton"

export default function RequestPage() {
  return (
    <Suspense fallback={<RequestGridSkeleton />}>
      <RequestGrid />
    </Suspense>
  )
}

