'use client'
import { useEffect } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { LayoutDashboard, Car, Calendar, MessageSquare, FileText, AlertTriangle, User, Plus, Star, Heart } from 'lucide-react'
import { useAuth } from '../../hooks/useAuth'

const navItems = [
  { href: '/tableau-de-bord', label: 'Tableau de bord', icon: LayoutDashboard, exact: true },
  { href: '/tableau-de-bord/vehicules', label: 'Mes véhicules', icon: Car },
  { href: '/tableau-de-bord/reservations', label: 'Réservations', icon: Calendar },
  { href: '/tableau-de-bord/messages', label: 'Messages', icon: MessageSquare },
  { href: '/tableau-de-bord/documents', label: 'Documents KYC', icon: FileText },
  { href: '/tableau-de-bord/litiges', label: 'Litiges', icon: AlertTriangle },
  { href: '/tableau-de-bord/avis', label: 'Mes avis', icon: Star },
  { href: '/tableau-de-bord/favoris', label: 'Favoris', icon: Heart },
  { href: '/tableau-de-bord/profil', label: 'Mon profil', icon: User }
]

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth({ requireAuth: true })
  const pathname = usePathname()

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full" />
      </div>
    )
  }

  if (!user) return null

  return (
    <div className="min-h-screen bg-gray-50 pt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex gap-8">
          {/* Sidebar */}
          <aside className="hidden lg:block w-64 flex-shrink-0">
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden sticky top-24">
              {/* User info */}
              <div className="p-5 border-b border-gray-100 bg-gradient-to-br from-blue-50 to-indigo-50">
                <div className="flex items-center gap-3">
                  {user.avatar_url ? (
                    <img src={user.avatar_url} className="w-10 h-10 rounded-full object-cover" alt="" />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold text-sm">
                      {user.first_name[0]}{user.last_name[0]}
                    </div>
                  )}
                  <div className="min-w-0">
                    <p className="font-semibold text-gray-900 text-sm truncate">{user.first_name} {user.last_name}</p>
                    <div className="flex items-center gap-1 mt-0.5">
                      <div className={`w-2 h-2 rounded-full ${user.is_documents_verified ? 'bg-green-500' : 'bg-yellow-400'}`} />
                      <span className="text-xs text-gray-500">
                        {user.is_documents_verified ? 'Profil vérifié' : 'Vérification en attente'}
                      </span>
                    </div>
                  </div>
                </div>
                {/* Trust score */}
                <div className="mt-3">
                  <div className="flex justify-between text-xs text-gray-500 mb-1">
                    <span>Score de confiance</span>
                    <span className="font-medium text-gray-700">{user.trust_score}/100</span>
                  </div>
                  <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${
                        user.trust_score >= 80 ? 'bg-green-500' : user.trust_score >= 50 ? 'bg-yellow-400' : 'bg-red-400'
                      }`}
                      style={{ width: `${user.trust_score}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* Nav */}
              <nav className="p-2">
                {navItems.map(item => {
                  const active = item.exact ? pathname === item.href : pathname.startsWith(item.href)
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all mb-0.5 ${
                        active
                          ? 'bg-blue-600 text-white font-medium shadow-sm'
                          : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                      }`}
                    >
                      <item.icon className="w-4 h-4 flex-shrink-0" />
                      {item.label}
                    </Link>
                  )
                })}
              </nav>

              {/* CTA publier */}
              <div className="p-3 border-t border-gray-100">
                <Link href="/tableau-de-bord/vehicules/ajouter" className="btn-primary w-full justify-center text-sm">
                  <Plus className="w-4 h-4" /> Publier une annonce
                </Link>
              </div>
            </div>
          </aside>

          {/* Contenu */}
          <main className="flex-1 min-w-0">
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
              {children}
            </motion.div>
          </main>
        </div>
      </div>
    </div>
  )
}
