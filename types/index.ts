export interface Product {
  id: string
  name: string
  projectName: string
  weight: number
  weightUnit: 'g' | 'kg'
  dimension?: string
  description?: string
  materials: Material[]
  supplierCountry: string
  lifetime: number
  lifetimeUnit: 'year' | 'month'
}

export interface Material {
  id: string
  name: string
  weight: number
  unit: 'g' | 'kg'
}

export interface FileUpload {
  image?: File
  document?: File
}
