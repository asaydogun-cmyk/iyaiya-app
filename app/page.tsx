'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { getUserKey } from '@/lib/supabase'
import type { Child } from '@/lib/types'
import BottomNav from '@/components/BottomNav'

export default function HomePage() {
  const router = useRouter()
  const [children, setChildren] = useState<Child[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    loadChildren()
  }, [])

  async function loadChildren() {
    try {
      const userKey = getUserKey()
      const res = await fetch(`/api/children?userKey=${encodeURIComponent(userKey)}`)
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const data: Child[] = await res.json()
      setChildren(data)
    } catch (e) {
      console.error(e)
      setError('データの読み込みに失敗しました。')
    } finally {
      setLoading(false)
    }
  }

  async function deleteChild(id: string) {
    if (!confirm('このプロフィールを削除しますか？')) return
    const res = await fetch(`/api/children/${id}`, { method: 'DELETE' })
    if (res.ok) setChildren(prev => prev.filter(c => c.id !== id))
  }

  return (
    <div className="flex flex-col min-h-dvh">
      {/* Header */}
      <div className="w-full">
        <Image src="/header.png" alt="うちの子トリセツ" width={480} height={240} className="w-full h-auto" style={{ display: 'block' }} />
      </div>

      <div className="flex-1 px-4 py-5 pb-24">
        {error && (
          <div className="mb-4 p-4 rounded-xl text-sm" style={{ backgroundColor: '#fee2e2', color: '#b91c1c' }}>
            {error}
          </div>
        )}

        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div
              className="w-8 h-8 rounded-full border-3 animate-spin"
              style={{ borderColor: 'var(--color-peach-dark)', borderTopColor: 'var(--color-coral)' }}
            />
          </div>
        ) : children.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="flex justify-center gap-4 mb-4">
              <Image src="/illustrations/boy-icon.png" alt="おとこのこ" width={120} height={120} style={{ objectFit: 'contain' }} />
              <Image src="/illustrations/girl-icon.png" alt="おんなのこ" width={120} height={120} style={{ objectFit: 'contain' }} />
            </div>
            <p className="text-gray-700 font-medium mb-1">まだ登録されていません</p>
            <p className="text-gray-500 text-sm mb-6">お子さんのプロフィールを登録してください</p>
          </div>
        ) : (
          <div className="space-y-3 mb-4">
            <p className="text-gray-500 text-sm font-medium">お子さんを選んでください</p>
            {children.map(child => (
              <div key={child.id} className="card">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-12 h-12 rounded-full flex items-center justify-center overflow-hidden"
                      style={{ backgroundColor: 'var(--color-peach)' }}
                    >
                      <Image
                        src={child.gender === 'girl' ? '/illustrations/girl-icon.png' : '/illustrations/boy-icon.png'}
                        alt={child.gender === 'girl' ? 'おんなのこ' : 'おとこのこ'}
                        width={48}
                        height={48}
                        style={{ objectFit: 'cover' }}
                      />
                    </div>
                    <div>
                      <p className="font-bold text-gray-900">{child.name}</p>
                      <p className="text-sm text-gray-500">{child.age}歳</p>
                    </div>
                  </div>
                  <button
                    onClick={() => router.push(`/profile?id=${child.id}`)}
                    className="p-2 rounded-full flex flex-col items-center gap-0.5"
                    aria-label="編集"
                  >
                    <Image src="/illustrations/41.png" alt="編集" width={24} height={24} style={{ objectFit: 'contain' }} />
                    <span style={{ fontSize: 10, color: '#F4907A', fontWeight: 500 }}>編集</span>
                  </button>
                </div>
                <div className="mt-3 flex gap-2">
                  <button
                    onClick={() => router.push(`/situation?childId=${child.id}`)}
                    className="btn-primary flex-1 text-sm"
                    style={{ minHeight: '44px' }}
                  >
                    声かけを使う
                  </button>
                  <button
                    onClick={() => deleteChild(child.id)}
                    className="px-3 py-2 rounded-xl flex flex-col items-center gap-0.5"
                    style={{ minHeight: '44px' }}
                    aria-label="削除"
                  >
                    <Image src="/illustrations/42.png" alt="削除" width={24} height={24} style={{ objectFit: 'contain' }} />
                    <span style={{ fontSize: 10, color: '#F4907A', fontWeight: 500 }}>削除</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        <button
          onClick={() => router.push('/profile')}
          className="btn-secondary"
        >
          ＋ 子どもを追加
        </button>
      </div>

      <BottomNav />
    </div>
  )
}
