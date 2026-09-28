import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import { LogOut, Shield } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
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

export function AccountSecurityCards() {
  const clearSession = useAuthStore((s) => s.clearSession)
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

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Shield className="h-4 w-4" /> Password</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="mb-4 text-sm text-ink/70">Use a strong password. You will need to sign in again after changing it.</p>
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
          <p className="mb-3 text-sm text-ink/70">Sign out of AgriConnect on every device where you are currently logged in.</p>
          <Button variant="outline" onClick={handleLogoutAllDevices} loading={loggingOutAll}>Log Out All Devices</Button>
        </CardContent>
      </Card>
    </>
  )
}
