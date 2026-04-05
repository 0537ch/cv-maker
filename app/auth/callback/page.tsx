'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

export default function AuthCallback() {
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading')
  const supabase = createClient()

  useEffect(() => {
    const handleCallback = async () => {
      try {
        // Wait a moment for session to be established
        await new Promise(resolve => setTimeout(resolve, 500))

        // Check if we have a session
        const { data: { session }, error } = await supabase.auth.getSession()

        if (error) {
          setStatus('error')

          // Notify parent window of error
          if (window.opener) {
            window.opener.postMessage({ type: 'AUTH_ERROR', error: error.message }, '*')
          }

          // Close popup after delay
          setTimeout(() => {
            window.close()
          }, 2000)
          return
        }

        if (session) {
          setStatus('success')

          // Notify parent window
          if (window.opener) {
            window.opener.postMessage(
              { type: 'AUTH_SUCCESS', user: { email: session.user?.email, id: session.user?.id } },
              '*'
            )
          }

          // Close popup
          setTimeout(() => {
            window.close()
          }, 500)
        } else {
          // No session yet, wait more and retry
          setTimeout(handleCallback, 1000)
        }
      } catch {
        setStatus('error')

        if (window.opener) {
          window.opener.postMessage({ type: 'AUTH_ERROR', error: 'Unknown error' }, '*')
        }

        setTimeout(() => {
          window.close()
        }, 2000)
      }
    }

    handleCallback()
  }, [supabase])

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center space-y-4 p-8">
        {status === 'loading' && (
          <>
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            <p className="text-muted-foreground">Authenticating...</p>
            <p className="text-xs text-muted-foreground mt-2">
              This window will close automatically
            </p>
          </>
        )}

        {status === 'success' && (
          <>
            <div className="text-green-500 text-4xl">✓</div>
            <p className="text-lg font-semibold">Authentication Successful!</p>
            <p className="text-sm text-muted-foreground">This window will close automatically.</p>
          </>
        )}

        {status === 'error' && (
          <>
            <div className="text-destructive text-4xl">✕</div>
            <p className="text-lg font-semibold text-destructive">Authentication Failed</p>
            <p className="text-sm text-muted-foreground">This window will close automatically.</p>
          </>
        )}
      </div>
    </div>
  )
}
