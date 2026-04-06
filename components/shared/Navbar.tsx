'use client'
import Link from 'next/link'
import { useState } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { Button } from '@/components/ui/button'
import { createClient } from '@/lib/supabase/client'

export function Navbar({ user }: { user: { email?: string | null; full_name?: string | null } | null }) {
  const { user: clientUser } = useAuth()
  const currentUser = user || clientUser
  const supabase = createClient()
  const [signOutLoading, setSignOutLoading] = useState(false)

  const handleSignOut = async () => {
    setSignOutLoading(true)
    try {
      await supabase.auth.signOut()
      window.location.href = '/login'
    } catch (error) {
      console.error('Failed to sign out:', error)
    } finally {
      setSignOutLoading(false)
    }
  }

  return (
    <nav className="sticky top-0 z-50 border-b border-cyan-500/20 bg-slate-900/60 backdrop-blur-xl">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <Link href="/" className="text-xl font-bold bg-gradient-to-r from-cyan-400 to-teal-400 bg-clip-text text-transparent">
          ATS CV Maker
        </Link>

        <div className="flex items-center gap-4">
          {currentUser ? (
            <>
              <Link href="/dashboard">
                <Button variant="ghost" className="hover:bg-cyan-500/10 hover:text-cyan-400">Dashboard</Button>
              </Link>
              <Link href="/templates">
                <Button variant="ghost" className="hover:bg-cyan-500/10 hover:text-cyan-400">Templates</Button>
              </Link>
              <Button
                variant="outline"
                onClick={handleSignOut}
                loading={signOutLoading}
                loadingText="Signing out..."
                className="border-cyan-500/30 hover:bg-cyan-500/10 hover:border-cyan-400/50"
              >
                Sign Out
              </Button>
            </>
          ) : (
            <>
              <Link href="/login">
                <Button variant="ghost" className="hover:bg-cyan-500/10 hover:text-cyan-400">Sign In</Button>
              </Link>
              <Link href="/signup">
                <Button className="bg-gradient-to-r from-cyan-500 to-teal-500 hover:from-cyan-600 hover:to-teal-600 hover:scale-105 hover:shadow-lg hover:shadow-cyan-500/25 transition-all duration-200">Sign Up</Button>
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  )
}
