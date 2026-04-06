'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { TemplateCard } from './TemplateCard'
import { Template } from '@/types/cv'

export function TemplateGallery() {
  const [templates, setTemplates] = useState<Template[]>([])

  useEffect(() => {
    async function loadTemplates() {
      try {
        const response = await fetch('/api/templates')
        if (response.ok) {
          const data = await response.json()
          setTemplates(data.templates)
        }
      } catch (error) {
        console.error('Failed to load templates:', error)
      }
    }
    loadTemplates()
  }, [])

  if (!templates.length) return null

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {templates.map((template, index) => (
        <motion.div
          key={template.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: index * 0.1, ease: 'easeOut' }}
        >
          <TemplateCard template={template} />
        </motion.div>
      ))}
    </div>
  )
}
