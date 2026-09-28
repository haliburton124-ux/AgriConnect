import { Controller, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { PasswordInput } from '@/components/ui/PasswordInput'
import { PhilippinePhoneInput } from '@/components/forms/PhilippinePhoneInput'
import { incidentService } from '@/services/incidentService'
import { getApiErrorMessage } from '@/lib/api'
import { isValidPhilippineLocalPhone, toPhilippineE164 } from '@/lib/phone'
import { useMunicipalityBarangays } from '@/hooks/useMunicipalityBarangays'
import { useAuthStore } from '@/store/authStore'
import { cn } from '@/lib/utils'

const SPECIALIZATIONS = [
  { value: 'crop_disease', label: 'Crop disease' },
  { value: 'pest_infestation', label: 'Pest infestation' },
  { value: 'soil_management', label: 'Soil management' },
  { value: 'irrigation', label: 'Irrigation' },
  { value: 'livestock', label: 'Livestock' },
] as const

const schema = z
  .object({
    first_name: z.string().min(1, 'First name is required'),
    last_name: z.string().min(1, 'Last name is required'),
    email: z.string().email('Enter a valid email address'),
    phone: z.string().refine(isValidPhilippineLocalPhone, 'Enter a valid Philippine mobile number (9XXXXXXXXX)'),
    barangay_id: z.coerce.number({ invalid_type_error: 'Select a barangay' }).min(1, 'Select a barangay'),
    license_number: z.string().optional(),
    specializations: z.array(z.string()).optional(),
    password: z.string().min(8, 'At least 8 characters').regex(/[A-Z]/, 'Include an uppercase letter').regex(/[0-9]/, 'Include a number'),
    password_confirmation: z.string(),
  })
  .refine((data) => data.password === data.password_confirmation, {
    message: 'Passwords do not match',
    path: ['password_confirmation'],
  })

type FormValues = z.infer<typeof schema>

interface CreateTechnicianModalProps {
  open: boolean
  onClose: () => void
  onSuccess: () => void
}

export function CreateTechnicianModal({ open, onClose, onSuccess }: CreateTechnicianModalProps) {
  const municipalityId = useAuthStore((s) => s.user?.municipality?.id)
  const municipalityName = useAuthStore((s) => s.user?.municipality?.name)
  const { barangays, loadingBarangays } = useMunicipalityBarangays(municipalityId)

  const {
    register,
    handleSubmit,
    control,
    reset,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { specializations: [], phone: '', license_number: '' },
  })

  const selectedSpecializations = watch('specializations') ?? []

  const close = () => {
    reset({ specializations: [], phone: '', license_number: '' })
    onClose()
  }

  const toggleSpecialization = (value: string) => {
    const next = selectedSpecializations.includes(value)
      ? selectedSpecializations.filter((item) => item !== value)
      : [...selectedSpecializations, value]
    setValue('specializations', next, { shouldDirty: true })
  }

  const onSubmit = async (values: FormValues) => {
    try {
      await incidentService.createTechnician({
        first_name: values.first_name,
        last_name: values.last_name,
        email: values.email,
        phone: toPhilippineE164(values.phone),
        password: values.password,
        barangay_id: values.barangay_id,
        license_number: values.license_number || undefined,
        specializations: values.specializations?.length ? values.specializations : undefined,
      })
      toast.success('Technician account created.')
      onSuccess()
      close()
    } catch (error) {
      toast.error(getApiErrorMessage(error, 'Could not create the technician.'))
    }
  }

  return (
    <Modal
      open={open}
      onClose={close}
      title="Add Technician"
      description={`Create an agricultural technician account for ${municipalityName ?? 'your municipality'}.`}
      size="lg"
      footer={
        <>
          <Button variant="ghost" onClick={close}>Cancel</Button>
          <Button onClick={handleSubmit(onSubmit)} loading={isSubmitting}>Create Technician</Button>
        </>
      }
    >
      <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Input label="First name" error={errors.first_name?.message} {...register('first_name')} />
          <Input label="Last name" error={errors.last_name?.message} {...register('last_name')} />
        </div>

        <Input label="Email" type="email" error={errors.email?.message} {...register('email')} />

        <Controller
          name="phone"
          control={control}
          render={({ field }) => (
            <PhilippinePhoneInput
              label="Mobile number"
              value={field.value}
              onChange={field.onChange}
              onBlur={field.onBlur}
              error={errors.phone?.message}
            />
          )}
        />

        <div>
          <label className="mb-1.5 block text-sm font-medium text-ink">Barangay</label>
          <select
            className="h-11 w-full rounded-xl border-2 border-input bg-white px-4 text-sm focus-visible:border-forest-light focus-visible:outline-none"
            {...register('barangay_id')}
          >
            <option value="">{loadingBarangays ? 'Loading barangays…' : 'Select barangay…'}</option>
            {barangays.map((barangay) => (
              <option key={barangay.id} value={barangay.id}>{barangay.name}</option>
            ))}
          </select>
          {errors.barangay_id && <p className="mt-1.5 text-xs text-danger">{errors.barangay_id.message}</p>}
          <p className="mt-1.5 text-xs text-muted-foreground">Assigned to {municipalityName ?? 'your municipality'}.</p>
        </div>

        <Input label="License number (optional)" error={errors.license_number?.message} {...register('license_number')} />

        <div>
          <p className="mb-1.5 text-sm font-medium text-ink">Specializations</p>
          <div className="flex flex-wrap gap-2">
            {SPECIALIZATIONS.map((item) => {
              const active = selectedSpecializations.includes(item.value)
              return (
                <button
                  key={item.value}
                  type="button"
                  onClick={() => toggleSpecialization(item.value)}
                  className={cn(
                    'rounded-full px-3 py-1.5 text-xs font-semibold transition-colors',
                    active ? 'bg-gradient-primary text-white shadow-card' : 'border border-black/5 bg-white text-ink/70 hover:bg-forest/5',
                  )}
                >
                  {item.label}
                </button>
              )
            })}
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <PasswordInput label="Temporary password" error={errors.password?.message} {...register('password')} />
          <PasswordInput label="Confirm password" error={errors.password_confirmation?.message} {...register('password_confirmation')} />
        </div>
      </form>
    </Modal>
  )
}
