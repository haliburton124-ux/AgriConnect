import { Share2 } from 'lucide-react'
import { formatDate } from '@/lib/utils'
import type { CommunityPost, UserRole } from '@/types'

interface SharedPostBannerProps {
  post: CommunityPost
  viewerId?: number
  viewerRole?: UserRole
}

export function hasSharedPostContext(post: CommunityPost): boolean {
  return Boolean(post.is_shared_in_feed && post.shared_at && post.shared_by)
}

export function SharedPostBanner({ post, viewerId }: SharedPostBannerProps) {
  if (!hasSharedPostContext(post)) return null

  const isOwnShare = post.shared_by?.id === viewerId
  const sharerLabel = isOwnShare ? 'You' : post.shared_by?.full_name ?? 'Someone'
  const showFarmerCaptionLabel = !isOwnShare && post.shared_by?.role === 'farmer'
  const captionLabel = showFarmerCaptionLabel
    ? "Farmer's Caption"
    : isOwnShare
      ? 'Your message'
      : 'Caption'

  return (
    <div className="space-y-3">
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

      {post.share_caption?.trim() && (
        <div className="rounded-xl border border-forest/10 bg-forest/[0.03] px-4 py-3">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            {captionLabel}
          </p>
          <p className="mt-1.5 whitespace-pre-wrap text-sm leading-relaxed text-ink">
            {post.share_caption}
          </p>
        </div>
      )}
    </div>
  )
}
