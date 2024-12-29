'use client'

import { useState } from 'react'
import { FileSpreadsheet, PenLine, ArrowLeft } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Sidebar } from "@/components/sidebar"
import { UIModeDialog } from "@/components/ui-mode-dialog"
import { RightSidebar } from "@/components/right-sidebar"
import { useRouter } from 'next/navigation'
import { FunFeedbackDialog } from '@/components/fun-feedback-dialog'


export default function InputDataPage() {
  const router = useRouter()
  const [isUIModeDialogOpen, setIsUIModeDialogOpen] = useState(false)
  const [isFeedbackDialogOpen, setIsFeedbackDialogOpen] = useState(false)

  const handleExcelUpload = () => {
    setIsFeedbackDialogOpen(true)
  }

  const handleFeedbackAction = (action: 'later' | 'share') => {
    setIsFeedbackDialogOpen(false)
    router.push('/excel-upload')
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <main className="flex-1 md:ml-64">
        <div className="max-w-7xl mx-auto p-2 md:p-6">
          <h1 className="text-2xl font-semibold text-gray-900 mb-8">Input Your Data</h1>
          <div className="flex flex-col lg:flex-row gap-6">
            {/* Main Content */}
            <div className="flex-1">
              <p className="text-gray-600 mb-4">
                Choose your preferred method to input data and upload Excel files if needed.
              </p>

              <div className="grid md:grid-cols-2 gap-6 mb-8">
                {/* Upload Excel Card */}
                <Card className="p-4 hover:shadow-lg transition-shadow">
                  <div className="h-10 w-10 bg-teal-50 rounded-lg flex items-center justify-center mb-3">
                    <FileSpreadsheet className="h-5 w-5 text-teal-600" />
                  </div>
                  <h2 className="text-lg font-bold text-teal-600 mb-2">Upload Excel File</h2>
                  <p className="text-gray-600 mb-4 text-sm">
                    Quick and efficient way to upload large amounts of data using our Excel templates.
                  </p>
                  <ul className="space-y-2 mb-4">
                    <li className="flex items-center text-sm text-gray-600">
                      <svg className="h-4 w-4 text-teal-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      Best for existing data
                    </li>
                    <li className="flex items-center text-sm text-gray-600">
                      <svg className="h-4 w-4 text-teal-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      Bulk upload capability
                    </li>
                    <li className="flex items-center text-sm text-gray-600">
                      <svg className="h-4 w-4 text-teal-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      Templates provided
                    </li>
                  </ul>
                  <Button 
                    className="w-full bg-teal-600 hover:bg-teal-700 text-white" 
                    onClick={handleExcelUpload}
                  >
                    Choose Excel Upload
                  </Button>
                </Card>

                {/* Manual Entry Card */}
                <Card className="p-4 hover:shadow-lg transition-shadow">
                  <div className="h-10 w-10 bg-teal-50 rounded-lg flex items-center justify-center mb-3">
                    <PenLine className="h-5 w-5 text-teal-600" />
                  </div>
                  <h2 className="text-lg font-bold text-teal-600 mb-2">Manual Entry</h2>
                  <p className="text-gray-600 mb-4 text-sm">
                    Enter data step by step through our guided forms with real-time validation.
                  </p>
                  <ul className="space-y-2 mb-4">
                    <li className="flex items-center text-sm text-gray-600">
                      <svg className="h-4 w-4 text-teal-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      Guided process
                    </li>
                    <li className="flex items-center text-sm text-gray-600">
                      <svg className="h-4 w-4 text-teal-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      Real-time validation
                    </li>
                    <li className="flex items-center text-sm text-gray-600">
                      <svg className="h-4 w-4 text-teal-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      Flexible data entry
                    </li>
                  </ul>
                  <Button 
                    className="w-full bg-teal-600 hover:bg-teal-700 text-white" 
                    onClick={() => setIsUIModeDialogOpen(true)}
                  >
                    Choose Manual Entry
                  </Button>
                </Card>
              </div>

              <div className="flex justify-center">
                <Button
                  variant="outline"
                  onClick={() => router.back()}
                  className="flex items-center gap-2 text-gray-600 hover:text-teal-600 hover:border-teal-600 transition-colors px-8 py-2.5"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span className="font-medium">Back</span>
                </Button>
              </div>
            </div>

            {/* Right Sidebar */}
            <RightSidebar />
          </div>
        </div>
      </main>

      <UIModeDialog 
        open={isUIModeDialogOpen} 
        onOpenChange={setIsUIModeDialogOpen}
      />
      
      <FunFeedbackDialog
        open={isFeedbackDialogOpen}
        onOpenChange={setIsFeedbackDialogOpen}
        onAction={handleFeedbackAction}
      />
    </div>
  )
}
