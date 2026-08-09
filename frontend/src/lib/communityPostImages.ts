import type { CommunityPost } from '@/types'

/** Resolve all image paths for a community post (supports legacy single `image_path`). */
export function getCommunityPostImages(post: CommunityPost): string[] {
  if (post.image_paths?.length) return post.image_paths
  if (post.image_path) return [post.image_path]
  return []
}
