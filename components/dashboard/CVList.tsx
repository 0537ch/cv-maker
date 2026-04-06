'use client'

import { motion } from 'framer-motion'
import { CV } from '@/types/cv'
import { CVCard } from './CVCard'

export function CVList({ cvs }: { cvs: CV[] }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {cvs.map((cv, index) => (
        <motion.div
          key={cv.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: index * 0.1, ease: 'easeOut' }}
        >
          <CVCard cv={cv} />
        </motion.div>
      ))}
    </div>
  )
}
