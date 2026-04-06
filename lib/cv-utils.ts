import { UnifiedCVData, CVSection, CVData } from '@/types/cv'

export function isLegacyCVData(data: unknown): data is CVData {
  if (!data || typeof data !== 'object') return false
  const d = data as Record<string, unknown>
  return !('sections' in d) && !!(d.experience || d.education || d.skills)
} 

export function migrateLegacyToUnified(legacy: CVData): UnifiedCVData {
  const sections: CVSection[] = []

  const addSection = (key: keyof CVData, label: string, defaultHeader: string, order: number) => {
    const data = legacy[key]
    // Always include the section, even if empty, for consistent reordering
    if (Array.isArray(data)) {
      sections.push({
        id: key as string,
        type: key as string,
        label,
        header: legacy.sectionHeaders?.[key as keyof typeof legacy.sectionHeaders] || defaultHeader,
        data: data as unknown[],
        order,
        isCustom: false,
      })
    }
  }

  addSection('experience', 'Experience', 'Professional Experience', 1)
  addSection('education', 'Education', 'Education', 2)
  addSection('skills', 'Skills', 'Core Competencies', 3)

  return {
    personalInfo: legacy.personalInfo,
    sections: sections.sort((a, b) => a.order - b.order),
  }
}