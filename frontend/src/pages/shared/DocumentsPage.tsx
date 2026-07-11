import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { FileText, Upload, Trash2, File as FileIcon, Lock, ShieldAlert } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { EmptyState } from '@/components/ui/EmptyState'
import { Modal } from '@/components/ui/Modal'
import { documentService } from '@/services/documentService'
import { municipalityDocumentService } from '@/services/municipalityDocumentService'
import { useAuthStore } from '@/store/authStore'
import { getApiErrorMessage } from '@/lib/api'
import { formatDate, cn } from '@/lib/utils'
import type { AppDocument, UserRole } from '@/types'

const PERSONAL_CATEGORIES = [
  { value: 'land_title', label: 'Land Title' },
  { value: 'certification', label: 'Certification' },
  { value: 'id', label: 'Government ID' },
  { value: 'permit', label: 'Permit' },
  { value: 'other', label: 'Other' },
]

const MUNICIPALITY_CATEGORIES = [
  { value: 'memorandum', label: 'Memorandum' },
  { value: 'internal_announcement', label: 'Internal Announcement' },
  { value: 'report', label: 'Report' },
  { value: 'permit', label: 'Permit' },
  { value: 'confidential', label: 'Confidential File' },
]

type DocTab = 'personal' | 'municipality'

function rolePrefix(role: UserRole): 'mao' | 'ppo' | 'admin' | null {
  if (role === 'municipal_office') return 'mao'
  if (role === 'provincial_office') return 'ppo'
  if (role === 'admin') return 'admin'
  return null
}

export function DocumentsPage() {
  const { user } = useAuthStore()
  const canUploadMunicipality = Boolean(rolePrefix(user!.role))
  const hasMunicipality = Boolean(user?.municipality?.id)

  const [tab, setTab] = useState<DocTab>('personal')
  const [documents, setDocuments] = useState<AppDocument[] | null>(null)
  const [municipalityDocs, setMunicipalityDocs] = useState<AppDocument[] | null>(null)
  const [modalOpen, setModalOpen] = useState(false)
  const [title, setTitle] = useState('')
  const [category, setCategory] = useState('other')
  const [file, setFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)

  const loadPersonal = () => {
    setDocuments(null)
    documentService.list().then((res) => setDocuments(res.data.data))
  }

  const loadMunicipality = () => {
    if (!hasMunicipality) {
      setMunicipalityDocs([])
      return
    }
    setMunicipalityDocs(null)
    municipalityDocumentService.list().then((res) => setMunicipalityDocs(res.data.data))
  }

  useEffect(() => {
    if (tab === 'personal') loadPersonal()
    else loadMunicipality()
  }, [tab, hasMunicipality])

  const close = () => {
    setModalOpen(false)
    setTitle('')
    setCategory(tab === 'personal' ? 'other' : 'memorandum')
    setFile(null)
  }

  const handleUpload = async () => {
    if (!title || !file) {
      toast.error('Please provide a title and select a file.')
      return
    }
    setUploading(true)
    const formData = new FormData()
    formData.append('title', title)
    formData.append('category', category)
    formData.append('file', file)

    try {
      if (tab === 'personal') {
        await documentService.upload(formData)
        loadPersonal()
      } else {
        const prefix = rolePrefix(user!.role)
        if (!prefix) throw new Error('Unauthorized')
        await municipalityDocumentService.upload(formData, prefix)
        loadMunicipality()
      }
      toast.success('Document uploaded successfully.')
      close()
    } catch (error) {
      toast.error(getApiErrorMessage(error))
    } finally {
      setUploading(false)
    }
  }

  const handleDeletePersonal = async (doc: AppDocument) => {
    if (!window.confirm(`Remove "${doc.title}"?`)) return
    try {
      await documentService.remove(doc.id)
      toast.success('Document removed.')
      loadPersonal()
    } catch (error) {
      toast.error(getApiErrorMessage(error))
    }
  }

  const handleDeleteMunicipality = async (doc: AppDocument) => {
    if (!window.confirm(`Remove "${doc.title}"?`)) return
    const prefix = rolePrefix(user!.role)
    if (!prefix) return
    try {
      await municipalityDocumentService.remove(doc.id, prefix)
      toast.success('Document removed.')
      loadMunicipality()
    } catch (error) {
      toast.error(getApiErrorMessage(error))
    }
  }

  const activeDocs = tab === 'personal' ? documents : municipalityDocs
  const categories = tab === 'personal' ? PERSONAL_CATEGORIES : MUNICIPALITY_CATEGORIES

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold text-ink">Documents</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {tab === 'personal'
              ? 'Your personal land titles, certifications, IDs, and permits.'
              : 'Official municipality files visible only to authorized users in your LGU.'}
          </p>
        </div>
        {(tab === 'personal' || canUploadMunicipality) && (
          <Button onClick={() => setModalOpen(true)}>
            <Upload className="h-4 w-4" /> Upload Document
          </Button>
        )}
      </div>

      {hasMunicipality && (
        <div className="flex rounded-xl border border-black/5 bg-white p-1 shadow-card w-fit">
          <button
            type="button"
            onClick={() => setTab('personal')}
            className={cn(
              'rounded-lg px-4 py-2 text-sm font-semibold transition-colors',
              tab === 'personal' ? 'bg-gradient-primary text-white' : 'text-ink/60 hover:bg-forest/5',
            )}
          >
            My Documents
          </button>
          <button
            type="button"
            onClick={() => setTab('municipality')}
            className={cn(
              'flex items-center gap-1.5 rounded-lg px-4 py-2 text-sm font-semibold transition-colors',
              tab === 'municipality' ? 'bg-gradient-primary text-white' : 'text-ink/60 hover:bg-forest/5',
            )}
          >
            <Lock className="h-3.5 w-3.5" /> Municipality Only
          </button>
        </div>
      )}

      {tab === 'municipality' && (
        <div className="flex items-start gap-3 rounded-xl border border-gold/20 bg-gold/5 p-4 text-sm text-ink/80">
          <ShieldAlert className="mt-0.5 h-5 w-5 shrink-0 text-gold" />
          <p>
            These files are restricted to users within <strong>{user?.municipality?.name ?? 'your municipality'}</strong>.
            Memorandums, internal announcements, reports, and confidential documents are not visible to farmers in other LGUs.
          </p>
        </div>
      )}

      <Card>
        <CardContent className="p-0">
          {activeDocs === null ? (
            <div className="space-y-3 p-6">
              {[1, 2, 3].map((i) => <div key={i} className="skeleton h-14 w-full" />)}
            </div>
          ) : activeDocs.length === 0 ? (
            <div className="p-6">
              <EmptyState
                icon={FileText}
                title={tab === 'personal' ? 'No personal documents yet' : 'No municipality documents yet'}
                description={tab === 'personal' ? 'Upload your first document to get started.' : 'Municipality-only files shared by your LGU will appear here.'}
                actionLabel={tab === 'personal' || canUploadMunicipality ? 'Upload Document' : undefined}
                onAction={tab === 'personal' || canUploadMunicipality ? () => setModalOpen(true) : undefined}
              />
            </div>
          ) : (
            <div className="divide-y divide-black/5">
              {activeDocs.map((doc) => (
                <div key={doc.id} className="flex items-center justify-between gap-4 p-4">
                  <div className="flex items-center gap-3">
                    <div className={cn(
                      'flex h-10 w-10 items-center justify-center rounded-lg',
                      tab === 'municipality' ? 'bg-gold/10 text-gold' : 'bg-sky/10 text-sky',
                    )}>
                      <FileIcon className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-ink">{doc.title}</p>
                      <p className="text-xs capitalize text-muted-foreground">
                        {doc.category.replace(/_/g, ' ')} · {formatDate(doc.created_at)}
                        {doc.municipality && ` · ${doc.municipality.name}`}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <a href={`${import.meta.env.VITE_API_URL?.replace('/api/v1', '')}/storage/${doc.file_path}`} target="_blank" rel="noreferrer">
                      <Button size="sm" variant="outline">View</Button>
                    </a>
                    {(tab === 'personal' || canUploadMunicipality) && (
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => (tab === 'personal' ? handleDeletePersonal(doc) : handleDeleteMunicipality(doc))}
                      >
                        <Trash2 className="h-4 w-4 text-danger" />
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Modal
        open={modalOpen}
        onClose={close}
        title={tab === 'personal' ? 'Upload Personal Document' : 'Upload Municipality Document'}
        size="sm"
        footer={
          <>
            <Button variant="ghost" onClick={close}>Cancel</Button>
            <Button onClick={handleUpload} loading={uploading}>Upload</Button>
          </>
        }
      >
        <div className="space-y-4">
          <Input label="Title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Document title" />
          <div>
            <label className="mb-1.5 block text-sm font-medium text-ink">Category</label>
            <select
              className="h-11 w-full rounded-xl border-2 border-input bg-white px-4 text-sm focus-visible:outline-none focus-visible:border-forest-light"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            >
              {categories.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
            </select>
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-ink">File</label>
            <label className={cn(
              'flex cursor-pointer items-center justify-center gap-2 rounded-xl border-2 border-dashed py-6 text-sm transition-colors',
              file ? 'border-forest bg-forest/5 text-forest' : 'border-forest-light/40 bg-forest/[0.02] text-forest hover:bg-forest/5',
            )}>
              <Upload className="h-4 w-4" />
              {file ? file.name : 'Choose a file (JPG, PNG, PDF, DOC)'}
              <input type="file" accept="image/*,.pdf,.doc,.docx" className="hidden" onChange={(e) => setFile(e.target.files?.[0] ?? null)} />
            </label>
          </div>
        </div>
      </Modal>
    </div>
  )
}
