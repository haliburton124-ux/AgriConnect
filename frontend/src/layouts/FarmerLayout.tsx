import { Outlet } from 'react-router-dom'
import { FarmerNavbar } from '@/components/landing/FarmerNavbar'
import { Footer } from '@/components/landing/Footer'
import { FarmerActionsProvider } from '@/contexts/FarmerActionsContext'

/**
 * Wraps authenticated farmer app pages (My Farms, News Feed, etc.).
 * Top navbar only — no sidebar.
 */
export function FarmerLayout() {
  return (
    <FarmerActionsProvider>
      <div className="min-h-screen bg-canvas">
        <FarmerNavbar />
        <main className="mx-auto max-w-7xl px-4 pb-16 pt-28 sm:px-6 lg:px-8">
          <Outlet />
        </main>
        <Footer />
      </div>
    </FarmerActionsProvider>
  )
}
