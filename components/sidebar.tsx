import Link from "next/link"
import { BarChart2, FileText, Settings, Search, MessageSquare, LogOut, Menu } from 'lucide-react'
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { ModeToggle } from "@/components/mode-toggle"

export function Sidebar() {
  return (
    <>
      {/* Mobile Menu Trigger */}
      <div className="fixed top-4 right-4 flex items-center gap-2 md:hidden">
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon">
              <Menu className="h-6 w-6" />
              <span className="sr-only">Toggle Menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-64 p-0">
            <SidebarContent />
          </SheetContent>
        </Sheet>
        <ModeToggle />
      </div>

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
      <div className="hidden md:block p-6">
        <img src="/assets/images/logo.png" alt="TerraNEXT" className="h-8" />
      </div>
      
      <div className="p-4 flex items-center space-x-3">
        <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
          <span className="text-gray-600">👤</span>
        </div>
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
            className="flex items-center space-x-3 px-3 py-2 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg"
          >
            <FileText className="h-5 w-5" />
            <span>Project Management</span>
          </Link>
          <Link 
            href="#" 
            className="flex items-center space-x-3 px-3 py-2 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg"
          >
            <Settings className="h-5 w-5" />
            <span>Administrative</span>
          </Link>
          <Link 
            href="#" 
            className="flex items-center space-x-3 px-3 py-2 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg"
          >
            <Search className="h-5 w-5" />
            <span>EPD preview</span>
          </Link>
          <Link 
            href="#" 
            className="flex items-center space-x-3 px-3 py-2 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg"
          >
            <MessageSquare className="h-5 w-5" />
            <span>Requests</span>
            <span className="ml-auto bg-teal-100 text-teal-600 text-xs px-2 py-0.5 rounded-full">2</span>
          </Link>
        </div>

        <div className="absolute bottom-4 left-4 right-4">
          <Link 
            href="#" 
            className="flex items-center space-x-3 px-3 py-2 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg"
          >
            <LogOut className="h-5 w-5" />
            <span>Log out</span>
          </Link>
        </div>
      </nav>
    </>
  )
}
