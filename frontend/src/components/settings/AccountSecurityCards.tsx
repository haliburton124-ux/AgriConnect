import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import { ChevronRight, KeyRound, LogOut, Shield } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { PasswordInput } from '@/components/ui/PasswordInput'
import { Modal } from '@/components/ui/Modal'
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

export function AccountSecurityCards({ layout = 'form' }: { layout?: 'form' | 'modal' }) {
  const clearSession = useAuthStore((s) => s.clearSession)
  const [loggingOutAll, setLoggingOutAll] = useState(false)
  const [passwordOpen, setPasswordOpen] = useState(false)
  const [logoutOpen, setLogoutOpen] = useState(false)
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(schema) })

  const closePassword = () => {
    reset()
    setPasswordOpen(false)
  }

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
      setLogoutOpen(false)
    }
  }

  const passwordForm = (
    <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
      <PasswordInput label="Current password" autoComplete="current-password" error={errors.current_password?.message} {...register('current_password')} />
      <PasswordInput label="New password" autoComplete="new-password" error={errors.password?.message} {...register('password')} />
      <PasswordInput label="Confirm new password" autoComplete="new-password" error={errors.password_confirmation?.message} {...register('password_confirmation')} />
      <p className="text-xs text-muted-foreground">At least 8 characters, with one uppercase letter and one number.</p>
    </form>
  )

  if (layout === 'modal') {
    return (
      <>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Shield className="h-4 w-4" /> Account security</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <button
              type="button"
              onClick={() => setPasswordOpen(true)}
              className="flex w-full items-center gap-3 rounded-2xl border border-black/[0.04] bg-canvas px-4 py-3.5 text-left transition-colors hover:border-forest-light/40 hover:bg-forest/[0.04]"
            >
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-forest/10 text-forest">
                <KeyRound className="h-4 w-4" />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-sm font-semibold text-ink">Change password</span>
                <span className="block text-xs text-muted-foreground">Update your sign-in password in a secure dialog.</span>
              </span>
              <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" />
            </button>
            <button
              type="button"
              onClick={() => setLogoutOpen(true)}
              className="flex w-full items-center gap-3 rounded-2xl border border-black/[0.04] bg-canvas px-4 py-3.5 text-left transition-colors hover:border-danger/20 hover:bg-danger/5"
            >
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-danger/10 text-danger">
                <LogOut className="h-4 w-4" />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-sm font-semibold text-ink">Sign out all devices</span>
                <span className="block text-xs text-muted-foreground">End every active AgriConnect session.</span>
              </span>
              <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" />
            </button>
          </CardContent>
        </Card>

        <Modal
          open={passwordOpen}
          onClose={closePassword}
          title="Change password"
          description="You will need to sign in again after updating it."
          size="sm"
          footer={
            <div className="flex justify-end gap-2">
              <Button variant="ghost" onClick={closePassword}>Cancel</Button>
              <Button onClick={handleSubmit(onSubmit)} loading={isSubmitting}>Update Password</Button>
            </div>
          }
        >
          {passwordForm}
        </Modal>

        <Modal
          open={logoutOpen}
          onClose={() => setLogoutOpen(false)}
          title="Sign out all devices?"
          description="This will end your session here and on every other device."
          size="sm"
          footer={
            <div className="flex justify-end gap-2">
              <Button variant="ghost" onClick={() => setLogoutOpen(false)}>Cancel</Button>
              <Button variant="danger" onClick={handleLogoutAllDevices} loading={loggingOutAll}>Sign out everywhere</Button>
            </div>
          }
        >
          <p className="text-sm leading-relaxed text-ink/70">
            Use this if you used a shared computer or think someone else may still be signed in to your account.
          </p>
        </Modal>
      </>
    )
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Shield className="h-4 w-4" /> Password</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="mb-4 text-sm text-ink/70">Use a strong password. You will need to sign in again after changing it.</p>
          {passwordForm}
          <Button className="mt-4" onClick={handleSubmit(onSubmit)} loading={isSubmitting}>Update Password</Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><LogOut className="h-4 w-4" /> Sessions</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="mb-3 text-sm text-ink/70">Sign out of AgriConnect on every device where you are currently logged in.</p>
          <Button variant="outline" onClick={handleLogoutAllDevices} loading={loggingOutAll}>Log Out All Devices</Button>
        </CardContent>
      </Card>
    </>
  )
}
