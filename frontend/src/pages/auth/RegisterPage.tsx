import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Link, useNavigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { UserPlus } from 'lucide-react'
import { toast } from 'sonner'
import { AuthLayout } from '@/layouts/AuthLayout'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { authService } from '@/services/authService'
import { getApiErrorMessage } from '@/lib/api'
import { api } from '@/lib/api'
import type { Barangay, Municipality } from '@/types'

const schema = z
  .object({
    first_name: z.string().min(1, 'First name is required'),
    last_name: z.string().min(1, 'Last name is required'),
    email: z.string().email('Enter a valid email address'),
    phone: z.string().min(10, 'Enter a valid phone number'),
    municipality_id: z.coerce.number({ invalid_type_error: 'Select your municipality' }).min(1, 'Select your municipality'),
    barangay_id: z.coerce.number({ invalid_type_error: 'Select your barangay' }).min(1, 'Select your barangay'),
    password: z.string().min(8, 'At least 8 characters').regex(/[A-Z]/, 'Include an uppercase letter').regex(/[0-9]/, 'Include a number'),
    password_confirmation: z.string(),
  })
  .refine((data) => data.password === data.password_confirmation, {
    message: 'Passwords do not match',
    path: ['password_confirmation'],
  })

type FormValues = z.infer<typeof schema>

export function RegisterPage() {
  const navigate = useNavigate()
  const [municipalities, setMunicipalities] = useState<Municipality[]>([])
  const [barangays, setBarangays] = useState<Barangay[]>([])

  const {
    register,
    handleSubmit,
    control,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(schema) })

  const municipalityId = watch('municipality_id')

  useEffect(() => {
    api.get('/locations/municipalities').then((res) => setMunicipalities(res.data.data))
  }, [])

  useEffect(() => {
    if (!municipalityId) return
    api.get('/locations/barangays', { params: { municipality_id: municipalityId } }).then((res) => setBarangays(res.data.data))
  }, [municipalityId])

  const onSubmit = async (values: FormValues) => {
    try {
      const { data } = await authService.register(values)
      toast.success(data.message)
      navigate('/verify-otp', {
        state: {
          email: values.email,
          verificationCode: data.verification_code,
        },
      })
    } catch (error) {
      toast.error(getApiErrorMessage(error, 'Registration failed. Please check your details.'))
    }
  }

  return (
    <AuthLayout title="Create your farmer account" subtitle="Register to start reporting incidents and requesting assistance.">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
        <div className="grid grid-cols-2 gap-4">
          <Input label="First name" error={errors.first_name?.message} {...register('first_name')} />
          <Input label="Last name" error={errors.last_name?.message} {...register('last_name')} />
        </div>

        <Input label="Email address" type="email" error={errors.email?.message} {...register('email')} />
        <Input label="Mobile number" type="tel" placeholder="09XXXXXXXXX" error={errors.phone?.message} {...register('phone')} />

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-ink">Municipality</label>
            <Controller
              control={control}
              name="municipality_id"
              render={({ field }) => (
                <select
                  {...field}
                  value={field.value ?? ''}
                  className="h-11 w-full rounded-xl border-2 border-input bg-white px-3 text-sm focus-visible:outline-none focus-visible:border-forest-light"
                >
                  <option value="">Select...</option>
                  {municipalities.map((m) => (
                    <option key={m.id} value={m.id}>{m.name}</option>
                  ))}
                </select>
              )}
            />
            {errors.municipality_id && <p className="mt-1.5 text-xs text-danger">{errors.municipality_id.message}</p>}
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-ink">Barangay</label>
            <Controller
              control={control}
              name="barangay_id"
              render={({ field }) => (
                <select
                  {...field}
                  value={field.value ?? ''}
                  disabled={!municipalityId}
                  className="h-11 w-full rounded-xl border-2 border-input bg-white px-3 text-sm focus-visible:outline-none focus-visible:border-forest-light disabled:bg-muted"
                >
                  <option value="">Select...</option>
                  {barangays.map((b) => (
                    <option key={b.id} value={b.id}>{b.name}</option>
                  ))}
                </select>
              )}
            />
            {errors.barangay_id && <p className="mt-1.5 text-xs text-danger">{errors.barangay_id.message}</p>}
          </div>
        </div>

        <Input label="Password" type="password" error={errors.password?.message} {...register('password')} />
        <Input label="Confirm password" type="password" error={errors.password_confirmation?.message} {...register('password_confirmation')} />

        <Button type="submit" className="w-full" loading={isSubmitting}>
          <UserPlus className="h-4 w-4" />
          Create account
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-muted-foreground">
        Already have an account?{' '}
        <Link to="/login" className="font-semibold text-forest hover:underline">Sign in</Link>
      </p>
    </AuthLayout>
  )
}
