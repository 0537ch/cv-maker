import { createClient } from '@/lib/supabase/server'
import { CVEditor } from '@/components/cv/CVEditor'
import { redirect } from 'next/navigation'

export default async function EditorPage({
  params
}: {
  params: Promise<{ cvId: string }>
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const { cvId } = await params

  const { data: cv } = await supabase
    .from('cvs')
    .select('*')
    .eq('id', cvId)
    .eq('user_id', user.id)
    .single()

  if (!cv) {
    redirect('/dashboard')
  }

  return <CVEditor cv={cv} />
}
