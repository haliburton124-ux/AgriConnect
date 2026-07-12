import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Link, useNavigate } from 'react-router-dom'
import { useState, type KeyboardEvent } from 'react'
import { ArrowLeft, ArrowRight, UserPlus } from 'lucide-react'
import { toast } from 'sonner'
import { AuthLayout } from '@/layouts/AuthLayout'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { MunicipalityBarangayFields } from '@/components/forms/MunicipalityBarangayFields'
import { authService } from '@/services/authService'
import { getApiErrorMessage } from '@/lib/api'

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

const STEPS = [
  { label: 'Your details', fields: ['first_name', 'last_name', 'email', 'phone'] as const },
  { label: 'Location', fields: ['municipality_id', 'barangay_id'] as const },
  { label: 'Security', fields: ['password', 'password_confirmation'] as const },
]

function StepIndicator({ step }: { step: number }) {
  return (
    <div className="mb-7 flex items-center gap-2">
      {STEPS.map((s, i) => {
        const index = i + 1
        const active = index === step
        const done = index < step
        return (
          <div key={s.label} className="flex flex-1 items-center gap-2">
            <div
              className={[
                'flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-semibold transition-colors',
                done ? 'bg-forest text-white' : active ? 'bg-forest/10 text-forest ring-2 ring-forest' : 'bg-muted text-muted-foreground',
              ].join(' ')}
            >
              {index}
            </div>
            {i < STEPS.length - 1 && (
              <div className={['h-0.5 flex-1 rounded-full transition-colors', done ? 'bg-forest' : 'bg-muted'].join(' ')} />
            )}
          </div>
        )
      })}
    </div>
  )
}

export function RegisterPage() {
  const navigate = useNavigate()
  const [step, setStep] = useState(1)

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    trigger,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(schema) })

  const municipalityId = watch('municipality_id')
  const barangayId = watch('barangay_id')

  const handleMunicipalityChange = (value: string) => {
    setValue('municipality_id', value ? Number(value) : ('' as unknown as number), { shouldValidate: true })
    setValue('barangay_id', '' as unknown as number, { shouldValidate: true })
  }

  const handleBarangayChange = (value: string) => {
    setValue('barangay_id', value ? Number(value) : ('' as unknown as number), { shouldValidate: true })
  }

  const isLastStep = step === STEPS.length

  const handleNext = async () => {
    const valid = await trigger(STEPS[step - 1].fields as unknown as (keyof FormValues)[])
    if (valid) setStep((s) => Math.min(s + 1, STEPS.length))
  }

  const handleBack = () => setStep((s) => Math.max(s - 1, 1))

  const handleFormKeyDown = (e: KeyboardEvent<HTMLFormElement>) => {
    if (e.key === 'Enter' && !isLastStep) {
      e.preventDefault()
      handleNext()
    }
  }

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
    <AuthLayout
      title="Create your farmer account"
      subtitle={`Step ${step} of ${STEPS.length} — ${STEPS[step - 1].label}.`}
    >
      <StepIndicator step={step} />

      <form onSubmit={handleSubmit(onSubmit)} onKeyDown={handleFormKeyDown} className="space-y-4" noValidate>
        {step === 1 && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <Input label="First name" error={errors.first_name?.message} {...register('first_name')} />
              <Input label="Last name" error={errors.last_name?.message} {...register('last_name')} />
            </div>
            <Input label="Email address" type="email" error={errors.email?.message} {...register('email')} />
            <Input label="Mobile number" type="tel" placeholder="09XXXXXXXXX" error={errors.phone?.message} {...register('phone')} />
          </div>
        )}

        {step === 2 && (
          <MunicipalityBarangayFields
            municipalityId={municipalityId}
            barangayId={barangayId}
            onMunicipalityChange={handleMunicipalityChange}
            onBarangayChange={handleBarangayChange}
            municipalityError={errors.municipality_id?.message}
            barangayError={errors.barangay_id?.message}
          />
        )}

        {step === 3 && (
          <div className="space-y-4">
            <Input label="Password" type="password" error={errors.password?.message} {...register('password')} />
            <Input label="Confirm password" type="password" error={errors.password_confirmation?.message} {...register('password_confirmation')} />
          </div>
        )}

        <div className="flex gap-3 pt-2">
          {step > 1 && (
            <button
              type="button"
              onClick={handleBack}
              className="flex h-11 flex-1 items-center justify-center gap-2 rounded-xl border-2 border-input bg-white text-sm font-semibold text-ink transition-colors hover:bg-muted"
            >
              <ArrowLeft className="h-4 w-4" />
              Back
            </button>
          )}

          {!isLastStep && (
            <Button type="button" onClick={handleNext} className="flex-1">
              Continue
              <ArrowRight className="h-4 w-4" />
            </Button>
          )}

          {isLastStep && (
            <Button type="submit" className="flex-1" loading={isSubmitting}>
              <UserPlus className="h-4 w-4" />
              Create account
            </Button>
          )}
        </div>
      </form>

      <p className="mt-6 text-center text-sm text-muted-foreground">
        Already have an account?{' '}
        <Link to="/login" className="font-semibold text-forest hover:underline">Sign in</Link>
      </p>
    </AuthLayout>
  )
}
