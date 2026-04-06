import { 
  Briefcase, 
  GraduationCap, 
  Award, 
  FolderOpen, 
  CertificateIcon, 
  Plus 
} from '@hugeicons/core-free-icons'
import { ExperienceForm } from '@/components/cv/sections/ExperienceForm'
import { EducationForm } from '@/components/cv/sections/EducationForm'
import { SkillsForm } from '@/components/cv/sections/SkillsForm'
import type { SectionConfig, SectionFormProps } from '@/types/cv'
import { ProjectSectionForm } from '@/components/cv/sections/ProjectSectionForm'
import { CertificationsForm } from '@/components/cv/sections/CertificationsForm'
import { DynamicSectionForm } from '@/components/cv/sections/DynamicSectionForm'

export const SECTION_REGISTRY: Record<string, SectionConfig> = {
  experience: {
    id: 'experience',
    label: 'Experience',
    defaultHeader: 'Professional Experience',
    formComponent: ExperienceForm as unknown as React.ComponentType<SectionFormProps>,
    icon: Briefcase,
    isPredefined: true
  },
  education: {
    id: 'education',
    label: 'Education',
    defaultHeader: 'Education',
    formComponent: EducationForm as unknown as React.ComponentType<SectionFormProps>,
    icon: GraduationCap,
    isPredefined: true
  },
  skills: {
    id: 'skills',
    label: 'Skills',
    defaultHeader: 'Core Competencies',
    formComponent: SkillsForm as unknown as React.ComponentType<SectionFormProps>,
    icon: Award,
    isPredefined: true
  },
  projects: {
    id: 'projects',
    label: 'Projects',
    defaultHeader: 'Key Projects',
    formComponent: ProjectSectionForm as unknown as React.ComponentType<SectionFormProps>,
    icon: FolderOpen,
    isPredefined: true
  },
  certifications: {
    id: 'certifications',
    label: 'Certifications',
    defaultHeader: 'Certifications & Licenses',
    formComponent: CertificationsForm as unknown as React.ComponentType<SectionFormProps>,
    icon: CertificateIcon,
    isPredefined: true
  },
  custom: {
    id: 'custom',
    label: 'Custom Section',
    defaultHeader: 'Additional Information',
    formComponent: DynamicSectionForm as unknown as React.ComponentType<SectionFormProps>,
    icon: Plus,
    isPredefined: false
  }
}