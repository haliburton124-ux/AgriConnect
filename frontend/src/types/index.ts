export type UserRole = 'admin' | 'provincial_office' | 'municipal_office' | 'technician' | 'farmer'

export interface Municipality {
  id: number
  name: string
  type: 'city' | 'municipality'
  latitude?: number
  longitude?: number
}

export interface Barangay {
  id: number
  name: string
  latitude?: number
  longitude?: number
}

export interface User {
  id: number
  first_name: string
  last_name: string
  full_name: string
  email: string
  phone: string
  role: UserRole
  status: 'active' | 'inactive' | 'suspended' | 'pending'
  avatar_url: string | null
  municipality?: { id: number; name: string } | null
  barangay?: { id: number; name: string } | null
  two_factor_enabled: boolean
  email_verified_at: string | null
  created_at: string
}

export type IncidentStatus = 'pending' | 'validated' | 'assigned' | 'ongoing' | 'resolved' | 'rejected'
export type IncidentSeverity = 'low' | 'medium' | 'high' | 'critical'

export interface IncidentCategory {
  id: number
  name: string
  slug: string
  icon: string
  color: string
}

export interface IncidentMedia {
  id: number
  type: 'photo' | 'video'
  url: string
  mime_type: string
}

export interface Recommendation {
  id: number
  inspection_notes: string
  treatment_recommendation: string
  follow_up_actions: string | null
  requires_follow_up: boolean
  follow_up_date: string | null
  attachments: string[]
  technician?: { id: number; full_name: string }
  created_at: string
}

export interface Incident {
  id: number
  reference_code: string
  title: string
  description: string
  severity: IncidentSeverity
  status: IncidentStatus
  latitude: number
  longitude: number
  incident_date: string
  remarks: string | null
  rejection_reason: string | null
  category?: IncidentCategory
  farmer?: { id: number; full_name: string; phone: string }
  farm?: { id: number; farm_name: string } | null
  municipality?: { id: number; name: string }
  barangay?: { id: number; name: string }
  assigned_technician?: { id: number; full_name: string; phone: string } | null
  media?: IncidentMedia[]
  status_history?: IncidentStatusHistoryEntry[]
  recommendations?: Recommendation[]
  created_at: string
  updated_at: string
}

export interface IncidentStatusHistoryEntry {
  id: number
  from_status: IncidentStatus | null
  to_status: IncidentStatus
  notes: string | null
  changed_by?: { id: number; full_name: string; role: UserRole }
  created_at: string
}

export interface Farm {
  id: number
  farm_name: string
  address: string | null
  latitude: number
  longitude: number
  area_hectares: number | null
  farm_type: string
  primary_crop: string | null
  status: 'active' | 'inactive'
  municipality?: { id: number; name: string }
  barangay?: { id: number; name: string }
  boundaries?: { id: number; geojson: GeoJSON.Polygon; computed_area_hectares: number | null }[]
}

export interface PaginatedResponse<T> {
  data: T[]
  meta: { current_page: number; last_page: number; total: number }
}

export interface Appointment {
  id: number
  scheduled_at: string
  purpose: string | null
  notes: string | null
  status: 'scheduled' | 'confirmed' | 'completed' | 'cancelled' | 'no_show'
  farmer?: { id: number; first_name: string; last_name: string; phone: string }
  technician?: { id: number; first_name: string; last_name: string; phone: string }
  incident?: { id: number; reference_code: string; title: string } | null
}

export interface MessageThread {
  partner: { id: number; first_name: string; last_name: string; role: UserRole }
  last_message: ChatMessage | null
  unread_count: number
}

export interface ChatMessage {
  id: number
  sender_id: number
  receiver_id: number
  body: string
  attachment_path: string | null
  read_at: string | null
  created_at: string
}

export interface Program {
  id: number
  title: string
  description: string
  cover_image_path: string | null
  category: 'subsidy' | 'training' | 'loan' | 'seedling' | 'equipment' | 'insurance' | 'other'
  application_start: string | null
  application_end: string | null
  is_active: boolean
  created_at: string
}

export interface ProgramApplication {
  id: number
  status: 'submitted' | 'under_review' | 'approved' | 'rejected'
  remarks: string | null
  created_at: string
  program?: { id: number; title: string; category: string }
}

export interface KnowledgeCategory {
  id: number
  name: string
  slug: string
  articles_count?: number
}

export interface KnowledgeArticle {
  id: number
  title: string
  slug: string
  content: string
  cover_image_path: string | null
  type: 'article' | 'video' | 'faq' | 'pdf_guide'
  video_url: string | null
  pdf_path: string | null
  view_count: number
  category?: { id: number; name: string } | null
  author?: { id: number; first_name: string; last_name: string }
  created_at: string
}

export interface Announcement {
  id: number
  title: string
  content: string
  cover_image_path: string | null
  audience: 'all' | 'farmers' | 'technicians' | 'municipal_office'
  published_at: string | null
  posted_by?: { id: number; first_name: string; last_name: string; role: UserRole }
}

export interface AppDocument {
  id: number
  title: string
  file_path: string
  mime_type: string | null
  size_bytes: number | null
  category: string
  visibility?: 'personal' | 'municipality_only'
  municipality?: { id: number; name: string }
  uploaded_by?: { id: number; full_name: string }
  created_at: string
}

export type CommunityPostCategory =
  | 'pesticide_usage'
  | 'crop_disease'
  | 'soil_management'
  | 'suitable_crops'
  | 'weather_advisory'
  | 'planting_calendar'
  | 'pest_outbreak'
  | 'irrigation'
  | 'fertilizer'
  | 'best_practices'
  | 'general'

export interface CommunityPost {
  id: number
  title: string
  content: string
  category: CommunityPostCategory
  is_published: boolean
  likes_count: number
  comments_count: number
  shares_count: number
  municipality?: { id: number; name: string }
  author?: { id: number; full_name: string; role: UserRole }
  liked_by_me?: boolean
  shared_by_me?: boolean
  shared_at?: string
  is_shared_in_feed?: boolean
  created_at: string
}

export interface CommunityPostComment {
  id: number
  body: string
  parent_id: number | null
  user?: { id: number; full_name: string; role: UserRole }
  replies?: CommunityPostComment[]
  created_at: string
}

export interface CommunityCategory {
  value: CommunityPostCategory
  label: string
}

export interface AppNotification {
  id: string
  type: 'like' | 'share' | 'comment' | 'reply' | 'mention' | 'community'
  message: string
  post_id: number | null
  comment_id: number | null
  parent_comment_id: number | null
  actor_id: number | null
  actor_name: string | null
  post_title: string | null
  read_at: string | null
  created_at: string
}
