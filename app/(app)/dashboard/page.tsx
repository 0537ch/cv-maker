import { prisma } from '@/lib/prisma'
import { createClient } from '@/lib/supabase/server'
import { CVList } from '@/components/dashboard/CVList'
import { CreateCVButton } from '@/components/dashboard/CreateCVButton'
import { ImportCVButton } from '@/components/dashboard/ImportCVButton'
import { CV } from '@/types/cv'
import { Prisma } from '@prisma/client'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return null
  }

  const cvs = await prisma.cV.findMany({
    where: { userId: user.id },
    orderBy: { updatedAt: 'desc' },
  })

  // Convert Prisma camelCase to snake_case for CV type
  const convertedCVs: CV[] = cvs.map(cv => ({
    id: cv.id,
    user_id: cv.userId,
    title: cv.title,
    template_id: cv.templateId,
    cv_data: (cv.cvData as Prisma.JsonObject) ?? {
      personalInfo: { fields: [] },
      experience: [],
      education: [],
      skills: [],
      projects: []
    },
    is_favorite: cv.isFavorite,
    created_at: cv.createdAt.toISOString(),
    updated_at: cv.updatedAt.toISOString(),
  }))

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">My CVs</h1>
          <p className="text-muted-foreground mt-1">
            Manage and edit your CVs
          </p>
        </div>
        <div className="flex gap-2">
          <ImportCVButton />
          <CreateCVButton />
        </div>
      </div>

      {/* Import/Export Help */}
      <div className="bg-muted/50 p-4 rounded-lg">
        <h3 className="font-semibold mb-2">Import & Export CVs</h3>
        <a
          href="/sample-cv.json"
          download="sample-cv.json"
          className="text-sm text-primary hover:underline"
        >
          Download sample CV format
        </a>
      </div>

      {cvs && cvs.length > 0 ? (
        <CVList cvs={convertedCVs} />
      ) : (
        <div className="text-center py-12">
          <p className="text-muted-foreground mb-4">
            You haven&apos;t created any CVs yet
          </p>
          <div className="flex gap-2 justify-center">
            <ImportCVButton />
            <CreateCVButton />
          </div>
        </div>
      )}
    </div>
  )
}
