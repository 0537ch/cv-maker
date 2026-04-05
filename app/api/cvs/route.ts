import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await req.json()
  const { title, template_id = 'modern', cv_data } = body

  const cv = await prisma.cV.create({
    data: {
      userId: user.id,
      title,
      templateId: template_id,
      cvData: cv_data || {
        personalInfo: {},
        experience: [],
        education: [],
        skills: [],
        projects: []
      }
    }
  })

  return NextResponse.json({ cv })
}

export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const cvs = await prisma.cV.findMany({
    where: { userId: user.id },
    orderBy: { updatedAt: 'desc' },
  })

  return NextResponse.json({ cvs })
}
