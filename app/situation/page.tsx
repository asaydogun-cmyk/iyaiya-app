'use client'

import { useEffect, useState, Suspense } from 'react'
import Image from 'next/image'
import { useRouter, useSearchParams } from 'next/navigation'
import { situationOptions } from '@/lib/data'
import ChipSelector from '@/components/ChipSelector'
import type { Child, SituationInput, SuggestResult } from '@/lib/types'

function stripLeadingEmoji(text: string) {
  return text.replace(/^[🔴🟠🟡🟢]\s+/, '')
}

function SituationForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const childId = searchParams.get('childId')

  const [child, setChild] = useState<Child | null>(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  const [illustrationSrc] = useState(() => {
    const files = [12, 14, 15, 16, 17]
    const n = files[Math.floor(Math.random() * files.length)]
    return `/illustrations/situation/${n}.png`
  })
  const [parentState, setParentState] = useState('')
  const [currentState, setCurrentState] = useState('')
  const [previousActivity, setPreviousActivity] = useState('')
  const [trigger, setTrigger] = useState('')
  const [duration, setDuration] = useState('')
  const [intensity, setIntensity] = useState('')
  const [additionalNotes, setAdditionalNotes] = useState('')

  useEffect(() => {
    if (!childId) {
      router.push('/')
      return
    }
    fetch(`/api/children/${childId}`)
      .then(res => res.ok ? res.json() : Promise.reject())
      .then((data: Child) => setChild(data))
      .catch(() => router.push('/'))
      .finally(() => setLoading(false))
  }, [childId, router])

  const canSubmit = parentState !== '' && currentState !== '' && previousActivity !== ''

  async function handleSubmit() {
    if (!canSubmit || !child) return
    setSubmitting(true)
    setError('')

    const situation: SituationInput = {
      current_state: currentState,
      previous_activity: previousActivity,
      parent_state: parentState,
      trigger: trigger || undefined,
      duration: duration || undefined,
      intensity: intensity || undefined,
      additional_notes: additionalNotes || undefined,
    }

    try {
      const res = await fetch('/api/suggest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ child, situation }),
      })
      if (!res.ok) throw new Error('API error')
      const result: SuggestResult = await res.json()

      sessionStorage.setItem('iyaiya_session', JSON.stringify({ child, situation, result }))
      router.push('/result')
    } catch (e) {
      console.error(e)
      setError('声かけの生成に失敗しました。APIキーの設定を確認してください。')
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-dvh">
        <div
          className="w-8 h-8 rounded-full border-3 animate-spin"
          style={{ borderColor: 'var(--color-peach-dark)', borderTopColor: 'var(--color-coral)' }}
        />
      </div>
    )
  }

  return (
    <div className="flex flex-col min-h-dvh">
      {/* Header */}
      <div
        className="px-4 pt-10 pb-5"
        style={{ background: 'linear-gradient(135deg, #ff7c7c 0%, #ff9a9a 100%)' }}
      >
        <div className="flex items-center gap-3 mb-3">
          <button
            onClick={() => router.push('/')}
            className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center text-white"
          >
            ←
          </button>
          <h1 className="text-white font-black text-xl">今のお子さんの状況を教えて</h1>
        </div>
        {child && (
          <p className="text-white/90 text-sm ml-12">
            {child.name}ちゃん（{child.age}歳）に合った声かけを提案します
          </p>
        )}
      </div>

      <div className="flex-1 px-4 py-4 space-y-4 pb-36">
        <div
          className="flex items-center gap-2 p-3 rounded-xl text-sm"
          style={{ backgroundColor: 'var(--color-peach)', color: '#6b7280' }}
        >
          <span>詳しく入れるほど精度が上がります</span>
        </div>

        {error && (
          <div className="p-3 rounded-xl text-sm" style={{ backgroundColor: '#fee2e2', color: '#b91c1c' }}>
            {error}
          </div>
        )}

        {/* 今のあなたの状態（必須） */}
        <section className="card space-y-4">
          <div className="flex items-center gap-2">
            <span
              className="text-xs font-bold text-white px-2 py-0.5 rounded-full"
              style={{ backgroundColor: 'var(--color-coral)' }}
            >
              必須
            </span>
            <h2 className="font-black text-sm" style={{ color: '#5C4033' }}>{situationOptions.parent_state.label}</h2>
          </div>

          <div className="flex justify-center">
            <Image
              src={illustrationSrc}
              alt=""
              width={200}
              height={200}
              style={{ objectFit: 'contain' }}
            />
          </div>

          <div className="flex flex-wrap gap-2">
            {situationOptions.parent_state.options.map(option => (
              <button
                key={option}
                type="button"
                onClick={() => setParentState(parentState === option ? '' : option)}
                className={`chip ${parentState === option ? 'chip-active' : 'chip-inactive'}`}
              >
                {stripLeadingEmoji(option)}
              </button>
            ))}
          </div>
        </section>

        {/* 必須項目 */}
        <section className="card space-y-4">
          <div className="flex items-center gap-2">
            <span
              className="text-xs font-bold text-white px-2 py-0.5 rounded-full"
              style={{ backgroundColor: 'var(--color-coral)' }}
            >
              必須
            </span>
            <h2 className="font-black text-gray-900 text-sm">今のお子さんの状況</h2>
          </div>

          <div>
            <p className="section-label">{situationOptions.current_state.label}</p>
            <ChipSelector
              options={situationOptions.current_state.options}
              selected={currentState}
              onChange={v => setCurrentState(v as string)}
            />
          </div>

          <div>
            <p className="section-label">{situationOptions.previous_activity.label}</p>
            <ChipSelector
              options={situationOptions.previous_activity.options}
              selected={previousActivity}
              onChange={v => setPreviousActivity(v as string)}
            />
          </div>
        </section>

        {/* 任意項目 */}
        <section className="card space-y-4">
          <div className="flex items-center gap-2">
            <span
              className="text-xs font-bold px-2 py-0.5 rounded-full"
              style={{ backgroundColor: 'var(--color-peach-dark)', color: '#6b7280' }}
            >
              任意
            </span>
            <h2 className="font-black text-gray-900 text-sm">もっと詳しく（任意）</h2>
          </div>

          <div>
            <p className="section-label">{situationOptions.trigger.label}</p>
            <ChipSelector
              options={situationOptions.trigger.options}
              selected={trigger}
              onChange={v => setTrigger(v as string)}
            />
          </div>

          <div>
            <p className="section-label">{situationOptions.duration.label}</p>
            <ChipSelector
              options={situationOptions.duration.options}
              selected={duration}
              onChange={v => setDuration(v as string)}
            />
          </div>

          <div>
            <p className="section-label">{situationOptions.intensity.label}</p>
            <ChipSelector
              options={situationOptions.intensity.options}
              selected={intensity}
              onChange={v => setIntensity(v as string)}
            />
          </div>

          <div>
            <p className="section-label">その他・今日だけの状況</p>
            <p className="text-xs text-gray-400 mb-2">例：昨日ほとんど眠れてない、今日保育園でトラブルがあった</p>
            <textarea
              value={additionalNotes}
              onChange={e => setAdditionalNotes(e.target.value)}
              className="textarea-field"
              rows={3}
              placeholder="今日特別なことがあれば入力してください"
            />
          </div>
        </section>
      </div>

      {/* Sticky Submit */}
      <div
        className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[480px] px-4 pb-6 pt-3"
        style={{ background: 'linear-gradient(to top, white 70%, transparent)' }}
      >
        <button
          onClick={handleSubmit}
          disabled={!canSubmit || submitting}
          className="btn-primary"
        >
          {submitting ? (
            <span className="flex items-center gap-2">
              <span className="w-4 h-4 border-2 border-white/50 border-t-white rounded-full animate-spin" />
              声かけを考えています...
            </span>
          ) : (
            '声かけを見る →'
          )}
        </button>
        {!canSubmit && (
          <p className="text-center text-xs text-gray-400 mt-2">
            必須項目をすべて選んでください
          </p>
        )}
      </div>
    </div>
  )
}

export default function SituationPage() {
  return (
    <Suspense>
      <SituationForm />
    </Suspense>
  )
}
