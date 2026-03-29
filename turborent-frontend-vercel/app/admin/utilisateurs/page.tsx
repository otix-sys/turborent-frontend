'use client'
import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { CheckCircle, XCircle, Search, Filter, Eye, Loader2, AlertTriangle } from 'lucide-react'
import { adminApi } from '../../../lib/api'
import toast from 'react-hot-toast'

// ─── ADMIN UTILISATEURS ─────────────────────────────────────────
export default function AdminUsersPage() {
  const [users, setUsers] = useState<unknown[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)

  const load = (p = 1) => {
    setLoading(true)
    adminApi.getUsers({ search: search||undefined, status: statusFilter||undefined, page: p, limit: 30 })
      .then(r => { setUsers(r.data.users || []); setTotal(r.data.pagination?.total || 0) })
      .catch(() => {})
      .finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [search, statusFilter])

  const suspend = async (id: string, name: string) => {
    const reason = prompt(`Motif de suspension pour ${name} :`)
    if (!reason) return
    try {
      await adminApi.suspendUser(id, reason)
      toast.success('Compte suspendu.')
      load()
    } catch { toast.error('Erreur') }
  }

  const restore = async (id: string) => {
    try {
      await adminApi.restoreUser(id)
      toast.success('Compte réactivé.')
      load()
    } catch { toast.error('Erreur') }
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-bold text-white">Utilisateurs</h1><p className="text-gray-400 text-sm mt-0.5">{total} comptes</p></div>
      </div>

      <div className="flex gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Nom, email…"
            className="w-full pl-9 pr-4 py-2.5 bg-gray-800 border border-gray-700 text-white rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-gray-500" />
        </div>
        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
          className="bg-gray-800 border border-gray-700 text-white rounded-xl px-3 py-2.5 text-sm focus:outline-none">
          <option value="">Tous les statuts</option>
          <option value="actif">Actif</option>
          <option value="email_non_verifie">Non vérifié</option>
          <option value="suspendu">Suspendu</option>
        </select>
      </div>

      <div className="bg-gray-900 rounded-xl border border-gray-800 overflow-hidden">
        <table className="w-full">
          <thead><tr className="border-b border-gray-800">
            <th className="text-left px-4 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">Utilisateur</th>
            <th className="text-left px-4 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">Type</th>
            <th className="text-left px-4 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">Statut</th>
            <th className="text-left px-4 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">KYC</th>
            <th className="text-left px-4 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">Score</th>
            <th className="text-left px-4 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">Inscrit le</th>
            <th className="text-right px-4 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">Actions</th>
          </tr></thead>
          <tbody>
            {loading ? [...Array(8)].map((_, i) => (
              <tr key={i} className="border-b border-gray-800"><td colSpan={7} className="px-4 py-3"><div className="skeleton h-5 w-full rounded" /></td></tr>
            )) : users.length === 0 ? (
              <tr><td colSpan={7} className="text-center py-12 text-gray-500">Aucun utilisateur</td></tr>
            ) : users.map((u: unknown) => {
              const user = u as { id: string; first_name: string; last_name: string; email: string; user_type: string; status: string; is_documents_verified: boolean; trust_score: number; created_at: string }
              return (
                <motion.tr key={user.id} initial={{ opacity:0 }} animate={{ opacity:1 }} className="border-b border-gray-800 hover:bg-gray-800/50 transition-colors">
                  <td className="px-4 py-3">
                    <div><p className="text-white text-sm font-medium">{user.first_name} {user.last_name}</p><p className="text-gray-500 text-xs">{user.email}</p></div>
                  </td>
                  <td className="px-4 py-3"><span className="text-gray-300 text-sm capitalize">{user.user_type}</span></td>
                  <td className="px-4 py-3">
                    <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                      user.status === 'actif' ? 'bg-green-900/50 text-green-400' :
                      user.status === 'suspendu' ? 'bg-red-900/50 text-red-400' :
                      user.status === 'email_non_verifie' ? 'bg-yellow-900/50 text-yellow-400' :
                      'bg-gray-800 text-gray-400'
                    }`}>{user.status}</span>
                  </td>
                  <td className="px-4 py-3">
                    {user.is_documents_verified
                      ? <CheckCircle className="w-4 h-4 text-green-500" />
                      : <XCircle className="w-4 h-4 text-gray-600" />}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`text-sm font-medium ${user.trust_score >= 80 ? 'text-green-400' : user.trust_score >= 50 ? 'text-yellow-400' : 'text-red-400'}`}>
                      {user.trust_score}/100
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-400 text-xs">{new Date(user.created_at).toLocaleDateString('fr-FR')}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-2">
                      {user.status === 'actif' ? (
                        <button onClick={() => suspend(user.id, `${user.first_name} ${user.last_name}`)}
                          className="px-3 py-1.5 bg-red-900/40 text-red-400 hover:bg-red-900/60 rounded-lg text-xs font-medium transition-colors">
                          Suspendre
                        </button>
                      ) : user.status === 'suspendu' ? (
                        <button onClick={() => restore(user.id)}
                          className="px-3 py-1.5 bg-green-900/40 text-green-400 hover:bg-green-900/60 rounded-lg text-xs font-medium transition-colors">
                          Réactiver
                        </button>
                      ) : null}
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
