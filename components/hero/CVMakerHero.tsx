'use client'

import { motion } from 'framer-motion'
import { ArrowRight, Sparkles, CheckCircle, Zap, Download } from 'lucide-react'
import Link from 'next/link'
import { useShaderBackground } from './hooks/useShaderBackground'
import { FeatureCard } from './FeatureCard'

export function CVMakerHero() {
  const canvasRef = useShaderBackground()

  const features = [
    {
      icon: <Sparkles className="w-6 h-6" />,
      title: "AI-Powered",
      description: "Smart suggestions for content and formatting"
    },
    {
      icon: <Zap className="w-6 h-6" />,
      title: "Instant Preview",
      description: "See changes in real-time as you edit"
    },
    {
      icon: <Download className="w-6 h-6" />,
      title: "Export Ready",
      description: "Download in PDF, DOCX, or share online"
    }
  ]

  return (
    <div className="relative w-full h-screen overflow-hidden bg-slate-950">
      {/* WebGL Shader Canvas */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full object-cover touch-none"
        style={{ background: '#020617' }}
      />

      {/* Gradient Overlay */}
      <div className="absolute inset-0 bg-linear-to-b from-slate-950/50 via-transparent to-slate-950/80" />

      {/* Content */}
      <div className="relative z-10 container mx-auto px-4 py-6 lg:py-8">
        <div className="grid lg:grid-cols-2 gap-6 lg:gap-8 items-center h-[calc(100vh-4rem)]">

          {/* Left Column - Hero Content */}
          <div className="space-y-4 lg:space-y-6">
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-linear-to-r from-cyan-500/10 to-teal-500/10 border border-cyan-500/20 backdrop-blur-sm"
            >
              <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
              <span className="text-xs font-medium text-cyan-300">AI-Powered CV Builder</span>
            </motion.div>

            {/* Heading */}
            <div className="space-y-2 lg:space-y-3">
              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1 }}
                className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight"
              >
                <span className="bg-linear-to-r from-white via-cyan-100 to-teal-100 bg-clip-text text-transparent">
                  Create Your
                </span>
                <br />
                <span className="bg-linear-to-r from-cyan-400 via-teal-400 to-blue-400 bg-clip-text text-transparent">
                  Perfect CV
                </span>
              </motion.h1>

            </div>

            {/* CTAs */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="flex justify-start"
            >
              <Link href="/login">
                <button className="group px-6 py-3 bg-linear-to-r from-cyan-500 to-teal-500 hover:from-cyan-600 hover:to-teal-600 text-white rounded-xl font-semibold text-base transition-all duration-300 hover:scale-105 hover:shadow-xl hover:shadow-cyan-500/25 flex items-center justify-center gap-2">
                  Login
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </button>
              </Link>
            </motion.div>

            {/* Trust Indicators */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="flex items-center gap-4 pt-2"
            >
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-cyan-400" />
                <span className="text-xs text-slate-400">No credit card required</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-cyan-400" />
                <span className="text-xs text-slate-400">Free forever plan</span>
              </div>
            </motion.div>
          </div>

          {/* Right Column - CV Mockup + Features */}
          <div className="relative lg:pl-4">
            {/* CV Mockup */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              className="relative"
            >
              <div className="absolute inset-0 bg-linear-to-br from-cyan-500/20 to-teal-500/20 rounded-2xl blur-2xl animate-pulse" />

              <div className="relative overflow-hidden rounded-2xl border border-cyan-500/20 bg-slate-900/40 backdrop-blur-2xl p-4 lg:p-5 shadow-2xl animate-float">
                <div className="absolute top-0 right-0 w-48 h-48 bg-linear-to-br from-cyan-500/10 to-transparent rounded-full blur-2xl" />
                <div className="absolute bottom-0 left-0 w-48 h-48 bg-linear-to-tr from-teal-500/10 to-transparent rounded-full blur-2xl" />

                <div className="relative space-y-3 lg:space-y-4">
                  {/* Profile Section */}
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 lg:w-10 lg:h-10 rounded-full bg-linear-to-br from-cyan-500 to-teal-500" />
                      <div>
                        <div className="h-2 w-24 lg:w-28 bg-slate-700/50 rounded mb-1.5" />
                        <div className="h-1.5 w-16 lg:w-20 bg-slate-800/50 rounded" />
                      </div>
                    </div>
                  </div>

                  {/* Content Lines */}
                  <div className="space-y-2">
                    <div className="h-2.5 bg-linear-to-r from-slate-700/50 to-slate-800/50 rounded w-full" />
                    <div className="h-2.5 bg-linear-to-r from-slate-700/50 to-slate-800/50 rounded w-5/6" />
                    <div className="h-2.5 bg-linear-to-r from-slate-700/50 to-slate-800/50 rounded w-4/6" />
                  </div>

                  {/* Bullet Points */}
                  <div className="pt-3 space-y-2">
                    <div className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
                      <div className="h-2 bg-slate-700/50 rounded flex-1" />
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-teal-400" />
                      <div className="h-2 bg-slate-700/50 rounded flex-1" />
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-blue-400" />
                      <div className="h-2 bg-slate-700/50 rounded flex-1" />
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Feature Cards */}
            <div className="grid grid-cols-1 gap-2 lg:gap-3 mt-4">
              {features.map((feature, index) => (
                <FeatureCard
                  key={index}
                  icon={feature.icon}
                  title={feature.title}
                  description={feature.description}
                  delay={0.5 + index * 0.1}
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes float {
          0%, 100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-20px);
          }
        }

        .animate-float {
          animation: float 6s ease-in-out infinite;
        }
      `}</style>
    </div>
  )
}
