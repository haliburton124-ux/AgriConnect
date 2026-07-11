import { useState } from 'react'
import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Bell, Menu, X, LogOut, ChevronDown, Sprout } from 'lucide-react'
import { cn, initials } from '@/lib/utils'
import { useAuthStore } from '@/store/authStore'
import { NAVIGATION, ROLE_LABELS } from '@/config/navigation'
import { authService } from '@/services/authService'
import { toast } from 'sonner'

export function DashboardLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [profileOpen, setProfileOpen] = useState(false)
  const user = useAuthStore((s) => s.user)
  const clearSession = useAuthStore((s) => s.clearSession)
  const navigate = useNavigate()

  if (!user) return null
  const items = NAVIGATION[user.role]

  const handleLogout = async () => {
    try {
      await authService.logout()
    } catch {
      // proceed with local logout regardless
    } finally {
      clearSession()
      toast.success('You have been logged out.')
      navigate('/login')
    }
  }

  const SidebarContent = (
    <div className="flex h-full flex-col">
      <div className="flex items-center gap-2.5 px-6 py-6">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-primary text-white shadow-card">
          <Sprout className="h-5 w-5" />
        </div>
        <div>
          <p className="text-base font-bold leading-none text-ink">AgriConnect</p>
          <p className="mt-1 text-[11px] text-muted-foreground">Ilocos Norte</p>
        </div>
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto px-3">
        {items.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            onClick={() => setSidebarOpen(false)}
            className={({ isActive }) =>
              cn(
                'flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium transition-colors',
                isActive
                  ? 'bg-gradient-primary text-white shadow-card'
                  : 'text-ink/70 hover:bg-forest/5 hover:text-forest',
              )
            }
          >
            <item.icon className="h-[18px] w-[18px]" />
            {item.label}
          </NavLink>
        ))}
      </nav>

      <div className="border-t border-black/5 p-4">
        <button
          onClick={handleLogout}
          className="flex w-full items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium text-danger hover:bg-danger/5"
        >
          <LogOut className="h-[18px] w-[18px]" />
          Sign out
        </button>
      </div>
    </div>
  )

  return (
    <div className="flex min-h-screen bg-canvas">
      {/* Desktop sidebar */}
      <aside className="hidden w-64 shrink-0 border-r border-black/5 bg-white lg:block">{SidebarContent}</aside>

      {/* Mobile sidebar */}
      <AnimatePresence>
        {sidebarOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 z-40 bg-ink/40 lg:hidden"
              onClick={() => setSidebarOpen(false)}
            />
            <motion.aside
              initial={{ x: -280 }} animate={{ x: 0 }} exit={{ x: -280 }} transition={{ type: 'tween', duration: 0.25 }}
              className="fixed inset-y-0 left-0 z-50 w-64 bg-white lg:hidden"
            >
              {SidebarContent}
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      <div className="flex min-w-0 flex-1 flex-col">
        {/* Topbar */}
        <header className="glass-surface sticky top-0 z-30 flex items-center justify-between px-4 py-3 lg:px-8">
          <button className="text-ink lg:hidden" onClick={() => setSidebarOpen(true)} aria-label="Open menu">
            {sidebarOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>

          <div className="hidden lg:block">
            <p className="text-sm text-muted-foreground">{ROLE_LABELS[user.role]}</p>
          </div>

          <div className="flex items-center gap-3">
            <button className="relative rounded-full p-2 text-ink/70 hover:bg-forest/5" aria-label="Notifications">
              <Bell className="h-5 w-5" />
              <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-danger" />
            </button>

            <div className="relative">
              <button
                onClick={() => setProfileOpen((v) => !v)}
                className="flex items-center gap-2 rounded-xl px-2 py-1.5 hover:bg-forest/5"
              >
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-primary text-sm font-semibold text-white">
                  {initials(user.first_name, user.last_name)}
                </div>
                <span className="hidden text-sm font-medium text-ink sm:block">{user.first_name}</span>
                <ChevronDown className="hidden h-4 w-4 text-muted-foreground sm:block" />
              </button>

              <AnimatePresence>
                {profileOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
                    className="absolute right-0 mt-2 w-56 rounded-xl border border-black/5 bg-white p-2 shadow-glass"
                  >
                    <p className="px-3 py-2 text-sm font-medium text-ink">{user.full_name}</p>
                    <p className="px-3 pb-2 text-xs text-muted-foreground">{user.email}</p>
                    <hr className="my-1 border-black/5" />
                    <button
                      onClick={handleLogout}
                      className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-danger hover:bg-danger/5"
                    >
                      <LogOut className="h-4 w-4" /> Sign out
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </header>

        <main className="flex-1 p-4 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
