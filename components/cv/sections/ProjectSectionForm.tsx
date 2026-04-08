'use client'
import React, { useState, useEffect } from 'react'
import { SectionFormProps, SectionDataItem } from '@/types/cv'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { Trash2, Plus } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import { v4 as uuidv4 } from 'uuid'

export function ProjectSectionForm({ data, onChange, sectionHeader, onHeaderChange }: SectionFormProps) {
  const [localSectionHeader, setLocalSectionHeader] = useState<string | undefined>(sectionHeader)

  // Sync local section header when prop changes
  useEffect(() => {
    setLocalSectionHeader(sectionHeader)
  }, [sectionHeader])
  
  const addItem = () => {
    const newItem: SectionDataItem = {
      id: uuidv4(),
      title: '',
      description: '',
      link: '',
      tags: ''
    }
    onChange([...data, newItem])
  }

  const updateItem = (id: string, updates: Partial<SectionDataItem>) => {
    onChange(data.map((item) => (item.id === id ? { ...item, ...updates } : item)))
  }

  return (
    <div className="space-y-6">
      {onHeaderChange && (
        <div className="space-y-2 pb-4 border-b">
          <Label>Section Title</Label>
          <Input
            value={localSectionHeader}
            onChange={(e) => setLocalSectionHeader(e.target.value)}
            onBlur={(e) => onHeaderChange(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                onHeaderChange(e.currentTarget.value)
                e.currentTarget.blur()
              }
            }}
            placeholder="e.g. Projects"
          />
        </div>
      )}

      <Button variant="outline" className="w-full" onClick={addItem}>
        <HugeiconsIcon icon={Plus} className="h-4 w-4 mr-2" /> Add Project
      </Button>

      {data.map((item, index) => (
        <div key={(item.id as string) || index} className="p-4 border rounded-lg space-y-4 relative">
          <Button 
            variant="ghost" 
            size="sm" 
            className="absolute top-2 right-2 text-red-500"
            onClick={() => onChange(data.filter((i) => i.id !== item.id))}
          >
            <HugeiconsIcon icon={Trash2} className="h-4 w-4" />
          </Button>

          <div className="grid gap-4">
            <div className="space-y-2">
              <Label>Project Title</Label>
              <Input 
                value={(item.title as string) || ''} 
                onChange={(e) => updateItem(item.id as string, { title: e.target.value })} 
              />
            </div>
            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea 
                value={(item.description as string) || ''} 
                onChange={(e) => updateItem(item.id as string, { description: e.target.value })} 
              />
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}