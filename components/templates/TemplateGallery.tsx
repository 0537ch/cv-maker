import { createClient } from '@/lib/supabase/server'
import { TemplateCard } from './TemplateCard'

export async function TemplateGallery() {
  const supabase = await createClient()
  const { data: templates } = await supabase
    .from('templates')
    .select('*')
    .order('sort_order', { ascending: true })

  if (!templates) return null

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {templates.map((template) => (
        <TemplateCard key={template.id} template={template} />
      ))}
    </div>
  )
}
