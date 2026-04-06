import { prisma } from '@/lib/prisma'
import { createClient } from '@/lib/supabase/server'
import { DashboardContent } from '@/components/dashboard/DashboardContent'
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

  return <DashboardContent cvs={convertedCVs} />
}
