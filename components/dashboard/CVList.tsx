import { CV } from '@/types/cv'
import { CVCard } from './CVCard'

export function CVList({ cvs }: { cvs: CV[] }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {cvs.map((cv) => (
        <CVCard key={cv.id} cv={cv} />
      ))}
    </div>
  )
}
