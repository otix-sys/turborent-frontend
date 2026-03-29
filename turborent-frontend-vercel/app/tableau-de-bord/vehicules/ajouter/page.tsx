'use client'
import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronRight, ChevronLeft, Upload, X, CheckCircle, Loader2, AlertCircle, Car, Info } from 'lucide-react'
import { vehiclesApi } from '../../../../lib/api'
import { useAuth } from '../../../../hooks/useAuth'
import toast from 'react-hot-toast'

const vehicleSchema = z.object({
  listing_type: z.enum(['location','vente']),
  category: z.enum(['voiture','moto','scooter','utilitaire','camping_car','camion']),
  brand: z.string().min(1,'Marque requise').max(100),
  model: z.string().min(1,'Modèle requis').max(100),
  version: z.string().optional(),
  year: z.number().int().min(1980).max(new Date().getFullYear()+1),
  fuel: z.enum(['essence','diesel','electrique','hybride','hybride_rechargeable','gpl']),
  transmission: z.enum(['manuelle','automatique']),
  mileage: z.number().int().min(0,'Kilométrage invalide'),
  seats: z.number().int().min(1).max(20),
  doors: z.number().int().min(2).max(6).optional(),
  color: z.string().optional(),
  power_din: z.number().int().min(1).optional(),
  city: z.string().min(2,'Ville requise'),
  postal_code: z.string().regex(/^\d{5}$/,'Code postal invalide'),
  description: z.string().max(5000).optional(),
  options: z.string().optional(),
  // Location
  price_per_day: z.number().min(10).optional(),
  deposit_amount: z.number().min(0).optional(),
  included_km_per_day: z.number().int().min(0).optional(),
  min_rental_days: z.number().int().min(1).optional(),
  max_rental_days: z.number().int().min(1).optional(),
  // Vente
  sale_price: z.number().min(500).optional(),
  negotiable: z.boolean().optional(),
  first_hand: z.boolean().optional(),
})

type FormData = z.infer<typeof vehicleSchema>

const STEPS = ['Type & Catégorie', 'Informations', 'Prix & Caution', 'Photos', 'Confirmation']

const INPUT_CLASS = 'w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white'
const LABEL_CLASS = 'block text-sm font-medium text-gray-700 mb-1.5'

export default function AddVehiclePage() {
  const router = useRouter()
  const { user } = useAuth({ requireAuth: true })
  const [step, setStep] = useState(0)
  const [photos, setPhotos] = useState<File[]>([])
  const [photoUrls, setPhotoUrls] = useState<string[]>([])
  const [submitting, setSubmitting] = useState(false)
  const [vehicleId, setVehicleId] = useState<string|null>(null)
  const fileRef = useRef<HTMLInputElement>(null)

  const { register, handleSubmit, watch, setValue, getValues, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(vehicleSchema),
    defaultValues: {
      listing_type: 'location', category: 'voiture', fuel: 'essence',
      transmission: 'automatique', seats: 5, doors: 5,
      deposit_amount: 500, included_km_per_day: 200,
      min_rental_days: 1, max_rental_days: 30,
      negotiable: true, first_hand: false
    }
  })

  const listingType = watch('listing_type')

  const addPhotos = (files: FileList) => {
    const newFiles = Array.from(files).filter(f => f.type.startsWith('image/') && f.size <= 10*1024*1024)
    const newUrls = newFiles.map(f => URL.createObjectURL(f))
    setPhotos(p => [...p, ...newFiles].slice(0, 20))
    setPhotoUrls(u => [...u, ...newUrls].slice(0, 20))
  }

  const removePhoto = (i: number) => {
    URL.revokeObjectURL(photoUrls[i])
    setPhotos(p => p.filter((_,j) => j !== i))
    setPhotoUrls(u => u.filter((_,j) => j !== i))
  }

  const onSubmit = async (data: FormData) => {
    if (step < STEPS.length - 1) { setStep(s => s+1); return }
    if (photos.length === 0) { toast.error('Au moins 1 photo requise'); return }

    setSubmitting(true)
    try {
      // 1. Créer le véhicule
      const options = data.options ? data.options.split(',').map(s => s.trim()).filter(Boolean) : []
      const res = await vehiclesApi.create({ ...data, options })
      const id = res.data.vehicle?.id
      setVehicleId(id)

      // 2. Upload photos
      const fileList = (() => {
        const dt = new DataTransfer()
        photos.forEach(f => dt.items.add(f))
        return dt.files
      })()
      await vehiclesApi.uploadPhotos(id, fileList)

      toast.success('Annonce soumise ! Notre équipe la vérifiera sous 24-48h.')
      router.push('/tableau-de-bord/vehicules')
    } catch (err: unknown) {
      const e = err as { response?: { data?: { error?: string } } }
      toast.error(e.response?.data?.error || 'Erreur lors de la soumission')
    } finally { setSubmitting(false) }
  }

  const nextStep = async () => {
    if (step === 0) { setStep(1); return }
    if (step === 1) {
      const vals = getValues()
      const requiredFields: (keyof FormData)[] = ['brand','model','year','fuel','transmission','mileage','seats','city','postal_code']
      const hasError = requiredFields.some(f => !vals[f])
      if (hasError) { toast.error('Remplissez tous les champs obligatoires'); return }
      setStep(2); return
    }
    if (step === 2) {
      const vals = getValues()
      if (vals.listing_type === 'location' && (!vals.price_per_day || vals.price_per_day < 10)) {
        toast.error('Prix de location invalide (min 10 €/jour)'); return
      }
      if (vals.listing_type === 'vente' && (!vals.sale_price || vals.sale_price < 500)) {
        toast.error('Prix de vente invalide (min 500 €)'); return
      }
      setStep(3); return
    }
    if (step === 3) { setStep(4); return }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Publier une annonce</h1>
        <p className="text-gray-500 mt-1">Votre annonce sera vérifiée par notre équipe avant publication (24-48h).</p>
      </div>

      {/* Barre de progression */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
        <div className="flex items-center gap-0">
          {STEPS.map((s, i) => (
            <div key={i} className="flex items-center flex-1 last:flex-none">
              <div className="flex flex-col items-center gap-1">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all ${
                  i < step ? 'bg-green-500 text-white' : i === step ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-400'
                }`}>
                  {i < step ? <CheckCircle className="w-4 h-4" /> : i+1}
                </div>
                <span className={`text-xs hidden sm:block ${i === step ? 'text-blue-600 font-medium' : 'text-gray-400'}`}>{s}</span>
              </div>
              {i < STEPS.length-1 && (
                <div className={`flex-1 h-0.5 mx-2 transition-colors ${i < step ? 'bg-green-500' : 'bg-gray-200'}`} />
              )}
            </div>
          ))}
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)}>
        <AnimatePresence mode="wait">
          {/* ÉTAPE 0 — Type & Catégorie */}
          {step === 0 && (
            <motion.div key="step0" initial={{ opacity:0, x:20 }} animate={{ opacity:1, x:0 }} exit={{ opacity:0, x:-20 }} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-6">
              <div>
                <h2 className="text-lg font-bold text-gray-900 mb-4">Type d'annonce</h2>
                <div className="grid grid-cols-2 gap-3">
                  {[['location','Location','Mettez votre véhicule en location'],['vente','Vente','Vendez votre véhicule']].map(([val, label, desc]) => (
                    <button key={val} type="button" onClick={() => setValue('listing_type', val as 'location'|'vente')}
                      className={`p-4 rounded-xl border-2 text-left transition-all ${listingType === val ? 'border-blue-600 bg-blue-50' : 'border-gray-200 hover:border-gray-300'}`}>
                      <p className="font-semibold text-gray-900">{label}</p>
                      <p className="text-xs text-gray-500 mt-0.5">{desc}</p>
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <h2 className="text-lg font-bold text-gray-900 mb-4">Catégorie du véhicule</h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {[['voiture','🚗','Voiture'],['moto','🏍️','Moto'],['scooter','🛵','Scooter'],['utilitaire','🚐','Utilitaire'],['camping_car','🚌','Camping-car'],['camion','🚛','Camion']].map(([val, emoji, label]) => (
                    <button key={val} type="button" onClick={() => setValue('category', val as FormData['category'])}
                      className={`flex items-center gap-2 p-3 rounded-xl border-2 transition-all ${watch('category') === val ? 'border-blue-600 bg-blue-50' : 'border-gray-200 hover:border-gray-300'}`}>
                      <span className="text-xl">{emoji}</span>
                      <span className="text-sm font-medium">{label}</span>
                    </button>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {/* ÉTAPE 1 — Informations */}
          {step === 1 && (
            <motion.div key="step1" initial={{ opacity:0, x:20 }} animate={{ opacity:1, x:0 }} exit={{ opacity:0, x:-20 }} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-4">
              <h2 className="text-lg font-bold text-gray-900">Informations du véhicule</h2>
              <div className="grid grid-cols-2 gap-4">
                <div><label className={LABEL_CLASS}>Marque *</label><input {...register('brand')} placeholder="BMW, Renault…" className={INPUT_CLASS} />{errors.brand && <p className="text-red-500 text-xs mt-1">{errors.brand.message}</p>}</div>
                <div><label className={LABEL_CLASS}>Modèle *</label><input {...register('model')} placeholder="Série 5, Clio…" className={INPUT_CLASS} />{errors.model && <p className="text-red-500 text-xs mt-1">{errors.model.message}</p>}</div>
                <div><label className={LABEL_CLASS}>Version / finition</label><input {...register('version')} placeholder="M-Sport, GT Line…" className={INPUT_CLASS} /></div>
                <div><label className={LABEL_CLASS}>Année *</label><input type="number" {...register('year', { valueAsNumber:true })} placeholder="2020" className={INPUT_CLASS} /></div>
                <div><label className={LABEL_CLASS}>Carburant *</label><select {...register('fuel')} className={INPUT_CLASS}><option value="essence">Essence</option><option value="diesel">Diesel</option><option value="electrique">Électrique</option><option value="hybride">Hybride</option><option value="hybride_rechargeable">Hybride rechargeable</option><option value="gpl">GPL</option></select></div>
                <div><label className={LABEL_CLASS}>Boîte *</label><select {...register('transmission')} className={INPUT_CLASS}><option value="automatique">Automatique</option><option value="manuelle">Manuelle</option></select></div>
                <div><label className={LABEL_CLASS}>Kilométrage *</label><input type="number" {...register('mileage', { valueAsNumber:true })} placeholder="50000" className={INPUT_CLASS} />{errors.mileage && <p className="text-red-500 text-xs mt-1">{errors.mileage.message}</p>}</div>
                <div><label className={LABEL_CLASS}>Nb. de places *</label><input type="number" {...register('seats', { valueAsNumber:true })} min={1} max={20} className={INPUT_CLASS} /></div>
                <div><label className={LABEL_CLASS}>Nb. de portes</label><input type="number" {...register('doors', { valueAsNumber:true })} min={2} max={6} className={INPUT_CLASS} /></div>
                <div><label className={LABEL_CLASS}>Couleur</label><input {...register('color')} placeholder="Blanc, Noir, Gris…" className={INPUT_CLASS} /></div>
                <div><label className={LABEL_CLASS}>Puissance (ch)</label><input type="number" {...register('power_din', { valueAsNumber:true })} placeholder="150" className={INPUT_CLASS} /></div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className={LABEL_CLASS}>Ville *</label><input {...register('city')} placeholder="Paris, Lyon…" className={INPUT_CLASS} />{errors.city && <p className="text-red-500 text-xs mt-1">{errors.city.message}</p>}</div>
                <div><label className={LABEL_CLASS}>Code postal *</label><input {...register('postal_code')} placeholder="75001" maxLength={5} className={INPUT_CLASS} />{errors.postal_code && <p className="text-red-500 text-xs mt-1">{errors.postal_code.message}</p>}</div>
              </div>
              <div><label className={LABEL_CLASS}>Description</label><textarea {...register('description')} rows={4} placeholder="Décrivez votre véhicule : état, entretien, historique, particularités…" className={`${INPUT_CLASS} resize-none`} /></div>
              <div><label className={LABEL_CLASS}>Options / Équipements <span className="text-gray-400 font-normal">(séparés par une virgule)</span></label><input {...register('options')} placeholder="GPS, Toit panoramique, Sièges chauffants, CarPlay…" className={INPUT_CLASS} /></div>
            </motion.div>
          )}

          {/* ÉTAPE 2 — Prix */}
          {step === 2 && (
            <motion.div key="step2" initial={{ opacity:0, x:20 }} animate={{ opacity:1, x:0 }} exit={{ opacity:0, x:-20 }} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-5">
              <h2 className="text-lg font-bold text-gray-900">Prix {listingType === 'location' ? '& conditions' : 'de vente'}</h2>
              {listingType === 'location' ? (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <div><label className={LABEL_CLASS}>Prix par jour * (€)</label><input type="number" {...register('price_per_day', { valueAsNumber:true })} placeholder="79" min={10} className={INPUT_CLASS} />{errors.price_per_day && <p className="text-red-500 text-xs mt-1">{errors.price_per_day.message}</p>}</div>
                    <div><label className={LABEL_CLASS}>Caution (€)</label><input type="number" {...register('deposit_amount', { valueAsNumber:true })} placeholder="500" className={INPUT_CLASS} /></div>
                    <div><label className={LABEL_CLASS}>Km inclus / jour</label><input type="number" {...register('included_km_per_day', { valueAsNumber:true })} placeholder="200" className={INPUT_CLASS} /></div>
                    <div><label className={LABEL_CLASS}>Prix km suppl. (€/km)</label><input type="number" step="0.01" placeholder="0.35" defaultValue={0.35} className={INPUT_CLASS} /></div>
                    <div><label className={LABEL_CLASS}>Durée min. (jours)</label><input type="number" {...register('min_rental_days', { valueAsNumber:true })} placeholder="1" className={INPUT_CLASS} /></div>
                    <div><label className={LABEL_CLASS}>Durée max. (jours)</label><input type="number" {...register('max_rental_days', { valueAsNumber:true })} placeholder="30" className={INPUT_CLASS} /></div>
                  </div>
                  <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl flex items-start gap-3">
                    <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-blue-800">Une commission de <strong>15%</strong> sera prélevée sur chaque location. Elle couvre l'assurance, la caution Stripe, le support et la sécurité de la plateforme.</p>
                  </div>
                </>
              ) : (
                <>
                  <div><label className={LABEL_CLASS}>Prix de vente (€) *</label><input type="number" {...register('sale_price', { valueAsNumber:true })} placeholder="12000" min={500} className={INPUT_CLASS} />{errors.sale_price && <p className="text-red-500 text-xs mt-1">{errors.sale_price.message}</p>}</div>
                  <div className="flex gap-6">
                    <label className="flex items-center gap-2 cursor-pointer"><input type="checkbox" {...register('negotiable')} className="w-4 h-4 text-blue-600 rounded" /><span className="text-sm text-gray-700">Prix négociable</span></label>
                    <label className="flex items-center gap-2 cursor-pointer"><input type="checkbox" {...register('first_hand')} className="w-4 h-4 text-blue-600 rounded" /><span className="text-sm text-gray-700">Première main</span></label>
                  </div>
                  <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl flex items-start gap-3">
                    <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-blue-800">Commission de <strong>3%</strong> (plafonnée à 500 €) sur le prix de vente. Transparente et prélevée uniquement après conclusion de la vente.</p>
                  </div>
                </>
              )}
            </motion.div>
          )}

          {/* ÉTAPE 3 — Photos */}
          {step === 3 && (
            <motion.div key="step3" initial={{ opacity:0, x:20 }} animate={{ opacity:1, x:0 }} exit={{ opacity:0, x:-20 }} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-5">
              <div>
                <h2 className="text-lg font-bold text-gray-900">Photos du véhicule</h2>
                <p className="text-sm text-gray-500 mt-1">Minimum 1 photo requise. Max 20. JPG/PNG uniquement. Chaque photo est analysée automatiquement (qualité, netteté, luminosité).</p>
              </div>
              <input ref={fileRef} type="file" multiple accept="image/jpeg,image/png" className="hidden"
                onChange={e => e.target.files && addPhotos(e.target.files)} />
              <button type="button" onClick={() => fileRef.current?.click()}
                className="w-full border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:border-blue-400 hover:bg-blue-50 transition-all group">
                <Upload className="w-10 h-10 text-gray-300 group-hover:text-blue-500 mx-auto mb-3 transition-colors" />
                <p className="text-gray-600 font-medium">Cliquez pour ajouter des photos</p>
                <p className="text-xs text-gray-400 mt-1">JPG, PNG · Max 10 Mo par photo</p>
              </button>
              {photoUrls.length > 0 && (
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                  {photoUrls.map((url, i) => (
                    <div key={i} className="relative aspect-video rounded-xl overflow-hidden group border border-gray-200">
                      <img src={url} alt="" className="w-full h-full object-cover" />
                      {i === 0 && <div className="absolute top-1.5 left-1.5 bg-blue-600 text-white text-xs px-2 py-0.5 rounded-full font-medium">Principale</div>}
                      <button type="button" onClick={() => removePhoto(i)}
                        className="absolute top-1.5 right-1.5 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
              {photos.length === 0 && (
                <div className="flex items-center gap-2 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <AlertCircle className="w-4 h-4 text-yellow-600" />
                  <p className="text-sm text-yellow-800">Au moins 1 photo est requise pour soumettre l'annonce.</p>
                </div>
              )}
            </motion.div>
          )}

          {/* ÉTAPE 4 — Confirmation */}
          {step === 4 && (
            <motion.div key="step4" initial={{ opacity:0, x:20 }} animate={{ opacity:1, x:0 }} exit={{ opacity:0, x:-20 }} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <h2 className="text-lg font-bold text-gray-900 mb-5">Récapitulatif avant soumission</h2>
              <div className="space-y-3 mb-6">
                {[
                  ['Type', watch('listing_type') === 'location' ? 'Location' : 'Vente'],
                  ['Véhicule', `${watch('brand')} ${watch('model')} ${watch('version') || ''} (${watch('year')})`],
                  ['Carburant / Boîte', `${watch('fuel')} · ${watch('transmission')}`],
                  ['Kilométrage', `${watch('mileage')?.toLocaleString('fr-FR')} km`],
                  ['Ville', `${watch('city')} (${watch('postal_code')})`],
                  watch('listing_type') === 'location' ? ['Prix location', `${watch('price_per_day')} €/jour · Caution ${watch('deposit_amount')} €`] : ['Prix vente', `${watch('sale_price')?.toLocaleString('fr-FR')} €`],
                  ['Photos', `${photos.length} photo(s)`],
                ].map(([label, value]) => (
                  <div key={label} className="flex justify-between items-center py-2 border-b border-gray-50 last:border-0">
                    <span className="text-sm text-gray-500">{label}</span>
                    <span className="text-sm font-medium text-gray-900">{value}</span>
                  </div>
                ))}
              </div>
              <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-xl mb-5">
                <p className="text-sm text-yellow-800">
                  <strong>Prochaines étapes :</strong> Après soumission, notre équipe vérifiera vos documents KYC et votre annonce sous 24-48h. Vous serez notifié par email.
                </p>
              </div>
              <button type="submit" disabled={submitting} className="btn-primary w-full justify-center text-base">
                {submitting ? <><Loader2 className="w-5 h-5 animate-spin" /> Soumission en cours…</> : <><Car className="w-5 h-5" /> Soumettre l'annonce</>}
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Boutons navigation */}
        <div className="flex justify-between mt-5">
          {step > 0 ? (
            <button type="button" onClick={() => setStep(s => s-1)} className="btn-secondary flex items-center gap-2">
              <ChevronLeft className="w-4 h-4" /> Retour
            </button>
          ) : <div />}
          {step < 4 && (
            <button type="button" onClick={nextStep} className="btn-primary flex items-center gap-2">
              Continuer <ChevronRight className="w-4 h-4" />
            </button>
          )}
        </div>
      </form>
    </div>
  )
}
