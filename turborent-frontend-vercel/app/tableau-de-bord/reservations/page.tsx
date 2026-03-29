'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Calendar, Clock, CheckCircle, XCircle, AlertTriangle, ChevronRight } from 'lucide-react'
import { rentalsApi } from '../../../lib/api'
import { Rental } from '../../../types'

const STATUS_CONFIG: Record<string, { label: string; color: string }> = {
  demande:  { label:'En attente',  color:'yellow' },
  confirme: { label:'Confirmée',   color:'blue' },
  en_cours: { label:'En cours',    color:'green' },
  termine:  { label:'Terminée',    color:'gray' },
  annule:   { label:'Annulée',     color:'red' },
  litige:   { label:'Litige',      color:'orange' }
}

export default function ReservationsPage() {
  const [rentals, setRentals] = useState<Rental[]>([])
  const [loading, setLoading] = useState(true)
  const [role, setRole] = useState<'renter'|'owner'>('renter')

  useEffect(() => {
    setLoading(true)
    rentalsApi.getMine(role)
      .then(r => setRentals(r.data.rentals || []))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [role])

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Réservations</h1>
        <p className="text-gray-500 text-sm mt-0.5">Historique de vos locations</p>
      </div>

      <div className="flex gap-1 bg-gray-100 p-1 rounded-xl w-fit">
        {[['renter','Je loue'],['owner','Je propose']].map(([r,label]) => (
          <button key={r} onClick={() => setRole(r as 'renter'|'owner')}
            className={`px-5 py-2 rounded-lg text-sm font-semibold transition-all ${role === r ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>
            {label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="space-y-3">{[...Array(4)].map((_, i) => <div key={i} className="skeleton h-24 rounded-2xl" />)}</div>
      ) : rentals.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 p-14 text-center">
          <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <h3 className="font-semibold text-gray-700 mb-1">Aucune réservation</h3>
          <p className="text-gray-400 text-sm">{role === 'renter' ? 'Parcourez les annonces pour réserver un véhicule.' : 'Publiez un véhicule pour recevoir des demandes.'}</p>
        </div>
      ) : (
        <div className="space-y-3">
          {rentals.map((r: Rental & { brand?: string; model?: string; other_fn?: string; other_ln?: string }, i) => {
            const st = STATUS_CONFIG[r.status] || STATUS_CONFIG.annule
            return (
              <motion.div key={r.id} initial={{ opacity:0, y:10 }} animate={{ opacity:1, y:0 }} transition={{ delay: i*0.05 }}
                className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex items-center gap-4 hover:shadow-md transition-shadow">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold text-gray-900">{r.brand} {r.model}</h3>
                    <span className={`badge badge-${st.color === 'yellow' ? 'yellow' : st.color === 'green' ? 'green' : st.color === 'blue' ? 'blue' : st.color === 'red' ? 'red' : 'gray'}`}>
                      {st.label}
                    </span>
                  </div>
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-gray-500">
                    <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5" />{new Date(r.start_date).toLocaleDateString('fr-FR')} → {new Date(r.end_date).toLocaleDateString('fr-FR')}</span>
                    <span className="font-semibold text-gray-900">{r.total_amount?.toLocaleString('fr-FR')} €</span>
                    {r.other_fn && <span>{role === 'renter' ? 'Propriétaire' : 'Locataire'} : {r.other_fn} {r.other_ln?.[0]}.</span>}
                  </div>
                  {r.status === 'litige' && (
                    <p className="text-xs text-red-600 mt-1 flex items-center gap-1"><AlertTriangle className="w-3 h-3" /> Litige en cours — consultez la section litiges</p>
                  )}
                </div>
                <ChevronRight className="w-5 h-5 text-gray-300 flex-shrink-0" />
              </motion.div>
            )
          })}
        </div>
      )}
    </div>
  )
}
