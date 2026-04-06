'use client'
import { Button } from '@/components/ui/button'
import { useRef, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { CVData } from '@/types/cv'
import { validateImportedCV, formatCVDataForImport } from '@/lib/import/import-json'

export function ImportCVButton() {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()
  const supabase = createClient()

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    setLoading(true)
    setError('')

    try {
      // Read file
      const text = await file.text()
      const jsonData = JSON.parse(text)

      // Validate and format the imported data
      let cvData: CVData

      try {
        cvData = await validateImportedCV(jsonData)
      } catch {
        cvData = formatCVDataForImport(jsonData)
      }

      // Get user
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/login')
        return
      }

      const res = await fetch('/api/cvs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: jsonData.title || file.name.replace('.json', ' - Imported CV'),
          template_id: 'ats',
          cv_data: cvData
        }),
      })

      if (!res.ok) {
        throw new Error('Failed to create CV from imported data')
      }

      const { cv } = await res.json()
      router.push(`/editor/${cv.id}`)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to import CV')
      setLoading(false)
    }
  }

  const handleClick = () => {
    setError('')
    fileInputRef.current?.click()
  }

  return (
    <div>
      <input
        ref={fileInputRef}
        type="file"
        accept=".json"
        onChange={handleFileSelect}
        className="hidden"
      />
      <Button
        onClick={handleClick}
        disabled={loading}
        variant="outline"
        loading={loading}
        loadingText="Importing..."
      >
        Import JSON
      </Button>
      {error && (
        <p className="text-sm text-destructive mt-2 max-w-md">{error}</p>
      )}
    </div>
  )
}
