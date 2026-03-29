'use client'
import { useEffect, useState } from 'react'
import { ScrollText, Shield, User, Car, FileText, AlertTriangle, Settings } from 'lucide-react'
import { adminApi } from '../../../lib/api'

const ACTION_CONFIG: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
  user_suspend:      { label:'Suspension',    color:'red',    icon:<User className="w-3 h-3" /> },
  user_restore:      { label:'Réactivation',  color:'green',  icon:<User className="w-3 h-3" /> },
  user_delete:       { label:'Suppression',   color:'red',    icon:<User className="w-3 h-3" /> },
  user_update:       { label:'Modification',  color:'blue',   icon:<User className="w-3 h-3" /> },
  vehicle_validate:  { label:'Validation',    color:'green',  icon:<Car className="w-3 h-3" /> },
  vehicle_refuse:    { label:'Refus',         color:'red',    icon:<Car className="w-3 h-3" /> },
  vehicle_delete:    { label:'Suppression',   color:'red',    icon:<Car className="w-3 h-3" /> },
  document_validate: { label:'Doc validé',    color:'green',  icon:<FileText className="w-3 h-3" /> },
  document_refuse:   { label:'Doc refusé',    color:'red',    icon:<FileText className="w-3 h-3" /> },
  dispute_resolve:   { label:'Litige résolu', color:'purple', icon:<AlertTriangle className="w-3 h-3" /> },
  avis_delete:       { label:'Avis supprimé', color:'yellow', icon:<ScrollText className="w-3 h-3" /> },
  setting_update:    { label:'Paramètres',    color:'blue',   icon:<Settings className="w-3 h-3" /> },
  login:             { label:'Connexion',     color:'gray',   icon:<Shield className="w-3 h-3" /> },
}

export default function AdminLogsPage() {
  const [logs, setLogs] = useState<unknown[]>([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)

  useEffect(() => {
    setLoading(true)
    adminApi.getLogs({ page, limit: 50 })
      .then(r => setLogs(r.data.logs || []))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [page])

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-white">Logs d'administration</h1>
        <p className="text-gray-400 text-sm mt-0.5">Toutes les actions effectuées par les administrateurs sont enregistrées.</p>
      </div>

      <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-800">
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-400 uppercase">Date</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-400 uppercase">Admin</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-400 uppercase">Action</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-400 uppercase">Détails</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-400 uppercase">IP</th>
            </tr>
          </thead>
          <tbody>
            {loading ? [...Array(10)].map((_, i) => (
              <tr key={i} className="border-b border-gray-800">
                <td colSpan={5} className="px-4 py-3"><div className="skeleton h-4 w-full rounded" /></td>
              </tr>
            )) : logs.length === 0 ? (
              <tr><td colSpan={5} className="text-center py-12 text-gray-500">Aucun log disponible</td></tr>
            ) : logs.map((item: unknown) => {
              const log = item as { id: string; action: string; admin_email: string; first_name: string; last_name: string; description?: string; ip_address?: string; created_at: string }
              const cfg = ACTION_CONFIG[log.action] || { label: log.action, color: 'gray', icon: null }
              return (
                <tr key={log.id} className="border-b border-gray-800 hover:bg-gray-800/40 transition-colors">
                  <td className="px-4 py-3 text-gray-400 text-xs whitespace-nowrap">
                    {new Date(log.created_at).toLocaleString('fr-FR')}
                  </td>
                  <td className="px-4 py-3">
                    <p className="text-white text-sm font-medium">{log.first_name} {log.last_name}</p>
                    <p className="text-gray-500 text-xs">{log.admin_email}</p>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full bg-${cfg.color}-900/40 text-${cfg.color}-400`}>
                      {cfg.icon}{cfg.label}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-400 text-xs max-w-xs truncate">{log.description || '—'}</td>
                  <td className="px-4 py-3 text-gray-500 text-xs font-mono">{log.ip_address || '—'}</td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      <div className="flex justify-center gap-2">
        <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page <= 1}
          className="px-4 py-2 rounded-lg bg-gray-800 text-gray-300 text-sm disabled:opacity-40 hover:bg-gray-700 transition-colors">
          ← Précédent
        </button>
        <span className="px-4 py-2 text-gray-400 text-sm">Page {page}</span>
        <button onClick={() => setPage(p => p + 1)} disabled={logs.length < 50}
          className="px-4 py-2 rounded-lg bg-gray-800 text-gray-300 text-sm disabled:opacity-40 hover:bg-gray-700 transition-colors">
          Suivant →
        </button>
      </div>
    </div>
  )
}
