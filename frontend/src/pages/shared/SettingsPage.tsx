import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import { User as UserIcon, Shield, LogOut } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Badge } from '@/components/ui/Badge'
import { authService } from '@/services/authService'
import { useAuthStore } from '@/store/authStore'
import { getApiErrorMessage } from '@/lib/api'

const schema = z
  .object({
    current_password: z.string().min(1, 'Enter your current password'),
    password: z.string().min(8, 'At least 8 characters').regex(/[A-Z]/, 'Needs an uppercase letter').regex(/[0-9]/, 'Needs a number'),
    password_confirmation: z.string(),
  })
  .refine((data) => data.password === data.password_confirmation, {
    message: 'Passwords do not match',
    path: ['password_confirmation'],
  })

type FormValues = z.infer<typeof schema>

export function SettingsPage() {
  const { user, clearSession } = useAuthStore()
  const [loggingOutAll, setLoggingOutAll] = useState(false)
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(schema) })

  const onSubmit = async (values: FormValues) => {
    try {
      await authService.changePassword(values)
      toast.success('Password changed successfully. Please log in again.')
      reset()
      clearSession()
      window.location.href = '/login'
    } catch (error) {
      toast.error(getApiErrorMessage(error))
    }
  }

  const handleLogoutAllDevices = async () => {
    setLoggingOutAll(true)
    try {
      await authService.logoutAllDevices()
      toast.success('Logged out from all devices.')
      clearSession()
      window.location.href = '/login'
    } catch (error) {
      toast.error(getApiErrorMessage(error))
    } finally {
      setLoggingOutAll(false)
    }
  }

  if (!user) return null

  return (
    <div className="max-w-2xl space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-ink">Settings</h1>
        <p className="mt-1 text-sm text-muted-foreground">Manage your profile and account security.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><UserIcon className="h-4 w-4" /> Profile</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-primary text-xl font-semibold text-white">
              {user.first_name[0]}{user.last_name[0]}
            </div>
            <div>
              <p className="font-semibold text-ink">{user.full_name}</p>
              <p className="text-sm text-muted-foreground">{user.email}</p>
              <div className="mt-1.5 flex items-center gap-1.5">
                <Badge variant="neutral">{user.role.replace('_', ' ')}</Badge>
                {user.municipality && <span className="text-xs text-muted-foreground">{user.municipality.name}</span>}
              </div>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4 border-t border-black/5 pt-4 text-sm">
            <div>
              <p className="text-muted-foreground">Phone</p>
              <p className="font-medium text-ink">{user.phone}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Barangay</p>
              <p className="font-medium text-ink">{user.barangay?.name ?? '—'}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Shield className="h-4 w-4" /> Change Password</CardTitle>
        </CardHeader>
        <CardContent>
          <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
            <Input type="password" label="Current password" error={errors.current_password?.message} {...register('current_password')} />
            <Input type="password" label="New password" error={errors.password?.message} {...register('password')} />
            <Input type="password" label="Confirm new password" error={errors.password_confirmation?.message} {...register('password_confirmation')} />
            <Button onClick={handleSubmit(onSubmit)} loading={isSubmitting}>Update Password</Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><LogOut className="h-4 w-4" /> Sessions</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="mb-3 text-sm text-ink/70">Sign out of Agriri on every device where you're currently logged in.</p>
          <Button variant="outline" onClick={handleLogoutAllDevices} loading={loggingOutAll}>Log Out All Devices</Button>
        </CardContent>
      </Card>
    </div>
  )
}
