'use client'

import { motion } from 'framer-motion'
import { CV } from '@/types/cv'
import { CVList } from './CVList'
import { CreateCVButton } from './CreateCVButton'
import { ImportCVButton } from './ImportCVButton'

export function DashboardContent({ cvs }: { cvs: CV[] }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-6 px-4 sm:px-6 lg:px-8"
    >
      {/* Header with gradient text */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-cyan-400 to-teal-400 bg-clip-text text-transparent">
            My CVs
          </h1>
          <p className="text-muted-foreground mt-1 text-sm sm:text-base">
            Manage and edit your CVs
          </p>
        </div>
        <div className="flex gap-2">
          <ImportCVButton />
          <CreateCVButton />
        </div>
      </div>

      {/* Import/Export Help */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="relative bg-slate-900/60 backdrop-blur-xl border border-cyan-500/20 p-4 rounded-xl"
      >
        <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 to-teal-500/5 rounded-xl pointer-events-none" />
        <div className="relative">
          <h3 className="font-semibold mb-2">Import & Export CVs</h3>
          <a
            href="/sample-cv.json"
            download="sample-cv.json"
            className="text-sm text-primary hover:underline"
          >
            Download sample CV format
          </a>
        </div>
      </motion.div>

      {/* CV List or Empty State */}
      {cvs && cvs.length > 0 ? (
        <CVList cvs={cvs} />
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
          className="relative bg-slate-900/60 backdrop-blur-xl border border-cyan-500/20 rounded-2xl p-6 sm:p-12 text-center"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/10 to-teal-500/10 rounded-2xl pointer-events-none" />
          <div className="relative">
            <p className="text-muted-foreground mb-6 text-sm sm:text-base">
              You haven&apos;t created any CVs yet
            </p>
            <div className="flex flex-col sm:flex-row gap-2 justify-center">
              <ImportCVButton />
              <CreateCVButton />
            </div>
          </div>
        </motion.div>
      )}
    </motion.div>
  )
}
