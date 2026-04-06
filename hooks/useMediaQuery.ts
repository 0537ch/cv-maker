import { useState, useEffect } from 'react'

export function useMediaQuery(query: string): boolean {
  // Default to false on server, update after mount
  const [matches, setMatches] = useState(false)
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
    const media = window.matchMedia(query)
    setMatches(media.matches)

    const listener = () => setMatches(media.matches)
    media.addEventListener('change', listener)
    return () => media.removeEventListener('change', listener)
  }, [query])

  // Don't render until client-side to avoid hydration mismatch
  // Return false during SSR/hydration
  return isMounted ? matches : false
}
