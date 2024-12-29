'use client'

import { Trash2 } from 'lucide-react'
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { ComponentTabs } from './component-tabs'

interface SubComponentSectionProps {
  componentId: string
  subComponentId: string
  name: string
  onNameChange: (name: string) => void
  onRemove: () => void
}

export function SubComponentSection({
  componentId,
  subComponentId,
  name,
  onNameChange,
  onRemove
}: SubComponentSectionProps) {
  return (
    <div className="space-y-6 p-4 border rounded-lg bg-gray-50">
      <div className="flex items-center gap-4">
        <div className="flex-1">
          <label className="block">
            <span className="text-sm font-medium text-gray-700">Sub-component Name</span>
            <Input 
              placeholder="Enter sub-component name"
              value={name}
              onChange={(e) => onNameChange(e.target.value)}
              className="mt-1"
            />
          </label>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={onRemove}
          className="text-red-500 hover:text-red-600 hover:bg-red-50"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>

      <ComponentTabs 
        componentId={componentId}
        subComponentId={subComponentId}
      />
    </div>
  )
}

