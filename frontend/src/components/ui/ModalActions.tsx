import { type ReactNode } from 'react'
import { cn } from '@/lib/utils'

interface ModalActionsProps {
  cancel: ReactNode
  confirm: ReactNode
  className?: string
}

/** Cancel left / confirm right on desktop; responsive full-width stack on narrow screens. */
export function ModalActions({ cancel, confirm, className }: ModalActionsProps) {
  return (
    <div
      className={cn(
        'flex w-full flex-col gap-3 min-[420px]:flex-row min-[420px]:items-center min-[420px]:justify-between',
        className,
      )}
    >
      <div className="w-full min-[420px]:w-auto min-[420px]:flex-1 min-[420px]:flex min-[420px]:justify-start">
        {cancel}
      </div>
      <div className="w-full min-[420px]:w-auto min-[420px]:flex-1 min-[420px]:flex min-[420px]:justify-end">
        {confirm}
      </div>
    </div>
  )
}

export const modalActionButtonClass =
  'h-11 w-full min-[420px]:w-auto min-[420px]:min-w-[8.5rem] rounded-xl px-6 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forest/40 focus-visible:ring-offset-2'
