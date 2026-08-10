import type { CommunityPost } from '@/types'

/** When a post is shared to the farmer feed, sort by share time — not the original post date. */
export function getCommunityFeedSortTime(post: CommunityPost): number {
  if (post.is_shared_in_feed && post.shared_at) {
    return new Date(post.shared_at).getTime()
  }

  return new Date(post.created_at).getTime()
}

export function sortCommunityFeed(posts: CommunityPost[]): CommunityPost[] {
  return [...posts].sort((a, b) => getCommunityFeedSortTime(b) - getCommunityFeedSortTime(a))
}
