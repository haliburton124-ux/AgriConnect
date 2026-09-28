import { cn, initials } from '@/lib/utils'
import type { User } from '@/types'

const sizes = {
  sm: 'h-9 w-9 text-sm rounded-full',
  md: 'h-16 w-16 text-lg rounded-2xl',
  lg: 'h-24 w-24 text-2xl rounded-3xl',
} as const

export function UserAvatar({
  user,
  size = 'md',
  className,
}: {
  user: Pick<User, 'first_name' | 'last_name' | 'avatar_url' | 'full_name'>
  size?: keyof typeof sizes
  className?: string
}) {
  if (user.avatar_url) {
    return (
      <img
        src={user.avatar_url}
        alt={user.full_name}
        className={cn('shrink-0 object-cover', sizes[size], className)}
      />
    )
  }

  return (
    <div
      className={cn(
        'flex shrink-0 items-center justify-center font-semibold',
        sizes[size],
        className,
      )}
    >
      {initials(user.first_name, user.last_name)}
    </div>
  )
}
