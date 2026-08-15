import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ChevronLeft, MessageCircle, MessageSquare, Search, Send, X,
} from 'lucide-react'
import { cn, formatDateTime, initials } from '@/lib/utils'
import { messageService } from '@/services/messageService'
import { useAuthStore } from '@/store/authStore'
import type { ChatMessage, MessageThread } from '@/types'

function formatRelativeTime(date: string): string {
  const diffMs = Date.now() - new Date(date).getTime()
  const diffMin = Math.floor(diffMs / 60_000)
  if (diffMin < 1) return 'Just now'
  if (diffMin < 60) return `${diffMin}m`
  const diffHr = Math.floor(diffMin / 60)
  if (diffHr < 24) return `${diffHr}h`
  const diffDay = Math.floor(diffHr / 24)
  if (diffDay < 7) return `${diffDay}d`
  return new Date(date).toLocaleDateString('en-PH', { month: 'short', day: 'numeric' })
}

interface MessengerPanelProps {
  open: boolean
  onClose: () => void
  messagesPath: string
}

export function MessengerPanel({ open, onClose, messagesPath }: MessengerPanelProps) {
  const { user } = useAuthStore()
  const [threads, setThreads] = useState<MessageThread[] | null>(null)
  const [activePartnerId, setActivePartnerId] = useState<number | null>(null)
  const [conversation, setConversation] = useState<ChatMessage[] | null>(null)
  const [draft, setDraft] = useState('')
  const [sending, setSending] = useState(false)
  const [loadingThreads, setLoadingThreads] = useState(false)
  const [search, setSearch] = useState('')
  const scrollRef = useRef<HTMLDivElement>(null)

  const loadThreads = () => {
    setLoadingThreads(true)
    messageService.threads()
      .then((res) => setThreads(res.data.data))
      .finally(() => setLoadingThreads(false))
  }

  useEffect(() => {
    if (!open) {
      setActivePartnerId(null)
      setConversation(null)
      setDraft('')
      setSearch('')
      return
    }
    loadThreads()
  }, [open])

  useEffect(() => {
    if (!open || activePartnerId === null) {
      setConversation(null)
      return
    }
    messageService.conversation(activePartnerId).then((res) => setConversation(res.data.data))
  }, [open, activePartnerId])

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' })
  }, [conversation, activePartnerId])

  const activeThread = threads?.find((thread) => thread.partner.id === activePartnerId)

  const handleBackToList = () => {
    setActivePartnerId(null)
    setConversation(null)
    setDraft('')
    loadThreads()
  }

  const handleSend = async () => {
    if (!draft.trim() || activePartnerId === null) return
    setSending(true)
    try {
      await messageService.send(activePartnerId, draft.trim())
      setDraft('')
      const res = await messageService.conversation(activePartnerId)
      setConversation(res.data.data)
      loadThreads()
    } finally {
      setSending(false)
    }
  }

  const filteredThreads = (threads ?? []).filter((thread) => {
    if (!search.trim()) return true
    const name = `${thread.partner.first_name} ${thread.partner.last_name}`.toLowerCase()
    return name.includes(search.trim().toLowerCase())
  })

  if (!open) return null

  return (
    <>
      <div className="fixed inset-0 z-40" onClick={onClose} aria-hidden="true" />
      <div className="absolute right-0 z-50 mt-2 flex h-[min(32rem,78vh)] w-[min(22rem,calc(100vw-1.5rem))] flex-col overflow-hidden rounded-2xl border border-black/5 bg-white shadow-glass sm:w-96">
        <AnimatePresence mode="wait" initial={false}>
          {activePartnerId === null ? (
            <motion.div
              key="list"
              initial={{ opacity: 0, x: -12 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -12 }}
              transition={{ duration: 0.15 }}
              className="flex min-h-0 flex-1 flex-col"
            >
              <div className="flex items-center justify-between border-b border-black/5 px-4 py-3">
                <p className="text-lg font-bold text-ink">Chats</p>
                <button
                  type="button"
                  onClick={onClose}
                  className="rounded-full p-1.5 text-muted-foreground transition-colors hover:bg-black/5 hover:text-ink"
                  aria-label="Close chats"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="px-3 py-2">
                <div className="relative">
                  <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <input
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search Messenger"
                    className="h-10 w-full rounded-full bg-muted/80 pl-9 pr-3 text-sm text-ink placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forest/20"
                  />
                </div>
              </div>

              <div className="min-h-0 flex-1 overflow-y-auto">
                {loadingThreads && threads === null ? (
                  <div className="space-y-2 p-3">
                    {[1, 2, 3, 4].map((i) => (
                      <div key={i} className="skeleton h-14 w-full rounded-xl" />
                    ))}
                  </div>
                ) : filteredThreads.length === 0 ? (
                  <div className="flex flex-col items-center gap-2 px-4 py-12 text-center">
                    <MessageCircle className="h-7 w-7 text-forest-light" />
                    <p className="text-sm font-medium text-ink">No conversations yet</p>
                    <p className="text-xs text-muted-foreground">Messages with your contacts will show up here.</p>
                  </div>
                ) : (
                  <ul>
                    {filteredThreads.map((thread) => {
                      const preview = thread.last_message
                        ? (thread.last_message.sender_id === user?.id
                            ? `You: ${thread.last_message.body}`
                            : thread.last_message.body)
                        : 'No messages yet'

                      return (
                        <li key={thread.partner.id}>
                          <button
                            type="button"
                            onClick={() => setActivePartnerId(thread.partner.id)}
                            className="flex w-full items-center gap-3 px-3 py-2.5 text-left transition-colors hover:bg-forest/[0.04]"
                          >
                            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-gradient-primary text-sm font-semibold text-white">
                              {initials(thread.partner.first_name, thread.partner.last_name)}
                            </div>
                            <div className="min-w-0 flex-1">
                              <div className="flex items-center justify-between gap-2">
                                <p className="truncate text-sm font-semibold text-ink">
                                  {thread.partner.first_name} {thread.partner.last_name}
                                </p>
                                {thread.last_message && (
                                  <span className="shrink-0 text-[11px] text-muted-foreground">
                                    {formatRelativeTime(thread.last_message.created_at)}
                                  </span>
                                )}
                              </div>
                              <div className="mt-0.5 flex items-center justify-between gap-2">
                                <p className="truncate text-xs text-muted-foreground">{preview}</p>
                                {thread.unread_count > 0 && (
                                  <span className="flex h-5 min-w-5 shrink-0 items-center justify-center rounded-full bg-[#0084ff] px-1.5 text-[10px] font-bold text-white">
                                    {thread.unread_count > 9 ? '9+' : thread.unread_count}
                                  </span>
                                )}
                              </div>
                            </div>
                          </button>
                        </li>
                      )
                    })}
                  </ul>
                )}
              </div>

              <div className="border-t border-black/5 px-4 py-3">
                <Link
                  to={messagesPath}
                  onClick={onClose}
                  className="block text-center text-sm font-semibold text-[#0084ff] hover:underline"
                >
                  See all in Messenger
                </Link>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="chat"
              initial={{ opacity: 0, x: 12 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 12 }}
              transition={{ duration: 0.15 }}
              className="flex min-h-0 flex-1 flex-col"
            >
              <div className="flex items-center gap-2 border-b border-black/5 px-2 py-2">
                <button
                  type="button"
                  onClick={handleBackToList}
                  className="rounded-full p-2 text-[#0084ff] transition-colors hover:bg-[#0084ff]/10"
                  aria-label="Back to chats"
                >
                  <ChevronLeft className="h-5 w-5" />
                </button>
                <div className="flex min-w-0 flex-1 items-center gap-2">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-primary text-xs font-semibold text-white">
                    {activeThread
                      ? initials(activeThread.partner.first_name, activeThread.partner.last_name)
                      : '?'}
                  </div>
                  <p className="truncate text-sm font-semibold text-ink">
                    {activeThread
                      ? `${activeThread.partner.first_name} ${activeThread.partner.last_name}`
                      : 'Conversation'}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleBackToList}
                  className="rounded-full p-2 text-muted-foreground transition-colors hover:bg-black/5 hover:text-ink"
                  aria-label="Close conversation"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div ref={scrollRef} className="min-h-0 flex-1 space-y-2 overflow-y-auto bg-[#f0f2f5] p-3">
                {conversation === null ? (
                  <div className="space-y-2">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="skeleton h-10 w-2/3 rounded-2xl" />
                    ))}
                  </div>
                ) : conversation.length === 0 ? (
                  <div className="flex h-full items-center justify-center py-8 text-center">
                    <p className="text-xs text-muted-foreground">Say hello to start the conversation.</p>
                  </div>
                ) : (
                  conversation.map((msg) => {
                    const isMine = msg.sender_id === user?.id
                    return (
                      <div key={msg.id} className={cn('flex', isMine ? 'justify-end' : 'justify-start')}>
                        <div
                          className={cn(
                            'max-w-[82%] rounded-2xl px-3 py-2 text-sm shadow-sm',
                            isMine
                              ? 'rounded-br-md bg-[#0084ff] text-white'
                              : 'rounded-bl-md bg-white text-ink',
                          )}
                        >
                          <p className="whitespace-pre-wrap break-words">{msg.body}</p>
                          <p className={cn('mt-1 text-[10px]', isMine ? 'text-white/75' : 'text-muted-foreground')}>
                            {formatDateTime(msg.created_at)}
                          </p>
                        </div>
                      </div>
                    )
                  })
                )}
              </div>

              <div className="border-t border-black/5 bg-white p-3">
                <div className="flex items-center gap-2">
                  <input
                    value={draft}
                    onChange={(e) => setDraft(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault()
                        handleSend()
                      }
                    }}
                    placeholder="Aa"
                    className="h-10 flex-1 rounded-full bg-muted/60 px-4 text-sm text-ink placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0084ff]/20"
                  />
                  <button
                    type="button"
                    onClick={handleSend}
                    disabled={sending || !draft.trim()}
                    className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#0084ff] text-white transition-transform hover:scale-105 disabled:opacity-50"
                    aria-label="Send message"
                  >
                    <Send className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </>
  )
}

export function MessengerBell({
  open,
  onToggle,
  tone = 'default',
  messagesPath,
}: {
  open: boolean
  onToggle: () => void
  tone?: 'default' | 'transparent'
  messagesPath: string
}) {
  const [unreadTotal, setUnreadTotal] = useState(0)

  useEffect(() => {
    messageService.threads()
      .then((res) => {
        const total = res.data.data.reduce((sum, thread) => sum + thread.unread_count, 0)
        setUnreadTotal(total)
      })
      .catch(() => {})
  }, [open])

  return (
    <div className="relative">
      <button
        type="button"
        onClick={onToggle}
        className={cn(
          'relative rounded-full p-2.5 transition-colors',
          tone === 'transparent'
            ? 'text-white hover:bg-white/10'
            : 'text-ink/70 hover:bg-forest/5',
        )}
        aria-label="Messages"
        aria-expanded={open}
      >
        <MessageSquare className="h-5 w-5" />
        {unreadTotal > 0 && (
          <span className="absolute right-1.5 top-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-[#0084ff] px-1 text-[10px] font-bold text-white">
            {unreadTotal > 9 ? '9+' : unreadTotal}
          </span>
        )}
      </button>
      <MessengerPanel open={open} onClose={() => onToggle()} messagesPath={messagesPath} />
    </div>
  )
}
