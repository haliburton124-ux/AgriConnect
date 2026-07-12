import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { toast } from 'sonner'
import {
  Sprout, Lock, ShieldAlert, ArrowRight, Newspaper, BookOpen,
} from 'lucide-react'
import { SectionHeading } from '@/components/landing/SectionHeading'
import { Button } from '@/components/ui/Button'
import { Card, CardContent } from '@/components/ui/Card'
import { PostCard } from '@/components/community/PostCard'
import { PostDetailModal } from '@/components/community/PostDetailModal'
import { AdvisorySearchPanel } from '@/components/community/AdvisorySearchPanel'
import { communityService } from '@/services/communityService'
import { useAuthStore } from '@/store/authStore'
import { getApiErrorMessage } from '@/lib/api'
import { cn } from '@/lib/utils'
import type { CommunityPost } from '@/types'

type FeedView = 'advisories' | 'my-feed'

export function KnowledgeHubSection() {
  const navigate = useNavigate()
  const { isAuthenticated, user } = useAuthStore()
  const isFarmer = isAuthenticated && user?.role === 'farmer'

  const [view, setView] = useState<FeedView>('advisories')
  const [searchOpen, setSearchOpen] = useState(false)
  const [activeCategory, setActiveCategory] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [posts, setPosts] = useState<CommunityPost[] | null>(null)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [selected, setSelected] = useState<CommunityPost | null>(null)

  useEffect(() => {
    setPosts(null)
    setLoadError(null)
    const params = activeCategory
      ? { category: activeCategory }
      : { search: search.trim() || undefined }

    const request =
      view === 'my-feed' && isFarmer
        ? communityService.feed(params)
        : communityService.list(params)

    request
      .then((res) => setPosts(res.data.data))
      .catch((error) => {
        setPosts([])
        setLoadError(getApiErrorMessage(error))
      })
  }, [view, activeCategory, search, isFarmer])

  const updatePost = (updated: CommunityPost) => {
    setPosts((current) => current?.map((p) => (p.id === updated.id ? updated : p)) ?? null)
    setSelected((current) => (current?.id === updated.id ? updated : current))
  }

  const requireAuth = (action: () => void) => {
    if (isAuthenticated) action()
    else {
      toast.info('Sign in to like, comment, and share advisories.')
      navigate('/login')
    }
  }

  const handleLike = (post: CommunityPost) => {
    requireAuth(async () => {
      try {
        const { data } = await communityService.like(post.id)
        updatePost(data.data)
      } catch (error) {
        toast.error(getApiErrorMessage(error))
      }
    })
  }

  const handleShare = (post: CommunityPost) => {
    requireAuth(async () => {
      try {
        const { data } = await communityService.share(post.id)
        updatePost(data.data)
        toast.success('Shared to your feed.')
      } catch (error) {
        toast.error(getApiErrorMessage(error))
      }
    })
  }

  const enableEngagement = isAuthenticated

  return (
    <section id="knowledge-hub" className="scroll-mt-24 bg-canvas px-4 py-20 sm:px-6 sm:py-28 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <SectionHeading
          eyebrow="Knowledge Sharing"
          title="Learn from municipalities across Ilocos Norte"
          description="Public agricultural advisories on pesticide use, crop disease, soil management, planting calendars, and more — like, comment, and share with fellow farmers."
        />

        <div className="mt-14 grid grid-cols-1 gap-8 xl:grid-cols-[1fr_320px]">
          {/* Main feed */}
          <div className="space-y-6">
            {/* View toggle + search */}
            <div className={cn(
              'flex flex-col gap-4',
              !searchOpen && 'rounded-2xl bg-white p-4 shadow-soft ring-1 ring-black/[0.03] sm:p-5',
            )}>
              {!searchOpen && (
                <div className="flex rounded-xl border border-black/5 bg-canvas p-1 w-fit">
                  <button
                    type="button"
                    onClick={() => setView('advisories')}
                    className={cn(
                      'rounded-lg px-4 py-2 text-xs font-semibold transition-colors',
                      view === 'advisories' ? 'bg-gradient-primary text-white shadow-card' : 'text-ink/60 hover:bg-forest/5',
                    )}
                  >
                    Public Advisories
                  </button>
                  {isFarmer && (
                    <button
                      type="button"
                      onClick={() => setView('my-feed')}
                      className={cn(
                        'rounded-lg px-4 py-2 text-xs font-semibold transition-colors',
                        view === 'my-feed' ? 'bg-gradient-primary text-white shadow-card' : 'text-ink/60 hover:bg-forest/5',
                      )}
                    >
                      My Feed
                    </button>
                  )}
                </div>
              )}

              <AdvisorySearchPanel
                open={searchOpen}
                onOpenChange={setSearchOpen}
                search={search}
                onSearchChange={setSearch}
                onCategoryChange={setActiveCategory}
              />
            </div>

            {/* Posts */}
            {posts === null ? (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="skeleton h-44 w-full rounded-2xl" />
                ))}
              </div>
            ) : posts.length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center gap-3 p-10 text-center">
                  <Sprout className="h-10 w-10 text-forest-light" />
                  <p className="font-medium text-ink">
                    {loadError ? 'Could not load advisories' : 'No advisories found.'}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {loadError
                      ? `${loadError} Make sure the Laravel API is running (php artisan serve) and MySQL is started in XAMPP.`
                      : 'Try a different search or category filter.'}
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {posts.map((post, i) => (
                  <motion.div
                    key={post.id}
                    initial={{ opacity: 0, y: 12 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: '-40px' }}
                    transition={{ delay: i * 0.04 }}
                  >
                    <PostCard
                      post={post}
                      onOpen={setSelected}
                      onLike={enableEngagement ? handleLike : () => requireAuth(() => {})}
                      onShare={enableEngagement ? handleShare : () => requireAuth(() => {})}
                    />
                  </motion.div>
                ))}
              </div>
            )}

            {isFarmer && (
              <div className="flex justify-center pt-2">
                <Link to="/farmer/feed">
                  <Button variant="outline">
                    <Newspaper className="h-4 w-4" /> View full news feed
                  </Button>
                </Link>
              </div>
            )}
          </div>

          {/* Sidebar — content types */}
          <aside className="space-y-5">
            <Card className="overflow-hidden border-forest/10 bg-gradient-to-br from-forest/[0.04] to-sky/[0.04]">
              <CardContent className="space-y-4 p-6">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-primary text-white shadow-card">
                  <Sprout className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-semibold text-ink">Public Agricultural Advisories</h3>
                  <p className="mt-2 text-sm leading-relaxed text-ink/65">
                    Educational posts from every municipality — visible to all registered farmers province-wide.
                    Share knowledge and join the discussion.
                  </p>
                </div>
                <Link
                  to={isFarmer ? '/farmer/knowledge' : '/knowledge-center'}
                  className="inline-flex items-center gap-1.5 text-sm font-semibold text-forest hover:underline"
                >
                  <BookOpen className="h-4 w-4" /> Browse knowledge hub <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </CardContent>
            </Card>

            <Card className="overflow-hidden border-gold/20 bg-gold/[0.04]">
              <CardContent className="space-y-4 p-6">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gold/15 text-gold">
                  <Lock className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-semibold text-ink">Municipality-Only Documents</h3>
                  <p className="mt-2 text-sm leading-relaxed text-ink/65">
                    Memorandums, internal announcements, reports, permits, and confidential LGU files are
                    restricted to authorized users within the posting municipality only.
                  </p>
                </div>
                <div className="flex items-start gap-2 rounded-xl bg-white/80 p-3 text-xs text-ink/70 ring-1 ring-gold/10">
                  <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0 text-gold" />
                  <span>These files never appear in the public feed above.</span>
                </div>
                {isFarmer ? (
                  <Link to="/farmer/documents">
                    <Button variant="outline" className="w-full border-gold/30 text-ink hover:bg-gold/5">
                      <Lock className="h-4 w-4" /> Municipality documents
                    </Button>
                  </Link>
                ) : (
                  <Button
                    variant="outline"
                    className="w-full border-gold/30"
                    onClick={() => navigate('/login')}
                  >
                    Sign in to access LGU documents
                  </Button>
                )}
              </CardContent>
            </Card>
          </aside>
        </div>
      </div>

      <PostDetailModal
        post={selected}
        onClose={() => setSelected(null)}
        onUpdate={updatePost}
        enableEngagement={enableEngagement}
      />
    </section>
  )
}
