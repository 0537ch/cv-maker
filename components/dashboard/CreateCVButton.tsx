'use client'
import { Button } from '@/components/ui/button'
import { Square } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

export function CreateCVButton() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  const handleCreate = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/cvs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: 'Untitled CV',
          template_id: 'ats',
        }),
      })

      if (res.ok) {
        const { cv } = await res.json()
        router.push(`/editor/${cv.id}`)
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <Button onClick={handleCreate} loading={loading} loadingText="Creating CV...">
      <HugeiconsIcon icon={Square} className="h-4 w-4 mr-2" />
      New CV
    </Button>
  )
}
