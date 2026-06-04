import { Phrase } from '@/lib/types'

interface PhraseCardProps {
  phrase: Phrase
  index: number
}

export default function PhraseCard({ phrase, index }: PhraseCardProps) {
  return (
    <div className="card">
      <div className="flex items-start gap-3">
        <div
          className="flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-white font-bold text-sm"
          style={{ backgroundColor: 'var(--color-coral)' }}
        >
          {index + 1}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-gray-800 font-medium text-base leading-relaxed mb-2">
            「{phrase.text}」
          </p>
          <p className="text-sm leading-relaxed" style={{ color: 'var(--color-sage-dark)' }}>
            ✓ {phrase.reason}
          </p>
        </div>
      </div>
    </div>
  )
}
