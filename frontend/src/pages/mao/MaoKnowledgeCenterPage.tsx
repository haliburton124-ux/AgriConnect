import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { Archive, Bookmark, BookOpen, Calendar, MapPin, Plus, RotateCcw } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { EmptyState } from '@/components/ui/EmptyState'
import { ArchivedFilterTabs } from '@/components/ui/ArchivedFilterTabs'
import { ArchiveConfirmDialog } from '@/components/ui/ArchiveConfirmDialog'
import { Modal } from '@/components/ui/Modal'
import { CreateKnowledgeArticleModal } from '@/components/modals/CreateKnowledgeArticleModal'
import { knowledgeService } from '@/services/knowledgeService'
import { useAuthStore } from '@/store/authStore'
import { getApiErrorMessage } from '@/lib/api'
import { cn, formatDate, storageUrl } from '@/lib/utils'
import { KNOWLEDGE_IMAGES } from '@/lib/knowledgeCenterConfig'
import { getKnowledgeBookmarks, toggleKnowledgeBookmark } from '@/lib/knowledgeBookmarks'
import type { KnowledgeArticle } from '@/types'

function coverFor(article: KnowledgeArticle): string {
  if (article.cover_image_path) return storageUrl(article.cover_image_path)
  const title = article.title.toLowerCase()
  if (title.includes('rice') || title.includes('transplant')) return KNOWLEDGE_IMAGES.rice
  if (title.includes('blast') || title.includes('pest')) return KNOWLEDGE_IMAGES.pest
  if (title.includes('monsoon') || title.includes('vegetable')) return KNOWLEDGE_IMAGES.vegetables
  if (title.includes('heat') || title.includes('irrigation')) return KNOWLEDGE_IMAGES.irrigation
  return KNOWLEDGE_IMAGES.farming
}

export function MaoKnowledgeCenterPage() {
  const { user } = useAuthStore()
  const municipalityName = user?.municipality?.name ?? null
  const [articles, setArticles] = useState<KnowledgeArticle[] | null>(null)
  const [view, setView] = useState<'active' | 'archived'>('active')
  const [search, setSearch] = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [selected, setSelected] = useState<KnowledgeArticle | null>(null)
  const [archiveTarget, setArchiveTarget] = useState<KnowledgeArticle | null>(null)
  const [bookmarks, setBookmarks] = useState<Set<string>>(() => getKnowledgeBookmarks())

  const load = () => {
    setArticles(null)
    knowledgeService
      .manage({ search: search || undefined, archived: view === 'archived' })
      .then((res) => setArticles(res.data.data))
      .catch((error) => {
        setArticles([])
        toast.error(getApiErrorMessage(error))
      })
  }

  useEffect(load, [view, search])

  const handleArchive = async () => {
    if (!archiveTarget) return
    try {
      await knowledgeService.archive(archiveTarget.id)
      toast.success('Post archived.')
      setArchiveTarget(null)
      load()
    } catch (error) {
      toast.error(getApiErrorMessage(error))
    }
  }

  const handleBookmark = (id: string) => {
    toggleKnowledgeBookmark(id)
    setBookmarks(getKnowledgeBookmarks())
  }

  const handleRestore = async (article: KnowledgeArticle) => {
    try {
      await knowledgeService.restore(article.id)
      toast.success('Post restored.')
      load()
    } catch (error) {
      toast.error(getApiErrorMessage(error))
    }
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="overflow-hidden rounded-3xl bg-gradient-to-br from-forest-dark via-forest to-forest-light p-6 text-white shadow-glass sm:p-8">
        <p className="text-xs font-semibold uppercase tracking-wider text-white/70">Municipal Agriculture Office</p>
        <h1 className="mt-2 text-2xl font-bold sm:text-3xl">Knowledge Center</h1>
        <p className="mt-2 flex items-center gap-1.5 text-sm text-white/85">
          <MapPin className="h-4 w-4" />
          {municipalityName ? `${municipalityName}, Ilocos Norte` : 'Assigned municipality'}
        </p>
        <p className="mt-3 max-w-2xl text-sm leading-relaxed text-white/80">
          Create and publish educational posts for farmers in your municipality only. Farmers from other LGUs will not see this content.
        </p>
      </div>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <ArchivedFilterTabs value={view} onChange={setView} />
        {view === 'active' && (
          <Button onClick={() => setModalOpen(true)}>
            <Plus className="h-4 w-4" /> Create post
          </Button>
        )}
      </div>

      <input
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Search your municipality’s posts…"
        className="h-11 w-full max-w-md rounded-full border border-black/10 bg-white px-5 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:border-forest-light focus-visible:outline-none"
      />

      {articles === null ? (
        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {[1, 2, 3, 4].map((i) => <div key={i} className="skeleton h-72 rounded-[22px]" />)}
        </div>
      ) : articles.length === 0 ? (
        <Card>
          <CardContent className="p-6">
            <EmptyState
              icon={BookOpen}
              title={view === 'archived' ? 'No archived posts' : 'No Knowledge Center posts yet'}
              description={view === 'archived' ? 'Archived posts for your municipality will appear here.' : 'Publish a guide, advisory, or learning material for farmers in your municipality.'}
              actionLabel={view === 'active' ? 'Create post' : undefined}
              onAction={view === 'active' ? () => setModalOpen(true) : undefined}
            />
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {articles.map((article) => {
            const bookmarkId = `article-${article.id}`
            const bookmarked = bookmarks.has(bookmarkId)
            return (
              <article
                key={article.id}
                className="group flex h-full flex-col overflow-hidden rounded-[22px] border border-black/[0.04] bg-white shadow-soft"
              >
                <button type="button" className="block text-left" onClick={() => setSelected(article)}>
                  <div className="aspect-[16/10] overflow-hidden bg-forest/5">
                    <img
                      src={coverFor(article)}
                      alt=""
                      className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                  </div>
                </button>
                <div className="flex flex-1 flex-col p-5">
                  <div className="flex items-start justify-between gap-2">
                    <button type="button" className="min-w-0 text-left" onClick={() => setSelected(article)}>
                      <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-forest">
                        {article.category?.name ?? article.type.replace('_', ' ')}
                      </p>
                      <h2 className="mt-1.5 text-lg font-semibold leading-snug text-ink">{article.title}</h2>
                    </button>
                    <div className="flex shrink-0 items-center">
                      {view === 'archived' ? (
                        <button type="button" title="Restore" className="rounded-lg p-1.5 text-success hover:bg-success/10" onClick={() => handleRestore(article)}>
                          <RotateCcw className="h-4 w-4" />
                        </button>
                      ) : (
                        <button type="button" title="Archive" className="rounded-lg p-1.5 text-muted-foreground hover:bg-danger/5 hover:text-danger" onClick={() => setArchiveTarget(article)}>
                          <Archive className="h-4 w-4" />
                        </button>
                      )}
                      <button
                        type="button"
                        title={bookmarked ? 'Remove bookmark' : 'Bookmark'}
                        className={cn('rounded-lg p-1.5 hover:bg-forest/5', bookmarked ? 'text-forest' : 'text-forest/70')}
                        onClick={() => handleBookmark(bookmarkId)}
                      >
                        <Bookmark className={cn('h-4 w-4', bookmarked && 'fill-current')} />
                      </button>
                    </div>
                  </div>
                  <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-muted-foreground">{article.content}</p>
                  <div className="mt-auto flex items-center gap-2 pt-4 text-xs text-muted-foreground">
                    <Calendar className="h-3.5 w-3.5" />
                    <span>{formatDate(article.published_at ?? article.created_at)}</span>
                    <span>{article.is_published ? 'Published' : 'Draft'}</span>
                  </div>
                </div>
              </article>
            )
          })}
        </div>
      )}

      <CreateKnowledgeArticleModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSuccess={load}
        municipalityName={municipalityName}
      />

      <Modal open={Boolean(selected)} onClose={() => setSelected(null)} title={selected?.title ?? ''} size="lg">
        {selected && (
          <div className="space-y-4">
            <img src={coverFor(selected)} alt="" className="max-h-64 w-full rounded-xl object-cover" />
            <p className="whitespace-pre-wrap text-sm leading-relaxed text-ink/80">{selected.content}</p>
            {selected.attachments?.filter((a) => a.kind === 'file').map((file) => (
              <a key={file.path} href={file.url ?? storageUrl(file.path)} target="_blank" rel="noreferrer" className="flex items-center gap-2 text-sm font-medium text-forest hover:underline">
                {file.name}
              </a>
            ))}
          </div>
        )}
      </Modal>

      <ArchiveConfirmDialog
        open={Boolean(archiveTarget)}
        onClose={() => setArchiveTarget(null)}
        onConfirm={handleArchive}
        title="Archive this post?"
        description={archiveTarget ? `Archive “${archiveTarget.title}”? Farmers in ${municipalityName ?? 'your municipality'} will no longer see it.` : ''}
      />
    </div>
  )
}
