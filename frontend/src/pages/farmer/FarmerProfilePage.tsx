import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { toast } from 'sonner'
import { BookOpen, Share2, User } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { EmptyState } from '@/components/ui/EmptyState'
import { PostCard } from '@/components/community/PostCard'
import { PostDetailModal } from '@/components/community/PostDetailModal'
import { communityService } from '@/services/communityService'
import { useAuthStore } from '@/store/authStore'
import { getApiErrorMessage } from '@/lib/api'
import { cn, initials } from '@/lib/utils'
import type { CommunityPost } from '@/types'

function isSharedPost(post: CommunityPost): boolean {
  return Boolean(post.shared_by_me || post.is_shared_in_feed)
}

export function FarmerProfilePage() {
  const { user } = useAuthStore()
  const [posts, setPosts] = useState<CommunityPost[] | null>(null)
  const [selected, setSelected] = useState<CommunityPost | null>(null)

  useEffect(() => {
    setPosts(null)
    communityService
      .feed()
      .then((res) => setPosts(res.data.data.filter(isSharedPost)))
      .catch(() => setPosts([]))
  }, [])

  const updatePost = (updated: CommunityPost) => {
    setPosts((current) => {
      const next = current?.map((post) => (post.id === updated.id ? updated : post)) ?? null
      if (!next) return null
      return next.filter(isSharedPost)
    })
    setSelected((current) => (current?.id === updated.id ? updated : current))
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
      toast.success('Shared to your profile.')
    } catch (error) {
      toast.error(getApiErrorMessage(error))
    }
  }

  if (!user) return null

  return (
    <div className="mx-auto max-w-3xl space-y-6 animate-fade-in">
      <Card className="overflow-hidden border-forest/10">
        <CardContent className="flex flex-col gap-4 p-6 sm:flex-row sm:items-center">
          <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-gradient-primary text-xl font-semibold text-white shadow-card">
            {initials(user.first_name, user.last_name)}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-semibold uppercase tracking-wider text-forest">My Profile</p>
            <h1 className="mt-1 text-2xl font-bold text-ink">{user.full_name}</h1>
            <p className="mt-1 text-sm text-muted-foreground">{user.email}</p>
            {user.municipality && (
              <p className="mt-1 text-xs text-muted-foreground">
                {user.barangay?.name ? `${user.barangay.name}, ` : ''}{user.municipality.name}
              </p>
            )}
          </div>
          <Link to="/farmer/settings">
            <Button variant="outline" size="sm">
              <User className="h-4 w-4" /> Account settings
            </Button>
          </Link>
        </CardContent>
      </Card>

      <Card className="border-dashed border-forest/20 bg-forest/[0.03]">
        <CardContent className="flex flex-col gap-3 p-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="font-semibold text-ink">Share advisories to your profile</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Browse public agricultural posts, then tap Share to save them here.
            </p>
          </div>
          <Link to="/#knowledge-hub">
            <Button>
              <BookOpen className="h-4 w-4" /> Browse advisories
            </Button>
          </Link>
        </CardContent>
      </Card>

      <div>
        <div className="mb-4 flex items-center gap-2">
          <Share2 className="h-5 w-5 text-forest" />
          <h2 className="text-lg font-semibold text-ink">My Shared Posts</h2>
          {posts && (
            <span className={cn(
              'rounded-full bg-forest/10 px-2.5 py-0.5 text-xs font-semibold text-forest',
            )}>
              {posts.length}
            </span>
          )}
        </div>

        {posts === null ? (
          <div className="space-y-4">
            {[1, 2].map((i) => (
              <div key={i} className="skeleton h-44 w-full rounded-2xl" />
            ))}
          </div>
        ) : posts.length === 0 ? (
          <Card>
            <CardContent className="p-6">
              <EmptyState
                icon={Share2}
                title="No shared posts yet"
                description="When you share a public advisory, it will appear here on your profile."
              />
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {posts.map((post) => (
              <PostCard
                key={post.id}
                post={post}
                onOpen={setSelected}
                onLike={handleLike}
                onShare={handleShare}
              />
            ))}
          </div>
        )}
      </div>

      <PostDetailModal
        post={selected}
        onClose={() => setSelected(null)}
        onUpdate={updatePost}
      />
    </div>
  )
}
