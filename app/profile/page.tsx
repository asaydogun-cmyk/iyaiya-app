'use client'

import { useEffect, useState, Suspense } from 'react'
import Image from 'next/image'
import { useRouter, useSearchParams } from 'next/navigation'
import { getUserKey } from '@/lib/supabase'
import { temperamentCategories } from '@/lib/data'
import ChipSelector from '@/components/ChipSelector'
import type { Child } from '@/lib/types'

const temperamentIllustrations: Record<string, { emoji: string; imgSrc: string }> = {
  activity:          { emoji: '⚡', imgSrc: '/illustrations/temperament/21.png' },
  rhythm:            { emoji: '🔄', imgSrc: '/illustrations/temperament/22.png' },
  novelty:           { emoji: '🚪', imgSrc: '/illustrations/temperament/23.png' },
  adaptation:        { emoji: '🔁', imgSrc: '/illustrations/temperament/24.png' },
  emotion_intensity: { emoji: '🎚', imgSrc: '/illustrations/temperament/25.png' },
  sensory:           { emoji: '😰', imgSrc: '/illustrations/temperament/26.png' },
  mood:              { emoji: '😄', imgSrc: '/illustrations/temperament/27.png' },
  persistence:       { emoji: '🎯', imgSrc: '/illustrations/temperament/28.png' },
  interaction:       { emoji: '💬', imgSrc: '/illustrations/temperament/29.png' },
}

function ProfileForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const editId = searchParams.get('id')
  const isEdit = !!editId

  const [name, setName] = useState('')
  const [age, setAge] = useState('2')
  const [gender, setGender] = useState<'boy' | 'girl' | ''>('')
  const [traits, setTraits] = useState<string[]>([])
  const [effectivePhrases, setEffectivePhrases] = useState('')
  const [ineffectivePhrases, setIneffectivePhrases] = useState('')
  const [notes, setNotes] = useState('')
  const [saving, setSaving] = useState(false)
  const [loading, setLoading] = useState(isEdit)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!editId) return
    fetch(`/api/children/${editId}`)
      .then(res => res.ok ? res.json() : Promise.reject(`HTTP ${res.status}`))
      .then((c: Child) => {
        setName(c.name)
        setAge(String(c.age))
        setGender(c.gender || '')
        setTraits(c.temperament_traits || [])
        setEffectivePhrases(c.effective_phrases || '')
        setIneffectivePhrases(c.ineffective_phrases || '')
        setNotes(c.notes || '')
      })
      .catch(() => setError('プロフィールの読み込みに失敗しました'))
      .finally(() => setLoading(false))
  }, [editId])

  async function handleSave() {
    if (!name.trim()) {
      setError('名前を入力してください')
      return
    }
    if (!gender) {
      setError('性別を選択してください')
      return
    }
    setSaving(true)
    setError('')
    try {
      const userKey = getUserKey()
      const payload = {
        name: name.trim(),
        age: parseInt(age),
        gender,
        temperament_traits: traits,
        effective_phrases: effectivePhrases,
        ineffective_phrases: ineffectivePhrases,
        notes,
        user_key: userKey,
      }

      if (isEdit) {
        const res = await fetch(`/api/children/${editId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        })
        if (!res.ok) {
          const body = await res.json().catch(() => ({}))
          throw new Error(body.error ?? `HTTP ${res.status}`)
        }
      } else {
        const res = await fetch('/api/children', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        })
        if (!res.ok) {
          const body = await res.json().catch(() => ({}))
          throw new Error(body.error ?? `HTTP ${res.status}`)
        }
      }
      router.push('/')
    } catch (e) {
      const err = e as { code?: string; message?: string; hint?: string; details?: string }
      console.error('Supabase error:', JSON.stringify(err))
      const detail = err?.message ? `（${err.message}）` : ''
      setError(`保存に失敗しました${detail}`)
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-32">
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
        className="flex items-center gap-3 px-4 pt-10 pb-5"
        style={{ background: 'linear-gradient(135deg, #ff7c7c 0%, #ff9a9a 100%)' }}
      >
        <button
          onClick={() => router.back()}
          className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center text-white"
        >
          ←
        </button>
        <h1 className="text-white font-black text-xl">
          {isEdit ? 'プロフィールを編集' : '子どもを登録'}
        </h1>
      </div>

      <div className="flex-1 px-4 py-5 space-y-5 pb-28">
        {error && (
          <div className="p-3 rounded-xl text-sm" style={{ backgroundColor: '#fee2e2', color: '#b91c1c' }}>
            {error}
          </div>
        )}

        {/* 基本情報 */}
        <section className="card space-y-4">
          <h2 className="font-black text-gray-900 text-base">基本情報</h2>
          <div>
            <label className="section-label">お子さんの名前 *</label>
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="例：たろう"
              className="input-field"
            />
          </div>
          <div>
            <label className="section-label">年齢 *</label>
            <select
              value={age}
              onChange={e => setAge(e.target.value)}
              className="select-field"
            >
              {[1, 2, 3, 4, 5, 6].map(n => (
                <option key={n} value={String(n)}>{n}歳</option>
              ))}
            </select>
          </div>
          <div>
            <label className="section-label">性別 *</label>
            <div className="flex gap-3">
              {([
                { value: 'boy', label: 'おとこのこ', src: '/illustrations/boy-icon.png' },
                { value: 'girl', label: 'おんなのこ', src: '/illustrations/girl-icon.png' },
              ] as const).map(({ value, label, src }) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setGender(value)}
                  className="flex-1 flex flex-col items-center gap-2 py-3 rounded-xl border-2 transition-colors"
                  style={{
                    borderColor: gender === value ? '#F4907A' : '#E5E7EB',
                    backgroundColor: gender === value ? '#FFF5F3' : '#FFFFFF',
                  }}
                >
                  <Image src={src} alt={label} width={80} height={80} style={{ objectFit: 'contain' }} />
                  <span className="text-sm font-medium" style={{ color: gender === value ? '#F4907A' : '#6B7280' }}>
                    {label}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* 気質タイプ */}
        <section className="space-y-3">
          <div className="px-1">
            <h2 className="font-black text-base mb-1" style={{ color: '#5C4033' }}>気質タイプ</h2>
            <p className="text-xs" style={{ color: '#A0887A' }}>当てはまるものを複数選択できます</p>
          </div>
          {temperamentCategories.map(cat => {
            const illus = temperamentIllustrations[cat.id]
            return (
              <div
                key={cat.id}
                style={{
                  backgroundColor: '#FFFFFF',
                  borderRadius: 16,
                  border: '1px solid #F0DDD0',
                  padding: '20px 16px',
                }}
              >
                {illus && (
                  <div className="flex justify-center mb-3">
                    <Image
                      src={illus.imgSrc}
                      alt=""
                      width={180}
                      height={180}
                      style={{ objectFit: 'contain' }}
                    />
                  </div>
                )}
                <p
                  className="text-center font-black text-base mb-4"
                  style={{ color: '#5C4033' }}
                >
                  {cat.label}
                </p>
                <ChipSelector
                  options={cat.options}
                  selected={traits}
                  onChange={v => setTraits(v as string[])}
                  multiple
                />
              </div>
            )
          })}
        </section>

        {/* 効いた声かけ */}
        <section className="card space-y-4">
          <h2 className="font-black text-gray-900 text-base">声かけメモ</h2>
          <div>
            <label className="section-label">効いた声かけ</label>
            <textarea
              value={effectivePhrases}
              onChange={e => setEffectivePhrases(e.target.value)}
              placeholder="例：選択肢を2つ出すと動ける、「あと3回ね」と数えると納得する"
              className="textarea-field"
              rows={3}
            />
          </div>
          <div>
            <label className="section-label">効かない声かけ</label>
            <textarea
              value={ineffectivePhrases}
              onChange={e => setIneffectivePhrases(e.target.value)}
              placeholder="例：「早くして！」は逆効果、比べると怒る"
              className="textarea-field"
              rows={3}
            />
          </div>
          <div>
            <label className="section-label">補足・うちの子らしいエピソード</label>
            <p className="text-xs text-gray-400 mb-2">
              「正義感が強い」より「保育園でお友達に先生みたいなことしてる」のように場面で書くと精度が上がります
            </p>
            <textarea
              value={notes}
              onChange={e => setNotes(e.target.value)}
              placeholder="例：お兄ちゃんのことが大好きで何でも真似したがる、怖い話は大丈夫だけどお化けが苦手"
              className="textarea-field"
              rows={4}
            />
          </div>
        </section>
      </div>

      {/* Sticky Save Button */}
      <div
        className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[480px] px-4 pb-6 pt-3"
        style={{ background: 'linear-gradient(to top, white 70%, transparent)' }}
      >
        <button
          onClick={handleSave}
          disabled={saving}
          className="btn-primary"
        >
          {saving ? '保存中...' : isEdit ? '変更を保存' : '登録する'}
        </button>
      </div>
    </div>
  )
}

export default function ProfilePage() {
  return (
    <Suspense>
      <ProfileForm />
    </Suspense>
  )
}
