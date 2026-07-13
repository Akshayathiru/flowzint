'use client'

import { useEffect, useRef } from 'react'

// Silently keeps a long-lived admin session's token from expiring — it does
// NOT force a logout on failure. middleware.ts is the sole authority on
// whether a session is valid: it already redirects to login on its own
// whenever an actually-invalid/expired token is used to access a protected
// route, so this hook doesn't need to (and shouldn't) preempt that.
export function useTokenRefresh() {
  const intervalRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    // Refresh token every 7 hours (token expires at 8h)
    const REFRESH_INTERVAL = 7 * 60 * 60 * 1000

    const refresh = async () => {
      if (typeof window === 'undefined') return
      const path = window.location.pathname
      const isOperatorRoute = [
        "/dashboard",
        "/farmers",
        "/buyers",
        "/settlements",
        "/demo",
        "/admin",
      ].some((r) => path.includes(r))
      if (!isOperatorRoute) return

      try {
        await fetch('/api/auth/refresh', { method: 'POST' })
      } catch {
        console.warn('Token refresh failed — will retry next cycle')
      }
    }

    intervalRef.current = setInterval(refresh, REFRESH_INTERVAL)

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [])
}
