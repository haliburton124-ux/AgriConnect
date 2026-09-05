import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { Archive, BookOpen, Calendar, MapPin, Plus, RotateCcw } from 'lucide-react'
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
import { formatDate, storageUrl } from '@/lib/utils'
import type { KnowledgeArticle } from '@/types'

export function MaoKnowledgeCenterPage() {
  const { user } = useAuthStore()
  const municipalityName = user?.municipality?.name ?? null
  const [articles, setArticles] = useState<KnowledgeArticle[] | null>(null)
  const [view, setView] = useState<'active' | 'archived'>('active')
  const [search, setSearch] = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [selected, setSelected] = useState<KnowledgeArticle | null>(null)
  const [archiveTarget, setArchiveTarget] = useState<KnowledgeArticle | null>(null)

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
        className="h-11 w-full rounded-xl border-2 border-input bg-white px-4 text-sm focus-visible:border-forest-light focus-visible:outline-none sm:max-w-sm"
      />

      {articles === null ? (
        <div className="grid gap-4 sm:grid-cols-2">
          {[1, 2, 3, 4].map((i) => <div key={i} className="skeleton h-48 rounded-2xl" />)}
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
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {articles.map((article) => (
            <Card key={article.id} className="overflow-hidden">
              {article.cover_image_path && (
                <img src={storageUrl(article.cover_image_path)} alt="" className="h-36 w-full object-cover" />
              )}
              <CardContent className="space-y-3 p-5">
                <div className="flex items-start justify-between gap-2">
                  <button type="button" className="text-left" onClick={() => setSelected(article)}>
                    <p className="text-xs font-semibold uppercase tracking-wide text-forest">
                      {article.category?.name ?? article.type.replace('_', ' ')}
                    </p>
                    <h2 className="mt-1 font-semibold text-ink">{article.title}</h2>
                  </button>
                  {view === 'archived' ? (
                    <Button size="icon" variant="ghost" title="Restore" onClick={() => handleRestore(article)}>
                      <RotateCcw className="h-4 w-4 text-success" />
                    </Button>
                  ) : (
                    <Button size="icon" variant="ghost" title="Archive" onClick={() => setArchiveTarget(article)}>
                      <Archive className="h-4 w-4 text-danger" />
                    </Button>
                  )}
                </div>
                <p className="line-clamp-2 text-sm text-muted-foreground">{article.content}</p>
                <div className="flex items-center gap-3 text-xs text-muted-foreground">
                  <span className="inline-flex items-center gap-1"><Calendar className="h-3.5 w-3.5" /> {formatDate(article.published_at ?? article.created_at)}</span>
                  <span>{article.is_published ? 'Published' : 'Draft'}</span>
                </div>
              </CardContent>
            </Card>
          ))}
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
            {selected.cover_image_path && (
              <img src={storageUrl(selected.cover_image_path)} alt="" className="max-h-64 w-full rounded-xl object-cover" />
            )}
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
