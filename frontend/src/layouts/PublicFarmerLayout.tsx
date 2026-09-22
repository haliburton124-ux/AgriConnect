import { FarmerActionsProvider } from '@/contexts/FarmerActionsContext'
import { PublicNavbar } from '@/components/landing/PublicNavbar'
import { PublicFooter } from '@/components/landing/PublicFooter'
import { NavigationOutlet } from '@/components/navigation/PageLoadingOverlay'

/**
 * Public Farmer marketing shell — top navbar, page content, footer.
 * No sidebar. Used for /, /services, /knowledge-center, etc.
 */
export function PublicFarmerLayout() {
  return (
    <FarmerActionsProvider>
      <div className="min-h-screen bg-white">
        <PublicNavbar />
        <main>
          <NavigationOutlet />
        </main>
        <PublicFooter />
      </div>
    </FarmerActionsProvider>
  )
}
