import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { Users, Plus, Search, Ban, CheckCircle2, Trash2 } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { EmptyState } from '@/components/ui/EmptyState'
import { CreateStaffUserModal } from '@/components/modals/CreateStaffUserModal'
import { userService } from '@/services/userService'
import { getApiErrorMessage } from '@/lib/api'
import { formatDate, cn } from '@/lib/utils'
import type { User, UserRole } from '@/types'

const ROLE_TABS: { value: UserRole | ''; label: string }[] = [
  { value: '', label: 'All' },
  { value: 'provincial_office', label: 'Provincial Office' },
  { value: 'municipal_office', label: 'Municipal Office' },
  { value: 'technician', label: 'Technicians' },
  { value: 'farmer', label: 'Farmers' },
  { value: 'admin', label: 'Admins' },
]

const STATUS_BADGE: Record<User['status'], 'resolved' | 'pending' | 'rejected' | 'neutral'> = {
  active: 'resolved',
  pending: 'pending',
  suspended: 'rejected',
  inactive: 'neutral',
}

export function AdminUsersPage() {
  const [users, setUsers] = useState<User[] | null>(null)
  const [role, setRole] = useState<UserRole | ''>('')
  const [search, setSearch] = useState('')
  const [createOpen, setCreateOpen] = useState(false)

  const load = () => {
    setUsers(null)
    userService.list({ role: role || undefined, search: search || undefined }).then((res) => {
      setUsers(res.data.data)
    })
  }

  useEffect(load, [role, search])

  const handleStatusChange = async (user: User, status: 'active' | 'suspended') => {
    try {
      await userService.updateStatus(user.id, status)
      toast.success(`${user.full_name} is now ${status}.`)
      load()
    } catch (error) {
      toast.error(getApiErrorMessage(error))
    }
  }

  const handleDelete = async (user: User) => {
    if (!window.confirm(`Remove ${user.full_name}'s account? This can be reversed by support if needed.`)) return
    try {
      await userService.remove(user.id)
      toast.success('Account removed.')
      load()
    } catch (error) {
      toast.error(getApiErrorMessage(error))
    }
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold text-ink">Manage Users</h1>
          <p className="mt-1 text-sm text-muted-foreground">Provision staff accounts and manage every user on the platform.</p>
        </div>
        <Button onClick={() => setCreateOpen(true)}>
          <Plus className="h-4 w-4" /> Add Staff Account
        </Button>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap gap-2">
          {ROLE_TABS.map((tab) => (
            <button
              key={tab.value}
              onClick={() => setRole(tab.value)}
              className={cn(
                'rounded-full px-4 py-1.5 text-xs font-semibold transition-colors',
                role === tab.value ? 'bg-gradient-primary text-white shadow-card' : 'bg-white text-ink/60 hover:bg-forest/5 border border-black/5',
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="Search name or email…" className="pl-9" value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
      </div>

      <Card>
        <CardContent className="p-0">
          {users === null ? (
            <div className="space-y-3 p-6">
              {[1, 2, 3, 4, 5].map((i) => <div key={i} className="skeleton h-16 w-full" />)}
            </div>
          ) : users.length === 0 ? (
            <div className="p-6">
              <EmptyState icon={Users} title="No users found" description="Try a different filter, or add a new staff account." />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-black/5 text-xs uppercase tracking-wide text-muted-foreground">
                    <th className="px-5 py-3 font-medium">Name</th>
                    <th className="px-5 py-3 font-medium">Role</th>
                    <th className="px-5 py-3 font-medium">Municipality</th>
                    <th className="px-5 py-3 font-medium">Status</th>
                    <th className="px-5 py-3 font-medium">Joined</th>
                    <th className="px-5 py-3 font-medium text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-black/5">
                  {users.map((u) => (
                    <tr key={u.id} className="transition-colors hover:bg-forest/[0.02]">
                      <td className="px-5 py-3.5">
                        <p className="font-medium text-ink">{u.full_name}</p>
                        <p className="text-xs text-muted-foreground">{u.email}</p>
                      </td>
                      <td className="px-5 py-3.5 capitalize text-ink/80">{u.role.replace('_', ' ')}</td>
                      <td className="px-5 py-3.5 text-ink/80">{u.municipality?.name ?? '—'}</td>
                      <td className="px-5 py-3.5"><Badge variant={STATUS_BADGE[u.status]}>{u.status}</Badge></td>
                      <td className="px-5 py-3.5 text-ink/60">{formatDate(u.created_at)}</td>
                      <td className="px-5 py-3.5">
                        <div className="flex justify-end gap-1.5">
                          {u.status === 'active' ? (
                            <Button size="icon" variant="ghost" title="Suspend account" onClick={() => handleStatusChange(u, 'suspended')}>
                              <Ban className="h-4 w-4 text-danger" />
                            </Button>
                          ) : (
                            <Button size="icon" variant="ghost" title="Activate account" onClick={() => handleStatusChange(u, 'active')}>
                              <CheckCircle2 className="h-4 w-4 text-success" />
                            </Button>
                          )}
                          <Button size="icon" variant="ghost" title="Remove account" onClick={() => handleDelete(u)}>
                            <Trash2 className="h-4 w-4 text-danger" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      <CreateStaffUserModal open={createOpen} onClose={() => setCreateOpen(false)} onSuccess={load} />
    </div>
  )
}
