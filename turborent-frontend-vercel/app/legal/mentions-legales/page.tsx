import type { Metadata } from 'next'
import { legal } from '../../../lib/legal'

export const metadata: Metadata = { title: 'Mentions légales | TurboRent' }

export default function MentionsLegalesPage() {
  return (
    <div className="min-h-screen bg-gray-50 pt-24 pb-16">
      <div className="max-w-3xl mx-auto px-4 sm:px-6">
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="bg-gray-800 text-white px-8 py-10">
            <h1 className="text-3xl font-bold">{legal.mentions.title}</h1>
          </div>
          <div className="px-8 py-8">
            <p className="text-gray-600 text-sm leading-loose whitespace-pre-line">{legal.mentions.content}</p>
          </div>
        </div>
      </div>
    </div>
  )
}
