import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { Megaphone, Plus, Archive, RotateCcw } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { EmptyState } from '@/components/ui/EmptyState'
import { ArchivedFilterTabs } from '@/components/ui/ArchivedFilterTabs'
import { ArchiveConfirmDialog } from '@/components/ui/ArchiveConfirmDialog'
import { CreateAnnouncementModal } from '@/components/modals/CreateAnnouncementModal'
import { announcementService } from '@/services/announcementService'
import { useAuthStore } from '@/store/authStore'
import { getApiErrorMessage } from '@/lib/api'
import { formatDateTime } from '@/lib/utils'
import type { Announcement } from '@/types'

const OFFICE_ROLES = ['municipal_office', 'provincial_office', 'admin']

export function AnnouncementsPage() {
  const { user } = useAuthStore()
  const canManage = user ? OFFICE_ROLES.includes(user.role) : false
  const [announcements, setAnnouncements] = useState<Announcement[] | null>(null)
  const [view, setView] = useState<'active' | 'archived'>('active')
  const [modalOpen, setModalOpen] = useState(false)
  const [archiveTarget, setArchiveTarget] = useState<Announcement | null>(null)

  const load = () => {
    setAnnouncements(null)
    announcementService.list({ archived: canManage && view === 'archived' }).then((res) => setAnnouncements(res.data.data))
  }

  useEffect(load, [view, canManage])

  const handleArchive = async () => {
    if (!user || !archiveTarget) return
    try {
      await announcementService.archive(user.role, archiveTarget.id)
      toast.success('Announcement archived.')
      setArchiveTarget(null)
      load()
    } catch (error) {
      toast.error(getApiErrorMessage(error))
    }
  }

  const handleRestore = async (announcement: Announcement) => {
    if (!user) return
    try {
      await announcementService.restore(user.role, announcement.id)
      toast.success('Announcement restored.')
      load()
    } catch (error) {
      toast.error(getApiErrorMessage(error))
    }
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold text-ink">Announcements</h1>
          <p className="mt-1 text-sm text-muted-foreground">Updates and notices from the Agriculture Office.</p>
        </div>
        {canManage && view === 'active' && (
          <Button onClick={() => setModalOpen(true)}>
            <Plus className="h-4 w-4" /> New Announcement
          </Button>
        )}
      </div>

      {canManage && <ArchivedFilterTabs value={view} onChange={setView} />}

      {announcements === null ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => <div key={i} className="skeleton h-28 w-full rounded-2xl" />)}
        </div>
      ) : announcements.length === 0 ? (
        <Card>
          <CardContent className="p-6">
            <EmptyState
              icon={Megaphone}
              title={view === 'archived' ? 'No archived announcements' : 'No announcements yet'}
              description={view === 'archived' ? 'Archived announcements will appear here.' : 'Check back later for updates from the Agriculture Office.'}
            />
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {announcements.map((a) => (
            <Card key={a.id}>
              <CardContent className="flex items-start justify-between gap-4 p-5">
                <div>
                  <div className="mb-1.5 flex items-center gap-2">
                    <Megaphone className="h-4 w-4 text-forest" />
                    <h3 className="font-semibold text-ink">{a.title}</h3>
                  </div>
                  <p className="text-sm text-ink/70">{a.content}</p>
                  <p className="mt-2 text-xs text-muted-foreground">
                    {a.posted_by?.first_name} {a.posted_by?.last_name} · {a.published_at ? formatDateTime(a.published_at) : ''}
                  </p>
                </div>
                {canManage && (
                  view === 'archived' ? (
                    <Button size="icon" variant="ghost" title="Restore" onClick={() => handleRestore(a)}>
                      <RotateCcw className="h-4 w-4 text-success" />
                    </Button>
                  ) : (
                    <Button size="icon" variant="ghost" title="Archive" onClick={() => setArchiveTarget(a)}>
                      <Archive className="h-4 w-4 text-danger" />
                    </Button>
                  )
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {canManage && (
        <CreateAnnouncementModal open={modalOpen} onClose={() => setModalOpen(false)} onSuccess={load} />
      )}

      <ArchiveConfirmDialog
        open={Boolean(archiveTarget)}
        onClose={() => setArchiveTarget(null)}
        onConfirm={handleArchive}
        title="Archive announcement?"
        description={archiveTarget ? `Archive "${archiveTarget.title}"? It will be hidden from public view but can be restored.` : ''}
      />
    </div>
  )
}
