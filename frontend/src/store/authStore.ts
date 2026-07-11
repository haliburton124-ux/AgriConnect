import { create } from 'zustand'
import type { User } from '@/types'

interface AuthState {
  user: User | null
  token: string | null
  isAuthenticated: boolean
  setSession: (user: User, token: string) => void
  updateUser: (user: User) => void
  clearSession: () => void
}

const storedUser = localStorage.getItem('agriri_user')
const storedToken = localStorage.getItem('agriri_token')

export const useAuthStore = create<AuthState>((set) => ({
  user: storedUser ? (JSON.parse(storedUser) as User) : null,
  token: storedToken,
  isAuthenticated: Boolean(storedToken),

  setSession: (user, token) => {
    localStorage.setItem('agriri_user', JSON.stringify(user))
    localStorage.setItem('agriri_token', token)
    set({ user, token, isAuthenticated: true })
  },

  updateUser: (user) => {
    localStorage.setItem('agriri_user', JSON.stringify(user))
    set({ user })
  },

  clearSession: () => {
    localStorage.removeItem('agriri_user')
    localStorage.removeItem('agriri_token')
    set({ user: null, token: null, isAuthenticated: false })
  },
}))

/** Route prefix each role lands on after login. */
export const ROLE_HOME: Record<string, string> = {
  admin: '/admin/dashboard',
  provincial_office: '/ppo/dashboard',
  municipal_office: '/mao/dashboard',
  technician: '/technician/dashboard',
  farmer: '/',
}
