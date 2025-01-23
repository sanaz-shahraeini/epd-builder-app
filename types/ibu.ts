export interface IbuData {
  uuid: string
  name: string
  classific: string
  geo: string
  ref_year: string
  status?: 'verified' | 'pending'
}

export interface ComparisonCategory {
  id: string
  name: string
  rows: {
    name: string
    values: string[]
  }[]
}
