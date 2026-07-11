import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { Newspaper } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/Card'
import { EmptyState } from '@/components/ui/EmptyState'
import { PostCard } from '@/components/community/PostCard'
import { PostDetailModal } from '@/components/community/PostDetailModal'
import { communityService } from '@/services/communityService'
import { getApiErrorMessage } from '@/lib/api'
import type { CommunityPost } from '@/types'

export function CommunityFeedPage() {
  const [posts, setPosts] = useState<CommunityPost[] | null>(null)
  const [selected, setSelected] = useState<CommunityPost | null>(null)

  const load = () => {
    setPosts(null)
    communityService.feed().then((res) => setPosts(res.data.data))
  }

  useEffect(load, [])

  const updatePost = (updated: CommunityPost) => {
    setPosts((current) => current?.map((p) => (p.id === updated.id ? updated : p)) ?? null)
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
      toast.success('Shared to your feed.')
    } catch (error) {
      toast.error(getApiErrorMessage(error))
    }
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-ink">News Feed</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Public agricultural advisories from municipalities across Ilocos Norte. Like, comment, and share to learn together.
        </p>
      </div>

      {posts === null ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => <div key={i} className="skeleton h-44 w-full rounded-2xl" />)}
        </div>
      ) : posts.length === 0 ? (
        <Card>
          <CardContent className="p-6">
            <EmptyState
              icon={Newspaper}
              title="No posts in your feed yet"
              description="Public agricultural advisories from municipalities will appear here."
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

      <PostDetailModal
        post={selected}
        onClose={() => setSelected(null)}
        onUpdate={updatePost}
      />
    </div>
  )
}
