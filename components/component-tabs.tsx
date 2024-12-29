'use client'

import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { Truck, PenToolIcon as Tool, Info, Plus, Trash2, Factory, Zap, Lightbulb } from 'lucide-react'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

interface MaintenanceMaterial {
  id: string
  name: string
  quantity: number
  unit: string
}

interface Material {
  id: string
  name: string
  quantity: number
  unit: 'kg' | 'g'
  recycled: number
}

interface ComponentTabsProps {
  componentId: string
  subComponentId: string
}

export function ComponentTabs({ componentId, subComponentId }: ComponentTabsProps) {
  const [materials, setMaterials] = useState<Material[]>([])
  const [maintenanceMaterials, setMaintenanceMaterials] = useState<MaintenanceMaterial[]>([])
  const [activeTab, setActiveTab] = useState("materials")
  const [maintenanceType, setMaintenanceType] = useState("")
  const [maintenanceFrequency, setMaintenanceFrequency] = useState("")
  const [equalToFunctionalUnit, setEqualToFunctionalUnit] = useState(false)
  const [requiresEnergy, setRequiresEnergy] = useState(false)

  const addMaterial = () => {
    setMaterials([
      ...materials,
      {
        id: Math.random().toString(),
        name: '',
        quantity: 0,
        unit: 'kg',
        recycled: 0
      }
    ])
  }

  const addMaintenanceMaterial = () => {
    setMaintenanceMaterials([
      ...maintenanceMaterials,
      {
        id: Math.random().toString(),
        name: '',
        quantity: 0,
        unit: 'kg'
      }
    ])
  }

  const removeMaterial = (materialId: string) => {
    setMaterials(materials.filter(m => m.id !== materialId))
  }

  const removeMaintenanceMaterial = (materialId: string) => {
    setMaintenanceMaterials(maintenanceMaterials.filter(m => m.id !== materialId))
  }

  const updateMaterial = (materialId: string, updates: Partial<Material>) => {
    setMaterials(materials.map(material =>
      material.id === materialId ? { ...material, ...updates } : material
    ))
  }

  const updateMaintenanceMaterial = (materialId: string, updates: Partial<MaintenanceMaterial>) => {
    setMaintenanceMaterials(maintenanceMaterials.map(material =>
      material.id === materialId ? { ...material, ...updates } : material
    ))
  }

  return (
    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
      <TabsList className="grid w-full grid-cols-3">
        <TabsTrigger value="materials" className="data-[state=active]:bg-teal-50 data-[state=active]:text-teal-600">
          Materials
        </TabsTrigger>
        <TabsTrigger value="details" className="data-[state=active]:bg-teal-50 data-[state=active]:text-teal-600">
          Component Details
        </TabsTrigger>
        <TabsTrigger value="manufacturing" className="data-[state=active]:bg-teal-50 data-[state=active]:text-teal-600">
          Manufacturing
        </TabsTrigger>
      </TabsList>

      <TabsContent value="materials" className="mt-6">
        <div className="space-y-6">
          {materials.map((material) => (
            <div key={material.id} className="grid grid-cols-[1fr_auto_auto_auto] gap-4 items-end">
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">
                  Material Name*
                </label>
                <Input
                  placeholder="Enter material name"
                  value={material.name}
                  onChange={(e) => updateMaterial(material.id, { name: e.target.value })}
                />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">
                  Quantity*
                </label>
                <div className="flex gap-2">
                  <Input
                    type="number"
                    value={material.quantity}
                    onChange={(e) => updateMaterial(material.id, { quantity: parseFloat(e.target.value) || 0 })}
                    className="w-24"
                  />
                  <Select
                    value={material.unit}
                    onValueChange={(value: 'kg' | 'g') => updateMaterial(material.id, { unit: value })}
                  >
                    <SelectTrigger className="w-20">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="kg">Kg</SelectItem>
                      <SelectItem value="g">g</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">
                  % Recycled*
                </label>
                <Input
                  type="number"
                  min="0"
                  max="100"
                  value={material.recycled}
                  onChange={(e) => updateMaterial(material.id, { recycled: parseFloat(e.target.value) || 0 })}
                  className="w-24"
                />
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

          <Button
            variant="outline"
            onClick={addMaterial}
            className="border-dashed"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Material
          </Button>
        </div>
      </TabsContent>

      <TabsContent value="details" className="mt-6 space-y-8">
        <div>
          <div className="flex items-center gap-2 mb-4">
            <Truck className="h-5 w-5 text-teal-600" />
            <h3 className="text-lg font-semibold">Transport Information</h3>
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">
                Transport
              </label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Select transport type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="road">Road</SelectItem>
                  <SelectItem value="rail">Rail</SelectItem>
                  <SelectItem value="sea">Sea</SelectItem>
                  <SelectItem value="air">Air</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">
                Origin
              </label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Select origin" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="factory">Factory</SelectItem>
                  <SelectItem value="warehouse">Warehouse</SelectItem>
                  <SelectItem value="port">Port</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">
                Destination
              </label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Select destination" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="factory">Factory</SelectItem>
                  <SelectItem value="warehouse">Warehouse</SelectItem>
                  <SelectItem value="port">Port</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">
                Distance (km)
              </label>
              <Input type="number" placeholder="Enter distance" />
            </div>
          </div>
        </div>

        <div>
          <div className="flex items-center gap-2 mb-4">
            <Tool className="h-5 w-5 text-teal-600" />
            <h3 className="text-lg font-semibold">Maintenance & Replacement</h3>
          </div>
          <div className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">
                  Type
                </label>
                <Select value={maintenanceType} onValueChange={setMaintenanceType}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select maintenance type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="maintenance">Maintenance</SelectItem>
                    <SelectItem value="replacement">Replacement</SelectItem>
                    <SelectItem value="repair">Repair</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">
                  Frequency (per year)
                </label>
                <Input 
                  type="number" 
                  placeholder="Enter frequency"
                  value={maintenanceFrequency}
                  onChange={(e) => setMaintenanceFrequency(e.target.value)}
                />
              </div>
            </div>

            {maintenanceType && (
              <div className="space-y-4 pt-4">
                {maintenanceMaterials.map((material) => (
                  <div key={material.id} className="grid grid-cols-[1fr_auto_auto_auto] gap-4 items-end">
                    <div>
                      <label className="text-sm font-medium text-gray-700 mb-2 block">
                        Material Name
                      </label>
                      <Input
                        placeholder="Enter material name"
                        value={material.name}
                        onChange={(e) => updateMaintenanceMaterial(material.id, { name: e.target.value })}
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700 mb-2 block">
                        Quantity
                      </label>
                      <Input
                        type="number"
                        value={material.quantity}
                        onChange={(e) => updateMaintenanceMaterial(material.id, { quantity: parseFloat(e.target.value) || 0 })}
                        className="w-24"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700 mb-2 block">
                        Unit
                      </label>
                      <Select
                        value={material.unit}
                        onValueChange={(value) => updateMaintenanceMaterial(material.id, { unit: value })}
                      >
                        <SelectTrigger className="w-20">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="kg">Kg</SelectItem>
                          <SelectItem value="g">g</SelectItem>
                          <SelectItem value="l">L</SelectItem>
                          <SelectItem value="ml">mL</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => removeMaintenanceMaterial(material.id)}
                      className="text-red-500 hover:text-red-600 hover:bg-red-50"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}

                <Button
                  variant="outline"
                  onClick={addMaintenanceMaterial}
                  className="border-dashed"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Material
                </Button>
              </div>
            )}
          </div>
        </div>

        <div>
          <div className="flex items-center gap-2 mb-4">
            <Info className="h-5 w-5 text-teal-600" />
            <h3 className="text-lg font-semibold">Component Information</h3>
          </div>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">
                Number of components used
              </label>
              <Input type="number" placeholder="Enter number of components" />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">
                Component description
              </label>
              <Textarea 
                placeholder="Enter component description"
                className="min-h-[100px]"
              />
            </div>
          </div>
        </div>
      </TabsContent>

      <TabsContent value="manufacturing" className="mt-6 space-y-8">
        <div>
          <div className="flex items-center gap-2 mb-4">
            <Factory className="h-5 w-5 text-teal-600" />
            <h3 className="text-lg font-semibold">Manufacturing</h3>
          </div>
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Checkbox 
                id="functionalUnit" 
                checked={equalToFunctionalUnit}
                onCheckedChange={(checked) => setEqualToFunctionalUnit(checked as boolean)}
              />
              <label 
                htmlFor="functionalUnit" 
                className="text-sm font-medium text-gray-700 cursor-pointer"
              >
                Equal to functional unit
              </label>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger>
                    <Info className="h-4 w-4 text-gray-400" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Check if the manufacturing quantity equals the functional unit</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">
                  Production Quantity
                </label>
                <Input placeholder="Enter production quantity" />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">
                  Production Unit
                </label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select unit" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pieces">Pieces</SelectItem>
                    <SelectItem value="units">Units</SelectItem>
                    <SelectItem value="sets">Sets</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </div>

        <div>
          <div className="flex items-center gap-2 mb-4">
            <Lightbulb className="h-5 w-5 text-teal-600" />
            <h3 className="text-lg font-semibold">Manufacturing Energy Use</h3>
          </div>
          <div className="grid md:grid-cols-3 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">
                Utility Type
              </label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="electricity">Electricity</SelectItem>
                  <SelectItem value="gas">Natural Gas</SelectItem>
                  <SelectItem value="water">Water</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">
                Utility Quantity
              </label>
              <Input placeholder="Enter quantity" />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">
                Utility Unit
              </label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Select unit" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="kwh">kWh</SelectItem>
                  <SelectItem value="mj">MJ</SelectItem>
                  <SelectItem value="m3">m³</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        <div>
          <div className="flex items-center gap-2 mb-4">
            <Zap className="h-5 w-5 text-teal-600" />
            <h3 className="text-lg font-semibold">Operation Energy</h3>
          </div>
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Checkbox 
                id="requiresEnergy" 
                checked={requiresEnergy}
                onCheckedChange={(checked) => setRequiresEnergy(checked as boolean)}
              />
              <label 
                htmlFor="requiresEnergy" 
                className="text-sm font-medium text-gray-700 cursor-pointer"
              >
                Requires Energy
              </label>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger>
                    <Info className="h-4 w-4 text-gray-400" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Check if operation requires energy consumption</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>

            {requiresEnergy && (
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">
                    Operation Quantity
                  </label>
                  <Input placeholder="Enter operation quantity" />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">
                    Operation Unit
                  </label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select unit" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="kwh">kWh</SelectItem>
                      <SelectItem value="mj">MJ</SelectItem>
                      <SelectItem value="m3">m³</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}
          </div>
        </div>
      </TabsContent>
    </Tabs>
  )
}

