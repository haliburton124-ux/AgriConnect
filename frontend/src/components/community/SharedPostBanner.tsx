import { Share2 } from 'lucide-react'
import { formatDate } from '@/lib/utils'
import type { CommunityPost } from '@/types'

interface SharedPostBannerProps {
  post: CommunityPost
}

export function hasSharedPostContext(post: CommunityPost): boolean {
  return Boolean(post.is_shared_in_feed && post.shared_at)
}

export function SharedPostBanner({ post }: SharedPostBannerProps) {
  if (!hasSharedPostContext(post)) return null

  const sharerLabel = post.shared_by_me ? 'You' : 'A farmer'

  return (
    <div className="flex items-center gap-2 text-sm">
      <Share2 className="h-4 w-4 shrink-0 text-forest" />
      <span className="font-semibold text-ink">Shared by {sharerLabel}</span>
      {post.shared_at && (
        <>
          <span className="text-muted-foreground">·</span>
          <span className="text-muted-foreground">{formatDate(post.shared_at)}</span>
        </>
      )}
    </div>
  )
}
