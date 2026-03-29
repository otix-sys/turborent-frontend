'use client'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { authApi } from '../lib/api'
import { useAuthStore } from '../store/authStore'

export function useAuth(options?: { requireAuth?: boolean; requireAdmin?: boolean }) {
  const { user, setUser, setLoading, isLoading, logout } = useAuthStore()
  const router = useRouter()

  useEffect(() => {
    const check = async () => {
      try {
        setLoading(true)
        const res = await authApi.me()
        setUser(res.data.user)
      } catch {
        setUser(null)
      } finally {
        setLoading(false)
      }
    }

    if (!user) check()
    else setLoading(false)
  }, [])

  useEffect(() => {
    if (isLoading) return
    if (options?.requireAuth && !user) {
      router.push('/auth/login')
      return
    }
    if (options?.requireAdmin && user?.role !== 'admin') {
      router.push('/')
    }
  }, [user, isLoading, options?.requireAuth, options?.requireAdmin])

  const signOut = async () => {
    try { await authApi.logout() } catch { /* ignore */ }
    logout()
    router.push('/')
  }

  return { user, isLoading, isAuthenticated: !!user, isAdmin: user?.role === 'admin', signOut }
}
