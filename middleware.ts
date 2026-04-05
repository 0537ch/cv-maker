import { NextResponse, type NextRequest } from 'next/server'
import { updateClient } from '@/lib/supabase/middleware'

export async function middleware(req: NextRequest) {
  // Skip middleware for auth callback - allow OAuth to complete
  if (req.nextUrl.pathname.startsWith('/auth/callback')) {
    return NextResponse.next()
  }

  const res = NextResponse.next()
  const supabase = await updateClient(req)
  const { data: { session } } = await supabase.auth.getSession()

  // Protect dashboard and editor routes
  if (req.nextUrl.pathname.startsWith('/dashboard') ||
      req.nextUrl.pathname.startsWith('/editor')) {
    if (!session) {
      return NextResponse.redirect(new URL('/login', req.url))
    }
  }

  // Redirect logged-in users away from auth pages
  if ((req.nextUrl.pathname === '/login' || req.nextUrl.pathname === '/signup') && session) {
    return NextResponse.redirect(new URL('/dashboard', req.url))
  }

  return res
}

export const config = {
  matcher: ['/dashboard/:path*', '/editor/:path*', '/login', '/signup', '/auth/callback']
}
