'use client'

import { useState } from 'react'
import { Info, Upload, Download, HelpCircle, ChevronDown, ChevronUp, Plus, Trash2 } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { Sidebar } from "@/components/sidebar"
import { SectionTitle } from '@/components/section-title'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { SubComponentSection } from '@/components/sub-component-section'


interface SubComponent {
  id: string
  name: string
}

interface Component {
  id: string
  name: string
  isOpen: boolean
  subComponents: SubComponent[]
}

export default function FreeUIPage() {
  const [components, setComponents] = useState<Component[]>([])
  const [files, setFiles] = useState<{ excel?: File; image?: File }>({})

  const handleFileUpload = (type: 'excel' | 'image') => (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setFiles(prev => ({ ...prev, [type]: file }))
    }
  }

  const addComponent = () => {
    setComponents([
      ...components, 
      { 
        id: Math.random().toString(), 
        name: '', 
        isOpen: true,
        subComponents: [] 
      }
    ])
  }

  const addSubComponent = (componentId: string) => {
    setComponents(components.map(component => {
      if (component.id === componentId) {
        return {
          ...component,
          subComponents: [
            ...component.subComponents,
            { id: Math.random().toString(), name: '' }
          ]
        }
      }
      return component
    }))
  }

  const updateComponentName = (componentId: string, name: string) => {
    setComponents(components.map(component => 
      component.id === componentId ? { ...component, name } : component
    ))
  }

  const updateSubComponentName = (componentId: string, subComponentId: string, name: string) => {
    setComponents(components.map(component => {
      if (component.id === componentId) {
        return {
          ...component,
          subComponents: component.subComponents.map(subComponent =>
            subComponent.id === subComponentId ? { ...subComponent, name } : subComponent
          )
        }
      }
      return component
    }))
  }

  const toggleComponent = (componentId: string) => {
    setComponents(components.map(component =>
      component.id === componentId ? { ...component, isOpen: !component.isOpen } : component
    ))
  }

  const removeComponent = (componentId: string) => {
    setComponents(components.filter(component => component.id !== componentId))
  }

  const removeSubComponent = (componentId: string, subComponentId: string) => {
    setComponents(components.map(component => {
      if (component.id === componentId) {
        return {
          ...component,
          subComponents: component.subComponents.filter(sub => sub.id !== subComponentId)
        }
      }
      return component
    }))
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <main className="flex-1 md:ml-64">
        <div className="max-w-7xl mx-auto p-4 md:p-8">
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Main Content */}
            <div className="flex-1">
              <h1 className="text-2xl font-bold mb-8">Create New EPD</h1>

              <Card className="p-6 mb-6">
                <div className="flex items-start gap-6">
                  <div className="w-32 h-32 bg-gray-100 border-2 border-dashed rounded-lg flex items-center justify-center flex-shrink-0">
                    <img 
                      src="/assets/images/image-placeholder.png" 
                      alt="Product preview" 
                      className="w-16 h-16 text-gray-400"
                    />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-4">
                      <h2 className="text-lg font-semibold">Product name 01</h2>
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger>
                            <Info className="h-4 w-4 text-gray-400" />
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Product information and details</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                    <p className="text-gray-600 mb-4">
                      Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam.
                    </p>
                    <div className="flex gap-6 text-sm text-gray-600">
                      <div>
                        <span className="font-medium">Industry Solutions: </span>
                        Lorem
                      </div>
                      <div>
                        <span className="font-medium">Country: </span>
                        Spain
                      </div>
                    </div>
                  </div>
                </div>
              </Card>

              {components.map((component) => (
                <Collapsible
                  key={component.id}
                  open={component.isOpen}
                  onOpenChange={() => toggleComponent(component.id)}
                  className="mb-4"
                >
                  <Card className="p-6">
                    <div className="space-y-4">
                      <div className="flex items-center gap-4">
                        <CollapsibleTrigger asChild>
                          <Button variant="ghost" size="sm" className="p-0 hover:bg-transparent">
                            {component.isOpen ? (
                              <ChevronUp className="h-4 w-4 text-gray-500" />
                            ) : (
                              <ChevronDown className="h-4 w-4 text-gray-500" />
                            )}
                          </Button>
                        </CollapsibleTrigger>
                        <div className="flex-1">
                          <label className="block">
                            <span className="text-sm font-medium text-gray-700">Component Name</span>
                            <Input 
                              placeholder="Enter component name"
                              value={component.name}
                              onChange={(e) => updateComponentName(component.id, e.target.value)}
                              className="mt-1"
                            />
                          </label>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeComponent(component.id)}
                          className="text-red-500 hover:text-red-600 hover:bg-red-50"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>

                      <CollapsibleContent className="space-y-4">
                        {component.subComponents.map((subComponent) => (
                          <SubComponentSection
                            key={subComponent.id}
                            componentId={component.id}
                            subComponentId={subComponent.id}
                            name={subComponent.name}
                            onNameChange={(name) => updateSubComponentName(component.id, subComponent.id, name)}
                            onRemove={() => removeSubComponent(component.id, subComponent.id)}
                          />
                        ))}
                        
                        <Button
                          variant="outline"
                          onClick={() => addSubComponent(component.id)}
                          className="ml-6 border-dashed"
                          size="sm"
                        >
                          <Plus className="h-4 w-4 mr-2" />
                          Add Sub-component
                        </Button>
                      </CollapsibleContent>
                    </div>
                  </Card>
                </Collapsible>
              ))}

              <Button
                variant="outline"
                onClick={addComponent}
                className="w-full border-dashed border-2 hover:border-teal-600"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Component
              </Button>
            </div>

            {/* Right Sidebar */}
            <div className="space-y-4">
              <Card className="p-6 w-full lg:w-80">
              <SectionTitle className="mb-4">
                  Upload Files
                </SectionTitle>
                <p className="text-sm text-gray-600 mb-4">
                  Quickly upload your data using our Excel template.
                </p>
                <Button 
                  variant="outline" 
                  className="w-full mb-4"
                  onClick={() => document.getElementById('template-download')?.click()}
                >
                  <Download className="w-4 h-4 mr-2" />
                  Download Template
                </Button>
                <a 
                  id="template-download" 
                  href="/template.xlsx" 
                  download 
                  className="hidden"
                >
                  Download Template
                </a>

                <div
                  className="border-2 border-dashed rounded-lg p-6 text-center hover:border-teal-600 transition-colors cursor-pointer"
                  onClick={() => document.getElementById('excel-upload')?.click()}
                >
                  <Upload className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                  <p className="text-sm text-gray-500">Upload Excel file</p>
                  <input
                    id="excel-upload"
                    type="file"
                    accept=".xlsx,.xls"
                    className="hidden"
                    onChange={handleFileUpload('excel')}
                  />
                </div>
              </Card>

              <Card className="p-6 w-full lg:w-80 ">
                <SectionTitle className="mb-4">
                  Upload Component Image
                </SectionTitle>
                <div
                  className="border-2 border-dashed rounded-lg p-6 text-center hover:border-teal-600 transition-colors cursor-pointer"
                  onClick={() => document.getElementById('image-upload')?.click()}
                >
                  <Upload className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                  <p className="text-sm text-gray-500">Select an image file</p>
                  <input
                    id="image-upload"
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleFileUpload('image')}
                  />
                </div>
              </Card>

              <Card className="p-6 w-full lg:w-80">
                <div className="flex items-start gap-4">
                  <HelpCircle className="w-5 h-5 text-teal-600 flex-shrink-0 mt-1" />
                  <div>
                  <SectionTitle className="mb-4">
                  Ask Questions
                </SectionTitle>
                    <p className="text-sm text-gray-600 mb-4">
                      Need help? Our support team is here to assist you with any questions about the EPD creation process.
                    </p>
                    <Button className="w-full bg-teal-600 hover:bg-teal-700">
                      Ask Questions
                    </Button>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

