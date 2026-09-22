import { useState } from 'react'
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import {
  Sprout, Menu, X, ChevronDown, LogOut, MapPin, AlertTriangle, Calendar,
  FileText, Settings as SettingsIcon, Gift, User,
} from 'lucide-react'
import { cn, initials } from '@/lib/utils'
import { useAuthStore, ROLE_HOME } from '@/store/authStore'
import { authService } from '@/services/authService'
import { communityService } from '@/services/communityService'
import { toast } from 'sonner'
import { NotificationBell } from '@/components/community/NotificationPanel'
import { MessengerBell } from '@/components/messages/MessengerPanel'
import { PostDetailModal } from '@/components/community/PostDetailModal'
import { useNotifications } from '@/hooks/useNotifications'
import type { CommunityPost } from '@/types'

const NAV_LINKS = [
  { label: 'Home', to: '/' },
  { label: 'About', to: '/#about' },
  { label: 'Services', to: '/#services' },
  { label: 'Resources', to: '/knowledge-center' },
  { label: 'Updates', to: '/#updates' },
  { label: 'Contact', to: '/contact' },
] as const

const ACCOUNT_LINKS = [
  { label: 'My Profile', path: '/farmer/profile', icon: User },
  { label: 'My Farms', path: '/farmer/farms', icon: MapPin },
  { label: 'My Reports', path: '/farmer/incidents', icon: AlertTriangle },
  { label: 'Appointments', path: '/farmer/appointments', icon: Calendar },
  { label: 'Programs', path: '/farmer/programs', icon: Gift },
  { label: 'Documents', path: '/farmer/documents', icon: FileText },
  { label: 'Settings', path: '/farmer/settings', icon: SettingsIcon },
]

function isNavActive(to: string, pathname: string, hash: string) {
  if (to === '/') return pathname === '/' && !hash
  if (to.startsWith('/#')) return pathname === '/' && hash === to.slice(1)
  return pathname === to
}

export function PublicNavbar() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const [profileOpen, setProfileOpen] = useState(false)
  const [notificationsOpen, setNotificationsOpen] = useState(false)
  const [messagesOpen, setMessagesOpen] = useState(false)
  const [notificationPost, setNotificationPost] = useState<CommunityPost | null>(null)
  const { user, isAuthenticated, clearSession } = useAuthStore()
  const { unreadCount, notifications, loading, load, markAsRead, markAllAsRead } = useNotifications()
  const navigate = useNavigate()
  const location = useLocation()

  const handleLogout = async () => {
    try {
      await authService.logout()
    } catch {
      // proceed with local logout regardless
    } finally {
      clearSession()
      toast.success("You've been logged out.")
      navigate('/')
    }
  }

  const handleOpenNotificationPost = async (postId: number) => {
    try {
      const { data } = await communityService.get(postId)
      setNotificationPost(data.data)
    } catch {
      toast.error('Could not open this advisory.')
    }
  }

  const dashboardPath = user ? (ROLE_HOME[user.role] ?? '/') : '/login'

  return (
    <header className="sticky top-0 z-50 border-b border-slate-100 bg-white/95 backdrop-blur-md">
      <div className="mx-auto flex h-[72px] max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link to="/" className="flex items-center gap-2.5">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#16A34A] text-white">
            <Sprout className="h-5 w-5" />
          </div>
          <span className="text-[17px] font-bold tracking-tight text-[#0F172A]">AgriConnect</span>
        </Link>

        <nav className="hidden items-center gap-1 lg:flex">
          {NAV_LINKS.map((link) => {
            const active = isNavActive(link.to, location.pathname, location.hash)
            return (
              <Link
                key={link.label}
                to={link.to}
                className={cn(
                  'rounded-lg px-3 py-2 text-[13px] font-medium transition-colors',
                  active ? 'bg-[#DCFCE7] text-[#166534]' : 'text-[#64748B] hover:bg-slate-50 hover:text-[#0F172A]',
                )}
              >
                {link.label}
              </Link>
            )
          })}
        </nav>

        <div className="hidden items-center gap-2 lg:flex">
          {!isAuthenticated ? (
            <>
              <Link
                to="/login"
                className="rounded-xl px-4 py-2 text-sm font-semibold text-[#0F172A] transition-colors hover:bg-slate-50"
              >
                Log In
              </Link>
              <Link
                to="/register"
                className="rounded-xl bg-[#16A34A] px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-[#15803d]"
              >
                Get Started
              </Link>
            </>
          ) : (
            <>
              <NotificationBell
                unreadCount={unreadCount}
                open={notificationsOpen}
                onToggle={() => { setNotificationsOpen((v) => !v); setProfileOpen(false); setMessagesOpen(false) }}
                onOpenPost={handleOpenNotificationPost}
                onOpenMessage={() => {
                  setNotificationsOpen(false)
                  navigate(user?.role === 'farmer' ? '/farmer/messages' : '/technician/messages')
                }}
                notifications={notifications}
                loading={loading}
                onLoad={load}
                onMarkAsRead={markAsRead}
                onMarkAllAsRead={markAllAsRead}
              />
              <MessengerBell
                open={messagesOpen}
                onToggle={() => { setMessagesOpen((v) => !v); setProfileOpen(false); setNotificationsOpen(false) }}
                messagesPath={user?.role === 'farmer' ? '/farmer/messages' : '/technician/messages'}
              />
              <div className="relative">
                <button
                  type="button"
                  onClick={() => { setProfileOpen((v) => !v); setNotificationsOpen(false); setMessagesOpen(false) }}
                  className="flex items-center gap-2 rounded-full py-1.5 pl-1.5 pr-3 hover:bg-slate-50"
                >
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#16A34A] text-xs font-semibold text-white">
                    {user ? initials(user.first_name, user.last_name) : ''}
                  </div>
                  <ChevronDown className="h-4 w-4 text-[#64748B]" />
                </button>
                <AnimatePresence>
                  {profileOpen && (
                    <>
                      <div className="fixed inset-0 z-40" onClick={() => setProfileOpen(false)} />
                      <motion.div
                        initial={{ opacity: 0, y: -8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -8 }}
                        className="absolute right-0 z-50 mt-2 w-64 rounded-2xl border border-slate-100 bg-white p-2 shadow-lg"
                      >
                        <div className="px-3 py-2.5">
                          <p className="text-sm font-semibold text-[#0F172A]">{user?.full_name}</p>
                          <p className="text-xs text-[#64748B]">{user?.email}</p>
                        </div>
                        <hr className="my-1 border-slate-100" />
                        {user?.role === 'farmer' ? ACCOUNT_LINKS.map((link) => (
                          <Link
                            key={link.path}
                            to={link.path}
                            onClick={() => setProfileOpen(false)}
                            className={cn(
                              'flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm hover:bg-[#DCFCE7] hover:text-[#166534]',
                              location.pathname === link.path ? 'bg-[#DCFCE7] text-[#166534]' : 'text-slate-700',
                            )}
                          >
                            <link.icon className="h-4 w-4" /> {link.label}
                          </Link>
                        )) : (
                          <Link
                            to={dashboardPath}
                            onClick={() => setProfileOpen(false)}
                            className="flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm text-slate-700 hover:bg-[#DCFCE7] hover:text-[#166534]"
                          >
                            Open dashboard
                          </Link>
                        )}
                        <hr className="my-1 border-slate-100" />
                        <button
                          type="button"
                          onClick={handleLogout}
                          className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm text-red-600 hover:bg-red-50"
                        >
                          <LogOut className="h-4 w-4" /> Sign out
                        </button>
                      </motion.div>
                    </>
                  )}
                </AnimatePresence>
              </div>
            </>
          )}
        </div>

        <div className="flex items-center gap-1 lg:hidden">
          {isAuthenticated && (
            <>
              <NotificationBell
                unreadCount={unreadCount}
                open={notificationsOpen}
                onToggle={() => { setNotificationsOpen((v) => !v); setProfileOpen(false); setMessagesOpen(false) }}
                onOpenPost={handleOpenNotificationPost}
                onOpenMessage={() => {
                  setNotificationsOpen(false)
                  setMobileOpen(false)
                  navigate('/farmer/messages')
                }}
                notifications={notifications}
                loading={loading}
                onLoad={load}
                onMarkAsRead={markAsRead}
                onMarkAllAsRead={markAllAsRead}
              />
              <MessengerBell
                open={messagesOpen}
                onToggle={() => { setMessagesOpen((v) => !v); setProfileOpen(false); setNotificationsOpen(false) }}
                messagesPath="/farmer/messages"
              />
            </>
          )}
          <button type="button" className="p-2 text-[#0F172A]" onClick={() => setMobileOpen((v) => !v)} aria-label="Toggle menu">
            {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden border-t border-slate-100 bg-white lg:hidden"
          >
            <div className="max-h-[70vh] space-y-1 overflow-y-auto px-4 py-4">
              {NAV_LINKS.map((link) => (
                <NavLink
                  key={link.label}
                  to={link.to}
                  end={link.to === '/'}
                  onClick={() => setMobileOpen(false)}
                  className={() =>
                    cn(
                      'block rounded-xl px-3 py-2.5 text-sm font-medium',
                      isNavActive(link.to, location.pathname, location.hash)
                        ? 'bg-[#DCFCE7] text-[#166534]'
                        : 'text-slate-700 hover:bg-slate-50',
                    )
                  }
                >
                  {link.label}
                </NavLink>
              ))}
              <hr className="my-2 border-slate-100" />
              {!isAuthenticated ? (
                <div className="flex gap-2 px-1 pt-1">
                  <Link to="/login" onClick={() => setMobileOpen(false)} className="flex-1 rounded-xl border border-slate-200 py-2.5 text-center text-sm font-semibold text-[#0F172A]">Log In</Link>
                  <Link to="/register" onClick={() => setMobileOpen(false)} className="flex-1 rounded-xl bg-[#16A34A] py-2.5 text-center text-sm font-semibold text-white">Get Started</Link>
                </div>
              ) : (
                <>
                  {user?.role === 'farmer' && ACCOUNT_LINKS.map((link) => (
                    <Link
                      key={link.path}
                      to={link.path}
                      onClick={() => setMobileOpen(false)}
                      className="flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm text-slate-700 hover:bg-slate-50"
                    >
                      <link.icon className="h-4 w-4" /> {link.label}
                    </Link>
                  ))}
                  <button type="button" onClick={handleLogout} className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm text-red-600">
                    <LogOut className="h-4 w-4" /> Sign out
                  </button>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <PostDetailModal
        post={notificationPost}
        onClose={() => setNotificationPost(null)}
        onUpdate={setNotificationPost}
        enableEngagement={isAuthenticated}
      />
    </header>
  )
}
