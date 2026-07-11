import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Link } from 'react-router-dom'
import { useState } from 'react'
import { Mail, CheckCircle2 } from 'lucide-react'
import { toast } from 'sonner'
import { AuthLayout } from '@/layouts/AuthLayout'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { authService } from '@/services/authService'
import { getApiErrorMessage } from '@/lib/api'

const schema = z.object({ email: z.string().email('Enter a valid email address') })
type FormValues = z.infer<typeof schema>

export function ForgotPasswordPage() {
  const [sent, setSent] = useState(false)
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormValues>({ resolver: zodResolver(schema) })

  const onSubmit = async (values: FormValues) => {
    try {
      await authService.forgotPassword(values.email)
      setSent(true)
    } catch (error) {
      toast.error(getApiErrorMessage(error))
    }
  }

  if (sent) {
    return (
      <AuthLayout title="Check your email" subtitle="We've sent password reset instructions to your inbox.">
        <div className="flex flex-col items-center rounded-2xl bg-forest/5 px-6 py-10 text-center animate-fade-in">
          <CheckCircle2 className="h-10 w-10 text-forest" />
          <p className="mt-3 text-sm text-muted-foreground">
            If an account exists with that email, a reset link is on its way. It may take a few minutes to arrive.
          </p>
          <Link to="/login" className="mt-6 text-sm font-semibold text-forest hover:underline">Back to sign in</Link>
        </div>
      </AuthLayout>
    )
  }

  return (
    <AuthLayout title="Forgot your password?" subtitle="Enter your email and we'll send you a link to reset it.">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
        <Input label="Email address" type="email" error={errors.email?.message} {...register('email')} />
        <Button type="submit" className="w-full" loading={isSubmitting}>
          <Mail className="h-4 w-4" />
          Send reset link
        </Button>
      </form>
      <p className="mt-6 text-center text-sm text-muted-foreground">
        <Link to="/login" className="font-semibold text-forest hover:underline">Back to sign in</Link>
      </p>
    </AuthLayout>
  )
}
