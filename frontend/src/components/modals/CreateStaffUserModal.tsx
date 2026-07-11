import { useEffect, useState } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { cn } from '@/lib/utils'
import { api, getApiErrorMessage } from '@/lib/api'
import { userService } from '@/services/userService'

const ROLE_OPTIONS = [
  { value: 'provincial_office', label: 'Provincial Agriculture Office' },
  { value: 'municipal_office', label: 'Municipal Agriculture Office' },
  { value: 'technician', label: 'Agricultural Technician' },
  { value: 'admin', label: 'System Administrator' },
] as const

const schema = z
  .object({
    first_name: z.string().min(1, 'Required'),
    last_name: z.string().min(1, 'Required'),
    email: z.string().email('Enter a valid email'),
    phone: z.string().min(7, 'Enter a valid phone number'),
    password: z.string().min(8, 'At least 8 characters').regex(/[A-Z]/, 'Needs an uppercase letter').regex(/[0-9]/, 'Needs a number'),
    role: z.enum(['provincial_office', 'municipal_office', 'technician', 'admin']),
    municipality_id: z.coerce.number().optional(),
    license_number: z.string().optional(),
  })
  .refine((data) => data.role !== 'municipal_office' && data.role !== 'technician' || Boolean(data.municipality_id), {
    message: 'Municipality is required for this role',
    path: ['municipality_id'],
  })

type FormValues = z.infer<typeof schema>

interface CreateStaffUserModalProps {
  open: boolean
  onClose: () => void
  onSuccess: () => void
}

/**
 * "Add User" modal — the only way non-farmer accounts (Provincial/Municipal
 * Office, Technician, Admin) get created, since public self-registration
 * is farmers-only by design (see docs/AUTH.md).
 */
export function CreateStaffUserModal({ open, onClose, onSuccess }: CreateStaffUserModalProps) {
  const [municipalities, setMunicipalities] = useState<{ id: number; name: string }[]>([])
  const {
    register,
    handleSubmit,
    control,
    watch,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(schema), defaultValues: { role: 'technician' } })

  const role = watch('role')
  const needsMunicipality = role === 'municipal_office' || role === 'technician'

  useEffect(() => {
    if (open) {
      api.get('/locations/municipalities').then((res) => setMunicipalities(res.data.data))
    }
  }, [open])

  const close = () => {
    reset()
    onClose()
  }

  const onSubmit = async (values: FormValues) => {
    try {
      await userService.create(values)
      toast.success('Account created successfully.')
      onSuccess()
      close()
    } catch (error) {
      toast.error(getApiErrorMessage(error))
    }
  }

  return (
    <Modal
      open={open}
      onClose={close}
      title="Add Staff Account"
      description="Provision a Provincial/Municipal Office, Technician, or Admin account."
      size="lg"
      footer={
        <>
          <Button variant="ghost" onClick={close}>Cancel</Button>
          <Button onClick={handleSubmit(onSubmit)} loading={isSubmitting}>Create Account</Button>
        </>
      }
    >
      <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
        <div>
          <label className="mb-2 block text-sm font-medium text-ink">Role</label>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            <Controller
              control={control}
              name="role"
              render={({ field }) => (
                <>
                  {ROLE_OPTIONS.map((opt) => (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => field.onChange(opt.value)}
                      className={cn(
                        'rounded-xl border-2 px-3 py-2.5 text-xs font-semibold transition-colors',
                        field.value === opt.value ? 'border-forest bg-forest/5 text-forest' : 'border-black/5 text-ink/60 hover:border-forest-light/40',
                      )}
                    >
                      {opt.label}
                    </button>
                  ))}
                </>
              )}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Input label="First name" error={errors.first_name?.message} {...register('first_name')} />
          <Input label="Last name" error={errors.last_name?.message} {...register('last_name')} />
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Input label="Email" type="email" error={errors.email?.message} {...register('email')} />
          <Input label="Phone" error={errors.phone?.message} {...register('phone')} />
        </div>

        <Input label="Temporary password" type="password" error={errors.password?.message} {...register('password')} />

        {needsMunicipality && (
          <div>
            <label className="mb-1.5 block text-sm font-medium text-ink">Municipality</label>
            <select
              className="h-11 w-full rounded-xl border-2 border-input bg-white px-4 text-sm focus-visible:outline-none focus-visible:border-forest-light"
              {...register('municipality_id')}
            >
              <option value="">Select municipality…</option>
              {municipalities.map((m) => (
                <option key={m.id} value={m.id}>{m.name}</option>
              ))}
            </select>
            {errors.municipality_id && <p className="mt-1.5 text-xs text-danger">{errors.municipality_id.message}</p>}
          </div>
        )}

        {role === 'technician' && (
          <Input label="License number (optional)" {...register('license_number')} />
        )}
      </form>
    </Modal>
  )
}
