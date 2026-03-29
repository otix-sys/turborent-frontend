'use client'
import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { motion } from 'framer-motion'
import { Car, Eye, EyeOff, Loader2, AlertCircle, CheckCircle } from 'lucide-react'
import { authApi } from '../../lib/api'
import { useAuthStore } from '../../store/authStore'
import toast from 'react-hot-toast'

// ─── Schémas Zod ────────────────────────────────────────────────
const loginSchema = z.object({
  email: z.string().email('Email invalide'),
  password: z.string().min(1, 'Mot de passe requis')
})

const registerSchema = z.object({
  first_name: z.string().min(2, 'Prénom requis (min 2 caractères)').max(100).regex(/^[a-zA-ZÀ-ÿ\s\-']+$/, 'Prénom invalide'),
  last_name: z.string().min(2, 'Nom requis (min 2 caractères)').max(100).regex(/^[a-zA-ZÀ-ÿ\s\-']+$/, 'Nom invalide'),
  email: z.string().email('Email invalide'),
  phone: z.string().optional(),
  user_type: z.enum(['particulier', 'professionnel']).default('particulier'),
  city: z.string().min(2, 'Ville requise'),
  postal_code: z.string().regex(/^\d{5}$/, 'Code postal invalide'),
  password: z.string()
    .min(8, 'Minimum 8 caractères')
    .regex(/[A-Z]/, 'Au moins 1 majuscule')
    .regex(/[0-9]/, 'Au moins 1 chiffre')
    .regex(/[^A-Za-z0-9]/, 'Au moins 1 caractère spécial'),
  confirm_password: z.string(),
  accept_terms: z.boolean().refine(v => v === true, 'Vous devez accepter les CGU')
}).refine(d => d.password === d.confirm_password, {
  message: 'Les mots de passe ne correspondent pas',
  path: ['confirm_password']
})

const forgotSchema = z.object({ email: z.string().email('Email invalide') })

const resetSchema = z.object({
  password: z.string()
    .min(8, 'Minimum 8 caractères')
    .regex(/[A-Z]/, 'Au moins 1 majuscule')
    .regex(/[0-9]/, 'Au moins 1 chiffre')
    .regex(/[^A-Za-z0-9]/, 'Au moins 1 caractère spécial'),
  confirm_password: z.string()
}).refine(d => d.password === d.confirm_password, {
  message: 'Les mots de passe ne correspondent pas',
  path: ['confirm_password']
})

// ─── Composants réutilisables ────────────────────────────────────
function AuthLayout({ title, subtitle, children }: { title: string; subtitle?: string; children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 flex items-center justify-center p-4 pt-24">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 group mb-6">
            <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center">
              <Car className="w-6 h-6 text-white" />
            </div>
            <span className="font-bold text-xl text-gray-900">Turbo<span className="text-blue-600">Rent</span></span>
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
          {subtitle && <p className="text-gray-500 mt-1 text-sm">{subtitle}</p>}
        </div>
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
          {children}
        </div>
      </motion.div>
    </div>
  )
}

function FieldError({ msg }: { msg?: string }) {
  if (!msg) return null
  return <p className="error-msg"><AlertCircle className="w-3.5 h-3.5" />{msg}</p>
}

function PasswordStrength({ password }: { password: string }) {
  const checks = [
    { ok: password.length >= 8, label: '8 caractères' },
    { ok: /[A-Z]/.test(password), label: 'Majuscule' },
    { ok: /[0-9]/.test(password), label: 'Chiffre' },
    { ok: /[^A-Za-z0-9]/.test(password), label: 'Spécial' }
  ]
  const score = checks.filter(c => c.ok).length
  const colors = ['bg-red-400', 'bg-orange-400', 'bg-yellow-400', 'bg-green-400']
  if (!password) return null
  return (
    <div className="mt-2">
      <div className="flex gap-1 mb-2">
        {[0, 1, 2, 3].map(i => (
          <div key={i} className={`h-1 flex-1 rounded-full transition-colors ${i < score ? colors[score - 1] : 'bg-gray-200'}`} />
        ))}
      </div>
      <div className="flex flex-wrap gap-2">
        {checks.map((c, i) => (
          <span key={i} className={`text-xs flex items-center gap-1 ${c.ok ? 'text-green-600' : 'text-gray-400'}`}>
            <CheckCircle className="w-3 h-3" /> {c.label}
          </span>
        ))}
      </div>
    </div>
  )
}

// ─── PAGE LOGIN ──────────────────────────────────────────────────
export function LoginForm() {
  const router = useRouter()
  const { setUser } = useAuthStore()
  const [showPwd, setShowPwd] = useState(false)
  const [serverError, setServerError] = useState('')
  const [emailNotVerified, setEmailNotVerified] = useState(false)
  const [resendEmail, setResendEmail] = useState('')

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema)
  })

  const onSubmit = async (data: z.infer<typeof loginSchema>) => {
    setServerError('')
    setEmailNotVerified(false)
    try {
      const res = await authApi.login(data.email, data.password)
      setUser(res.data.user)
      toast.success(`Bienvenue, ${res.data.user.first_name} !`)
      router.push('/tableau-de-bord')
    } catch (err: unknown) {
      const e = err as { response?: { data?: { error?: string; code?: string; email?: string } } }
      const msg = e.response?.data?.error || 'Erreur de connexion'
      if (e.response?.data?.code === 'EMAIL_NOT_VERIFIED') {
        setEmailNotVerified(true)
        setResendEmail(e.response.data.email || data.email)
      } else {
        setServerError(msg)
      }
    }
  }

  const resendVerif = async () => {
    try {
      await authApi.resendVerification(resendEmail)
      toast.success('Email de vérification renvoyé !')
    } catch { toast.error('Erreur lors du renvoi') }
  }

  return (
    <AuthLayout title="Connexion" subtitle="Accédez à votre espace TurboRent">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        {serverError && (
          <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            {serverError}
          </div>
        )}

        {emailNotVerified && (
          <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-yellow-800 text-sm font-medium mb-2">Email non vérifié</p>
            <p className="text-yellow-700 text-sm mb-3">Vérifiez votre boîte mail pour activer votre compte.</p>
            <button type="button" onClick={resendVerif} className="text-sm text-blue-600 hover:underline font-medium">
              Renvoyer l'email de vérification
            </button>
          </div>
        )}

        <div>
          <label className="label">Email</label>
          <input {...register('email')} type="email" placeholder="votre@email.fr" className={`input-field ${errors.email ? 'input-error' : ''}`} autoComplete="email" />
          <FieldError msg={errors.email?.message} />
        </div>

        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="label">Mot de passe</label>
            <Link href="/auth/forgot-password" className="text-xs text-blue-600 hover:underline">Mot de passe oublié ?</Link>
          </div>
          <div className="relative">
            <input {...register('password')} type={showPwd ? 'text' : 'password'} placeholder="••••••••" className={`input-field pr-12 ${errors.password ? 'input-error' : ''}`} autoComplete="current-password" />
            <button type="button" onClick={() => setShowPwd(!showPwd)} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
              {showPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
          <FieldError msg={errors.password?.message} />
        </div>

        <button type="submit" disabled={isSubmitting} className="btn-primary w-full justify-center">
          {isSubmitting ? <><Loader2 className="w-4 h-4 animate-spin" /> Connexion…</> : 'Se connecter'}
        </button>

        <p className="text-center text-sm text-gray-500">
          Pas encore de compte ?{' '}
          <Link href="/auth/register" className="text-blue-600 font-medium hover:underline">S'inscrire gratuitement</Link>
        </p>
      </form>
    </AuthLayout>
  )
}

// ─── PAGE REGISTER ───────────────────────────────────────────────
export function RegisterForm() {
  const router = useRouter()
  const [showPwd, setShowPwd] = useState(false)
  const [serverError, setServerError] = useState('')
  const [success, setSuccess] = useState(false)
  const [successEmail, setSuccessEmail] = useState('')
  const [step, setStep] = useState(1)

  const { register, handleSubmit, watch, formState: { errors, isSubmitting } } = useForm<z.infer<typeof registerSchema>>({
    resolver: zodResolver(registerSchema),
    defaultValues: { user_type: 'particulier', accept_terms: false }
  })

  const password = watch('password', '')

  const onSubmit = async (data: z.infer<typeof registerSchema>) => {
    setServerError('')
    try {
      await authApi.register({ ...data, accept_terms: 'true' })
      setSuccess(true)
      setSuccessEmail(data.email)
    } catch (err: unknown) {
      const e = err as { response?: { data?: { error?: string; details?: Array<{ message: string }> } } }
      const details = e.response?.data?.details
      setServerError(details ? details[0].message : e.response?.data?.error || 'Erreur lors de l\'inscription')
    }
  }

  if (success) {
    return (
      <AuthLayout title="Vérifiez votre email" subtitle="">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
          <h2 className="text-xl font-bold text-gray-900">Inscription réussie !</h2>
          <p className="text-gray-500 text-sm leading-relaxed">
            Un email de vérification a été envoyé à <strong className="text-gray-800">{successEmail}</strong>.
            Cliquez sur le lien dans l'email pour activer votre compte.
          </p>
          <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-xl text-sm text-yellow-800">
            <strong>Le lien expire dans 15 minutes.</strong> Vérifiez aussi vos spams.
          </div>
          <Link href="/auth/login" className="btn-primary w-full justify-center block text-center">
            Aller à la connexion
          </Link>
        </div>
      </AuthLayout>
    )
  }

  return (
    <AuthLayout title="Créer un compte" subtitle="Rejoignez TurboRent gratuitement">
      {/* Indicateur d'étapes */}
      <div className="flex gap-2 mb-6">
        {[1, 2].map(s => (
          <div key={s} className={`flex-1 h-1.5 rounded-full transition-colors ${s <= step ? 'bg-blue-600' : 'bg-gray-200'}`} />
        ))}
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {serverError && (
          <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
            <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
            {serverError}
          </div>
        )}

        {step === 1 && (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="label">Prénom</label>
                <input {...register('first_name')} placeholder="Jean" className={`input-field ${errors.first_name ? 'input-error' : ''}`} />
                <FieldError msg={errors.first_name?.message} />
              </div>
              <div>
                <label className="label">Nom</label>
                <input {...register('last_name')} placeholder="Dupont" className={`input-field ${errors.last_name ? 'input-error' : ''}`} />
                <FieldError msg={errors.last_name?.message} />
              </div>
            </div>

            <div>
              <label className="label">Email</label>
              <input {...register('email')} type="email" placeholder="jean@exemple.fr" className={`input-field ${errors.email ? 'input-error' : ''}`} autoComplete="email" />
              <FieldError msg={errors.email?.message} />
            </div>

            <div>
              <label className="label">Téléphone (optionnel)</label>
              <input {...register('phone')} type="tel" placeholder="06 12 34 56 78" className="input-field" />
            </div>

            <div>
              <label className="label">Type de compte</label>
              <select {...register('user_type')} className="input-field">
                <option value="particulier">Particulier</option>
                <option value="professionnel">Professionnel</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="label">Ville</label>
                <input {...register('city')} placeholder="Paris" className={`input-field ${errors.city ? 'input-error' : ''}`} />
                <FieldError msg={errors.city?.message} />
              </div>
              <div>
                <label className="label">Code postal</label>
                <input {...register('postal_code')} placeholder="75001" maxLength={5} className={`input-field ${errors.postal_code ? 'input-error' : ''}`} />
                <FieldError msg={errors.postal_code?.message} />
              </div>
            </div>

            <button type="button" onClick={() => setStep(2)} className="btn-primary w-full justify-center">
              Continuer
            </button>
          </motion.div>
        )}

        {step === 2 && (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-4">
            <button type="button" onClick={() => setStep(1)} className="text-sm text-blue-600 hover:underline mb-2">
              ← Retour
            </button>

            <div>
              <label className="label">Mot de passe</label>
              <div className="relative">
                <input {...register('password')} type={showPwd ? 'text' : 'password'} placeholder="••••••••" className={`input-field pr-12 ${errors.password ? 'input-error' : ''}`} autoComplete="new-password" />
                <button type="button" onClick={() => setShowPwd(!showPwd)} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">
                  {showPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              <PasswordStrength password={password} />
              <FieldError msg={errors.password?.message} />
            </div>

            <div>
              <label className="label">Confirmer le mot de passe</label>
              <input {...register('confirm_password')} type="password" placeholder="••••••••" className={`input-field ${errors.confirm_password ? 'input-error' : ''}`} autoComplete="new-password" />
              <FieldError msg={errors.confirm_password?.message} />
            </div>

            <div>
              <label className="flex items-start gap-3 cursor-pointer">
                <input {...register('accept_terms')} type="checkbox" className="mt-0.5 w-4 h-4 text-blue-600 rounded" />
                <span className="text-sm text-gray-600">
                  J'accepte les{' '}
                  <Link href="/legal/cgu" target="_blank" className="text-blue-600 hover:underline">CGU</Link>{' '}et la{' '}
                  <Link href="/legal/confidentialite" target="_blank" className="text-blue-600 hover:underline">politique de confidentialité</Link>
                </span>
              </label>
              <FieldError msg={errors.accept_terms?.message} />
            </div>

            <button type="submit" disabled={isSubmitting} className="btn-primary w-full justify-center">
              {isSubmitting ? <><Loader2 className="w-4 h-4 animate-spin" /> Création du compte…</> : 'Créer mon compte'}
            </button>
          </motion.div>
        )}

        <p className="text-center text-sm text-gray-500">
          Déjà membre ?{' '}
          <Link href="/auth/login" className="text-blue-600 font-medium hover:underline">Se connecter</Link>
        </p>
      </form>
    </AuthLayout>
  )
}

// ─── FORGOT PASSWORD ────────────────────────────────────────────
export function ForgotPasswordForm() {
  const [sent, setSent] = useState(false)
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<z.infer<typeof forgotSchema>>({
    resolver: zodResolver(forgotSchema)
  })

  const onSubmit = async (data: z.infer<typeof forgotSchema>) => {
    try {
      await authApi.forgotPassword(data.email)
      setSent(true)
    } catch { setSent(true) } // Toujours afficher succès (anti-énumération)
  }

  return (
    <AuthLayout title="Mot de passe oublié" subtitle="Entrez votre email pour recevoir un lien de réinitialisation">
      {sent ? (
        <div className="text-center space-y-4">
          <div className="w-14 h-14 bg-blue-100 rounded-full flex items-center justify-center mx-auto">
            <CheckCircle className="w-7 h-7 text-blue-600" />
          </div>
          <p className="text-gray-700 text-sm leading-relaxed">
            Si un compte correspond à cet email, un lien de réinitialisation a été envoyé. Vérifiez aussi vos spams.
          </p>
          <p className="text-xs text-gray-400">Ce lien expire dans 10 minutes.</p>
          <Link href="/auth/login" className="btn-primary w-full justify-center block text-center mt-4">
            Retour à la connexion
          </Link>
        </div>
      ) : (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <div>
            <label className="label">Email</label>
            <input {...register('email')} type="email" placeholder="votre@email.fr" className={`input-field ${errors.email ? 'input-error' : ''}`} autoFocus />
            <FieldError msg={errors.email?.message} />
          </div>
          <button type="submit" disabled={isSubmitting} className="btn-primary w-full justify-center">
            {isSubmitting ? <><Loader2 className="w-4 h-4 animate-spin" /> Envoi…</> : 'Envoyer le lien'}
          </button>
          <p className="text-center text-sm">
            <Link href="/auth/login" className="text-blue-600 hover:underline">← Retour à la connexion</Link>
          </p>
        </form>
      )}
    </AuthLayout>
  )
}

// ─── RESET PASSWORD ─────────────────────────────────────────────
export function ResetPasswordForm({ token }: { token: string }) {
  const router = useRouter()
  const [showPwd, setShowPwd] = useState(false)
  const [serverError, setServerError] = useState('')
  const [expired, setExpired] = useState(false)

  const { register, handleSubmit, watch, formState: { errors, isSubmitting } } = useForm<z.infer<typeof resetSchema>>({
    resolver: zodResolver(resetSchema)
  })
  const password = watch('password', '')

  const onSubmit = async (data: z.infer<typeof resetSchema>) => {
    setServerError('')
    try {
      await authApi.resetPassword(token, data.password, data.confirm_password)
      toast.success('Mot de passe mis à jour ! Vous pouvez vous connecter.')
      router.push('/auth/login')
    } catch (err: unknown) {
      const e = err as { response?: { data?: { error?: string; expired?: boolean } } }
      if (e.response?.data?.expired) setExpired(true)
      else setServerError(e.response?.data?.error || 'Erreur')
    }
  }

  if (!token) {
    return (
      <AuthLayout title="Lien invalide">
        <div className="text-center space-y-4">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto" />
          <p className="text-gray-600">Ce lien est invalide ou manquant.</p>
          <Link href="/auth/forgot-password" className="btn-primary w-full justify-center block text-center">Faire une nouvelle demande</Link>
        </div>
      </AuthLayout>
    )
  }

  if (expired) {
    return (
      <AuthLayout title="Lien expiré">
        <div className="text-center space-y-4">
          <AlertCircle className="w-12 h-12 text-yellow-500 mx-auto" />
          <p className="text-gray-600">Ce lien a expiré (valable 10 minutes).</p>
          <Link href="/auth/forgot-password" className="btn-primary w-full justify-center block text-center">Faire une nouvelle demande</Link>
        </div>
      </AuthLayout>
    )
  }

  return (
    <AuthLayout title="Nouveau mot de passe" subtitle="Choisissez un mot de passe sécurisé">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        {serverError && (
          <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
            <AlertCircle className="w-4 h-4" />{serverError}
          </div>
        )}
        <div>
          <label className="label">Nouveau mot de passe</label>
          <div className="relative">
            <input {...register('password')} type={showPwd ? 'text' : 'password'} placeholder="••••••••" className={`input-field pr-12 ${errors.password ? 'input-error' : ''}`} autoComplete="new-password" />
            <button type="button" onClick={() => setShowPwd(!showPwd)} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">
              {showPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
          <PasswordStrength password={password} />
          <FieldError msg={errors.password?.message} />
        </div>
        <div>
          <label className="label">Confirmer le mot de passe</label>
          <input {...register('confirm_password')} type="password" placeholder="••••••••" className={`input-field ${errors.confirm_password ? 'input-error' : ''}`} />
          <FieldError msg={errors.confirm_password?.message} />
        </div>
        <button type="submit" disabled={isSubmitting} className="btn-primary w-full justify-center">
          {isSubmitting ? <><Loader2 className="w-4 h-4 animate-spin" /> Mise à jour…</> : 'Mettre à jour le mot de passe'}
        </button>
      </form>
    </AuthLayout>
  )
}
