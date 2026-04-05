import { CVData, Experience, Education, Skill, PersonalInfo } from '@/types/cv'
import { z } from 'zod'

// Schema for imported CV data
export const personalInfoSchema = z.object({
  fullName: z.string().optional(),
  email: z.string().optional(),
  phone: z.string().optional(),
  location: z.string().optional(),
  website: z.string().optional(),
  linkedin: z.string().optional(),
  github: z.string().optional(),
  summary: z.string().optional(),
})

export const experienceSchema = z.object({
  id: z.string(),
  position: z.string(),
  company: z.string(),
  startDate: z.string(),
  endDate: z.string().optional(),
  current: z.boolean().optional(),
  description: z.string(),
})

export const educationSchema = z.object({
  id: z.string(),
  degree: z.string(),
  institution: z.string(),
  field: z.string(),
  startDate: z.string(),
  endDate: z.string(),
  gpa: z.string().optional(),
})

export const skillSchema = z.object({
  id: z.string(),
  name: z.string(),
  level: z.enum(['beginner', 'intermediate', 'expert']),
  category: z.string(),
})

export const cvDataSchema = z.object({
  personalInfo: personalInfoSchema.optional(),
  experience: z.array(experienceSchema).optional(),
  education: z.array(educationSchema).optional(),
  skills: z.array(skillSchema).optional(),
  projects: z.array(z.record(z.string(), z.unknown())).optional(),
  sectionHeaders: z.object({
    personalInfo: z.string().optional(),
    experience: z.string().optional(),
    education: z.string().optional(),
    skills: z.string().optional(),
    projects: z.string().optional(),
  }).optional(),
})

export const importCVSchema = z.object({
  version: z.string().optional(),
  title: z.string().optional(),
  exportedAt: z.string().optional(),
  data: cvDataSchema,
})

export async function validateImportedCV(json: Record<string, unknown>): Promise<CVData> {
  try {
    const parsed = importCVSchema.parse(json)
    return parsed.data as CVData
  } catch (error) {
    if (error instanceof z.ZodError) {
      const messages = error.issues.map((e) => `${e.path.join('.')}: ${e.message}`).join('\n')
      throw new Error(`Invalid CV format:\n${messages}`)
    }
    throw error
  }
}

export function formatCVDataForImport(rawData: Record<string, unknown>): CVData {
  // Try to format loosely structured data into our CV format
  const personalInfo = (rawData.personalInfo as Record<string, unknown>) || (rawData.personal_info as Record<string, unknown>) || { fields: [] }

  // Ensure personalInfo has fields property
  if (!('fields' in personalInfo)) {
    (personalInfo as Record<string, unknown>).fields = []
  }

  return {
    personalInfo: personalInfo as unknown as PersonalInfo,
    experience: (rawData.experience as Experience[]) || [],
    education: (rawData.education as Education[]) || [],
    skills: (rawData.skills as Skill[]) || [],
    projects: (rawData.projects as Record<string, unknown>[]) || []
  }
}
