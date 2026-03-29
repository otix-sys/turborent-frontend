// ================================================================
// TURBORENT — TYPES TYPESCRIPT
// ================================================================

export interface User {
  id: string
  email: string
  first_name: string
  last_name: string
  phone?: string
  user_type: 'particulier' | 'professionnel'
  role: 'user' | 'admin' | 'moderator'
  status: 'email_non_verifie' | 'actif' | 'suspendu' | 'supprime'
  subscription_plan: 'gratuit' | 'premium' | 'pro'
  city?: string
  postal_code?: string
  company_name?: string
  trust_score: number
  is_identity_verified: boolean
  is_documents_verified: boolean
  avatar_url?: string
  bio?: string
  avg_rating?: number
  review_count?: number
  vehicle_count?: number
  rental_count?: number
  created_at: string
}

export interface Vehicle {
  id: string
  owner_id: string
  listing_type: 'location' | 'vente'
  status: 'brouillon' | 'en_attente' | 'valide' | 'refuse' | 'suspendu' | 'expire' | 'archive'
  category: 'voiture' | 'moto' | 'scooter' | 'utilitaire' | 'camping_car' | 'camion'
  brand: string
  model: string
  version?: string
  year: number
  fuel: 'essence' | 'diesel' | 'electrique' | 'hybride' | 'hybride_rechargeable' | 'gpl'
  transmission: 'manuelle' | 'automatique'
  mileage: number
  seats: number
  doors?: number
  color?: string
  power_din?: number
  power_fiscal?: number
  title?: string
  description?: string
  options?: string[]
  city: string
  postal_code: string
  latitude?: number
  longitude?: number
  price_per_day?: number
  deposit_amount?: number
  included_km_per_day?: number
  extra_km_price?: number
  min_rental_days?: number
  max_rental_days?: number
  sale_price?: number
  negotiable?: boolean
  first_hand?: boolean
  slug: string
  is_featured: boolean
  featured_until?: string
  view_count: number
  favorite_count: number
  published_at?: string
  created_at: string
  // Relations
  owner_first_name?: string
  owner_last_name?: string
  owner_avatar?: string
  owner_trust_score?: number
  owner_verified?: boolean
  owner_city?: string
  avg_rating?: number
  review_count?: number
  primary_photo?: string
  photo_count?: number
}

export interface VehiclePhoto {
  id: string
  vehicle_id: string
  file_path: string
  file_name?: string
  position: number
  is_primary: boolean
}

export interface Rental {
  id: string
  vehicle_id: string
  renter_id: string
  owner_id: string
  status: 'demande' | 'confirme' | 'en_cours' | 'termine' | 'annule' | 'litige'
  start_date: string
  end_date: string
  price_per_day: number
  subtotal: number
  platform_fee: number
  total_amount: number
  deposit_amount: number
  extra_km_charge?: number
  mileage_start?: number
  mileage_end?: number
  mileage_start_confirmed: boolean
  payment_status: string
  deposit_status: string
  renter_message?: string
  confirmed_at?: string
  started_at?: string
  ended_at?: string
  cancelled_at?: string
  created_at: string
  // Relations
  brand?: string
  model?: string
  year?: number
  city?: string
  renter_fn?: string
  renter_ln?: string
  renter_email?: string
  owner_fn?: string
  owner_ln?: string
  owner_email?: string
}

export interface Review {
  id: string
  rental_id?: string
  reviewer_id: string
  reviewee_id: string
  vehicle_id?: string
  rating: number
  comment: string
  is_visible: boolean
  created_at: string
  first_name?: string
  last_name?: string
  avatar_url?: string
}

export interface Message {
  id: string
  conversation_id: string
  sender_id: string
  content: string
  is_read: boolean
  created_at: string
  first_name?: string
  last_name?: string
  avatar_url?: string
}

export interface Conversation {
  id: string
  participant_a: string
  participant_b: string
  vehicle_id?: string
  last_message_at?: string
  other_id: string
  first_name: string
  last_name: string
  avatar_url?: string
  brand?: string
  model?: string
  last_message?: string
  unread_count: number
}

export interface Notification {
  id: string
  user_id: string
  type: 'reservation' | 'message' | 'paiement' | 'litige' | 'document' | 'avis' | 'systeme'
  title: string
  body?: string
  data?: Record<string, unknown>
  is_read: boolean
  created_at: string
}

export interface Dispute {
  id: string
  rental_id: string
  initiated_by: string
  against: string
  status: 'ouvert' | 'en_traitement' | 'resolu_proprietaire' | 'resolu_locataire' | 'ferme'
  description: string
  claimed_amount?: number
  damage_zones: string[]
  resolved_at?: string
  resolution_notes?: string
  amount_retained?: number
  amount_refunded?: number
  created_at: string
}

export interface Document {
  id: string
  document_type: 'permis_conduire' | 'carte_grise' | 'piece_identite' | 'kbis' | 'assurance'
  status: 'en_attente' | 'valide' | 'refuse'
  created_at: string
  reviewed_at?: string
  refusal_reason?: string
  label?: string
}

export interface SiteSettings {
  [key: string]: string
}

export interface VehicleFilters {
  type?: 'location' | 'vente'
  category?: string
  brand?: string
  city?: string
  fuel?: string
  transmission?: string
  min_price?: number
  max_price?: number
  min_year?: number
  max_year?: number
  min_mileage?: number
  max_mileage?: number
  seats?: number
  sort?: string
  page?: number
}

export interface PaginationData {
  page: number
  limit: number
  total: number
  pages: number
}

export interface ApiError {
  error: string
  details?: Array<{ field: string; message: string }>
}
