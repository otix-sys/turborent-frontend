'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Plus, Edit, Trash2, Eye, Zap, Clock, CheckCircle, XCircle, AlertTriangle } from 'lucide-react'
import { vehiclesApi } from '../../../lib/api'
import { Vehicle } from '../../../types'
import toast from 'react-hot-toast'

const STATUS_CONFIG: Record<string, { label: string; class: string; icon: React.ReactNode }> = {
  brouillon:   { label:'Brouillon',    class:'badge-gray',   icon:<Edit className="w-3 h-3" /> },
  en_attente:  { label:'En vérification', class:'badge-yellow', icon:<Clock className="w-3 h-3" /> },
  valide:      { label:'En ligne',     class:'badge-green',  icon:<CheckCircle className="w-3 h-3" /> },
  refuse:      { label:'Refusé',       class:'badge-red',    icon:<XCircle className="w-3 h-3" /> },
  suspendu:    { label:'Suspendu',     class:'badge-red',    icon:<AlertTriangle className="w-3 h-3" /> },
  expire:      { label:'Expiré',       class:'badge-gray',   icon:<Clock className="w-3 h-3" /> }
}

export default function MyVehiclesPage() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([])
  const [loading, setLoading] = useState(true)

  const load = () => {
    vehiclesApi.getMine()
      .then(r => setVehicles(r.data.vehicles || []))
      .catch(() => {})
      .finally(() => setLoading(false))
  }
  useEffect(() => { load() }, [])

  const deleteVehicle = async (id: string) => {
    if (!confirm('Supprimer cette annonce ? Cette action est irréversible.')) return
    try {
      await vehiclesApi.delete(id)
      toast.success('Annonce supprimée.')
      load()
    } catch (err: unknown) {
      const e = err as { response?: { data?: { error?: string } } }
      toast.error(e.response?.data?.error || 'Erreur')
    }
  }

  const API_BASE = (process.env.NEXT_PUBLIC_API_URL || '').replace('/api/v1', '')

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Mes véhicules</h1>
          <p className="text-gray-500 text-sm mt-0.5">{vehicles.length} annonce(s)</p>
        </div>
        <Link href="/tableau-de-bord/vehicules/ajouter" className="btn-primary flex items-center gap-2">
          <Plus className="w-4 h-4" /> Nouvelle annonce
        </Link>
      </div>

      {loading ? (
        <div className="space-y-3">{[...Array(3)].map((_, i) => <div key={i} className="skeleton h-28 w-full rounded-2xl" />)}</div>
      ) : vehicles.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 p-16 text-center">
          <div className="text-5xl mb-4">🚗</div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Aucune annonce</h3>
          <p className="text-gray-500 text-sm mb-6">Publiez votre premier véhicule en quelques minutes.</p>
          <Link href="/tableau-de-bord/vehicules/ajouter" className="btn-primary inline-flex items-center gap-2">
            <Plus className="w-4 h-4" /> Publier un véhicule
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {vehicles.map((v, i) => {
            const st = STATUS_CONFIG[v.status] || STATUS_CONFIG.brouillon
            return (
              <motion.div key={v.id} initial={{ opacity:0, y:10 }} animate={{ opacity:1, y:0 }} transition={{ delay: i*0.05 }}
                className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex items-center gap-4">
                {/* Photo */}
                <div className="w-24 h-18 rounded-xl overflow-hidden bg-gray-100 flex-shrink-0 flex items-center justify-center">
                  {v.primary_photo ? (
                    <img src={`${API_BASE}${v.primary_photo}`} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-2xl">🚗</span>
                  )}
                </div>
                {/* Infos */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold text-gray-900 truncate">{v.brand} {v.model} ({v.year})</h3>
                    <span className={`badge ${st.class} flex-shrink-0 flex items-center gap-1`}>{st.icon}{st.label}</span>
                    {v.is_featured && v.featured_until && new Date(v.featured_until) > new Date() && (
                      <span className="badge badge-yellow flex-shrink-0 flex items-center gap-1"><Zap className="w-3 h-3" />En avant</span>
                    )}
                  </div>
                  <p className="text-sm text-gray-500">
                    {v.listing_type === 'location' ? `${v.price_per_day} €/jour` : `${v.sale_price?.toLocaleString('fr-FR')} €`}
                    {' · '}{v.city}{' · '}{v.mileage?.toLocaleString('fr-FR')} km
                  </p>
                  {v.status === 'refuse' && (
                    <p className="text-xs text-red-600 mt-1 flex items-center gap-1">
                      <AlertTriangle className="w-3 h-3" /> Annonce refusée — Vérifiez votre email pour les détails
                    </p>
                  )}
                  <div className="flex items-center gap-3 mt-2">
                    <span className="text-xs text-gray-400 flex items-center gap-1"><Eye className="w-3 h-3" />{v.view_count} vues</span>
                  </div>
                </div>
                {/* Actions */}
                <div className="flex items-center gap-2 flex-shrink-0">
                  {v.status === 'valide' && (
                    <Link href={`/${v.listing_type}/${v.slug}`} target="_blank" className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                      <Eye className="w-4 h-4" />
                    </Link>
                  )}
                  <button onClick={() => deleteVehicle(v.id)} className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </motion.div>
            )
          })}
        </div>
      )}
    </div>
  )
}
