import type { Metadata } from 'next'
import { legal } from '../../../lib/legal'

export const metadata: Metadata = { title: 'CGU | TurboRent' }

export default function CguPage() {
  const { title, sections } = legal.cgu
  return (
    <div className="min-h-screen bg-gray-50 pt-24 pb-16">
      <div className="max-w-3xl mx-auto px-4 sm:px-6">
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="bg-gray-900 text-white px-8 py-10">
            <h1 className="text-3xl font-bold">{title}</h1>
            <p className="text-gray-400 mt-2 text-sm">Dernière mise à jour : {new Date().toLocaleDateString('fr-FR')}</p>
          </div>
          <div className="px-8 py-8 space-y-8">
            {sections.map((section, i) => (
              <div key={i}>
                <h2 className="text-lg font-bold text-gray-900 mb-3">{section.title}</h2>
                <p className="text-gray-600 text-sm leading-relaxed whitespace-pre-line">{section.content}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
