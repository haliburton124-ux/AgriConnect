import { create } from 'zustand'

const SHOW_DELAY_MS = 200
const EFFECTS_WAIT_MS = 160
const SETTLE_MS = 120
const MIN_VISIBLE_MS = 300

export type LoadingMode = 'page' | 'inline'

interface LoadingState {
  visible: boolean
  error: string | null
  mode: LoadingMode
  outletKey: number
}

interface LoadingActions {
  startNavigation: (options?: { fromClick?: boolean }) => void
  retry: () => void
}

export const useLoadingStore = create<LoadingState & LoadingActions>(() => ({
  visible: false,
  error: null,
  mode: 'page',
  outletKey: 0,
  startNavigation: startNavigation,
  retry: retryNavigation,
}))

let generation = 0
let pending = 0
let navActive = false
let awaitingPage = false
let showTimer: ReturnType<typeof setTimeout> | null = null
let idleTimer: ReturnType<typeof setTimeout> | null = null
let hideTimer: ReturnType<typeof setTimeout> | null = null
let shownAt = 0

function clearTimer(timer: ReturnType<typeof setTimeout> | null) {
  if (timer) clearTimeout(timer)
  return null
}

function clearAllTimers() {
  showTimer = clearTimer(showTimer)
  idleTimer = clearTimer(idleTimer)
  hideTimer = clearTimer(hideTimer)
}

function scheduleShow(mode: LoadingMode) {
  const { visible } = useLoadingStore.getState()
  if (visible) {
    useLoadingStore.setState({ mode })
    return
  }
  if (showTimer) return
  showTimer = setTimeout(() => {
    showTimer = null
    shownAt = Date.now()
    useLoadingStore.setState({ visible: true, error: null, mode })
  }, SHOW_DELAY_MS)
}

function armIdleWatch() {
  idleTimer = clearTimer(idleTimer)
  const delay = awaitingPage ? EFFECTS_WAIT_MS : SETTLE_MS
  idleTimer = setTimeout(() => {
    idleTimer = null
    if (pending > 0) return
    awaitingPage = false
    navActive = false
    hideLoader()
  }, delay)
}

function hideLoader() {
  if (pending > 0) return
  const { visible } = useLoadingStore.getState()
  if (!visible) {
    showTimer = clearTimer(showTimer)
    return
  }
  hideTimer = clearTimer(hideTimer)
  const wait = Math.max(0, MIN_VISIBLE_MS - (Date.now() - shownAt))
  hideTimer = setTimeout(() => {
    hideTimer = null
    if (pending > 0) return
    useLoadingStore.setState({ visible: false })
  }, wait)
}

export function startNavigation(options?: { fromClick?: boolean }) {
  // A click already opened this wave; the following route change should not reset in-flight GETs.
  if (navActive && !options?.fromClick) return

  generation += 1
  pending = 0
  navActive = true
  awaitingPage = true
  hideTimer = clearTimer(hideTimer)
  useLoadingStore.setState({ error: null, mode: 'page' })
  scheduleShow('page')
  armIdleWatch()
}

export function beginTrackedRequest(): number {
  pending += 1
  awaitingPage = false
  idleTimer = clearTimer(idleTimer)
  hideTimer = clearTimer(hideTimer)
  scheduleShow(navActive ? 'page' : 'inline')
  return generation
}

export function endTrackedRequest(gen: number, failed?: string) {
  if (gen !== generation) return
  pending = Math.max(0, pending - 1)

  if (failed && navActive) {
    clearAllTimers()
    pending = 0
    navActive = false
    awaitingPage = false
    useLoadingStore.setState({
      visible: false,
      error: failed,
      mode: 'page',
    })
    return
  }

  if (pending === 0) armIdleWatch()
}

export function isNavigationPending() {
  return navActive
}

function retryNavigation() {
  useLoadingStore.setState((state) => ({
    error: null,
    outletKey: state.outletKey + 1,
  }))
  startNavigation()
}

export function shouldSkipLoader(url?: string, skipLoader?: boolean) {
  if (skipLoader) return true
  if (!url) return false
  return /realtime\/snapshot|unread-count|\/notifications(\?|$|\/)/.test(url)
}
