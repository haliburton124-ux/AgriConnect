import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { useState } from 'react'
import { Eye, EyeOff, KeyRound } from 'lucide-react'
import { toast } from 'sonner'
import { AuthLayout } from '@/layouts/AuthLayout'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { authService } from '@/services/authService'
import { getApiErrorMessage } from '@/lib/api'

const schema = z
  .object({
    password: z.string().min(8, 'At least 8 characters').regex(/[A-Z]/, 'Include an uppercase letter').regex(/[0-9]/, 'Include a number'),
    password_confirmation: z.string(),
  })
  .refine((data) => data.password === data.password_confirmation, {
    message: 'Passwords do not match',
    path: ['password_confirmation'],
  })

type FormValues = z.infer<typeof schema>

export function ResetPasswordPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const token = searchParams.get('token') ?? ''
  const email = searchParams.get('email') ?? ''
  const [showPassword, setShowPassword] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(schema) })

  if (!token || !email) {
    return (
      <AuthLayout title="Invalid reset link" subtitle="This password reset link is missing required details.">
        <p className="text-sm text-muted-foreground">
          Request a new link from the forgot password page.
        </p>
        <Link to="/forgot-password" className="mt-6 inline-block text-sm font-semibold text-forest hover:underline">
          Request new reset link
        </Link>
      </AuthLayout>
    )
  }

  const onSubmit = async (values: FormValues) => {
    try {
      const { data } = await authService.resetPassword({
        email,
        token,
        password: values.password,
        password_confirmation: values.password_confirmation,
      })
      toast.success(data.message)
      navigate('/login')
    } catch (error) {
      toast.error(getApiErrorMessage(error, 'Unable to reset password. The link may have expired.'))
    }
  }

  return (
    <AuthLayout title="Set a new password" subtitle="Choose a strong password for your AgriConnect account.">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
        <div className="relative">
          <Input
            label="New password"
            type={showPassword ? 'text' : 'password'}
            error={errors.password?.message}
            {...register('password')}
          />
          <button
            type="button"
            onClick={() => setShowPassword((current) => !current)}
            className="absolute right-2.5 top-[34px] rounded-full p-1.5 text-muted-foreground transition-colors hover:bg-forest/10 hover:text-forest"
            aria-label={showPassword ? 'Hide password' : 'Show password'}
          >
            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>
        <Input
          label="Confirm new password"
          type={showPassword ? 'text' : 'password'}
          error={errors.password_confirmation?.message}
          {...register('password_confirmation')}
        />
        <Button type="submit" className="w-full" loading={isSubmitting}>
          <KeyRound className="h-4 w-4" />
          Update password
        </Button>
      </form>
      <p className="mt-6 text-center text-sm text-muted-foreground">
        <Link to="/login" className="font-semibold text-forest hover:underline">Back to sign in</Link>
      </p>
    </AuthLayout>
  )
}
