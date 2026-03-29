'use client'
import { useEffect, useState } from 'react'
import { AlertTriangle, CheckCircle, Clock, Scale } from 'lucide-react'
import { adminApi } from '../../../lib/api'
import toast from 'react-hot-toast'

export default function AdminLitigesPage() {
  const [disputes, setDisputes] = useState<unknown[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('ouvert')

  const load = () => {
    setLoading(true)
    adminApi.getDisputes({ status: filter || undefined })
      .then(r => setDisputes(r.data.disputes || []))
      .catch(() => {})
      .finally(() => setLoading(false))
  }
  useEffect(() => { load() }, [filter])

  const resolve = async (id: string) => {
    const decision = prompt('Décision (resolu_proprietaire / resolu_locataire / ferme) :')
    if (!decision) return
    const validDecisions = ['resolu_proprietaire', 'resolu_locataire', 'ferme']
    if (!validDecisions.includes(decision)) { toast.error('Décision invalide'); return }
    const notes = prompt('Notes de résolution (détaillées, min 20 caractères) :')
    if (!notes || notes.length < 20) { toast.error('Notes trop courtes'); return }
    const retained = parseFloat(prompt('Montant retenu sur caution (€, 0 si aucun) :') || '0')
    const refunded = parseFloat(prompt('Montant remboursé (€, 0 si aucun) :') || '0')
    try {
      await adminApi.resolveDispute(id, { decision, resolution_notes: notes, amount_retained: retained, amount_refunded: refunded })
      toast.success('Litige résolu.')
      load()
    } catch { toast.error('Erreur') }
  }

  const STATUS_CONFIG: Record<string, { label: string; color: string }> = {
    ouvert:              { label: 'Ouvert',         color: 'red' },
    en_traitement:       { label: 'En traitement',  color: 'yellow' },
    resolu_proprietaire: { label: 'Propriétaire',   color: 'green' },
    resolu_locataire:    { label: 'Locataire',      color: 'blue' },
    ferme:               { label: 'Fermé',          color: 'gray' },
  }

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-white">Litiges</h1>
        <p className="text-gray-400 text-sm mt-0.5">Gestion des litiges entre locataires et propriétaires.</p>
      </div>

      <div className="flex gap-1 bg-gray-800 p-1 rounded-xl w-fit">
        {[['ouvert', 'Ouverts'], ['en_traitement', 'En traitement'], ['resolu_proprietaire', 'Résolus'], ['', 'Tous']].map(([val, label]) => (
          <button key={val} onClick={() => setFilter(val)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${filter === val ? 'bg-gray-700 text-white' : 'text-gray-400 hover:text-white'}`}>
            {label}
          </button>
        ))}
      </div>

      <div className="space-y-3">
        {loading ? [...Array(4)].map((_, i) => <div key={i} className="skeleton h-28 rounded-xl" />) :
        disputes.length === 0 ? (
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-14 text-center">
            <CheckCircle className="w-10 h-10 text-green-500/40 mx-auto mb-3" />
            <p className="text-gray-500">Aucun litige dans cette catégorie</p>
          </div>
        ) : disputes.map((item: unknown) => {
          const d = item as { id: string; status: string; description: string; claimed_amount?: number; created_at: string; start_date: string; end_date: string; brand: string; model: string; initiator_fn: string; initiator_ln: string; initiator_email: string; against_fn: string; against_ln: string; resolution_notes?: string; amount_retained?: number; amount_refunded?: number }
          const cfg = STATUS_CONFIG[d.status] || { label: d.status, color: 'gray' }
          return (
            <div key={d.id} className="bg-gray-900 border border-gray-800 rounded-xl p-5">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <AlertTriangle className={`w-4 h-4 text-${cfg.color}-400`} />
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full bg-${cfg.color}-900/40 text-${cfg.color}-400`}>
                      {cfg.label}
                    </span>
                    <span className="text-gray-500 text-xs">#{d.id.slice(0, 8)}</span>
                    <span className="text-gray-500 text-xs">{new Date(d.created_at).toLocaleDateString('fr-FR')}</span>
                  </div>
                  <h3 className="text-white font-semibold mb-1">{d.brand} {d.model} · {new Date(d.start_date).toLocaleDateString('fr-FR')} → {new Date(d.end_date).toLocaleDateString('fr-FR')}</h3>
                  <div className="flex gap-4 text-sm text-gray-400 mb-2">
                    <span>Initiateur : <span className="text-white">{d.initiator_fn} {d.initiator_ln}</span> ({d.initiator_email})</span>
                    <span>Contre : <span className="text-white">{d.against_fn} {d.against_ln}</span></span>
                  </div>
                  <p className="text-gray-400 text-sm line-clamp-2">{d.description}</p>
                  {d.claimed_amount && <p className="text-yellow-400 text-sm mt-1 font-medium">Montant réclamé : {d.claimed_amount.toLocaleString('fr-FR')} €</p>}
                  {d.resolution_notes && (
                    <div className="mt-2 p-3 bg-gray-800 rounded-lg">
                      <p className="text-xs text-gray-400">Résolution : {d.resolution_notes}</p>
                      {d.amount_retained !== undefined && <p className="text-xs text-gray-500 mt-1">Retenu : {d.amount_retained} € · Remboursé : {d.amount_refunded} €</p>}
                    </div>
                  )}
                </div>
                {(d.status === 'ouvert' || d.status === 'en_traitement') && (
                  <button onClick={() => resolve(d.id)}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-medium transition-colors flex-shrink-0">
                    <Scale className="w-4 h-4" /> Résoudre
                  </button>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
