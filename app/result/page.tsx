'use client'

import { useEffect, useState, Suspense } from 'react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import PhraseCard from '@/components/PhraseCard'
import { getUserKey } from '@/lib/supabase'
import type { SessionData, SituationInput, SuggestResult } from '@/lib/types'

function buildSituationSummary(s: SituationInput): string {
  const parts = [s.previous_activity]
  if (s.trigger) parts.push(s.trigger)
  if (s.duration) parts.push(s.duration)
  return parts.filter(Boolean).join(' → ')
}

async function autoSaveRecord(sessionData: SessionData) {
  try {
    const res = await fetch('/api/records', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        child_id: sessionData.child.id,
        user_key: getUserKey(),
        situation: buildSituationSummary(sessionData.situation),
        parent_status: sessionData.situation.parent_state,
        result: sessionData.result,
      }),
    })
    if (res.ok) {
      const record = await res.json()
      const updated = { ...sessionData, record_id: record.id }
      sessionStorage.setItem('iyaiya_session', JSON.stringify(updated))
    }
  } catch (e) {
    console.error('Auto-save record failed:', e)
  }
}

function ResultContent() {
  const router = useRouter()
  const [session, setSession] = useState<SessionData | null>(null)
  const [regenerating, setRegenerating] = useState(false)
  const [error, setError] = useState('')
  const [savedPhrases, setSavedPhrases] = useState<Set<string>>(new Set())

  useEffect(() => {
    const raw = sessionStorage.getItem('iyaiya_session')
    if (!raw) {
      router.push('/')
      return
    }
    try {
      const parsed: SessionData = JSON.parse(raw)
      setSession(parsed)
      // 既存のeffective_phrasesを保存済み初期値として読み込む
      const existing = parsed.child.effective_phrases || ''
      const lines = existing.split('\n').map(s => s.trim()).filter(Boolean)
      if (lines.length > 0) setSavedPhrases(new Set(lines))
      // 初回のみきろくに自動保存（record_idがなければ未保存）
      if (!parsed.record_id) autoSaveRecord(parsed)
    } catch {
      router.push('/')
    }
  }, [router])

  async function handleRetry() {
    if (!session) return
    setRegenerating(true)
    setError('')
    try {
      const res = await fetch('/api/suggest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ child: session.child, situation: session.situation, isRetry: true }),
      })
      if (!res.ok) throw new Error('API error')
      const result: SuggestResult = await res.json()
      const newSession = { ...session, result }
      sessionStorage.setItem('iyaiya_session', JSON.stringify(newSession))
      setSession(newSession)
    } catch (e) {
      console.error(e)
      setError('再生成に失敗しました。もう一度試してください。')
    } finally {
      setRegenerating(false)
    }
  }

  async function handleSavePhrase(text: string) {
    if (!session || savedPhrases.has(text)) return
    setSavedPhrases(prev => new Set(prev).add(text))
    await fetch(`/api/children/${session.child.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phrase: text }),
    })
  }

  function handleRestart() {
    if (!session) return
    router.push(`/situation?childId=${session.child.id}`)
  }

  if (!session) {
    return (
      <div className="flex items-center justify-center min-h-dvh">
        <div
          className="w-8 h-8 rounded-full border-3 animate-spin"
          style={{ borderColor: 'var(--color-peach-dark)', borderTopColor: 'var(--color-coral)' }}
        />
      </div>
    )
  }

  const { child, result } = session

  return (
    <div className="flex flex-col min-h-dvh">
      {/* Header */}
      <div
        className="px-4 pt-10 pb-6"
        style={{ background: 'linear-gradient(135deg, #ff7c7c 0%, #ffb3b3 100%)' }}
      >
        <p className="text-white/80 text-xs font-medium mb-1 uppercase tracking-wider">
          声かけ提案
        </p>
        <h1 className="text-white font-black text-2xl leading-tight">
          {child.name}ちゃん専用の<br />声かけ
        </h1>
      </div>

      <div className="flex-1 px-4 py-5 space-y-4 pb-36">
        {/* Parent message */}
        {result.parent_message && (() => {
          const parts = result.parent_message.split('\n\n')
          const title = parts[0].replace('今日もがんばっているママパパへ', '今日もがんばっているあなたへ')
          const body = parts.slice(1).join('\n\n')
          return (
            <div
              style={{
                background: '#FFF7FA',
                border: '1.5px solid #F4C2D0',
                borderRadius: 16,
                padding: '16px 20px',
              }}
            >
              <div className="flex justify-center" style={{ marginBottom: 8 }}>
                <Image
                  src="/illustrations/message/31.png"
                  alt=""
                  width={180}
                  height={180}
                  style={{ objectFit: 'contain', background: 'transparent' }}
                />
              </div>
              <p className="text-sm mb-2 text-center" style={{ color: '#c2687a', fontWeight: 500 }}>
                {title}
              </p>
              <p
                className="text-gray-700 text-sm whitespace-pre-wrap"
                style={{ lineHeight: 1.8, wordBreak: 'keep-all', overflowWrap: 'break-word' }}
              >{body || title}</p>
            </div>
          )
        })()}

        {/* Advice */}
        <div
          style={{
            background: '#F0F8FF',
            border: '1.5px solid #B8D8F0',
            borderRadius: 16,
            padding: 16,
          }}
        >
          <div className="flex justify-center" style={{ marginBottom: 8, background: 'transparent' }}>
            <Image
              src="/illustrations/message/32.png"
              alt=""
              width={180}
              height={180}
              style={{ objectFit: 'contain', background: 'transparent', display: 'block' }}
            />
          </div>
          <p className="text-sm mb-2 text-center" style={{ color: '#4a7fa5', fontWeight: 500 }}>
            知っておくと楽になること
          </p>
          <p
            className="text-gray-700 text-sm whitespace-pre-wrap"
            style={{ lineHeight: 1.8, wordBreak: 'keep-all', overflowWrap: 'break-word' }}
          >{result.advice}</p>
        </div>

        {/* これだけでOK */}
        <div
          style={{
            background: '#FFFDE7',
            border: '1.5px solid #F9E4A0',
            borderRadius: 16,
            padding: 16,
          }}
        >
          <div className="flex justify-center" style={{ marginBottom: 8, background: 'transparent' }}>
            <Image
              src="/illustrations/result/33.png"
              alt=""
              width={180}
              height={180}
              style={{ objectFit: 'contain', background: 'transparent', display: 'block' }}
            />
          </div>
          <p className="text-sm mb-2 text-center" style={{ color: '#b8860b', fontWeight: 500 }}>
            これだけでOK
          </p>
          <p
            className="text-gray-700 text-sm whitespace-pre-wrap"
            style={{ lineHeight: 1.8, wordBreak: 'keep-all', overflowWrap: 'break-word' }}
          >{result.unexpected_advice}</p>
        </div>

        {/* Phrases */}
        <div>
          <p className="text-xs font-bold text-gray-500 mb-3 uppercase tracking-wider">
            試してみて
          </p>
          <div className="space-y-3">
            {result.phrases.map((phrase, i) => (
              <PhraseCard
                key={i}
                phrase={phrase}
                index={i}
                onSave={() => handleSavePhrase(phrase.text)}
                isSaved={savedPhrases.has(phrase.text)}
              />
            ))}
          </div>
        </div>

        {/* Reward */}
        {result.reward && (
          <div
            style={{
              background: '#F3F0FF',
              border: '1.5px solid #D4C8F4',
              borderRadius: 16,
              padding: 16,
            }}
          >
            <div className="flex justify-center" style={{ marginBottom: 8, background: 'transparent' }}>
              <Image
                src="/illustrations/result/35.png"
                alt=""
                width={180}
                height={180}
                style={{ objectFit: 'contain', background: 'transparent', display: 'block' }}
              />
            </div>
            <p className="text-sm mb-2 text-center" style={{ color: '#7c3aed', fontWeight: 500 }}>
              今日の自分へのご褒美
            </p>
            <p
              className="text-gray-700 text-sm whitespace-pre-wrap"
              style={{ lineHeight: 1.8, wordBreak: 'keep-all', overflowWrap: 'break-word' }}
            >{result.reward}</p>
          </div>
        )}

        {error && (
          <div className="p-3 rounded-xl text-sm" style={{ backgroundColor: '#fee2e2', color: '#b91c1c' }}>
            {error}
          </div>
        )}
      </div>

      {/* Sticky Actions */}
      <div
        className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[480px] px-4 pb-6 pt-3 space-y-2"
        style={{ background: 'linear-gradient(to top, white 70%, transparent)' }}
      >
        <button
          onClick={handleRetry}
          disabled={regenerating}
          className="btn-sage"
        >
          {regenerating ? (
            <span className="flex items-center gap-2">
              <span className="w-4 h-4 border-2 border-white/50 border-t-white rounded-full animate-spin" />
              別の手を考えています...
            </span>
          ) : (
            '全部ダメだった → 次の手は？'
          )}
        </button>
        <button onClick={handleRestart} className="btn-secondary">
          最初から
        </button>
      </div>
    </div>
  )
}

export default function ResultPage() {
  return (
    <Suspense>
      <ResultContent />
    </Suspense>
  )
}
