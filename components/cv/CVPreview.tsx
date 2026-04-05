import { CVData } from '@/types/cv'
import { ATSTemplate } from './templates/ATSTemplate'

export function CVPreview({ data }: { data: CVData; templateId: string }) {
  // Use ATS template for all templates for now (ATS-optimized)
  return <ATSTemplate data={data} />
}
