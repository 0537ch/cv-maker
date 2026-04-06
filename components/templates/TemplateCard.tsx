'use client'
import { Template } from '@/types/cv'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { v4 as uuidv4 } from 'uuid'

// Generate default CV data based on template
function generateDefaultCVData(templateId: string) {
  const baseFields = [
    {
      id: uuidv4(),
      label: 'Full Name',
      value: '',
      type: 'text' as const,
      required: true,
      section: 'custom' as const,
      order: 0
    },
    {
      id: uuidv4(),
      label: 'Email',
      value: '',
      type: 'email' as const,
      required: true,
      section: 'custom' as const,
      order: 1
    },
    {
      id: uuidv4(),
      label: 'Phone',
      value: '',
      type: 'tel' as const,
      required: true,
      section: 'custom' as const,
      order: 2
    },
    {
      id: uuidv4(),
      label: 'Location',
      value: '',
      type: 'text' as const,
      required: true,
      section: 'custom' as const,
      order: 3
    },
    {
      id: uuidv4(),
      label: 'Professional Summary',
      value: '',
      type: 'textarea' as const,
      required: true,
      section: 'custom' as const,
      order: 4
    }
  ]

  // ATS template specific fields
  if (templateId === 'ats') {
    return {
      personalInfo: {
        fields: [
          ...baseFields,
          {
            id: uuidv4(),
            label: 'LinkedIn',
            value: '',
            type: 'url' as const,
            required: false,
            section: 'custom' as const,
            order: 5
          },
          {
            id: uuidv4(),
            label: 'GitHub',
            value: '',
            type: 'url' as const,
            required: false,
            section: 'custom' as const,
            order: 6
          },
          {
            id: uuidv4(),
            label: 'Portfolio',
            value: '',
            type: 'url' as const,
            required: false,
            section: 'custom' as const,
            order: 7
          }
        ]
      },
      experience: [],
      education: [],
      skills: [],
      projects: [],
      sectionHeaders: {
        personalInfo: 'Profile',
        experience: 'Professional Experience',
        education: 'Education',
        skills: 'Skills'
      }
    }
  }

  // Default for other templates
  return {
    personalInfo: {
      fields: baseFields
    },
    experience: [],
    education: [],
    skills: [],
    projects: [],
    sectionHeaders: {
      personalInfo: 'Profile',
      experience: 'Experience',
      education: 'Education',
      skills: 'Skills'
    }
  }
}

export function TemplateCard({ template }: { template: Template }) {
  const router = useRouter()
  const supabase = createClient()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSelect = async () => {
    setLoading(true)
    setError('')

    try {
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) {
        router.push('/login')
        setLoading(false)
        return
      }

      console.log('Creating CV for user:', user.id)

      const newId = uuidv4()
      const now = new Date().toISOString()

      const { data, error } = await supabase
        .from('cvs')
        .insert({
          id: newId,
          user_id: user.id,
          title: `New ${template.name} CV`,
          template_id: template.id,
          cv_data: generateDefaultCVData(template.id),
          created_at: now,
          updated_at: now
        })
        .select()
        .single()

      if (error) {
        console.error('Error creating CV:', error)
        setError(`Failed to create CV: ${error.message}`)
        setLoading(false)
        return
      }

      if (data) {
        console.log('CV created successfully:', data.id)
        router.push(`/editor/${data.id}`)
      }
    } catch (err) {
      console.error('Unexpected error:', err)
      setError('An unexpected error occurred')
      setLoading(false)
    }
  }

  return (
    <Card className="relative overflow-hidden bg-slate-900/60 backdrop-blur-xl border border-cyan-500/20 hover:border-cyan-400/40 hover:bg-slate-900/70 transition-all duration-200 hover:scale-[1.02] hover:shadow-xl hover:shadow-cyan-500/10 group">
      {/* Gradient overlay on hover */}
      <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 to-teal-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none" />

      <CardHeader className="relative">
        <CardTitle className="bg-gradient-to-r from-cyan-400 to-teal-400 bg-clip-text text-transparent">{template.name}</CardTitle>
      </CardHeader>
      <CardContent className="relative">
        <p className="text-sm text-muted-foreground">
          {template.description}
        </p>
        <div className="mt-2">
          <span className="text-xs bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 px-2 py-1 rounded">
            {template.category}
          </span>
        </div>
      </CardContent>
      <CardFooter className="relative">
        <div className="w-full space-y-2">
          {error && (
            <div className="text-xs text-destructive bg-destructive/10 border border-destructive/20 p-2 rounded backdrop-blur-sm">
              {error}
            </div>
          )}
          <Button
            onClick={handleSelect}
            disabled={loading}
            className="w-full bg-gradient-to-r from-cyan-500 to-teal-500 hover:from-cyan-600 hover:to-teal-600 hover:scale-105 hover:shadow-lg hover:shadow-cyan-500/25 transition-all duration-200"
          >
            {loading ? 'Creating...' : 'Use Template'}
          </Button>
        </div>
      </CardFooter>
    </Card>
  )
}
