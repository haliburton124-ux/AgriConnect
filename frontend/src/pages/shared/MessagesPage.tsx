import { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { Send, MessageCircle } from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { EmptyState } from '@/components/ui/EmptyState'
import { messageService } from '@/services/messageService'
import { useAuthStore } from '@/store/authStore'
import { cn, formatDateTime } from '@/lib/utils'
import type { ChatMessage, MessageThread } from '@/types'

export function MessagesPage() {
  const { user } = useAuthStore()
  const [threads, setThreads] = useState<MessageThread[] | null>(null)
  const [activePartnerId, setActivePartnerId] = useState<number | null>(null)
  const [conversation, setConversation] = useState<ChatMessage[] | null>(null)
  const [draft, setDraft] = useState('')
  const [sending, setSending] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)

  const loadThreads = () => {
    messageService.threads().then((res) => setThreads(res.data.data))
  }

  useEffect(loadThreads, [])

  useEffect(() => {
    if (activePartnerId === null) return
    messageService.conversation(activePartnerId).then((res) => setConversation(res.data.data))
  }, [activePartnerId])

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' })
  }, [conversation])

  const activeThread = threads?.find((t) => t.partner.id === activePartnerId)

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

  return (
    <div className="animate-fade-in">
      <div className="mb-4">
        <h1 className="text-2xl font-bold text-ink">Messages</h1>
        <p className="mt-1 text-sm text-muted-foreground">Direct conversations with your farmer/technician contacts.</p>
      </div>

      <Card className="flex h-[calc(100vh-14rem)] overflow-hidden p-0">
        {/* Thread list */}
        <div className="w-full max-w-xs shrink-0 border-r border-black/5 overflow-y-auto">
          {threads === null ? (
            <div className="space-y-2 p-4">
              {[1, 2, 3].map((i) => <div key={i} className="skeleton h-14 w-full" />)}
            </div>
          ) : threads.length === 0 ? (
            <div className="p-6">
              <EmptyState icon={MessageCircle} title="No conversations yet" description="Messages with your contacts will show up here." />
            </div>
          ) : (
            threads.map((thread) => (
              <button
                key={thread.partner.id}
                onClick={() => setActivePartnerId(thread.partner.id)}
                className={cn(
                  'flex w-full items-center gap-3 border-b border-black/5 p-4 text-left transition-colors hover:bg-forest/[0.03]',
                  activePartnerId === thread.partner.id && 'bg-forest/5',
                )}
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-primary text-xs font-semibold text-white">
                  {thread.partner.first_name[0]}{thread.partner.last_name[0]}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between">
                    <p className="truncate text-sm font-medium text-ink">{thread.partner.first_name} {thread.partner.last_name}</p>
                    {thread.unread_count > 0 && (
                      <span className="flex h-5 w-5 items-center justify-center rounded-full bg-gold text-[10px] font-bold text-white">{thread.unread_count}</span>
                    )}
                  </div>
                  <p className="truncate text-xs text-muted-foreground">{thread.last_message?.body ?? 'No messages yet'}</p>
                </div>
              </button>
            ))
          )}
        </div>

        {/* Conversation */}
        <div className="flex flex-1 flex-col">
          {activePartnerId === null ? (
            <div className="flex flex-1 items-center justify-center">
              <EmptyState icon={MessageCircle} title="Select a conversation" description="Choose a contact from the left to view your messages." />
            </div>
          ) : (
            <>
              <div className="border-b border-black/5 p-4">
                <p className="text-sm font-semibold text-ink">{activeThread?.partner.first_name} {activeThread?.partner.last_name}</p>
              </div>
              <div ref={scrollRef} className="flex-1 space-y-3 overflow-y-auto p-4">
                {conversation === null ? (
                  <div className="space-y-2">
                    {[1, 2, 3].map((i) => <div key={i} className="skeleton h-10 w-2/3" />)}
                  </div>
                ) : (
                  conversation.map((msg) => {
                    const isMine = msg.sender_id === user?.id
                    return (
                      <motion.div
                        key={msg.id}
                        initial={{ opacity: 0, y: 6 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={cn('flex', isMine ? 'justify-end' : 'justify-start')}
                      >
                        <div className={cn(
                          'max-w-[70%] rounded-2xl px-4 py-2.5 text-sm',
                          isMine ? 'bg-gradient-primary text-white' : 'bg-ink/5 text-ink',
                        )}>
                          <p>{msg.body}</p>
                          <p className={cn('mt-1 text-[10px]', isMine ? 'text-white/70' : 'text-muted-foreground')}>
                            {formatDateTime(msg.created_at)}
                          </p>
                        </div>
                      </motion.div>
                    )
                  })
                )}
              </div>
              <div className="flex items-center gap-2 border-t border-black/5 p-4">
                <input
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                  placeholder="Type a message…"
                  className="h-11 flex-1 rounded-full border-2 border-input bg-white px-4 text-sm focus-visible:outline-none focus-visible:border-forest-light"
                />
                <button
                  onClick={handleSend}
                  disabled={sending || !draft.trim()}
                  className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-gradient-primary text-white shadow-card transition-transform hover:scale-105 disabled:opacity-50"
                >
                  <Send className="h-4 w-4" />
                </button>
              </div>
            </>
          )}
        </div>
      </Card>
    </div>
  )
}
