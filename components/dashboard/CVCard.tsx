'use client'
import { CV } from '@/types/cv'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Star, Delete } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

export function CVCard({ cv }: { cv: CV }) {
  const router = useRouter()
  const [deleting, setDeleting] = useState(false)

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this CV?')) return

    setDeleting(true)
    await fetch(`/api/cvs/${cv.id}`, { method: 'DELETE' })
    router.refresh()
  }

  const handleToggleFavorite = async () => {
    await fetch(`/api/cvs/${cv.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ is_favorite: !cv.is_favorite }),
    })
    router.refresh()
  }

  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          {cv.title}
          {cv.is_favorite && (
            <HugeiconsIcon icon={Star} className="h-5 w-5 text-yellow-500 fill-yellow-500" />
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground">
          Template: {cv.template_id}
        </p>
        <p className="text-sm text-muted-foreground">
          Last updated: {new Date(cv.updated_at).toLocaleDateString()}
        </p>
      </CardContent>
      <CardFooter className="gap-2">
        <Button
          onClick={() => router.push(`/editor/${cv.id}`)}
          className="flex-1"
        >
          Edit
        </Button>
        <Button
          variant="outline"
          size="icon"
          onClick={handleToggleFavorite}
        >
          <HugeiconsIcon icon={Star} className={`h-4 w-4 ${cv.is_favorite ? 'fill-yellow-500 text-yellow-500' : ''}`} />
        </Button>
        <Button
          variant="outline"
          size="icon"
          onClick={handleDelete}
          disabled={deleting}
        >
          <HugeiconsIcon icon={Delete} className="h-4 w-4" />
        </Button>
      </CardFooter>
    </Card>
  )
}
