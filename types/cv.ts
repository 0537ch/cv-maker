import { Prisma } from '@prisma/client'

export interface CV {
  id: string
  user_id: string
  title: string
  template_id: string
  cv_data: Prisma.JsonObject
  is_favorite: boolean
  created_at: string
  updated_at: string
}

export interface ProfileField {
  id: string
  label: string
  value: string
  type: 'text' | 'email' | 'tel' | 'url' | 'textarea' | 'date' | 'number'
  required: boolean
  section?: 'custom'
  order: number
}

export interface PersonalInfo {
  fields: ProfileField[]
}

export interface Experience {
  id: string
  position: string
  company: string
  startDate: string
  endDate?: string
  current?: boolean
  description: string
  order?: number
}

export interface Education {
  id: string
  degree: string
  institution: string
  field: string
  startDate: string
  endDate: string
  gpa?: string
  order?: number
}

export interface Skill {
  id: string
  name: string
  level: 'beginner' | 'intermediate' | 'expert'
  category: string
  order?: number
}

export interface SectionHeaders {
  personalInfo?: string
  experience?: string
  education?: string
  skills?: string
  projects?: string
}

export interface CVData {
  personalInfo: PersonalInfo
  experience: Experience[]
  education: Education[]
  skills: Skill[]
  projects?: Record<string, unknown>[]
  sectionHeaders?: SectionHeaders
  sectionOrder?: string[]
}

export interface Template {
  id: string
  name: string
  description: string | null
  preview_url: string | null
  category: string
  is_premium: boolean
  sort_order: number
}
