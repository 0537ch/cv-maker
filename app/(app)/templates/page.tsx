import { TemplateGallery } from '@/components/templates/TemplateGallery'

export default function TemplatesPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold bg-gradient-to-r from-cyan-400 to-teal-400 bg-clip-text text-transparent">Choose a Template</h1>
        <p className="text-muted-foreground mt-1">
          Select a template to get started
        </p>
      </div>
      <TemplateGallery />
    </div>
  )
}
