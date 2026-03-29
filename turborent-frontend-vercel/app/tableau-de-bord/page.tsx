'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Car, Calendar, MessageSquare, FileText, Plus, CheckCircle, AlertCircle, Clock } from 'lucide-react'
import { useAuth } from '../../hooks/useAuth'
import { vehiclesApi, rentalsApi, documentsApi, notificationsApi } from '../../lib/api'

type DocumentType = {
  document_type: string
  status?: string
}

export default function DashboardPage() {
  const { user } = useAuth()
  const [vehicles, setVehicles] = useState<any[]>([])
  const [rentals, setRentals] = useState<any[]>([])
  const [docs, setDocs] = useState<DocumentType[]>([])
  const [notifs, setNotifs] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) return
    Promise.all([
      vehiclesApi.getMine(),
      rentalsApi.getMine(),
      documentsApi.getMine(),
      notificationsApi.getAll()
    ])
      .then(([v, r, d, n]) => {
        setVehicles(v.data.vehicles || [])
        setRentals((r.data.rentals || []).slice(0, 5))
        setDocs(d.data.documents || [])
        setNotifs((n.data.notifications || []).filter((x: any) => !x.is_read).slice(0, 5))
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [user])

  if (!user) return null

  const kycRequired = ['permis_conduire', 'carte_grise', 'piece_identite']

  const kycStatus = kycRequired.map(type => {
    const doc = docs.find(d => d.document_type === type)
    return {
      type,
      label:
        type === 'permis_conduire'
          ? 'Permis de conduire'
          : type === 'carte_grise'
          ? 'Carte grise'
          : "Pièce d'identité",
      doc
    }
  })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Bonjour, {user.first_name} 👋</h1>
          <p className="text-gray-500 mt-1">Bienvenue sur votre espace TurboRent</p>
        </div>
        <Link href="/tableau-de-bord/vehicules/ajouter" className="btn-primary hidden sm:inline-flex">
          <Plus className="w-4 h-4" /> Publier une annonce
        </Link>
      </div>

      {!user.is_documents_verified && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-2xl p-5">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <h3 className="font-semibold text-yellow-900 mb-1">Vérification d'identité requise</h3>
              <p className="text-yellow-700 text-sm mb-3">
                Pour publier un véhicule en location, vous devez d'abord soumettre vos documents.
              </p>

              <div className="flex flex-wrap gap-2 mb-3">
                {kycStatus.map(k => (
                  <span
                    key={k.type}
                    className={`badge ${
                      !k.doc
                        ? 'badge-red'
                        : k.doc?.status === 'valide'
                        ? 'badge-green'
                        : 'badge-yellow'
                    }`}
                  >
                    {k.doc?.status === 'valide' ? (
                      <CheckCircle className="w-3 h-3" />
                    ) : (
                      <Clock className="w-3 h-3" />
                    )}
                    {k.label}
                  </span>
                ))}
              </div>

              <Link href="/tableau-de-bord/documents" className="btn-primary btn-sm inline-flex">
                Soumettre mes documents
              </Link>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Mes annonces', value: vehicles.length, icon: Car, href: '/tableau-de-bord/vehicules', color: 'blue' },
          { label: 'Réservations', value: rentals.length, icon: Calendar, href: '/tableau-de-bord/reservations', color: 'green' },
          { label: 'Messages non lus', value: notifs.length, icon: MessageSquare, href: '/tableau-de-bord/messages', color: 'purple' },
          {
            label: 'Documents',
            value: `${kycStatus.filter(k => k.doc?.status === 'valide').length}/3`,
            icon: FileText,
            href: '/tableau-de-bord/documents',
            color: 'yellow'
          }
        ].map((stat, i) => (
          <Link key={i} href={stat.href} className="card p-5 hover:shadow-md transition-shadow">
            <div className={`inline-flex items-center justify-center w-10 h-10 rounded-xl bg-${stat.color}-100 mb-3`}>
              <stat.icon className={`w-5 h-5 text-${stat.color}-600`} />
            </div>
            <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
            <div className="text-sm text-gray-500 mt-0.5">{stat.label}</div>
          </Link>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="card p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-gray-900">Réservations récentes</h2>
            <Link href="/tableau-de-bord/reservations" className="text-sm text-blue-600 hover:underline">
              Tout voir
            </Link>
          </div>

          {loading ? (
            <div className="space-y-3">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="skeleton h-12 rounded-lg" />
              ))}
            </div>
          ) : rentals.length === 0 ? (
            <div className="text-center py-8 text-gray-400">
              <Calendar className="w-10 h-10 mx-auto mb-2 opacity-40" />
              <p className="text-sm">Aucune réservation</p>
            </div>
          ) : (
            <div className="space-y-2">
              {rentals.map((r: any) => (
                <div key={r.id} className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 transition-colors">
                  <div
                    className={`w-2 h-2 rounded-full ${
                      r.status === 'confirme'
                        ? 'bg-green-500'
                        : r.status === 'en_cours'
                        ? 'bg-blue-500'
                        : r.status === 'termine'
                        ? 'bg-gray-400'
                        : r.status === 'annule'
                        ? 'bg-red-400'
                        : 'bg-yellow-400'
                    }`}
                  />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {r.brand} {r.model}
                    </p>
                    <p className="text-xs text-gray-400">
                      {new Date(r.start_date).toLocaleDateString('fr-FR')} →{' '}
                      {new Date(r.end_date).toLocaleDateString('fr-FR')}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="card p-5">
          <h2 className="font-semibold text-gray-900 mb-4">Notifications</h2>
          {notifs.map((n: any) => (
            <div key={n.id} className="text-sm mb-2">
              {n.title}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
