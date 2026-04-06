'use client'
import Link from 'next/link'
import { useState } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { Button } from '@/components/ui/button'
import { ThemeToggle } from '@/components/shared/ThemeToggle'
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
    <nav className="border-b">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <Link href="/" className="text-xl font-bold">
          ATS CV Maker
        </Link>

        <div className="flex items-center gap-4">
          <ThemeToggle />

          {currentUser ? (
            <>
              <Link href="/dashboard">
                <Button variant="ghost">Dashboard</Button>
              </Link>
              <Link href="/templates">
                <Button variant="ghost">Templates</Button>
              </Link>
              <Button
                variant="outline"
                onClick={handleSignOut}
                loading={signOutLoading}
                loadingText="Signing out..."
              >
                Sign Out
              </Button>
            </>
          ) : (
            <>
              <Link href="/login">
                <Button variant="ghost">Sign In</Button>
              </Link>
              <Link href="/signup">
                <Button>Sign Up</Button>
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  )
}
