'use client'
import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Cookie, X, ChevronDown } from 'lucide-react'
import Cookies from 'js-cookie'
import api from '../../lib/api'

export default function CookieBanner() {
  const [show, setShow] = useState(false)
  const [expanded, setExpanded] = useState(false)
  const [prefs, setPrefs] = useState({ analytics: false, marketing: false })

  useEffect(() => {
    const consent = Cookies.get('cookie_consent')
    if (!consent) setTimeout(() => setShow(true), 1500)
  }, [])

  const saveConsent = async (analytics: boolean, marketing: boolean) => {
    Cookies.set('cookie_consent', JSON.stringify({ analytics, marketing }), { expires: 365, sameSite: 'strict' })
    setShow(false)
    try {
      await api.post('/settings/cookie-consent', { analytics_accepted: analytics, marketing_accepted: marketing })
    } catch { /* ignore */ }
  }

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 200, damping: 25 }}
          className="fixed bottom-0 left-0 right-0 z-[9999] p-4 md:p-6"
        >
          <div className="max-w-4xl mx-auto bg-gray-900 text-white rounded-2xl shadow-2xl p-5 md:p-6">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                <Cookie className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-white mb-1">Nous utilisons des cookies</h3>
                <p className="text-sm text-gray-300 leading-relaxed">
                  TurboRent utilise des cookies essentiels pour le fonctionnement du site (session, sécurité) et peut utiliser des cookies analytics pour améliorer votre expérience. Aucune donnée n'est vendue à des tiers.{' '}
                  <a href="/legal/confidentialite" className="text-blue-400 hover:underline">Politique de confidentialité</a>
                </p>

                {/* Options étendues */}
                <AnimatePresence>
                  {expanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden mt-4 space-y-3"
                    >
                      <label className="flex items-center justify-between p-3 bg-gray-800 rounded-lg">
                        <div>
                          <p className="text-sm font-medium">Cookies essentiels</p>
                          <p className="text-xs text-gray-400">Requis pour le fonctionnement du site</p>
                        </div>
                        <div className="w-10 h-5 bg-blue-600 rounded-full relative cursor-not-allowed">
                          <div className="absolute right-1 top-0.5 w-4 h-4 bg-white rounded-full" />
                        </div>
                      </label>
                      <label className="flex items-center justify-between p-3 bg-gray-800 rounded-lg cursor-pointer">
                        <div>
                          <p className="text-sm font-medium">Cookies analytiques</p>
                          <p className="text-xs text-gray-400">Google Analytics — améliore nos services</p>
                        </div>
                        <button
                          onClick={() => setPrefs(p => ({ ...p, analytics: !p.analytics }))}
                          className={`w-10 h-5 rounded-full relative transition-colors ${prefs.analytics ? 'bg-blue-600' : 'bg-gray-600'}`}
                        >
                          <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full transition-transform ${prefs.analytics ? 'right-1' : 'left-1'}`} />
                        </button>
                      </label>
                      <label className="flex items-center justify-between p-3 bg-gray-800 rounded-lg cursor-pointer">
                        <div>
                          <p className="text-sm font-medium">Cookies marketing</p>
                          <p className="text-xs text-gray-400">Publicités personnalisées</p>
                        </div>
                        <button
                          onClick={() => setPrefs(p => ({ ...p, marketing: !p.marketing }))}
                          className={`w-10 h-5 rounded-full relative transition-colors ${prefs.marketing ? 'bg-blue-600' : 'bg-gray-600'}`}
                        >
                          <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full transition-transform ${prefs.marketing ? 'right-1' : 'left-1'}`} />
                        </button>
                      </label>
                    </motion.div>
                  )}
                </AnimatePresence>

                <div className="flex flex-wrap items-center gap-3 mt-4">
                  <button
                    onClick={() => saveConsent(true, true)}
                    className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-lg transition-colors"
                  >
                    Tout accepter
                  </button>
                  <button
                    onClick={() => saveConsent(false, false)}
                    className="px-5 py-2.5 bg-gray-700 hover:bg-gray-600 text-white text-sm font-medium rounded-lg transition-colors"
                  >
                    Tout refuser
                  </button>
                  {expanded ? (
                    <button
                      onClick={() => saveConsent(prefs.analytics, prefs.marketing)}
                      className="px-5 py-2.5 bg-gray-600 hover:bg-gray-500 text-white text-sm font-medium rounded-lg transition-colors"
                    >
                      Sauvegarder mes choix
                    </button>
                  ) : (
                    <button
                      onClick={() => setExpanded(true)}
                      className="flex items-center gap-1 px-4 py-2.5 text-gray-400 hover:text-white text-sm transition-colors"
                    >
                      Personnaliser <ChevronDown className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
              <button onClick={() => setShow(false)} className="flex-shrink-0 p-1 text-gray-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
