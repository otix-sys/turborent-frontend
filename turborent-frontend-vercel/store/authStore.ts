import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { User } from '../types'

interface AuthState {
  user: User | null
  isLoading: boolean
  setUser: (user: User | null) => void
  setLoading: (v: boolean) => void
  logout: () => void
  isAdmin: () => boolean
  isAuthenticated: () => boolean
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isLoading: true,
      setUser: (user) => set({ user }),
      setLoading: (v) => set({ isLoading: v }),
      logout: () => set({ user: null }),
      isAdmin: () => get().user?.role === 'admin',
      isAuthenticated: () => get().user !== null
    }),
    {
      name: 'turborent-auth',
      partialize: (state) => ({ user: state.user })
    }
  )
)
