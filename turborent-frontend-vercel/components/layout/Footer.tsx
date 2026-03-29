import Link from 'next/link'
import { Car, Shield, Mail } from 'lucide-react'

const links = {
  'Location': [
    { label: 'Rechercher un véhicule', href: '/location' },
    { label: 'Voitures', href: '/location?category=voiture' },
    { label: 'Motos', href: '/location?category=moto' },
    { label: 'Utilitaires', href: '/location?category=utilitaire' }
  ],
  'Vente': [
    { label: 'Annonces récentes', href: '/vente' },
    { label: 'Publier une annonce', href: '/tableau-de-bord/vehicules/ajouter' },
    { label: 'Comment vendre', href: '/blog/comment-vendre' }
  ],
  'Informations': [
    { label: 'Comment ça marche', href: '/comment-ca-marche' },
    { label: 'Blog & Conseils', href: '/blog' },
    { label: 'Contact', href: '/contact' }
  ],
  'Légal': [
    { label: 'CGU', href: '/legal/cgu' },
    { label: 'Conditions de location', href: '/legal/conditions-location' },
    { label: 'Confidentialité', href: '/legal/confidentialite' },
    { label: 'Mentions légales', href: '/legal/mentions-legales' }
  ]
}

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-white mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <Link href="/" className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <Car className="w-5 h-5 text-white" />
              </div>
              <span className="font-bold text-lg">Turbo<span className="text-blue-400">Rent</span></span>
            </Link>
            <p className="text-gray-400 text-sm leading-relaxed mb-4">
              Plateforme sécurisée de location et vente de véhicules entre particuliers et professionnels.
            </p>
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <Shield className="w-3.5 h-3.5 text-green-500" />
              KYC vérifié · Caution Stripe · RGPD
            </div>
          </div>

          {/* Liens */}
          {Object.entries(links).map(([cat, items]) => (
            <div key={cat}>
              <h4 className="font-semibold text-white text-sm mb-4">{cat}</h4>
              <ul className="space-y-2.5">
                {items.map(item => (
                  <li key={item.href}>
                    <Link href={item.href} className="text-gray-400 hover:text-white text-sm transition-colors">
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="border-t border-gray-800 mt-12 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-gray-500 text-sm">© {new Date().getFullYear()} TurboRent. Tous droits réservés.</p>
          <a href="mailto:turborent@outlook.fr" className="flex items-center gap-2 text-gray-400 hover:text-white text-sm transition-colors">
            <Mail className="w-4 h-4" /> turborent@outlook.fr
          </a>
        </div>
      </div>
    </footer>
  )
}
