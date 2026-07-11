import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { BookOpen, Video, HelpCircle, FileDown, Eye, Sprout } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { EmptyState } from '@/components/ui/EmptyState'
import { Modal } from '@/components/ui/Modal'
import { PostCard } from '@/components/community/PostCard'
import { PostDetailModal } from '@/components/community/PostDetailModal'
import { knowledgeService } from '@/services/knowledgeService'
import { communityService } from '@/services/communityService'
import { getApiErrorMessage } from '@/lib/api'
import { cn } from '@/lib/utils'
import type { CommunityPost, KnowledgeArticle, KnowledgeCategory } from '@/types'

const TYPE_ICONS: Record<KnowledgeArticle['type'], typeof BookOpen> = {
  article: BookOpen,
  video: Video,
  faq: HelpCircle,
  pdf_guide: FileDown,
}

type HubTab = 'advisories' | 'guides'

export function KnowledgeCenterPage() {
  const [tab, setTab] = useState<HubTab>('advisories')
  const [articles, setArticles] = useState<KnowledgeArticle[] | null>(null)
  const [posts, setPosts] = useState<CommunityPost[] | null>(null)
  const [categories, setCategories] = useState<KnowledgeCategory[]>([])
  const [postCategories, setPostCategories] = useState<{ value: string; label: string }[]>([])
  const [activeCategory, setActiveCategory] = useState<number | null>(null)
  const [activePostCategory, setActivePostCategory] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [selectedArticle, setSelectedArticle] = useState<KnowledgeArticle | null>(null)
  const [selectedPost, setSelectedPost] = useState<CommunityPost | null>(null)

  useEffect(() => {
    knowledgeService.categories().then((res) => setCategories(res.data.data))
    communityService.categories().then((res) => setPostCategories(res.data.data))
  }, [])

  useEffect(() => {
    if (tab !== 'guides') return
    setArticles(null)
    knowledgeService.list({ category_id: activeCategory ?? undefined, search: search || undefined }).then((res) => {
      setArticles(res.data.data)
    })
  }, [tab, activeCategory, search])

  useEffect(() => {
    if (tab !== 'advisories') return
    setPosts(null)
    communityService.list({
      category: activePostCategory ?? undefined,
      search: search || undefined,
    }).then((res) => setPosts(res.data.data))
  }, [tab, activePostCategory, search])

  const updatePost = (updated: CommunityPost) => {
    setPosts((current) => current?.map((p) => (p.id === updated.id ? updated : p)) ?? null)
    setSelectedPost((current) => (current?.id === updated.id ? updated : current))
  }

  const handleLike = async (post: CommunityPost) => {
    try {
      const { data } = await communityService.like(post.id)
      updatePost(data.data)
    } catch (error) {
      toast.error(getApiErrorMessage(error))
    }
  }

  const handleShare = async (post: CommunityPost) => {
    try {
      const { data } = await communityService.share(post.id)
      updatePost(data.data)
      toast.success('Shared to your feed.')
    } catch (error) {
      toast.error(getApiErrorMessage(error))
    }
  }

  const openArticle = async (article: KnowledgeArticle) => {
    const { data } = await knowledgeService.get(article.id)
    setSelectedArticle(data.data)
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-ink">Knowledge Hub</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Public agricultural advisories from municipalities across Ilocos Norte, plus guides and reference articles.
        </p>
      </div>

      <div className="flex rounded-xl border border-black/5 bg-white p-1 shadow-card w-fit">
        <button
          type="button"
          onClick={() => { setTab('advisories'); setSearch('') }}
          className={cn(
            'rounded-lg px-4 py-2 text-sm font-semibold transition-colors',
            tab === 'advisories' ? 'bg-gradient-primary text-white' : 'text-ink/60 hover:bg-forest/5',
          )}
        >
          Public Advisories
        </button>
        <button
          type="button"
          onClick={() => { setTab('guides'); setSearch('') }}
          className={cn(
            'rounded-lg px-4 py-2 text-sm font-semibold transition-colors',
            tab === 'guides' ? 'bg-gradient-primary text-white' : 'text-ink/60 hover:bg-forest/5',
          )}
        >
          Guides & Articles
        </button>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap gap-2">
          {tab === 'advisories' ? (
            <>
              <button
                type="button"
                onClick={() => setActivePostCategory(null)}
                className={cn(
                  'rounded-full px-4 py-1.5 text-xs font-semibold transition-colors',
                  activePostCategory === null ? 'bg-gradient-primary text-white shadow-card' : 'bg-white text-ink/60 hover:bg-forest/5 border border-black/5',
                )}
              >
                All Topics
              </button>
              {postCategories.map((cat) => (
                <button
                  key={cat.value}
                  type="button"
                  onClick={() => setActivePostCategory(cat.value)}
                  className={cn(
                    'rounded-full px-4 py-1.5 text-xs font-semibold transition-colors',
                    activePostCategory === cat.value ? 'bg-gradient-primary text-white shadow-card' : 'bg-white text-ink/60 hover:bg-forest/5 border border-black/5',
                  )}
                >
                  {cat.label}
                </button>
              ))}
            </>
          ) : (
            <>
              <button
                type="button"
                onClick={() => setActiveCategory(null)}
                className={cn(
                  'rounded-full px-4 py-1.5 text-xs font-semibold transition-colors',
                  activeCategory === null ? 'bg-gradient-primary text-white shadow-card' : 'bg-white text-ink/60 hover:bg-forest/5 border border-black/5',
                )}
              >
                All
              </button>
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setActiveCategory(cat.id)}
                  className={cn(
                    'rounded-full px-4 py-1.5 text-xs font-semibold transition-colors',
                    activeCategory === cat.id ? 'bg-gradient-primary text-white shadow-card' : 'bg-white text-ink/60 hover:bg-forest/5 border border-black/5',
                  )}
                >
                  {cat.name}
                </button>
              ))}
            </>
          )}
        </div>
        <Input
          placeholder={tab === 'advisories' ? 'Search advisories…' : 'Search articles…'}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full sm:w-64"
        />
      </div>

      {tab === 'advisories' ? (
        posts === null ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => <div key={i} className="skeleton h-44 w-full rounded-2xl" />)}
          </div>
        ) : posts.length === 0 ? (
          <Card>
            <CardContent className="p-6">
              <EmptyState icon={Sprout} title="No advisories found" description="Try a different category or search term." />
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {posts.map((post) => (
              <PostCard
                key={post.id}
                post={post}
                onOpen={setSelectedPost}
                onLike={handleLike}
                onShare={handleShare}
              />
            ))}
          </div>
        )
      ) : articles === null ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => <div key={i} className="skeleton h-40 w-full rounded-2xl" />)}
        </div>
      ) : articles.length === 0 ? (
        <Card>
          <CardContent className="p-6">
            <EmptyState icon={BookOpen} title="No articles found" description="Try a different category or search term." />
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {articles.map((article) => {
            const Icon = TYPE_ICONS[article.type]
            return (
              <button key={article.id} type="button" onClick={() => openArticle(article)} className="text-left">
                <Card className="h-full transition-shadow hover:shadow-glass">
                  <CardContent className="flex h-full flex-col gap-3 p-5">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-forest/10 text-forest">
                      <Icon className="h-5 w-5" />
                    </div>
                    <h3 className="line-clamp-2 font-semibold text-ink">{article.title}</h3>
                    <div className="mt-auto flex items-center justify-between text-xs text-muted-foreground">
                      <span className="capitalize">{article.type.replace('_', ' ')}</span>
                      <span className="flex items-center gap-1"><Eye className="h-3.5 w-3.5" /> {article.view_count}</span>
                    </div>
                  </CardContent>
                </Card>
              </button>
            )
          })}
        </div>
      )}

      <PostDetailModal
        post={selectedPost}
        onClose={() => setSelectedPost(null)}
        onUpdate={updatePost}
      />

      <Modal open={Boolean(selectedArticle)} onClose={() => setSelectedArticle(null)} title={selectedArticle?.title ?? ''} size="lg">
        {selectedArticle?.type === 'video' && selectedArticle.video_url && (
          <div className="mb-4 aspect-video overflow-hidden rounded-xl bg-ink/5">
            <iframe src={selectedArticle.video_url} className="h-full w-full" allowFullScreen title={selectedArticle.title} />
          </div>
        )}
        <div className="whitespace-pre-wrap text-sm leading-relaxed text-ink/80">{selectedArticle?.content}</div>
        {selectedArticle?.pdf_path && (
          <a href={`${import.meta.env.VITE_API_URL?.replace('/api/v1', '')}/storage/${selectedArticle.pdf_path}`} target="_blank" rel="noreferrer" className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-forest hover:underline">
            <FileDown className="h-4 w-4" /> Download PDF Guide
          </a>
        )}
      </Modal>
    </div>
  )
}
