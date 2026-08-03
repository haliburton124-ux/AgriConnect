import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { api, getApiErrorMessage } from '@/lib/api'
import { userService } from '@/services/userService'

const schema = z.object({
  first_name: z.string().min(1, 'Required'),
  last_name: z.string().min(1, 'Required'),
  email: z.string().email('Enter a valid email'),
  phone: z.string().min(7, 'Enter a valid phone number'),
  password: z.string().min(8, 'At least 8 characters').regex(/[A-Z]/, 'Needs an uppercase letter').regex(/[0-9]/, 'Needs a number'),
  municipality_id: z.coerce.number().min(1, 'Select a municipality'),
})

type FormValues = z.infer<typeof schema>

interface CreateStaffUserModalProps {
  open: boolean
  onClose: () => void
  onSuccess: () => void
}

/** Admin-only flow to provision Municipal Agriculture Office accounts. */
export function CreateStaffUserModal({ open, onClose, onSuccess }: CreateStaffUserModalProps) {
  const [municipalities, setMunicipalities] = useState<{ id: number; name: string }[]>([])
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(schema) })

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
      await userService.create({ ...values, role: 'municipal_office' })
      toast.success('Municipal office account created successfully.')
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
      title="Add Municipal Office Account"
      description="Provision a Municipal Agriculture Office account for an LGU in Ilocos Norte."
      size="lg"
      footer={
        <>
          <Button variant="ghost" onClick={close}>Cancel</Button>
          <Button onClick={handleSubmit(onSubmit)} loading={isSubmitting}>Create Account</Button>
        </>
      }
    >
      <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Input label="First name" error={errors.first_name?.message} {...register('first_name')} />
          <Input label="Last name" error={errors.last_name?.message} {...register('last_name')} />
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Input label="Email" type="email" error={errors.email?.message} {...register('email')} />
          <Input label="Phone" error={errors.phone?.message} {...register('phone')} />
        </div>

        <Input label="Temporary password" type="password" error={errors.password?.message} {...register('password')} />

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
      </form>
    </Modal>
  )
}
