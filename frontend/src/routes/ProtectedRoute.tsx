import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuthStore, ROLE_HOME } from '@/store/authStore'
import type { UserRole } from '@/types'

interface ProtectedRouteProps {
  allowedRoles?: UserRole[]
}

/**
 * Guards a route subtree: redirects unauthenticated visitors to /login
 * (preserving the intended destination), and redirects authenticated users
 * whose role isn't allowed here back to their own dashboard — mirrors the
 * `role:` middleware enforced server-side in routes/api.php.
 */
export function ProtectedRoute({ allowedRoles }: ProtectedRouteProps) {
  const { isAuthenticated, user } = useAuthStore()
  const location = useLocation()

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to={ROLE_HOME[user.role]} replace />
  }

  return <Outlet />
}
