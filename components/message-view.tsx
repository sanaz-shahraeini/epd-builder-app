import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { MoreVertical, Reply, Forward, Paperclip, Image, Send } from 'lucide-react'

export function MessageView() {
  return (
    <div className="flex-1 p-6">
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-3">
          <Avatar>
            <AvatarImage src="/placeholder.svg" />
            <AvatarFallback>UN</AvatarFallback>
          </Avatar>
          <div>
            <h3 className="font-semibold">User name 05</h3>
            <p className="text-sm text-muted-foreground">Today, 12:05</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="ghost" size="icon">
            <Reply className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon">
            <MoreVertical className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="mt-6 text-muted-foreground">
        <p>
          Lorem ipsum dolor sit amet, consectetur adipiscing elit sed do eiu smodte
          mpor incididunt ut labore et dolore magna aliqua. Ut eniad minim veniam
          quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodomi
          consequat.
        </p>
      </div>

      <div className="mt-6 p-4 bg-muted rounded-lg">
        <div className="flex items-center gap-2">
          <Image className="h-5 w-5" />
          <div>
            <h4 className="font-medium">Product Name 01</h4>
            <p className="text-sm text-green-600">Fast LCA</p>
          </div>
        </div>
      </div>

      <div className="mt-6 flex gap-4">
        <Button variant="outline" className="gap-2">
          <Reply className="h-4 w-4" />
          Reply
        </Button>
        <Button variant="outline" className="gap-2">
          <Forward className="h-4 w-4" />
          Forward
        </Button>
      </div>

      <div className="mt-6">
        <div className="relative flex flex-col gap-2">
          <Input
            className="pr-24 min-h-[100px] align-top"
            placeholder="Type here"
            type="textarea"
            style={{ resize: 'vertical' }}
          />
          <div className="absolute right-2 top-2 flex gap-2">
            <Button variant="ghost" size="icon" className="h-6 w-6 hover:bg-gray-100 dark:hover:bg-gray-800">
              <Paperclip className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" className="h-6 w-6 hover:bg-gray-100 dark:hover:bg-gray-800">
              <Send className="h-4 w-4" />
            </Button>
          </div>
          <div className="flex justify-end gap-2 mt-2">
            <Button variant="outline" size="sm" className="gap-1">
              <Paperclip className="h-4 w-4" />
              Attach
            </Button>
            <Button variant="default" size="sm" className="gap-1 bg-teal-600 hover:bg-teal-500">
              <Send className="h-4 w-4" />
              Send
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

