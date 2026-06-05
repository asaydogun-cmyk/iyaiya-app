import { Phrase } from '@/lib/types'

interface PhraseCardProps {
  phrase: Phrase
  index: number
  onSave?: () => void
  isSaved?: boolean
}

export default function PhraseCard({ phrase, index, onSave, isSaved }: PhraseCardProps) {
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
          <p className="text-sm leading-relaxed mb-3" style={{ color: 'var(--color-sage-dark)' }}>
            ✓ {phrase.reason}
          </p>
          {onSave && (
            <div className="flex justify-end">
              <button
                onClick={onSave}
                disabled={isSaved}
                style={{
                  fontSize: 12,
                  fontFamily: 'inherit',
                  fontWeight: 600,
                  padding: '4px 10px',
                  borderRadius: 20,
                  border: `1.5px solid ${isSaved ? '#F4907A' : '#D1D5DB'}`,
                  backgroundColor: isSaved ? '#FFF0EB' : 'white',
                  color: isSaved ? '#F4907A' : '#9CA3AF',
                  cursor: isSaved ? 'default' : 'pointer',
                  transition: 'all 0.15s ease',
                }}
              >
                ✓ {isSaved ? '保存済み' : '保存する'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
