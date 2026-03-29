'use client'
import { useEffect } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { LayoutDashboard, Users, Car, FileText, AlertTriangle, DollarSign, Settings, Megaphone, LogOut, Shield, ScrollText } from 'lucide-react'
import { useAuth } from '../../hooks/useAuth'

const adminNav = [
  { href: '/admin', label: 'Dashboard', icon: LayoutDashboard, exact: true },
  { href: '/admin/utilisateurs', label: 'Utilisateurs', icon: Users },
  { href: '/admin/vehicules', label: 'Véhicules', icon: Car },
  { href: '/admin/documents', label: 'Documents KYC', icon: FileText },
  { href: '/admin/litiges', label: 'Litiges', icon: AlertTriangle },
  { href: '/admin/finances', label: 'Finances', icon: DollarSign },
  { href: '/admin/publicites', label: 'Publicités', icon: Megaphone },
  { href: '/admin/logs', label: 'Logs', icon: ScrollText },
  { href: '/admin/parametres', label: 'Paramètres site', icon: Settings }
]

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, isLoading, signOut } = useAuth({ requireAdmin: true })
  const pathname = usePathname()

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full" />
      </div>
    )
  }
  if (!user || user.role !== 'admin') return null

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      {/* Top bar */}
      <div className="bg-gray-900 border-b border-gray-800 h-14 flex items-center px-6 gap-4">
        <div className="flex items-center gap-2">
          <Shield className="w-5 h-5 text-blue-400" />
          <span className="font-bold text-white">TurboRent</span>
          <span className="text-xs bg-blue-600 text-white px-2 py-0.5 rounded-full font-medium">Admin</span>
        </div>
        <div className="ml-auto flex items-center gap-3">
          <span className="text-sm text-gray-400">{user.email}</span>
          <button onClick={signOut} className="flex items-center gap-1.5 text-sm text-gray-400 hover:text-white transition-colors">
            <LogOut className="w-4 h-4" /> Déconnexion
          </button>
        </div>
      </div>

      <div className="flex h-[calc(100vh-56px)]">
        {/* Sidebar */}
        <aside className="w-60 bg-gray-900 border-r border-gray-800 flex-shrink-0 overflow-y-auto">
          <nav className="p-3 space-y-0.5">
            {adminNav.map(item => {
              const active = item.exact ? pathname === item.href : pathname.startsWith(item.href)
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all ${
                    active
                      ? 'bg-blue-600 text-white font-medium'
                      : 'text-gray-400 hover:bg-gray-800 hover:text-white'
                  }`}
                >
                  <item.icon className="w-4 h-4 flex-shrink-0" />
                  {item.label}
                </Link>
              )
            })}
          </nav>
        </aside>

        {/* Contenu */}
        <main className="flex-1 overflow-y-auto">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="p-6 max-w-7xl"
          >
            {children}
          </motion.div>
        </main>
      </div>
    </div>
  )
}
