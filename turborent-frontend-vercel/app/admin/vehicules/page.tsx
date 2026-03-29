'use client'
import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { CheckCircle, XCircle, Clock, Search, Eye } from 'lucide-react'
import { adminApi } from '../../../lib/api'
import toast from 'react-hot-toast'

export default function AdminVehiclesPage() {
  const [vehicles, setVehicles] = useState<unknown[]>([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState('en_attente')
  const [total, setTotal] = useState(0)

  const load = () => {
    setLoading(true)
    adminApi.getVehicles({ status: statusFilter||undefined, limit: 50 })
      .then(r => { setVehicles(r.data.vehicles || []); setTotal(r.data.pagination?.total || 0) })
      .catch(() => {})
      .finally(() => setLoading(false))
  }
  useEffect(() => { load() }, [statusFilter])

  const validate = async (id: string) => {
    try { await adminApi.validateVehicle(id); toast.success('Annonce validée et publiée.'); load() }
    catch { toast.error('Erreur') }
  }

  const refuse = async (id: string) => {
    const reason = prompt('Motif de refus (obligatoire, min 10 caractères) :')
    if (!reason || reason.length < 10) { toast.error('Motif trop court'); return }
    try { await adminApi.refuseVehicle(id, reason); toast.success('Annonce refusée.'); load() }
    catch { toast.error('Erreur') }
  }

  const deleteV = async (id: string) => {
    if (!confirm('Supprimer définitivement cette annonce ?')) return
    try { await adminApi.deleteVehicle(id); toast.success('Annonce supprimée.'); load() }
    catch { toast.error('Erreur') }
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-bold text-white">Véhicules</h1><p className="text-gray-400 text-sm mt-0.5">{total} annonce(s)</p></div>
      </div>

      <div className="flex gap-1 bg-gray-800 p-1 rounded-xl w-fit">
        {[['en_attente','En attente'],['valide','Validés'],['refuse','Refusés'],['','Tous']].map(([val, label]) => (
          <button key={val} onClick={() => setStatusFilter(val)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${statusFilter === val ? 'bg-gray-700 text-white' : 'text-gray-400 hover:text-white'}`}>
            {label}
          </button>
        ))}
      </div>

      <div className="bg-gray-900 rounded-xl border border-gray-800 overflow-hidden">
        <table className="w-full">
          <thead><tr className="border-b border-gray-800">
            <th className="text-left px-4 py-3 text-xs font-semibold text-gray-400 uppercase">Véhicule</th>
            <th className="text-left px-4 py-3 text-xs font-semibold text-gray-400 uppercase">Propriétaire</th>
            <th className="text-left px-4 py-3 text-xs font-semibold text-gray-400 uppercase">Type</th>
            <th className="text-left px-4 py-3 text-xs font-semibold text-gray-400 uppercase">Prix</th>
            <th className="text-left px-4 py-3 text-xs font-semibold text-gray-400 uppercase">Statut</th>
            <th className="text-left px-4 py-3 text-xs font-semibold text-gray-400 uppercase">Date</th>
            <th className="text-right px-4 py-3 text-xs font-semibold text-gray-400 uppercase">Actions</th>
          </tr></thead>
          <tbody>
            {loading ? [...Array(6)].map((_, i) => (
              <tr key={i} className="border-b border-gray-800"><td colSpan={7} className="px-4 py-3"><div className="skeleton h-5 w-full rounded" /></td></tr>
            )) : vehicles.length === 0 ? (
              <tr><td colSpan={7} className="text-center py-12 text-gray-500">Aucune annonce dans cette catégorie</td></tr>
            ) : vehicles.map((item: unknown) => {
              const v = item as { id: string; brand: string; model: string; year: number; status: string; listing_type: string; city: string; price_per_day?: number; sale_price?: number; created_at: string; first_name: string; last_name: string; email: string; primary_photo?: string }
              const API_BASE = (process.env.NEXT_PUBLIC_API_URL || '').replace('/api/v1', '')
              return (
                <motion.tr key={v.id} initial={{ opacity:0 }} animate={{ opacity:1 }} className="border-b border-gray-800 hover:bg-gray-800/50 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-9 rounded-lg overflow-hidden bg-gray-800 flex-shrink-0 flex items-center justify-center">
                        {v.primary_photo ? <img src={`${API_BASE}${v.primary_photo}`} alt="" className="w-full h-full object-cover" /> : <span className="text-lg">🚗</span>}
                      </div>
                      <div><p className="text-white text-sm font-medium">{v.brand} {v.model}</p><p className="text-gray-500 text-xs">{v.year} · {v.city}</p></div>
                    </div>
                  </td>
                  <td className="px-4 py-3"><div><p className="text-white text-sm">{v.first_name} {v.last_name}</p><p className="text-gray-500 text-xs">{v.email}</p></div></td>
                  <td className="px-4 py-3"><span className={`text-xs font-medium px-2 py-1 rounded-full ${v.listing_type === 'location' ? 'bg-blue-900/50 text-blue-400' : 'bg-green-900/50 text-green-400'}`}>{v.listing_type}</span></td>
                  <td className="px-4 py-3 text-gray-300 text-sm">{v.price_per_day ? `${v.price_per_day} €/j` : `${v.sale_price?.toLocaleString('fr-FR')} €`}</td>
                  <td className="px-4 py-3">
                    <span className={`flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full w-fit ${
                      v.status === 'valide' ? 'bg-green-900/50 text-green-400' :
                      v.status === 'en_attente' ? 'bg-yellow-900/50 text-yellow-400' :
                      v.status === 'refuse' ? 'bg-red-900/50 text-red-400' : 'bg-gray-800 text-gray-400'
                    }`}>
                      {v.status === 'valide' ? <CheckCircle className="w-3 h-3" /> : v.status === 'en_attente' ? <Clock className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                      {v.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-400 text-xs">{new Date(v.created_at).toLocaleDateString('fr-FR')}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-2">
                      {v.status === 'en_attente' && (
                        <>
                          <button onClick={() => validate(v.id)} className="flex items-center gap-1 px-3 py-1.5 bg-green-900/40 text-green-400 hover:bg-green-900/60 rounded-lg text-xs font-medium transition-colors">
                            <CheckCircle className="w-3.5 h-3.5" /> Valider
                          </button>
                          <button onClick={() => refuse(v.id)} className="flex items-center gap-1 px-3 py-1.5 bg-red-900/40 text-red-400 hover:bg-red-900/60 rounded-lg text-xs font-medium transition-colors">
                            <XCircle className="w-3.5 h-3.5" /> Refuser
                          </button>
                        </>
                      )}
                      <button onClick={() => deleteV(v.id)} className="px-3 py-1.5 bg-gray-800 text-gray-400 hover:bg-gray-700 rounded-lg text-xs transition-colors">
                        Supprimer
                      </button>
                    </div>
                  </td>
                </motion.tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
