import { useState, useRef, type KeyboardEvent, type ClipboardEvent } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { ShieldCheck } from 'lucide-react'
import { toast } from 'sonner'
import { AuthLayout } from '@/layouts/AuthLayout'
import { Button } from '@/components/ui/Button'
import { authService } from '@/services/authService'
import { useAuthStore, ROLE_HOME } from '@/store/authStore'
import { getApiErrorMessage } from '@/lib/api'

export function VerifyOtpPage() {
  const location = useLocation()
  const navigate = useNavigate()
  const setSession = useAuthStore((s) => s.setSession)
  const email = (location.state as { email?: string })?.email ?? ''

  const [digits, setDigits] = useState<string[]>(Array(6).fill(''))
  const [submitting, setSubmitting] = useState(false)
  const [resending, setResending] = useState(false)
  const inputRefs = useRef<(HTMLInputElement | null)[]>([])

  const handleChange = (index: number, value: string) => {
    if (!/^\d?$/.test(value)) return
    const next = [...digits]
    next[index] = value
    setDigits(next)
    if (value && index < 5) inputRefs.current[index + 1]?.focus()
  }

  const handleKeyDown = (index: number, e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !digits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus()
    }
  }

  const handlePaste = (e: ClipboardEvent<HTMLInputElement>) => {
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6)
    if (pasted.length === 6) {
      setDigits(pasted.split(''))
      inputRefs.current[5]?.focus()
    }
  }

  const otp = digits.join('')

  const handleVerify = async () => {
    if (otp.length !== 6) {
      toast.error('Please enter the complete 6-digit code.')
      return
    }
    setSubmitting(true)
    try {
      const { data } = await authService.verifyOtp(email, otp)
      setSession(data.user, data.token)
      toast.success('Account verified successfully!')
      navigate(ROLE_HOME[data.user.role] ?? '/')
    } catch (error) {
      toast.error(getApiErrorMessage(error, 'Invalid or expired code.'))
    } finally {
      setSubmitting(false)
    }
  }

  const handleResend = async () => {
    setResending(true)
    try {
      await authService.resendOtp(email)
      toast.success('A new code has been sent to your email.')
    } catch (error) {
      toast.error(getApiErrorMessage(error))
    } finally {
      setResending(false)
    }
  }

  return (
    <AuthLayout title="Verify your email" subtitle={`Enter the 6-digit code we sent to ${email || 'your email'}.`}>
      <div className="flex justify-between gap-2" onPaste={handlePaste}>
        {digits.map((digit, i) => (
          <input
            key={i}
            ref={(el) => (inputRefs.current[i] = el)}
            type="text"
            inputMode="numeric"
            maxLength={1}
            value={digit}
            onChange={(e) => handleChange(i, e.target.value)}
            onKeyDown={(e) => handleKeyDown(i, e)}
            className="h-14 w-12 rounded-xl border-2 border-input bg-white text-center text-xl font-semibold focus-visible:outline-none focus-visible:border-forest-light"
            aria-label={`Digit ${i + 1}`}
          />
        ))}
      </div>

      <Button className="mt-8 w-full" loading={submitting} onClick={handleVerify}>
        <ShieldCheck className="h-4 w-4" />
        Verify account
      </Button>

      <p className="mt-6 text-center text-sm text-muted-foreground">
        Didn't get a code?{' '}
        <button onClick={handleResend} disabled={resending} className="font-semibold text-forest hover:underline disabled:opacity-50">
          {resending ? 'Sending…' : 'Resend code'}
        </button>
      </p>
    </AuthLayout>
  )
}
