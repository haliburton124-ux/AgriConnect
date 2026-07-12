import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Link, useNavigate } from 'react-router-dom'
import { useState } from 'react'
import { Eye, EyeOff, LogIn } from 'lucide-react'
import { toast } from 'sonner'
import { AuthLayout } from '@/layouts/AuthLayout'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { authService } from '@/services/authService'
import { useAuthStore, ROLE_HOME } from '@/store/authStore'
import { getApiErrorMessage } from '@/lib/api'

const schema = z.object({
  email: z.string().email('Enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
})

type FormValues = z.infer<typeof schema>

export function LoginPage() {
  const navigate = useNavigate()
  const setSession = useAuthStore((s) => s.setSession)
  const [showPassword, setShowPassword] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(schema) })

  const onSubmit = async (values: FormValues) => {
    try {
      const { data } = await authService.login(values)
      setSession(data.user, data.token)
      toast.success(`Welcome back, ${data.user.first_name}!`)
      navigate(ROLE_HOME[data.user.role] ?? '/')
    } catch (error) {
      toast.error(getApiErrorMessage(error, 'Invalid email or password.'))
    }
  }

  return (
    <AuthLayout title="Welcome back" subtitle="Sign in to continue to AgriConnect.">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
        <Input
          id="email"
          type="email"
          label="Email address"
          placeholder="you@example.com"
          autoComplete="email"
          error={errors.email?.message}
          {...register('email')}
        />

        <div className="relative">
          <Input
            id="password"
            type={showPassword ? 'text' : 'password'}
            label="Password"
            placeholder="••••••••"
            autoComplete="current-password"
            error={errors.password?.message}
            {...register('password')}
          />
          <button
            type="button"
            onClick={() => setShowPassword((v) => !v)}
            className="absolute right-2.5 top-[34px] rounded-full p-1.5 text-muted-foreground transition-colors hover:bg-forest/10 hover:text-forest"
            aria-label={showPassword ? 'Hide password' : 'Show password'}
          >
            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>

        <div className="flex justify-end">
          <Link to="/forgot-password" className="text-sm font-semibold text-forest hover:text-forest-light hover:underline">
            Forgot password?
          </Link>
        </div>

        <Button type="submit" className="w-full" loading={isSubmitting}>
          <LogIn className="h-4 w-4" />
          Sign in
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-muted-foreground">
        New farmer?{' '}
        <Link to="/register" className="font-semibold text-forest hover:underline">
          Create an account
        </Link>
      </p>
    </AuthLayout>
  )
}
