import type { CommunityPost } from '@/types'
import { storageUrl } from '@/lib/utils'

/** Resolve display URLs for all images on a community post. */
export function getCommunityPostImages(post: CommunityPost): string[] {
  if (post.image_urls?.length) return post.image_urls

  const paths = post.image_paths?.length
    ? post.image_paths
    : post.image_path
      ? [post.image_path]
      : []

  return paths.map((path) => storageUrl(path))
}
