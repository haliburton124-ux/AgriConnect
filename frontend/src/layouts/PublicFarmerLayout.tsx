import { Outlet, useLocation } from 'react-router-dom'
import { FarmerNavbar } from '@/components/landing/FarmerNavbar'
import { Footer } from '@/components/landing/Footer'
import { FarmerActionsProvider } from '@/contexts/FarmerActionsContext'

/**
 * Public Farmer marketing shell — top navbar, page content, footer.
 * No sidebar. Used for /, /services, /knowledge-center, etc.
 */
export function PublicFarmerLayout() {
  const { pathname } = useLocation()
  const transparentNav = pathname === '/'

  return (
    <FarmerActionsProvider>
      <div className="min-h-screen bg-canvas">
        <FarmerNavbar transparentAtTop={transparentNav} />
        <main>
          <Outlet />
        </main>
        <Footer />
      </div>
    </FarmerActionsProvider>
  )
}
