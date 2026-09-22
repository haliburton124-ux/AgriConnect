import { useEffect, useRef } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { AgriSpinner } from '@/components/ui/AgriSpinner'
import { ErrorState } from '@/components/ui/ErrorState'
import { startNavigation, useLoadingStore } from '@/store/loadingStore'
import { cn } from '@/lib/utils'

function overlayPlacement(pathname: string) {
  if (/^\/(technician|mao|ppo|admin)(\/|$)/.test(pathname)) {
    return 'inset-x-0 bottom-0 top-[3.65rem] lg:left-64'
  }
  if (/^\/(login|register|verify-otp|forgot-password|reset-password)/.test(pathname)) {
    return 'inset-0'
  }
  return 'inset-x-0 bottom-0 top-[4.5rem] sm:top-[4.75rem]'
}

export function NavigationLoaderRoot() {
  const location = useLocation()
  const previous = useRef(`${location.pathname}${location.search}`)

  useEffect(() => {
    const onClick = (event: MouseEvent) => {
      if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) {
        return
      }
      const anchor = (event.target as HTMLElement | null)?.closest('a[href]')
      if (!anchor) return
      if (anchor.getAttribute('target') === '_blank' || anchor.hasAttribute('download')) return

      const href = anchor.getAttribute('href')
      if (!href || href.startsWith('#') || href.startsWith('mailto:') || href.startsWith('tel:')) return

      let url: URL
      try {
        url = new URL(href, window.location.origin)
      } catch {
        return
      }
      if (url.origin !== window.location.origin) return
      if (url.pathname === window.location.pathname && url.search === window.location.search) return

      startNavigation({ fromClick: true })
    }

    document.addEventListener('click', onClick, true)
    return () => document.removeEventListener('click', onClick, true)
  }, [])

  useEffect(() => {
    const key = `${location.pathname}${location.search}`
    if (previous.current === key) return
    previous.current = key
    startNavigation()
  }, [location.pathname, location.search])

  return <PageLoadingOverlay />
}

function PageLoadingOverlay() {
  const { pathname } = useLocation()
  const visible = useLoadingStore((s) => s.visible)
  const error = useLoadingStore((s) => s.error)
  const mode = useLoadingStore((s) => s.mode)
  const retry = useLoadingStore((s) => s.retry)
  const open = Boolean(visible || error)
  const compact = mode === 'inline' && !error

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          key="agri-loader"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2, ease: 'easeOut' }}
          className={cn('fixed z-[35] flex items-center justify-center p-4', overlayPlacement(pathname))}
          role="alert"
          aria-live="polite"
          aria-busy={visible}
        >
          <div
            className={cn(
              'absolute inset-0',
              compact ? 'bg-canvas/40' : 'bg-canvas/70 backdrop-blur-[2px]',
            )}
          />
          <div className="relative w-full max-w-sm">
            {error ? (
              <ErrorState message={error} onRetry={retry} />
            ) : (
              <div
                className={cn(
                  'mx-auto flex flex-col items-center rounded-2xl border border-black/[0.03] bg-white shadow-card',
                  compact ? 'px-5 py-4' : 'px-8 py-7',
                )}
              >
                <AgriSpinner size={compact ? 'sm' : 'md'} />
                <p className={cn('font-medium text-ink', compact ? 'mt-2 text-xs' : 'mt-3 text-sm')}>
                  Loading…
                </p>
                {!compact && (
                  <p className="mt-1 text-xs text-muted-foreground">Please wait while we prepare this page.</p>
                )}
              </div>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export function NavigationOutlet() {
  const location = useLocation()
  const outletKey = useLoadingStore((s) => s.outletKey)
  return <Outlet key={`${location.pathname}${location.search}-${outletKey}`} />
}
