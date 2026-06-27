'use client'

import { useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { toast } from 'sonner'

export function useTokenRefresh() {
  const router = useRouter()
  const t = useTranslations('auth')
  const intervalRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    // Refresh token every 7 hours (token expires at 8h)
    const REFRESH_INTERVAL = 7 * 60 * 60 * 1000

    const refresh = async () => {
      try {
        const res = await fetch('/api/auth/refresh', { method: 'POST' })
        if (!res.ok) {
          // Token expired or invalid — redirect to login
          toast.error(t('session_expired'))
          router.push('/login?expired=true')
        }
      } catch {
        // Network error — don't redirect, just skip this cycle
        console.warn('Token refresh failed — will retry')
      }
    }

    intervalRef.current = setInterval(refresh, REFRESH_INTERVAL)

    // Also refresh on window focus after being idle
    const handleFocus = () => {
      refresh()
    }
    window.addEventListener('focus', handleFocus)

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
      window.removeEventListener('focus', handleFocus)
    }
  }, [router, t])
}
