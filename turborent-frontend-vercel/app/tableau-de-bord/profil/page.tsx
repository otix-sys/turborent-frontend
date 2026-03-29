'use client'
import { useEffect, useRef, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Camera, Loader2, CheckCircle, AlertCircle, Eye, EyeOff } from 'lucide-react'
import { usersApi, authApi } from '../../../lib/api'
import { useAuth } from '../../../hooks/useAuth'
import { useAuthStore } from '../../../store/authStore'
import toast from 'react-hot-toast'

const profileSchema = z.object({
  first_name: z.string().min(2).max(100),
  last_name:  z.string().min(2).max(100),
  phone:      z.string().optional(),
  city:       z.string().min(2).max(100).optional(),
  postal_code: z.string().regex(/^\d{5}$/).optional().or(z.literal('')),
  bio:        z.string().max(500).optional(),
  company_name: z.string().optional(),
})

const pwdSchema = z.object({
  current_password: z.string().min(1),
  password: z.string().min(8).regex(/[A-Z]/).regex(/[0-9]/).regex(/[^A-Za-z0-9]/),
  confirm_password: z.string()
}).refine(d => d.password === d.confirm_password, { message: 'Mots de passe différents', path: ['confirm_password'] })

export default function ProfilPage() {
  const { user } = useAuth()
  const { setUser } = useAuthStore()
  const [loading, setLoading] = useState(true)
  const [uploadingAvatar, setUploadingAvatar] = useState(false)
  const [showCurrentPwd, setShowCurrentPwd] = useState(false)
  const [showNewPwd, setShowNewPwd] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)
  const API_BASE = (process.env.NEXT_PUBLIC_API_URL || '').replace('/api/v1', '')

  const { register, handleSubmit, reset, formState: { errors, isSubmitting, isDirty } } = useForm<z.infer<typeof profileSchema>>({
    resolver: zodResolver(profileSchema)
  })

  const { register: regPwd, handleSubmit: handlePwd, reset: resetPwd, formState: { errors: errPwd, isSubmitting: submittingPwd } } = useForm<z.infer<typeof pwdSchema>>({
    resolver: zodResolver(pwdSchema)
  })

  useEffect(() => {
    usersApi.getMe().then(r => {
      const u = r.data.user
      reset({ first_name: u.first_name, last_name: u.last_name, phone: u.phone || '', city: u.city || '', postal_code: u.postal_code || '', bio: u.bio || '', company_name: u.company_name || '' })
      setLoading(false)
    }).catch(() => setLoading(false))
  }, [])

  const onSaveProfile = async (data: z.infer<typeof profileSchema>) => {
    try {
      const res = await usersApi.updateMe(data)
      setUser({ ...user!, ...res.data.user })
      toast.success('Profil mis à jour.')
    } catch { toast.error('Erreur lors de la mise à jour') }
  }

  const onChangePassword = async (data: z.infer<typeof pwdSchema>) => {
    try {
      await authApi.changePassword(data.current_password, data.password, data.confirm_password)
      toast.success('Mot de passe modifié. Reconnectez-vous.')
      resetPwd()
    } catch (err: unknown) {
      const e = err as { response?: { data?: { error?: string } } }
      toast.error(e.response?.data?.error || 'Mot de passe actuel incorrect')
    }
  }

  const uploadAvatar = async (file: File) => {
    setUploadingAvatar(true)
    try {
      const res = await usersApi.uploadAvatar(file)
      setUser({ ...user!, avatar_url: res.data.avatarUrl })
      toast.success('Photo de profil mise à jour.')
    } catch { toast.error('Erreur upload') }
    finally { setUploadingAvatar(false) }
  }

  if (loading || !user) return <div className="space-y-4">{[...Array(3)].map((_,i) => <div key={i} className="skeleton h-32 rounded-2xl" />)}</div>

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Mon profil</h1>

      {/* Avatar */}
      <div className="card p-6">
        <h2 className="font-semibold text-gray-900 mb-4">Photo de profil</h2>
        <div className="flex items-center gap-5">
          <div className="relative">
            <div className="w-20 h-20 rounded-full overflow-hidden bg-blue-100 flex items-center justify-center">
              {user.avatar_url ? (
                <img src={`${API_BASE}${user.avatar_url}`} alt="" className="w-full h-full object-cover" />
              ) : (
                <span className="text-2xl font-bold text-blue-600">{user.first_name[0]}{user.last_name[0]}</span>
              )}
            </div>
            <button onClick={() => fileRef.current?.click()} disabled={uploadingAvatar}
              className="absolute -bottom-1 -right-1 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center hover:bg-blue-700 transition-colors shadow-md">
              {uploadingAvatar ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Camera className="w-3.5 h-3.5" />}
            </button>
          </div>
          <div>
            <p className="text-sm text-gray-600">JPG ou PNG · Max 2 Mo · Dimensions recommandées : 400×400 px</p>
            <button onClick={() => fileRef.current?.click()} className="text-sm text-blue-600 hover:underline mt-1">Changer la photo</button>
          </div>
          <input ref={fileRef} type="file" accept="image/jpeg,image/png" className="hidden"
            onChange={e => { const f = e.target.files?.[0]; if (f) uploadAvatar(f) }} />
        </div>

        {/* Score confiance */}
        <div className="mt-5 p-4 bg-gray-50 rounded-xl">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">Score de confiance</span>
            <span className={`text-sm font-bold ${user.trust_score >= 80 ? 'text-green-600' : user.trust_score >= 50 ? 'text-yellow-600' : 'text-red-600'}`}>
              {user.trust_score}/100
            </span>
          </div>
          <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
            <div className={`h-full rounded-full ${user.trust_score >= 80 ? 'bg-green-500' : user.trust_score >= 50 ? 'bg-yellow-400' : 'bg-red-400'}`}
              style={{ width: `${user.trust_score}%` }} />
          </div>
          <div className="grid grid-cols-3 gap-2 mt-3">
            {[
              { ok: user.is_documents_verified, label: 'Documents KYC' },
              { ok: !!user.phone, label: 'Téléphone renseigné' },
              { ok: true, label: 'Email vérifié' }
            ].map((item, i) => (
              <div key={i} className={`flex items-center gap-1.5 text-xs ${item.ok ? 'text-green-600' : 'text-gray-400'}`}>
                <CheckCircle className="w-3 h-3" /> {item.label}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Informations personnelles */}
      <form onSubmit={handleSubmit(onSaveProfile)} className="card p-6 space-y-4">
        <h2 className="font-semibold text-gray-900">Informations personnelles</h2>
        <div className="grid grid-cols-2 gap-4">
          <div><label className="label">Prénom</label><input {...register('first_name')} className={`input-field ${errors.first_name ? 'input-error' : ''}`} /></div>
          <div><label className="label">Nom</label><input {...register('last_name')} className={`input-field ${errors.last_name ? 'input-error' : ''}`} /></div>
          <div><label className="label">Téléphone</label><input {...register('phone')} type="tel" placeholder="06 12 34 56 78" className="input-field" /></div>
          <div><label className="label">Entreprise</label><input {...register('company_name')} placeholder="Optionnel" className="input-field" /></div>
          <div><label className="label">Ville</label><input {...register('city')} placeholder="Paris" className="input-field" /></div>
          <div><label className="label">Code postal</label><input {...register('postal_code')} placeholder="75001" maxLength={5} className="input-field" /></div>
        </div>
        <div><label className="label">Bio <span className="text-gray-400 font-normal">(max 500 caractères)</span></label>
          <textarea {...register('bio')} rows={3} placeholder="Présentez-vous brièvement…" className="input-field resize-none" />
        </div>
        <div className="flex justify-end">
          <button type="submit" disabled={isSubmitting || !isDirty} className="btn-primary">
            {isSubmitting ? <><Loader2 className="w-4 h-4 animate-spin" /> Sauvegarde…</> : 'Sauvegarder les modifications'}
          </button>
        </div>
      </form>

      {/* Changer le mot de passe */}
      <form onSubmit={handlePwd(onChangePassword)} className="card p-6 space-y-4">
        <h2 className="font-semibold text-gray-900">Changer le mot de passe</h2>
        <div>
          <label className="label">Mot de passe actuel</label>
          <div className="relative">
            <input {...regPwd('current_password')} type={showCurrentPwd ? 'text' : 'password'} className={`input-field pr-12 ${errPwd.current_password ? 'input-error' : ''}`} />
            <button type="button" onClick={() => setShowCurrentPwd(!showCurrentPwd)} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">
              {showCurrentPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>
        <div>
          <label className="label">Nouveau mot de passe</label>
          <div className="relative">
            <input {...regPwd('password')} type={showNewPwd ? 'text' : 'password'} className={`input-field pr-12 ${errPwd.password ? 'input-error' : ''}`} />
            <button type="button" onClick={() => setShowNewPwd(!showNewPwd)} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">
              {showNewPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
          {errPwd.password && <p className="error-msg"><AlertCircle className="w-3.5 h-3.5" />{errPwd.password.message}</p>}
        </div>
        <div>
          <label className="label">Confirmer le nouveau mot de passe</label>
          <input {...regPwd('confirm_password')} type="password" className={`input-field ${errPwd.confirm_password ? 'input-error' : ''}`} />
          {errPwd.confirm_password && <p className="error-msg"><AlertCircle className="w-3.5 h-3.5" />{errPwd.confirm_password.message}</p>}
        </div>
        <div className="flex justify-end">
          <button type="submit" disabled={submittingPwd} className="btn-primary">
            {submittingPwd ? <><Loader2 className="w-4 h-4 animate-spin" /> Modification…</> : 'Changer le mot de passe'}
          </button>
        </div>
      </form>
    </div>
  )
}
