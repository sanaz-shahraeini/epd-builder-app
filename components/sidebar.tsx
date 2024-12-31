import Link from "next/link"
import { BarChart2, FileText, Settings, Search, MessageSquare, LogOut, Menu } from 'lucide-react'
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"

export function Sidebar() {
  return (
    <>
      {/* Mobile Menu Trigger */}
      <Sheet>
        <SheetTrigger asChild className="fixed top-4 right-4 md:hidden">
          <Button variant="ghost" size="icon">
            <Menu className="h-6 w-6" />
            <span className="sr-only">Toggle Menu</span>
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-64 p-0">
          <SidebarContent />
        </SheetContent>
      </Sheet>

      {/* Desktop Sidebar */}
      <div className="hidden md:block w-64 h-screen bg-white dark:bg-black border-r dark:border-gray-800 flex-col fixed">
        <SidebarContent />
      </div>
    </>
  )
}

// Extract sidebar content to a separate component for reuse
function SidebarContent() {
  return (
    <>
      <div className="p-6 flex justify-between items-center">
        <img src="/assets/images/logo.png" alt="TerraNEXT" className="h-8" />
      </div>
      
      <div className="p-4 flex items-center space-x-3">
        <img src="/assets/images/user.png" alt="TerraNEXT" className="h-8" />
        <div>
          <div className="font-medium dark:text-gray-100">User name</div>
          <div className="text-sm text-gray-500 dark:text-gray-400">Company name</div>
        </div>
      </div>

      <nav className="flex-1 p-4">
        <div className="space-y-2">
          <Link 
            href="#" 
            className="flex items-center space-x-3 px-3 py-2 text-teal-600 dark:text-teal-400 bg-teal-50 dark:bg-teal-950 rounded-lg"
          >
            <BarChart2 className="h-5 w-5" />
            <span>Product Portfolio</span>
          </Link>
          <Link 
            href="#" 
            className="flex items-center space-x-3 px-3 py-2 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg"
          >
            <FileText className="h-5 w-5" />
            <span>Project Management</span>
          </Link>
          <Link 
            href="#" 
            className="flex items-center space-x-3 px-3 py-2 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg"
          >
            <Settings className="h-5 w-5" />
            <span>Administrative</span>
          </Link>
          <Link 
            href="#" 
            className="flex items-center space-x-3 px-3 py-2 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg"
          >
            <Search className="h-5 w-5" />
            <span>EPD preview</span>
          </Link>
          <Link 
            href="#" 
            className="flex items-center space-x-3 px-3 py-2 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg"
          >
            <MessageSquare className="h-5 w-5" />
            <span>Requests</span>
            <span className="ml-auto bg-teal-100 dark:bg-teal-900 text-teal-600 dark:text-teal-300 px-2 py-0.5 rounded-full text-xs">2</span>
          </Link>
        </div>
      </nav>

      <div className="p-4 border-t dark:border-gray-800">
        <button className="flex items-center space-x-3 px-3 py-2 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg w-full">
          <LogOut className="h-5 w-5" />
          <span>Log out</span>
        </button>
      </div>
    </>
  )
}
