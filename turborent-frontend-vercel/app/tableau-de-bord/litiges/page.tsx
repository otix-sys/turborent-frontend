'use client'
import { useEffect, useState } from 'react'
import { AlertTriangle, Plus } from 'lucide-react'
import Link from 'next/link'
import { disputesApi } from '../../../lib/api'

export default function LitigesPage() {
  const [disputes, setDisputes] = useState<unknown[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    disputesApi.getMine().then(r => setDisputes(r.data.disputes || [])).catch(() => {}).finally(() => setLoading(false))
  }, [])

  const STATUS: Record<string,{label:string;color:string}> = {
    ouvert:              {label:'Ouvert',           color:'red'},
    en_traitement:       {label:'En traitement',    color:'yellow'},
    resolu_proprietaire: {label:'Résolu (proprio)', color:'green'},
    resolu_locataire:    {label:'Résolu (locataire)',color:'blue'},
    ferme:               {label:'Fermé',            color:'gray'},
  }

  return (
    <div className="space-y-5">
      <h1 className="text-2xl font-bold text-gray-900">Litiges</h1>
      {loading ? (
        <div className="space-y-3">{[...Array(3)].map((_,i) => <div key={i} className="skeleton h-24 rounded-2xl" />)}</div>
      ) : disputes.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 p-14 text-center">
          <AlertTriangle className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <h3 className="font-semibold text-gray-700 mb-2">Aucun litige</h3>
          <p className="text-gray-400 text-sm">Vos locations se passent bien — continuez ainsi !</p>
        </div>
      ) : (
        <div className="space-y-3">
          {disputes.map((item: unknown) => {
            const d = item as { id:string; status:string; description:string; claimed_amount?:number; created_at:string; brand:string; model:string; start_date:string; end_date:string }
            const cfg = STATUS[d.status] || {label:d.status, color:'gray'}
            return (
              <div key={d.id} className="card p-5">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`badge badge-${cfg.color === 'red' ? 'red' : cfg.color === 'yellow' ? 'yellow' : cfg.color === 'green' ? 'green' : 'gray'}`}>{cfg.label}</span>
                      <span className="text-gray-400 text-xs">#{d.id.slice(0,8)}</span>
                    </div>
                    <h3 className="font-semibold text-gray-900">{d.brand} {d.model}</h3>
                    <p className="text-sm text-gray-500">{new Date(d.start_date).toLocaleDateString('fr-FR')} → {new Date(d.end_date).toLocaleDateString('fr-FR')}</p>
                    <p className="text-sm text-gray-600 mt-2 line-clamp-2">{d.description}</p>
                    {d.claimed_amount && <p className="text-sm font-medium text-red-600 mt-1">Montant réclamé : {d.claimed_amount.toLocaleString('fr-FR')} €</p>}
                  </div>
                  <p className="text-xs text-gray-400 flex-shrink-0">{new Date(d.created_at).toLocaleDateString('fr-FR')}</p>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
