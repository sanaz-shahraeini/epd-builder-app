'use client'

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Card } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Upload, Package2, Info, ChevronDown, ChevronUp, Plus, HelpCircle, MapPin, Factory, Trash2 } from 'lucide-react'
import dynamic from "next/dynamic"
import { useRouter } from 'next/navigation'
import { SectionHeader } from './section-header'
import { SectionTitle } from './section-title'

const Map = dynamic(() => import('./map'), { ssr: false })

interface Material {
  id: string
  name: string
  weight: number
  unit: 'g' | 'kg'
}

export function ProductForm() {
  const router = useRouter()
  const [files, setFiles] = useState<{ image?: File; document?: File }>({})
  const [isWeightSummaryOpen, setIsWeightSummaryOpen] = useState(false)
  const [materials, setMaterials] = useState<Material[]>([])

  const handleFileUpload = (type: 'image' | 'document') => (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setFiles(prev => ({ ...prev, [type]: file }))
    }
  }

  const handleCreateProduct = () => {
    router.push('/input-data')
  }

  const handleBrowseClick = (inputId: string) => {
    document.getElementById(inputId)?.click()
  }

  const addMaterial = () => {
    setMaterials([
      ...materials,
      { id: Math.random().toString(), name: '', weight: 0, unit: 'kg' }
    ])
  }

  const removeMaterial = (id: string) => {
    setMaterials(materials.filter(m => m.id !== id))
  }

  const updateMaterial = (id: string, updates: Partial<Material>) => {
    setMaterials(materials.map(m => 
      m.id === id ? { ...m, ...updates } : m
    ))
  }

  const calculateTotalWeight = () => {
    return materials.reduce((total, material) => {
      const weight = material.unit === 'kg' ? material.weight * 1000 : material.weight
      return total + weight
    }, 0)
  }

  return (
    <div className="flex flex-col lg:flex-row gap-6">
      <div className="flex-1">
        <h1 className="text-2xl font-semibold mb-8">Create New Product</h1>

        <div className="space-y-8">
          <section>
            <SectionHeader 
              icon={Info} 
              title="Basic Information" 
              className="mb-6 text-teal-600"
            />
            <div className="grid sm:grid-cols-2 gap-6">
              <div className="space-y-1.5">
                <label className="text-sm text-gray-600 font-semibold">Product Name*</label>
                <Input placeholder="Enter product name" />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm text-gray-600 font-semibold">Project Name*</label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select project" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="project1">Project 1</SelectItem>
                    <SelectItem value="project2">Project 2</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <label className="text-sm text-gray-600 font-semibold">Weight*</label>
                <div className="flex gap-2">
                  <Input placeholder="Enter weight" />
                  <Select defaultValue="kg">
                    <SelectTrigger className="w-24">
                      <SelectValue placeholder="Unit" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="kg">kg</SelectItem>
                      <SelectItem value="g">g</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-sm text-gray-600 font-semibold">Dimension (optional)</label>
                <Input placeholder="1x1x1 cm" />
              </div>
            </div>
          </section>

          <Separator />

          <section>
            <SectionHeader 
              icon={Package2} 
              title="Product Packaging" 
              className="mb-6 font-bold"
            />
            <Button 
              variant="outline" 
              size="sm"
              onClick={addMaterial}
              className="text-teal-600 border-teal-600 hover:bg-teal-50 bg-teal-50"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Material
            </Button>

            <div className="mt-4 space-y-4">
              {materials.map((material) => (
                <div key={material.id} className="grid sm:grid-cols-[1fr_auto_auto_auto] gap-4 items-end">
                  <div>
                    <label className="text-sm text-gray-600 mb-1 block font-semibold">Material Name*</label>
                    <Input
                      placeholder="Enter material name"
                      value={material.name}
                      onChange={(e) => updateMaterial(material.id, { name: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="text-sm text-gray-600 mb-1 block font-semibold">Quantity*</label>
                    <div className="flex gap-2">
                      <Input
                        type="number"
                        value={material.weight}
                        onChange={(e) => updateMaterial(material.id, { weight: parseFloat(e.target.value) || 0 })}
                        className="w-24"
                      />
                      <Select
                        value={material.unit}
                        onValueChange={(value: 'g' | 'kg') => updateMaterial(material.id, { unit: value })}
                      >
                        <SelectTrigger className="w-20">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="g">g</SelectItem>
                          <SelectItem value="kg">kg</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => removeMaterial(material.id)}
                    className="text-red-500 hover:text-red-600 hover:bg-red-50"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>

            <div className="mt-8">
              <button
                onClick={() => setIsWeightSummaryOpen(!isWeightSummaryOpen)}
                className="flex items-center gap-2 text-teal-600 hover:text-teal-700"
              >
                {isWeightSummaryOpen ? (
                  <ChevronUp className="w-4 h-4" />
                ) : (
                  <ChevronDown className="w-4 h-4" />
                )}
                {isWeightSummaryOpen ? 'Hide' : 'Show'} Weight Summary
              </button>

              {isWeightSummaryOpen && (
                <div className="mt-4 space-y-4 bg-gray-50 rounded-lg p-6">
                  <h3 className="text-base font-medium text-teal-600">Weight Calculations</h3>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Packaging Weight:</span>
                      <span>{calculateTotalWeight().toFixed(2)} g</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Product Weight:</span>
                      <span>0.00 g</span>
                    </div>
                  </div>

                  <div className="flex justify-between bg-teal-500 text-white p-4 rounded-lg">
                    <span className="font-medium">Total Weight:</span>
                    <span>{calculateTotalWeight().toFixed(2)} g</span>
                  </div>
                </div>
              )}
            </div>
          </section>

          <Separator />

          <section>
            <SectionHeader 
              icon={MapPin} 
              title="Production Plant" 
              className="mb-6"
            />
            <div className="grid sm:grid-cols-2 gap-6">
              <div className="space-y-1.5">
                <label className="text-sm text-gray-600 font-semibold">Supplier Country*</label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select country" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="spain">Spain</SelectItem>
                    <SelectItem value="france">France</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <label className="text-sm text-gray-600 font-semibold">Product Lifetime*</label>
                <div className="flex gap-2">
                  <Input placeholder="Enter lifetime" />
                  <Select defaultValue="year">
                    <SelectTrigger className="w-24">
                      <SelectValue placeholder="Unit" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="year">Year</SelectItem>
                      <SelectItem value="month">Month</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          </section>

          <Separator />

          <section>
            <SectionHeader 
              icon={Factory} 
              title="Technical Information & Description" 
              className="mb-6"
            />
            <Textarea 
              placeholder="Enter product description"
              className="min-h-[200px]"
            />
          </section>

          <div className="h-[400px] rounded-lg overflow-hidden">
            <Map />
          </div>

          <div className="flex justify-center">
            <Button 
              size="lg" 
              className="px-8 bg-teal-600 hover:bg-teal-700 text-white" 
              onClick={handleCreateProduct}
            >
              Create Product
            </Button>
          </div>
        </div>
      </div>

      <div className="w-full lg:w-80 space-y-6">
        <Card className="p-6">
        <SectionTitle className="mb-4">
        Product Image
        </SectionTitle>
          <div
            className="border-2 border-dashed rounded-lg p-6 text-center"
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
              e.preventDefault()
              const file = e.dataTransfer.files[0]
              if (file) setFiles(prev => ({ ...prev, image: file }))
            }}
          >
            <Upload className="w-8 h-8 mx-auto mb-2 text-gray-400" />
            <p className="text-sm text-gray-500 mb-2">
              Drag and drop your product image here
            </p>
            <button
              onClick={() => handleBrowseClick('image-upload')}
              className="text-sm text-teal-600 hover:text-teal-700"
            >
              or browse to choose a file
            </button>
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
        <SectionTitle className="mb-4">
        Product Document
        </SectionTitle>
         
          <div
            className="border-2 border-dashed rounded-lg p-6 text-center"
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
              e.preventDefault()
              const file = e.dataTransfer.files[0]
              if (file) setFiles(prev => ({ ...prev, document: file }))
            }}
          >
            <Upload className="w-8 h-8 mx-auto mb-2 text-gray-400" />
            <p className="text-sm text-gray-500 mb-2">
              Drag and drop your document here
            </p>
            <button
              onClick={() => handleBrowseClick('document-upload')}
              className="text-sm text-teal-600 hover:text-teal-700"
            >
              or browse to choose a file
            </button>
            <input
              id="document-upload"
              type="file"
              accept=".pdf,.doc,.docx"
              className="hidden"
              onChange={handleFileUpload('document')}
            />
          </div>
        </Card>

        <Card className="p-6 w-full lg:w-80">
          <div className="flex items-start gap-4">
          <HelpCircle className="w-5 h-5 text-teal-600 flex-shrink-0 mt-1" />
            <div>
            <SectionTitle className="mb-4">
        Need Help?
        </SectionTitle>
              <p className="text-sm text-gray-500 mb-4">
                Our support team is here to assist you with any questions about the EPD creation process.
              </p>
              <Button 
                variant="outline" 
                className="w-full bg-teal-600 hover:bg-teal-700 text-white"
              >
                Ask Questions
              </Button>
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
}

