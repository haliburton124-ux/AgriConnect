import { useCallback, useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { FileDown } from 'lucide-react'
import { KnowledgeCenterHero } from '@/components/knowledge-center/KnowledgeCenterHero'
import { QuickAccessCategories } from '@/components/knowledge-center/QuickAccessCategories'
import { ResourceSection } from '@/components/knowledge-center/ResourceCard'
import { BrowseByTopicSection } from '@/components/knowledge-center/BrowseByTopicSection'
import { KnowledgeHelpSupport } from '@/components/knowledge-center/KnowledgeHelpSupport'
import { PostDetailModal } from '@/components/community/PostDetailModal'
import { Modal } from '@/components/ui/Modal'
import { communityService } from '@/services/communityService'
import { knowledgeService } from '@/services/knowledgeService'
import { useAuthStore } from '@/store/authStore'
import { useFarmerActions } from '@/contexts/FarmerActionsContext'
import { getKnowledgeBookmarks, toggleKnowledgeBookmark } from '@/lib/knowledgeBookmarks'
import {
  BROWSE_TOPICS,
  QUICK_CATEGORIES,
  type QuickCategoryKey,
} from '@/lib/knowledgeCenterConfig'
import {
  articleToResource,
  matchesQuickCategory,
  matchesSearch,
  matchesTopic,
  postToResource,
  type KnowledgeResource,
} from '@/lib/knowledgeResources'
import { buildCommunityListParams } from '@/lib/communityQuery'
import { cn, storageUrl } from '@/lib/utils'
import type { CommunityPost, KnowledgeArticle } from '@/types'

interface KnowledgeCenterViewProps {
  /** Break out of a constrained app shell for full-width layout. */
  fullBleed?: boolean
  /** Extra top padding when rendered under the public navbar without layout offset. */
  heroClassName?: string
}

export function KnowledgeCenterView({ fullBleed = false, heroClassName }: KnowledgeCenterViewProps) {
  const navigate = useNavigate()
  const { user, isAuthenticated } = useAuthStore()
  const { openReportIncident } = useFarmerActions()

  const [search, setSearch] = useState('')
  const [activeCategory, setActiveCategory] = useState<QuickCategoryKey | null>(null)
  const [activeTopic, setActiveTopic] = useState<string | null>(null)
  const [topicPage, setTopicPage] = useState(0)
  const [bookmarkedIds, setBookmarkedIds] = useState<Set<string>>(() => getKnowledgeBookmarks())
  const [articles, setArticles] = useState<KnowledgeArticle[]>([])
  const [posts, setPosts] = useState<CommunityPost[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedPost, setSelectedPost] = useState<CommunityPost | null>(null)
  const [selectedArticle, setSelectedArticle] = useState<KnowledgeArticle | null>(null)

  const municipalityName = user?.municipality?.name ?? null

  useEffect(() => {
    setLoading(true)
    Promise.all([
      knowledgeService.list({ search: search || undefined }),
      communityService.list(buildCommunityListParams({ search })),
    ])
      .then(([articlesRes, postsRes]) => {
        setArticles(articlesRes.data.data)
        setPosts(postsRes.data.data)
      })
      .catch(() => {
        setArticles([])
        setPosts([])
      })
      .finally(() => setLoading(false))
  }, [search, user?.municipality?.id])

  const allResources = useMemo(() => {
    return [
      ...articles.map(articleToResource),
      ...posts.map(postToResource),
    ]
  }, [articles, posts])

  const filteredResources = useMemo(() => {
    return allResources.filter((resource) => {
      if (!matchesSearch(resource, search)) return false
      if (activeCategory && !matchesQuickCategory(resource, activeCategory)) return false
      if (activeTopic) {
        const topic = BROWSE_TOPICS.find((t) => t.slug === activeTopic)
        if (topic && !matchesTopic(resource, topic.keywords)) return false
      }
      return true
    })
  }, [allResources, search, activeCategory, activeTopic])

  const featuredResources = useMemo(() => {
    const pool = filteredResources.length > 0 ? filteredResources : allResources
    const advisories = pool.filter((r) => r.type === 'advisory')
    const guides = pool.filter((r) => r.type !== 'advisory' && r.type !== 'video' && r.type !== 'pdf_guide')
    const picked = [...advisories, ...guides].slice(0, 4)
    return picked
  }, [filteredResources, allResources])

  const learningResources = useMemo(() => {
    const pool = filteredResources.length > 0 ? filteredResources : allResources
    const learning = pool.filter((r) =>
      r.type === 'video' || r.type === 'pdf_guide' || r.type === 'infographic' || r.type === 'faq',
    )
    return learning.slice(0, 4)
  }, [filteredResources, allResources])

  const topicCounts = useMemo(() => {
    const counts: Record<string, number> = {}
    for (const topic of BROWSE_TOPICS) {
      counts[topic.slug] = allResources.filter((r) => matchesTopic(r, topic.keywords)).length
    }
    return counts
  }, [allResources])

  const handleToggleBookmark = useCallback((id: string) => {
    const saved = toggleKnowledgeBookmark(id)
    setBookmarkedIds(getKnowledgeBookmarks())
    toast.success(saved ? 'Resource saved.' : 'Bookmark removed.')
  }, [])

  const openResource = useCallback(async (resource: KnowledgeResource) => {
    if (resource.postId) {
      try {
        const { data } = await communityService.get(resource.postId)
        setSelectedPost(data.data)
      } catch {
        toast.error('Could not open this advisory.')
      }
      return
    }

    if (resource.articleId) {
      try {
        const { data } = await knowledgeService.get(resource.articleId)
        setSelectedArticle(data.data)
      } catch {
        toast.error('Could not open this resource.')
      }
      return
    }

    toast.info('This sample resource will be available when content is published for your municipality.')
  }, [])

  const handleCategorySelect = (key: QuickCategoryKey) => {
    setActiveCategory((current) => (current === key ? null : key))
    setActiveTopic(null)
    document.getElementById('featured-resources')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  const handleTopicSelect = (slug: string) => {
    setActiveTopic((current) => (current === slug ? null : slug))
    setActiveCategory(null)
    document.getElementById('featured-resources')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  const handleContactTechnician = () => {
    if (isAuthenticated) navigate('/farmer/messages')
    else navigate('/login', { state: { from: '/knowledge-center' } })
  }

  const handleViewAll = () => {
    document.getElementById('popular-learning')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  const wrapperClass = cn(
    fullBleed && 'relative left-1/2 right-1/2 -mx-[50vw] w-screen max-w-[100vw]',
    'bg-white',
  )

  return (
    <div className={wrapperClass}>
      <KnowledgeCenterHero
        municipalityName={municipalityName}
        search={search}
        onSearchChange={setSearch}
        className={heroClassName}
      />

      <div className="space-y-14 bg-canvas py-10 sm:py-14">
        <QuickAccessCategories
          categories={QUICK_CATEGORIES}
          activeKey={activeCategory}
          onSelect={handleCategorySelect}
        />

        {loading ? (
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="skeleton h-80 rounded-2xl" />
              ))}
            </div>
          </div>
        ) : (
          <>
            <ResourceSection
              id="featured-resources"
              title="Featured & Latest Resources"
              resources={featuredResources}
              bookmarkedIds={bookmarkedIds}
              onOpen={openResource}
              onToggleBookmark={handleToggleBookmark}
              onViewAll={handleViewAll}
              emptyMessage={
                isAuthenticated
                  ? `No featured resources for ${municipalityName ?? 'your municipality'} yet.`
                  : 'Sign in to see Knowledge Center posts from your municipality.'
              }
            />

            <BrowseByTopicSection
              topics={BROWSE_TOPICS}
              counts={topicCounts}
              activeTopic={activeTopic}
              page={topicPage}
              pageSize={8}
              onSelectTopic={handleTopicSelect}
              onPageChange={setTopicPage}
            />

            <ResourceSection
              id="popular-learning"
              title="Popular Learning Materials"
              resources={learningResources}
              bookmarkedIds={bookmarkedIds}
              onOpen={openResource}
              onToggleBookmark={handleToggleBookmark}
              emptyMessage="No learning materials for your municipality yet."
            />
          </>
        )}

        <KnowledgeHelpSupport
          onContactTechnician={handleContactTechnician}
          onReportProblem={openReportIncident}
        />
      </div>

      <PostDetailModal
        post={selectedPost}
        onClose={() => setSelectedPost(null)}
        onUpdate={setSelectedPost}
        enableEngagement={isAuthenticated}
      />

      <Modal
        open={Boolean(selectedArticle)}
        onClose={() => setSelectedArticle(null)}
        title={selectedArticle?.title ?? ''}
        size="lg"
      >
        {selectedArticle?.type === 'video' && selectedArticle.video_url && (
          <div className="mb-4 aspect-video overflow-hidden rounded-xl bg-ink/5">
            <iframe
              src={selectedArticle.video_url}
              className="h-full w-full"
              allowFullScreen
              title={selectedArticle.title}
            />
          </div>
        )}
        <div className="whitespace-pre-wrap text-sm leading-relaxed text-ink/80">
          {selectedArticle?.content}
        </div>
        {selectedArticle?.pdf_path && (
          <a
            href={storageUrl(selectedArticle.pdf_path)}
            target="_blank"
            rel="noreferrer"
            className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-forest hover:underline"
          >
            <FileDown className="h-4 w-4" /> Download PDF Guide
          </a>
        )}
        {selectedArticle?.attachments?.filter((file) => file.kind === 'file').map((file) => (
          <a
            key={file.path}
            href={file.url ?? storageUrl(file.path)}
            target="_blank"
            rel="noreferrer"
            className="mt-2 flex items-center gap-1.5 text-sm font-medium text-forest hover:underline"
          >
            <FileDown className="h-4 w-4" /> {file.name}
          </a>
        ))}
      </Modal>
    </div>
  )
}
