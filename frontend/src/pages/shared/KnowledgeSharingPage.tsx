import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { Sprout, Plus, Trash2 } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { EmptyState } from '@/components/ui/EmptyState'
import { PostCard } from '@/components/community/PostCard'
import { PostDetailModal } from '@/components/community/PostDetailModal'
import { CreateCommunityPostModal } from '@/components/modals/CreateCommunityPostModal'
import { communityService } from '@/services/communityService'
import { useAuthStore } from '@/store/authStore'
import { getApiErrorMessage } from '@/lib/api'
import type { CommunityPost, UserRole } from '@/types'

function rolePrefix(role: UserRole): 'mao' | 'ppo' | 'admin' {
  if (role === 'municipal_office') return 'mao'
  if (role === 'provincial_office') return 'ppo'
  return 'admin'
}

export function KnowledgeSharingPage() {
  const { user } = useAuthStore()
  const [posts, setPosts] = useState<CommunityPost[] | null>(null)
  const [selected, setSelected] = useState<CommunityPost | null>(null)
  const [modalOpen, setModalOpen] = useState(false)

  const load = () => {
    setPosts(null)
    communityService.list().then((res) => setPosts(res.data.data))
  }

  useEffect(load, [])

  const handleDelete = async (post: CommunityPost) => {
    if (!window.confirm(`Remove "${post.title}"?`)) return
    try {
      await communityService.remove(post.id, rolePrefix(user!.role))
      toast.success('Advisory removed.')
      load()
    } catch (error) {
      toast.error(getApiErrorMessage(error))
    }
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold text-ink">Knowledge Sharing</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Publish public agricultural advisories for farmers across Ilocos Norte.
          </p>
        </div>
        <Button onClick={() => setModalOpen(true)}>
          <Plus className="h-4 w-4" /> Publish Advisory
        </Button>
      </div>

      {posts === null ? (
        <div className="space-y-4">
          {[1, 2].map((i) => <div key={i} className="skeleton h-44 w-full rounded-2xl" />)}
        </div>
      ) : posts.length === 0 ? (
        <Card>
          <CardContent className="p-6">
            <EmptyState
              icon={Sprout}
              title="No public advisories yet"
              description="Publish educational content for farmers — pesticide usage, crop disease treatment, planting calendars, and more."
              actionLabel="Publish Advisory"
              onAction={() => setModalOpen(true)}
            />
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {posts.map((post) => (
            <div key={post.id} className="relative">
              <PostCard post={post} onOpen={setSelected} compact />
              <Button
                size="icon"
                variant="ghost"
                className="absolute right-3 top-3"
                title="Remove"
                onClick={() => handleDelete(post)}
              >
                <Trash2 className="h-4 w-4 text-danger" />
              </Button>
            </div>
          ))}
        </div>
      )}

      <CreateCommunityPostModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSuccess={load}
        role={user!.role}
      />

      <PostDetailModal
        post={selected}
        onClose={() => setSelected(null)}
        onUpdate={(updated) => {
          setPosts((current) => current?.map((p) => (p.id === updated.id ? updated : p)) ?? null)
          setSelected(updated)
        }}
        enableEngagement={false}
      />
    </div>
  )
}
