import {
  LayoutDashboard, MapPin, AlertTriangle, Users, FileBarChart, Megaphone,
  BookOpen, Gift, Calendar, MessageSquare, FileText, Settings, ShieldCheck,
  Map as MapIcon, UserCog, ClipboardList, Newspaper, Share2,
} from 'lucide-react'
import type { UserRole } from '@/types'
import type { LucideIcon } from 'lucide-react'

export interface NavItem {
  label: string
  path: string
  icon: LucideIcon
}

/** Sidebar navigation tree per role — single source of truth for the shell. */
export const NAVIGATION: Record<UserRole, NavItem[]> = {
  farmer: [
    { label: 'My Farms', path: '/farmer/farms', icon: MapPin },
    { label: 'Incidents', path: '/farmer/incidents', icon: AlertTriangle },
    { label: 'Appointments', path: '/farmer/appointments', icon: Calendar },
    { label: 'Messages', path: '/farmer/messages', icon: MessageSquare },
    { label: 'Programs', path: '/farmer/programs', icon: Gift },
    { label: 'News Feed', path: '/farmer/feed', icon: Newspaper },
    { label: 'Knowledge Hub', path: '/farmer/knowledge', icon: BookOpen },
    { label: 'Announcements', path: '/farmer/announcements', icon: Megaphone },
    { label: 'Documents', path: '/farmer/documents', icon: FileText },
    { label: 'Settings', path: '/farmer/settings', icon: Settings },
  ],
  technician: [
    { label: 'Dashboard', path: '/technician/dashboard', icon: LayoutDashboard },
    { label: 'Assigned Incidents', path: '/technician/incidents', icon: ClipboardList },
    { label: 'Map', path: '/technician/map', icon: MapIcon },
    { label: 'Appointments', path: '/technician/appointments', icon: Calendar },
    { label: 'Messages', path: '/technician/messages', icon: MessageSquare },
    { label: 'Settings', path: '/technician/settings', icon: Settings },
  ],
  municipal_office: [
    { label: 'Dashboard', path: '/mao/dashboard', icon: LayoutDashboard },
    { label: 'Incidents', path: '/mao/incidents', icon: AlertTriangle },
    { label: 'GIS Map', path: '/mao/gis', icon: MapIcon },
    { label: 'Technicians', path: '/mao/technicians', icon: Users },
    { label: 'Farmers', path: '/mao/farmers', icon: UserCog },
    { label: 'Reports', path: '/mao/reports', icon: FileBarChart },
    { label: 'Knowledge Sharing', path: '/mao/knowledge-sharing', icon: Share2 },
    { label: 'Announcements', path: '/mao/announcements', icon: Megaphone },
    { label: 'Settings', path: '/mao/settings', icon: Settings },
  ],
  provincial_office: [
    { label: 'Province Dashboard', path: '/ppo/dashboard', icon: LayoutDashboard },
    { label: 'GIS Analytics', path: '/ppo/gis', icon: MapIcon },
    { label: 'Municipalities', path: '/ppo/municipalities', icon: MapPin },
    { label: 'Programs', path: '/ppo/programs', icon: Gift },
    { label: 'Reports', path: '/ppo/reports', icon: FileBarChart },
    { label: 'Knowledge Sharing', path: '/ppo/knowledge-sharing', icon: Share2 },
    { label: 'Announcements', path: '/ppo/announcements', icon: Megaphone },
    { label: 'Settings', path: '/ppo/settings', icon: Settings },
  ],
  admin: [
    { label: 'Dashboard', path: '/admin/dashboard', icon: LayoutDashboard },
    { label: 'Manage Users', path: '/admin/users', icon: Users },
    { label: 'GIS Overview', path: '/admin/gis', icon: MapIcon },
    { label: 'Audit Logs', path: '/admin/audit-logs', icon: ShieldCheck },
    { label: 'Knowledge Sharing', path: '/admin/knowledge-sharing', icon: Share2 },
    { label: 'Settings', path: '/admin/settings', icon: Settings },
  ],
}

export const ROLE_LABELS: Record<UserRole, string> = {
  admin: 'System Administrator',
  provincial_office: 'Provincial Agriculture Office',
  municipal_office: 'Municipal Agriculture Office',
  technician: 'Agricultural Technician',
  farmer: 'Farmer',
}
