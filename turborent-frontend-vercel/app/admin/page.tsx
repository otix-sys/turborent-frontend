'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Users, Car, DollarSign, AlertTriangle, FileText, Clock, TrendingUp, CheckCircle } from 'lucide-react'
import { adminApi } from '../../lib/api'

export default function AdminDashboard() {
  const [stats, setStats] = useState<Record<string, number | string>>({})
  const [chart, setChart] = useState<Array<{ month: string; revenue: string; count: string }>>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    adminApi.getStats()
      .then(r => { setStats(r.data.stats || {}); setChart(r.data.revenueChart || []) })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const cards = [
    { label: 'Utilisateurs', value: stats.totalUsers, sub: `+${stats.newUsersThisWeek} cette semaine`, icon: Users, color: 'blue', href: '/admin/utilisateurs' },
    { label: 'Véhicules actifs', value: stats.activeVehicles, sub: `${stats.pendingVehicles} en attente`, icon: Car, color: 'green', href: '/admin/vehicules' },
    { label: 'Revenus totaux', value: `${Number(stats.totalRevenue || 0).toLocaleString('fr-FR')} €`, sub: `${Number(stats.revenueThisMonth || 0).toLocaleString('fr-FR')} € ce mois`, icon: DollarSign, color: 'purple', href: '/admin/finances' },
    { label: 'Litiges ouverts', value: stats.openDisputes, sub: 'À traiter', icon: AlertTriangle, color: 'red', href: '/admin/litiges' },
    { label: 'Documents KYC', value: stats.pendingDocuments, sub: 'En attente de vérification', icon: FileText, color: 'yellow', href: '/admin/documents' },
    { label: 'Locations actives', value: stats.activeRentals, sub: `${stats.completedRentals} terminées`, icon: TrendingUp, color: 'indigo', href: '/admin/vehicules' }
  ]

  if (loading) {
    return (
      <div>
        <h1 className="text-2xl font-bold text-white mb-6">Tableau de bord</h1>
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => <div key={i} className="h-28 bg-gray-800 rounded-xl animate-pulse" />)}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white">Tableau de bord</h1>
        <span className="text-xs text-gray-500">Dernière mise à jour : {new Date().toLocaleString('fr-FR')}</span>
      </div>

      {/* Alertes prioritaires */}
      {(Number(stats.pendingVehicles) > 0 || Number(stats.pendingDocuments) > 0 || Number(stats.openDisputes) > 0) && (
        <div className="bg-yellow-900/30 border border-yellow-600/40 rounded-xl p-4">
          <h3 className="text-yellow-400 font-semibold text-sm mb-3 flex items-center gap-2">
            <Clock className="w-4 h-4" /> Actions requises
          </h3>
          <div className="flex flex-wrap gap-3">
            {Number(stats.pendingVehicles) > 0 && (
              <Link href="/admin/vehicules?status=en_attente" className="flex items-center gap-2 bg-yellow-600/20 text-yellow-300 text-sm px-3 py-1.5 rounded-lg hover:bg-yellow-600/30 transition-colors">
                <Car className="w-3.5 h-3.5" /> {stats.pendingVehicles} véhicule(s) à valider
              </Link>
            )}
            {Number(stats.pendingDocuments) > 0 && (
              <Link href="/admin/documents?status=en_attente" className="flex items-center gap-2 bg-yellow-600/20 text-yellow-300 text-sm px-3 py-1.5 rounded-lg hover:bg-yellow-600/30 transition-colors">
                <FileText className="w-3.5 h-3.5" /> {stats.pendingDocuments} document(s) à vérifier
              </Link>
            )}
            {Number(stats.openDisputes) > 0 && (
              <Link href="/admin/litiges" className="flex items-center gap-2 bg-red-600/20 text-red-300 text-sm px-3 py-1.5 rounded-lg hover:bg-red-600/30 transition-colors">
                <AlertTriangle className="w-3.5 h-3.5" /> {stats.openDisputes} litige(s) ouvert(s)
              </Link>
            )}
          </div>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        {cards.map((card, i) => (
          <Link key={i} href={card.href} className="bg-gray-900 border border-gray-800 rounded-xl p-5 hover:border-gray-700 transition-colors">
            <div className="flex items-start justify-between mb-3">
              <div className={`w-10 h-10 rounded-lg bg-${card.color}-500/20 flex items-center justify-center`}>
                <card.icon className={`w-5 h-5 text-${card.color}-400`} />
              </div>
            </div>
            <div className="text-2xl font-bold text-white">{card.value ?? '—'}</div>
            <div className="text-sm text-gray-400 mt-0.5">{card.label}</div>
            <div className="text-xs text-gray-600 mt-1">{card.sub}</div>
          </Link>
        ))}
      </div>

      {/* Graphique revenus */}
      {chart.length > 0 && (
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
          <h2 className="text-white font-semibold mb-4 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-blue-400" /> Revenus (commissions) — 6 derniers mois
          </h2>
          <div className="flex items-end gap-3 h-32">
            {chart.map((month, i) => {
              const maxRev = Math.max(...chart.map(m => parseFloat(m.revenue) || 0))
              const height = maxRev > 0 ? Math.max(4, (parseFloat(month.revenue) / maxRev) * 100) : 4
              return (
                <div key={i} className="flex-1 flex flex-col items-center gap-1.5">
                  <span className="text-xs text-gray-500 font-medium">{Number(month.revenue).toLocaleString('fr-FR', { maximumFractionDigits: 0 })} €</span>
                  <div className="w-full bg-gray-800 rounded-t-sm overflow-hidden" style={{ height: '80px' }}>
                    <div className="w-full bg-blue-500 rounded-t-sm transition-all" style={{ height: `${height}%`, marginTop: `${100 - height}%` }} />
                  </div>
                  <span className="text-xs text-gray-600">{month.month}</span>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
