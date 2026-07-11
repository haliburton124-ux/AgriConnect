import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import type { ComponentType } from 'react'
import { useAuthStore, ROLE_HOME } from '@/store/authStore'
import { ProtectedRoute } from '@/routes/ProtectedRoute'
import { DashboardLayout } from '@/layouts/DashboardLayout'
import { FarmerLayout } from '@/layouts/FarmerLayout'
import { PublicFarmerLayout } from '@/layouts/PublicFarmerLayout'
import { NAVIGATION } from '@/config/navigation'
import { ComingSoonPage } from '@/pages/ComingSoonPage'

import { LoginPage } from '@/pages/auth/LoginPage'
import { RegisterPage } from '@/pages/auth/RegisterPage'
import { VerifyOtpPage } from '@/pages/auth/VerifyOtpPage'
import { ForgotPasswordPage } from '@/pages/auth/ForgotPasswordPage'
import { HomePage } from '@/pages/public/HomePage'
import { ServicesPage } from '@/pages/public/ServicesPage'
import { AgriculturalExtensionPage } from '@/pages/public/AgriculturalExtensionPage'
import { KnowledgeCenterPublicPage } from '@/pages/public/KnowledgeCenterPublicPage'
import { GovernmentProgramsPage } from '@/pages/public/GovernmentProgramsPage'
import { ContactPage } from '@/pages/public/ContactPage'
import { FarmerIncidentsPage } from '@/pages/farmer/FarmerIncidentsPage'
import { FarmerFarmsPage } from '@/pages/farmer/FarmerFarmsPage'
import { AppointmentsPage } from '@/pages/shared/AppointmentsPage'
import { MessagesPage } from '@/pages/shared/MessagesPage'
import { DocumentsPage } from '@/pages/shared/DocumentsPage'
import { ProgramsPage } from '@/pages/farmer/ProgramsPage'
import { KnowledgeCenterPage } from '@/pages/shared/KnowledgeCenterPage'
import { CommunityFeedPage } from '@/pages/shared/CommunityFeedPage'
import { KnowledgeSharingPage } from '@/pages/shared/KnowledgeSharingPage'
import { AnnouncementsPage } from '@/pages/shared/AnnouncementsPage'
import { SettingsPage } from '@/pages/shared/SettingsPage'
import { AdminAuditLogsPage } from '@/pages/admin/AdminAuditLogsPage'
import { TechnicianDashboardPage } from '@/pages/technician/TechnicianDashboardPage'
import { MaoTechniciansPage } from '@/pages/mao/MaoTechniciansPage'
import { MaoFarmersPage } from '@/pages/mao/MaoFarmersPage'
import { PpoMunicipalitiesPage } from '@/pages/ppo/PpoMunicipalitiesPage'
import { MaoIncidentsPage } from '@/pages/mao/MaoIncidentsPage'
import { TechnicianIncidentsPage } from '@/pages/technician/TechnicianIncidentsPage'
import { GisMapPage } from '@/pages/gis/GisMapPage'
import { ReportsPage } from '@/pages/reports/ReportsPage'
import { AdminUsersPage } from '@/pages/admin/AdminUsersPage'
import { DashboardPage } from '@/pages/dashboard/DashboardPage'

import type { UserRole } from '@/types'

const BUILT_PAGES: Partial<Record<string, ComponentType>> = {
  '/farmer/incidents': FarmerIncidentsPage,
  '/farmer/farms': FarmerFarmsPage,
  '/farmer/appointments': AppointmentsPage,
  '/technician/appointments': AppointmentsPage,
  '/farmer/messages': MessagesPage,
  '/technician/messages': MessagesPage,
  '/farmer/documents': DocumentsPage,
  '/farmer/programs': ProgramsPage,
  '/ppo/programs': ProgramsPage,
  '/farmer/knowledge': KnowledgeCenterPage,
  '/farmer/feed': CommunityFeedPage,
  '/mao/knowledge-sharing': KnowledgeSharingPage,
  '/ppo/knowledge-sharing': KnowledgeSharingPage,
  '/admin/knowledge-sharing': KnowledgeSharingPage,
  '/farmer/announcements': AnnouncementsPage,
  '/mao/announcements': AnnouncementsPage,
  '/ppo/announcements': AnnouncementsPage,
  '/mao/incidents': MaoIncidentsPage,
  '/mao/gis': GisMapPage,
  '/ppo/gis': GisMapPage,
  '/admin/gis': GisMapPage,
  '/mao/reports': ReportsPage,
  '/ppo/reports': ReportsPage,
  '/admin/users': AdminUsersPage,
  '/mao/dashboard': DashboardPage,
  '/ppo/dashboard': DashboardPage,
  '/admin/dashboard': DashboardPage,
  '/technician/incidents': TechnicianIncidentsPage,
  '/technician/dashboard': TechnicianDashboardPage,
  '/mao/technicians': MaoTechniciansPage,
  '/mao/farmers': MaoFarmersPage,
  '/ppo/municipalities': PpoMunicipalitiesPage,
  '/technician/map': GisMapPage,
  '/admin/audit-logs': AdminAuditLogsPage,
  '/farmer/settings': SettingsPage,
  '/technician/settings': SettingsPage,
  '/mao/settings': SettingsPage,
  '/ppo/settings': SettingsPage,
  '/admin/settings': SettingsPage,
}

const DASHBOARD_ROLES: UserRole[] = ['technician', 'municipal_office', 'provincial_office', 'admin']

function FallbackRedirect() {
  const { isAuthenticated, user } = useAuthStore()

  if (isAuthenticated && user && user.role !== 'farmer') {
    return <Navigate to={ROLE_HOME[user.role]} replace />
  }

  return <Navigate to="/" replace />
}

export function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* ── Public Farmer marketing site (multi-page, top nav) ── */}
        <Route element={<PublicFarmerLayout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/services" element={<ServicesPage />} />
          <Route path="/agricultural-extension" element={<AgriculturalExtensionPage />} />
          <Route path="/knowledge-center" element={<KnowledgeCenterPublicPage />} />
          <Route path="/government-programs" element={<GovernmentProgramsPage />} />
          <Route path="/contact" element={<ContactPage />} />
        </Route>

        {/* Legacy path → home */}
        <Route path="/farmer" element={<Navigate to="/" replace />} />

        {/* ── Public auth routes ─────────────────────────────── */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/verify-otp" element={<VerifyOtpPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />

        {/* ── Farmer: authenticated app pages (top-nav shell) ── */}
        <Route element={<ProtectedRoute allowedRoles={['farmer']} />}>
          <Route element={<FarmerLayout />}>
            {NAVIGATION.farmer.map((item) => {
              const Page = BUILT_PAGES[item.path] ?? (() => <ComingSoonPage title={item.label} />)
              return <Route key={item.path} path={item.path} element={<Page />} />
            })}
          </Route>
        </Route>

        {/* ── Role-guarded dashboard shells (Technician/MAO/PPO/Admin) ── */}
        {DASHBOARD_ROLES.map((role) => (
          <Route key={role} element={<ProtectedRoute allowedRoles={[role]} />}>
            <Route element={<DashboardLayout />}>
              {NAVIGATION[role].map((item) => {
                const Page = BUILT_PAGES[item.path] ?? (() => <ComingSoonPage title={item.label} />)
                return <Route key={item.path} path={item.path} element={<Page />} />
              })}
            </Route>
          </Route>
        ))}

        <Route path="*" element={<FallbackRedirect />} />
      </Routes>
    </BrowserRouter>
  )
}
