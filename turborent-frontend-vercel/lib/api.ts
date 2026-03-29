import axios, { AxiosError, AxiosRequestConfig } from 'axios'

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1'

const api = axios.create({
  baseURL: BASE_URL,
  withCredentials: true,
  headers: { 'Content-Type': 'application/json' }
})

// Refresh silencieux sur 401
let isRefreshing = false
let failedQueue: Array<{ resolve: (v: unknown) => void; reject: (e: unknown) => void }> = []

api.interceptors.response.use(
  (res) => res,
  async (error: AxiosError) => {
    const original = error.config as AxiosRequestConfig & { _retry?: boolean }

    if (error.response?.status === 401
      && !original._retry
      && !original.url?.includes('/auth/refresh')
      && !original.url?.includes('/auth/login')
    ) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject })
        }).then(() => api(original))
      }

      original._retry = true
      isRefreshing = true

      try {
        await api.post('/auth/refresh')
        failedQueue.forEach(p => p.resolve(null))
        failedQueue = []
        return api(original)
      } catch (err) {
        failedQueue.forEach(p => p.reject(err))
        failedQueue = []
        // Rediriger vers login si refresh échoue
        if (typeof window !== 'undefined') {
          window.location.href = '/auth/login'
        }
        return Promise.reject(err)
      } finally {
        isRefreshing = false
      }
    }

    return Promise.reject(error)
  }
)

// ── AUTH ──────────────────────────────────────────────────────
export const authApi = {
  register: (data: Record<string, unknown>) => api.post('/auth/register', data),
  login: (email: string, password: string) => api.post('/auth/login', { email, password }),
  logout: () => api.post('/auth/logout'),
  verifyEmail: (token: string) => api.post('/auth/verify-email', { token }),
  resendVerification: (email: string) => api.post('/auth/resend-verification', { email }),
  forgotPassword: (email: string) => api.post('/auth/forgot-password', { email }),
  resetPassword: (token: string, password: string, confirm_password: string) =>
    api.post('/auth/reset-password', { token, password, confirm_password }),
  changePassword: (current_password: string, password: string, confirm_password: string) =>
    api.post('/auth/change-password', { current_password, password, confirm_password }),
  me: () => api.get('/auth/me')
}

// ── USERS ─────────────────────────────────────────────────────
export const usersApi = {
  getMe: () => api.get('/users/me'),
  updateMe: (data: Record<string, unknown>) => api.put('/users/me', data),
  uploadAvatar: (file: File) => {
    const fd = new FormData(); fd.append('avatar', file)
    return api.post('/users/me/avatar', fd, { headers: { 'Content-Type': 'multipart/form-data' } })
  },
  deleteAccount: (password: string) => api.delete('/users/me', { data: { password } }),
  getPublicProfile: (id: string) => api.get(`/users/${id}/public`)
}

// ── VEHICLES ──────────────────────────────────────────────────
export const vehiclesApi = {
  list: (params?: Record<string, unknown>) => api.get('/vehicles', { params }),
  get: (id: string) => api.get(`/vehicles/${id}`),
  getMine: () => api.get('/vehicles/mine/list'),
  create: (data: Record<string, unknown>) => api.post('/vehicles', data),
  update: (id: string, data: Record<string, unknown>) => api.put(`/vehicles/${id}`, data),
  delete: (id: string) => api.delete(`/vehicles/${id}`),
  uploadPhotos: (id: string, files: FileList) => {
    const fd = new FormData()
    Array.from(files).forEach(f => fd.append('photos', f))
    return api.post(`/vehicles/${id}/photos`, fd, { headers: { 'Content-Type': 'multipart/form-data' } })
  },
  getAvailability: (id: string) => api.get(`/vehicles/${id}/availability`),
  toggleFavorite: (id: string) => api.post(`/vehicles/${id}/favorite`),
  getFavorites: () => api.get('/vehicles/mine/list?favorites=true')
}

// ── RENTALS ───────────────────────────────────────────────────
export const rentalsApi = {
  create: (data: Record<string, unknown>) => api.post('/rentals', data),
  getMine: (role?: 'renter' | 'owner') => api.get('/rentals/mine', { params: { role } }),
  get: (id: string) => api.get(`/rentals/${id}`),
  confirm: (id: string) => api.patch(`/rentals/${id}/confirm`),
  reject: (id: string, reason?: string) => api.patch(`/rentals/${id}/reject`, { reason }),
  start: (id: string, mileage_start: number) => api.patch(`/rentals/${id}/start`, { mileage_start }),
  confirmMileage: (id: string) => api.patch(`/rentals/${id}/confirm-mileage`),
  end: (id: string, mileage_end: number) => api.patch(`/rentals/${id}/end`, { mileage_end }),
  cancel: (id: string, reason?: string) => api.patch(`/rentals/${id}/cancel`, { reason })
}

// ── DOCUMENTS ─────────────────────────────────────────────────
export const documentsApi = {
  getMine: () => api.get('/documents/mine'),
  upload: (type: string, file: File) => {
    const fd = new FormData()
    fd.append('document', file)
    fd.append('document_type', type)
    return api.post('/documents/upload', fd, { headers: { 'Content-Type': 'multipart/form-data' } })
  }
}

// ── MESSAGES ──────────────────────────────────────────────────
export const messagesApi = {
  getConversations: () => api.get('/messages/conversations'),
  getMessages: (convId: string) => api.get(`/messages/${convId}`),
  send: (convId: string, content: string) => api.post(`/messages/${convId}/send`, { content }),
  startConversation: (recipient_id: string, content: string, vehicle_id?: string) =>
    api.post('/messages/start', { recipient_id, content, vehicle_id })
}

// ── REVIEWS ───────────────────────────────────────────────────
export const reviewsApi = {
  create: (data: Record<string, unknown>) => api.post('/reviews', data),
  getForVehicle: (vehicleId: string) => api.get(`/reviews/vehicle/${vehicleId}`)
}

// ── DISPUTES ──────────────────────────────────────────────────
export const disputesApi = {
  create: (data: FormData) => api.post('/disputes', data, { headers: { 'Content-Type': 'multipart/form-data' } }),
  getMine: () => api.get('/disputes/mine')
}

// ── NOTIFICATIONS ─────────────────────────────────────────────
export const notificationsApi = {
  getAll: () => api.get('/notifications'),
  readAll: () => api.patch('/notifications/read-all')
}

// ── BOOSTS ────────────────────────────────────────────────────
export const boostsApi = {
  getPricing: () => api.get('/boosts/pricing'),
  create: (vehicle_id: string, days: number) => api.post('/boosts', { vehicle_id, days })
}

// ── SEARCH ────────────────────────────────────────────────────
export const searchApi = {
  search: (q: string, params?: Record<string, unknown>) => api.get('/search', { params: { q, ...params } })
}

// ── SETTINGS ──────────────────────────────────────────────────
export const settingsApi = {
  getPublic: () => api.get('/settings/public'),
  getAds: (position: string) => api.get(`/settings/advertisements/${position}`)
}

// ── ADMIN ─────────────────────────────────────────────────────
export const adminApi = {
  getStats: () => api.get('/admin/stats'),
  getUsers: (params?: Record<string, unknown>) => api.get('/admin/users', { params }),
  getUser: (id: string) => api.get(`/admin/users/${id}`),
  suspendUser: (id: string, reason?: string) => api.patch(`/admin/users/${id}/suspend`, { reason }),
  restoreUser: (id: string) => api.patch(`/admin/users/${id}/restore`),
  deleteUser: (id: string) => api.delete(`/admin/users/${id}`),
  getVehicles: (params?: Record<string, unknown>) => api.get('/admin/vehicles', { params }),
  validateVehicle: (id: string) => api.patch(`/admin/vehicles/${id}/validate`),
  refuseVehicle: (id: string, reason: string) => api.patch(`/admin/vehicles/${id}/refuse`, { reason }),
  deleteVehicle: (id: string) => api.delete(`/admin/vehicles/${id}`),
  getDocuments: (params?: Record<string, unknown>) => api.get('/admin/documents', { params }),
  getDocumentFile: (id: string) => `${BASE_URL}/admin/documents/file/${id}`,
  validateDocument: (id: string) => api.patch(`/admin/documents/${id}/validate`),
  refuseDocument: (id: string, reason: string) => api.patch(`/admin/documents/${id}/refuse`, { reason }),
  getDisputes: (params?: Record<string, unknown>) => api.get('/admin/disputes', { params }),
  getDispute: (id: string) => api.get(`/admin/disputes/${id}`),
  resolveDispute: (id: string, data: Record<string, unknown>) => api.patch(`/admin/disputes/${id}/resolve`, data),
  getTransactions: (params?: Record<string, unknown>) => api.get('/admin/transactions', { params }),
  getSettings: () => api.get('/admin/settings'),
  updateSettings: (settings: Record<string, string>) => api.put('/admin/settings', { settings }),
  getLogs: (params?: Record<string, unknown>) => api.get('/admin/logs', { params }),
  getReviews: () => api.get('/admin/reviews'),
  deleteReview: (id: string, reason?: string) => api.delete(`/admin/reviews/${id}`, { data: { reason } }),
  getAds: () => api.get('/admin/advertisements'),
  createAd: (data: Record<string, unknown>) => api.post('/admin/advertisements', data),
  toggleAd: (id: string) => api.patch(`/admin/advertisements/${id}/toggle`)
}

export default api
