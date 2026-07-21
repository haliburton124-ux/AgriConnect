import { useEffect, useState } from 'react'
import { Link, NavLink, useNavigate, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Sprout, Menu, X, MessageSquare, ChevronDown, LogOut, MapPin, AlertTriangle, Calendar, FileText, Settings as SettingsIcon, Newspaper, BookOpen, Gift, Megaphone } from 'lucide-react'
import { cn, initials } from '@/lib/utils'
import { useAuthStore } from '@/store/authStore'
import { authService } from '@/services/authService'
import { communityService } from '@/services/communityService'
import { PUBLIC_NAV_LINKS } from '@/config/farmerPublicNav'
import { toast } from 'sonner'
import { NotificationBell } from '@/components/community/NotificationPanel'
import { PostDetailModal } from '@/components/community/PostDetailModal'
import { useNotifications } from '@/hooks/useNotifications'
import type { CommunityPost } from '@/types'

const ACCOUNT_LINKS = [
  { label: 'My Farms', path: '/farmer/farms', icon: MapPin },
  { label: 'My Reports', path: '/farmer/incidents', icon: AlertTriangle },
  { label: 'Appointments', path: '/farmer/appointments', icon: Calendar },
  { label: 'Messages', path: '/farmer/messages', icon: MessageSquare },
  { label: 'News Feed', path: '/farmer/feed', icon: Newspaper },
  { label: 'Knowledge Hub', path: '/farmer/knowledge', icon: BookOpen },
  { label: 'Programs', path: '/farmer/programs', icon: Gift },
  { label: 'Announcements', path: '/farmer/announcements', icon: Megaphone },
  { label: 'Documents', path: '/farmer/documents', icon: FileText },
  { label: 'Settings', path: '/farmer/settings', icon: SettingsIcon },
]

interface FarmerNavbarProps {
  /** True only on the home page, where the navbar starts transparent over the hero. */
  transparentAtTop?: boolean
}

const navLinkClass = (isActive: boolean, isTransparent: boolean) =>
  cn(
    'rounded-full px-3 py-2 text-sm font-medium transition-colors lg:px-4',
    isActive
      ? isTransparent ? 'bg-white/20 text-white' : 'bg-forest/10 text-forest'
      : isTransparent ? 'text-white/90 hover:bg-white/10' : 'text-ink/70 hover:bg-forest/5 hover:text-forest',
  )

export function FarmerNavbar({ transparentAtTop = false }: FarmerNavbarProps) {
  const [scrolled, setScrolled] = useState(!transparentAtTop)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [profileOpen, setProfileOpen] = useState(false)
  const [notificationsOpen, setNotificationsOpen] = useState(false)
  const [notificationPost, setNotificationPost] = useState<CommunityPost | null>(null)
  const { user, isAuthenticated, clearSession } = useAuthStore()
  const { unreadCount, notifications, loading, load, markAsRead, markAllAsRead } = useNotifications()
  const navigate = useNavigate()
  const location = useLocation()

  useEffect(() => {
    if (!transparentAtTop) return
    const onScroll = () => setScrolled(window.scrollY > 64)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [transparentAtTop])

  const isTransparent = transparentAtTop && !scrolled

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

  const textTone = isTransparent ? 'text-white' : 'text-ink'
  const mutedTone = isTransparent ? 'text-white/75' : 'text-ink/60'

  return (
    <header
      className={cn(
        'fixed inset-x-0 top-0 z-50 transition-all duration-300',
        isTransparent ? 'bg-transparent py-5' : 'glass-surface py-3 shadow-soft',
      )}
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link to="/" className="flex items-center gap-2.5">
          <div className={cn('flex h-10 w-10 items-center justify-center rounded-xl shadow-card', isTransparent ? 'bg-white/15 backdrop-blur-sm' : 'bg-gradient-primary')}>
            <Sprout className="h-5 w-5 text-white" />
          </div>
          <div>
            <p className={cn('text-base font-bold leading-none', textTone)}>AgriConnect</p>
            <p className={cn('mt-1 text-[11px]', mutedTone)}>Ilocos Norte</p>
          </div>
        </Link>

        <nav className="hidden items-center gap-0.5 xl:flex">
          {PUBLIC_NAV_LINKS.map((link) => (
            <NavLink
              key={link.path}
              to={link.path}
              end={link.path === '/'}
              className={({ isActive }) => navLinkClass(isActive, isTransparent)}
            >
              {link.label}
            </NavLink>
          ))}
        </nav>

        <div className="hidden items-center gap-2 lg:flex">
          {!isAuthenticated ? (
            <>
              <Link
                to="/login"
                className={cn(
                  'rounded-full px-5 py-2.5 text-sm font-semibold transition-colors',
                  isTransparent ? 'text-white hover:bg-white/10' : 'text-ink hover:bg-forest/5',
                )}
              >
                Sign In
              </Link>
              <Link
                to="/register"
                className="rounded-full bg-gradient-primary px-5 py-2.5 text-sm font-semibold text-white shadow-card transition-transform hover:scale-105"
              >
                Register
              </Link>
            </>
          ) : (
            <>
              <NotificationBell
                unreadCount={unreadCount}
                open={notificationsOpen}
                onToggle={() => { setNotificationsOpen((v) => !v); setProfileOpen(false) }}
                onOpenPost={handleOpenNotificationPost}
                tone={isTransparent ? 'transparent' : 'default'}
                notifications={notifications}
                loading={loading}
                onLoad={load}
                onMarkAsRead={markAsRead}
                onMarkAllAsRead={markAllAsRead}
              />
              <Link
                to="/farmer/messages"
                className={cn('rounded-full p-2.5 transition-colors', isTransparent ? 'text-white hover:bg-white/10' : 'text-ink/70 hover:bg-forest/5')}
                aria-label="Messages"
              >
                <MessageSquare className="h-5 w-5" />
              </Link>

              <div className="relative">
                <button
                  type="button"
                  onClick={() => { setProfileOpen((v) => !v); setNotificationsOpen(false) }}
                  className={cn('flex items-center gap-2 rounded-full py-1.5 pl-1.5 pr-3 transition-colors', isTransparent ? 'hover:bg-white/10' : 'hover:bg-forest/5')}
                >
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-primary text-xs font-semibold text-white">
                    {user ? initials(user.first_name, user.last_name) : ''}
                  </div>
                  <ChevronDown className={cn('h-4 w-4', mutedTone)} />
                </button>

                <AnimatePresence>
                  {profileOpen && (
                    <>
                      <div className="fixed inset-0 z-40" onClick={() => setProfileOpen(false)} />
                      <motion.div
                        initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
                        className="absolute right-0 z-50 mt-2 w-64 rounded-2xl border border-black/5 bg-white p-2 shadow-glass"
                      >
                        <div className="px-3 py-2.5">
                          <p className="text-sm font-semibold text-ink">{user?.full_name}</p>
                          <p className="text-xs text-muted-foreground">{user?.email}</p>
                        </div>
                        <hr className="my-1 border-black/5" />
                        {ACCOUNT_LINKS.map((link) => (
                          <Link
                            key={link.path}
                            to={link.path}
                            onClick={() => setProfileOpen(false)}
                            className={cn(
                              'flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm transition-colors hover:bg-forest/5 hover:text-forest',
                              location.pathname === link.path ? 'bg-forest/10 text-forest' : 'text-ink/80',
                            )}
                          >
                            <link.icon className="h-4 w-4" /> {link.label}
                          </Link>
                        ))}
                        <hr className="my-1 border-black/5" />
                        <button
                          type="button"
                          onClick={handleLogout}
                          className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm text-danger hover:bg-danger/5"
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

        <button
          type="button"
          className={cn('lg:hidden', isTransparent ? 'text-white' : 'text-ink')}
          onClick={() => setMobileOpen((v) => !v)}
          aria-label="Toggle menu"
        >
          {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden bg-white shadow-glass lg:hidden"
          >
            <div className="max-h-[70vh] space-y-1 overflow-y-auto px-4 py-4">
              {PUBLIC_NAV_LINKS.map((link) => (
                <NavLink
                  key={link.path}
                  to={link.path}
                  end={link.path === '/'}
                  onClick={() => setMobileOpen(false)}
                  className={({ isActive }) =>
                    cn(
                      'block w-full rounded-xl px-3 py-2.5 text-left text-sm font-medium transition-colors',
                      isActive ? 'bg-forest/10 text-forest' : 'text-ink/80 hover:bg-forest/5',
                    )
                  }
                >
                  {link.label}
                </NavLink>
              ))}
              <hr className="my-2 border-black/5" />
              {!isAuthenticated ? (
                <div className="flex gap-2 px-1 pt-1">
                  <Link to="/login" onClick={() => setMobileOpen(false)} className="flex-1 rounded-full border-2 border-forest py-2.5 text-center text-sm font-semibold text-forest">Sign In</Link>
                  <Link to="/register" onClick={() => setMobileOpen(false)} className="flex-1 rounded-full bg-gradient-primary py-2.5 text-center text-sm font-semibold text-white">Register</Link>
                </div>
              ) : (
                <>
                  {ACCOUNT_LINKS.map((link) => (
                    <Link
                      key={link.path}
                      to={link.path}
                      onClick={() => setMobileOpen(false)}
                      className={cn(
                        'flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm hover:bg-forest/5',
                        location.pathname === link.path ? 'bg-forest/10 text-forest' : 'text-ink/80',
                      )}
                    >
                      <link.icon className="h-4 w-4" /> {link.label}
                    </Link>
                  ))}
                  <button type="button" onClick={handleLogout} className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm text-danger hover:bg-danger/5">
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
