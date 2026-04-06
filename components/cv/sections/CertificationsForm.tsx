'use client'
import React from 'react'
import { SectionFormProps, SectionDataItem } from '@/types/cv'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Trash2, Plus } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import { v4 as uuidv4 } from 'uuid'

export function CertificationsForm({ 
  data, 
  onChange, 
  sectionHeader, 
  onHeaderChange 
}: SectionFormProps) {

  const addCertification = () => {
    const newCert: SectionDataItem = {
      id: uuidv4(),
      name: '',
      issuer: '',
      date: '',
      url: ''
    }
    onChange([...data, newCert])
  }

  const updateCert = (id: string, updates: Partial<SectionDataItem>) => {
    onChange(data.map((item) => (item.id === id ? { ...item, ...updates } : item)))
  }

  const removeCert = (id: string) => {
    onChange(data.filter((item) => item.id !== id))
  }

  return (
    <div className="space-y-6">
      {/* Section Header Customization */}
      {onHeaderChange && (
        <div className="space-y-2 pb-4 border-b">
          <Label htmlFor="certHeader">Section Header</Label>
          <Input
            id="certHeader"
            value={sectionHeader || 'Certifications'}
            onChange={(e) => onHeaderChange(e.target.value)}
            placeholder="Certifications & Licenses"
          />
        </div>
      )}

      {/* Add Button */}
      <Button variant="outline" className="w-full" onClick={addCertification}>
        <HugeiconsIcon icon={Plus} className="h-4 w-4 mr-2" />
        Add Certification
      </Button>

      {/* List of Certifications */}
      <div className="space-y-4">
        {data.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground border-2 border-dashed rounded-lg">
            <p className="text-sm">No certifications added yet.</p>
          </div>
        ) : (
          data.map((cert) => (
            <div key={cert.id as string} className="p-4 border rounded-lg space-y-4 relative bg-card">
              <Button
                variant="ghost"
                size="sm"
                className="absolute top-2 right-2 text-destructive hover:text-destructive hover:bg-destructive/10"
                onClick={() => removeCert(cert.id as string)}
              >
                <HugeiconsIcon icon={Trash2} className="h-4 w-4" />
              </Button>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2 md:col-span-2">
                  <Label>Certificate Name</Label>
                  <Input
                    value={(cert.name as string) || ''}
                    onChange={(e) => updateCert(cert.id as string, { name: e.target.value })}
                    placeholder="e.g., AWS Certified Cloud Practitioner"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Issuing Organization</Label>
                  <Input
                    value={(cert.issuer as string) || ''}
                    onChange={(e) => updateCert(cert.id as string, { issuer: e.target.value })}
                    placeholder="e.g., Amazon Web Services"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Issue Date</Label>
                  <Input
                    type="text"
                    value={(cert.date as string) || ''}
                    onChange={(e) => updateCert(cert.id as string, { date: e.target.value })}
                    placeholder="e.g., Jan 2024"
                  />
                </div>

                <div className="space-y-2 md:col-span-2">
                  <Label>Credential URL (Optional)</Label>
                  <Input
                    type="url"
                    value={(cert.url as string) || ''}
                    onChange={(e) => updateCert(cert.id as string, { url: e.target.value })}
                    placeholder="https://..."
                  />
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}