import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { useState, useMemo } from "react"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useUsers } from "@/lib/context/UsersContext"
import { Input } from "@/components/ui/input"
import { Search, Loader2, User as UserIcon } from "lucide-react"
import { UserProfile } from "@/lib/api/auth"

interface User extends UserProfile {}

interface AdminSidebarProps {
  currentUser?: User
  onAddUser: () => void
}

export function AdminSidebar({ currentUser, onAddUser }: AdminSidebarProps) {
  const { users, isLoading } = useUsers()
  const [searchQuery, setSearchQuery] = useState("")

  const filteredUsers = users.filter(user =>
    user.username?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.email?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  // Sort users by creation date and get the two newest users
  const sortedUsers = useMemo(() => {
    return [...filteredUsers].sort((a, b) => {
      const dateA = a.profile?.created_at ? new Date(a.profile.created_at) : new Date(0)
      const dateB = b.profile?.created_at ? new Date(b.profile.created_at) : new Date(0)
      return dateB.getTime() - dateA.getTime()
    })
  }, [filteredUsers])

  const isNewUser = (user: User) => {
    const userIndex = sortedUsers.findIndex(u => u.id === user.id)
    return userIndex === 0 || userIndex === 1 // First two users are new
  }

  const getInitials = (user: User) => {
    return user.username?.[0]?.toUpperCase() || 'U'
  }

  return (
    <div className="w-full lg:w-[300px] border-l">
      <div className="p-4 lg:p-6 space-y-4 lg:space-y-6">
        <div className="flex flex-col items-center text-center space-y-3 lg:flex-row lg:text-left lg:space-y-0 lg:space-x-3">
          <Avatar className="h-10 w-10 lg:h-8 lg:w-8">
            {currentUser?.profile?.profile_picture_url ? (
              <AvatarImage 
                src={currentUser.profile.profile_picture_url} 
                alt={currentUser.username}
              />
            ) : (
              <AvatarFallback className="bg-gray-100 dark:bg-gray-800">
                <UserIcon className="h-4 w-4 text-gray-500" />
              </AvatarFallback>
            )}
          </Avatar>
          <div>
            <h2 className="text-base font-medium">{currentUser?.company_name || 'Company Name'}</h2>
            <div className="flex items-center justify-center lg:justify-start gap-1.5">
              <p className="text-sm text-muted-foreground">Users</p>
              <span className="text-xs bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 px-1.5 py-0.5 rounded">
                {users.length}
              </span>
            </div>
          </div>
        </div>

        <div className="relative">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
          <Input
            placeholder="Search users..."
            className="pl-9"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <ScrollArea className="h-[calc(100vh-280px)] lg:h-[calc(100vh-280px)]">
          <div className="space-y-2 lg:space-y-4">
            {isLoading ? (
              <div className="flex items-center justify-center py-4 lg:py-8">
                <Loader2 className="h-6 w-6 animate-spin text-gray-500" />
              </div>
            ) : filteredUsers.length === 0 ? (
              <div className="flex items-center justify-center py-4 lg:py-8">
                <p className="text-sm text-muted-foreground">No users found</p>
              </div>
            ) : (
              sortedUsers.map((user) => (
                <div key={user.id} className="flex items-center gap-2 lg:gap-3 p-1.5 lg:p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors">
                  <Avatar className="h-7 w-7 lg:h-8 lg:w-8">
                    {user.profile?.profile_picture_url ? (
                      <AvatarImage 
                        src={user.profile.profile_picture_url} 
                        alt={user.username}
                      />
                    ) : (
                      <AvatarFallback className="bg-gray-100 dark:bg-gray-800 uppercase">
                        {getInitials(user)}
                      </AvatarFallback>
                    )}
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs lg:text-sm font-medium leading-none">
                      {user.username}
                    </p>
                    <p className="text-xs lg:text-sm text-muted-foreground truncate">
                      {user.email}
                    </p>
                  </div>
                  <div className="flex gap-1.5">
                    {isNewUser(user) && (
                      <span className="text-[10px] lg:text-xs text-teal-500 font-medium px-1.5 py-0.5 lg:px-2 lg:py-1 bg-teal-50 dark:bg-teal-950 rounded-full">
                        New
                      </span>
                    )}
                    {user.user_type === 'admin' && (
                      <span className="text-[10px] lg:text-xs text-blue-500 font-medium px-1.5 py-0.5 lg:px-2 lg:py-1 bg-blue-50 dark:bg-blue-950 rounded-full">
                        Admin
                      </span>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </ScrollArea>

        <Button 
          onClick={onAddUser}
          className="w-full bg-teal-600 hover:bg-teal-700 text-white text-sm lg:text-base"
        >
          + Add New User
        </Button>
      </div>
    </div>
  )
}
