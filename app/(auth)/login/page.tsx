'use client'

import { motion } from 'framer-motion'
import { LoginForm } from '@/components/auth/LoginForm'
import { useShaderBackground } from '@/components/hero/hooks/useShaderBackground'

export default function LoginPage() {
  const canvasRef = useShaderBackground()

  return (
    <div className="h-screen flex items-center justify-center p-4 relative bg-slate-950 overflow-hidden">
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full object-cover touch-none z-0"
        style={{ background: '#020617' }}
      />

      <div className="absolute inset-0 bg-linear-to-br from-cyan-500/20 to-teal-500/20 z-10" />

      <motion.div
        layoutId="login-button"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, ease: 'easeInOut' }}
        className="relative z-20 max-w-md w-full mx-auto bg-linear-to-br from-cyan-500/20 to-teal-500/20 backdrop-blur-xl border border-cyan-500/50 rounded-2xl p-8 shadow-2xl"
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, ease: 'easeInOut', delay: 0.1 }}
        >
          <LoginForm />
        </motion.div>
      </motion.div>
    </div>
  )
}
