'use client'

import { motion } from 'framer-motion'
import { ReactNode } from 'react'

interface FeatureCardProps {
  icon: ReactNode
  title: string
  description: string
  delay: number
}

export function FeatureCard({ icon, title, description, delay }: FeatureCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay }}
      className="relative group"
    >
      <div className="relative overflow-hidden rounded-xl border border-cyan-500/20 bg-slate-900/40 backdrop-blur-xl p-3 lg:p-4 transition-all duration-300 hover:border-cyan-400/40 hover:bg-slate-900/60">
        <div className="absolute inset-0 bg-linear-to-br from-cyan-500/5 to-teal-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        <div className="relative z-10 flex items-center gap-3">
          <div className="inline-flex items-center justify-center w-8 h-8 lg:w-10 lg:h-10 rounded-lg bg-linear-to-br from-cyan-500/20 to-teal-500/20 text-cyan-400 shrink-0">
            {icon}
          </div>
          <div className="min-w-0">
            <h3 className="text-sm lg:text-base font-semibold text-white mb-0.5 truncate">{title}</h3>
            <p className="text-xs text-slate-400 line-clamp-1">{description}</p>
          </div>
        </div>
      </div>
    </motion.div>
  )
}
