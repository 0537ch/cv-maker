import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ cvId: string }> }
) {
  const { cvId } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await req.json()
  const cv = await prisma.cV.findUnique({
    where: { id: cvId }
  })

  if (!cv || cv.userId !== user.id) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  const updated = await prisma.cV.update({
    where: { id: cvId },
    data: body
  })

  return NextResponse.json({ cv: updated })
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ cvId: string }> }
) {
  const { cvId } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const cv = await prisma.cV.findUnique({
    where: { id: cvId }
  })

  if (!cv || cv.userId !== user.id) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  await prisma.cV.delete({
    where: { id: cvId }
  })

  return NextResponse.json({ success: true })
}
