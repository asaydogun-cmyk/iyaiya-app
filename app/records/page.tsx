'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { getUserKey } from '@/lib/supabase'
import type { AppRecord, Child } from '@/lib/types'
import BottomNav from '@/components/BottomNav'

function getBorderColor(status: string): string {
  if (status.startsWith('🔴')) return '#E57373'
  if (status.startsWith('🟠')) return '#FFB347'
  if (status.startsWith('🟡')) return '#A8D8EA'
  if (status.startsWith('🟢')) return '#81C784'
  return '#E5E7EB'
}

function getShortStatus(status: string): string {
  if (status.startsWith('🔴')) return '🔴 もう限界'
  if (status.startsWith('🟠')) return '🟠 余裕なし'
  if (status.startsWith('🟡')) return '🟡 少し疲れ'
  if (status.startsWith('🟢')) return '🟢 余裕あり'
  return status
}

function getStatusTextColor(status: string): string {
  if (status.startsWith('🔴')) return '#c62828'
  if (status.startsWith('🟠')) return '#e65100'
  if (status.startsWith('🟡')) return '#1565c0'
  if (status.startsWith('🟢')) return '#2e7d32'
  return '#5C4033'
}

function formatDate(dateStr: string): string {
  const d = new Date(dateStr)
  return `${d.getMonth() + 1}月${d.getDate()}日`
}

export default function RecordsPage() {
  const router = useRouter()
  const [records, setRecords] = useState<AppRecord[]>([])
  const [childMap, setChildMap] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(true)
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set())

  useEffect(() => {
    const userKey = getUserKey()
    Promise.all([
      fetch(`/api/records?userKey=${encodeURIComponent(userKey)}`).then(r => r.ok ? r.json() : []),
      fetch(`/api/children?userKey=${encodeURIComponent(userKey)}`).then(r => r.ok ? r.json() : []),
    ]).then(([recs, children]: [AppRecord[], Child[]]) => {
      setRecords(recs)
      const map: Record<string, string> = {}
      children.forEach(c => { map[c.id] = c.name })
      setChildMap(map)
    }).catch(() => {}).finally(() => setLoading(false))
  }, [])

  function toggleExpand(id: string) {
    setExpandedIds(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  return (
    <div className="flex flex-col min-h-dvh">
      {/* Header */}
      <div
        className="px-5 pt-10 pb-6"
        style={{ background: 'linear-gradient(135deg, #ff7c7c 0%, #ff9a9a 100%)' }}
      >
        <p className="text-white/80 text-sm font-medium mb-1">イヤイヤ期</p>
        <h1 className="text-white text-2xl font-black leading-tight">きろく</h1>
        <p className="text-white/80 text-sm mt-2">あのときの声かけを振り返れます</p>
      </div>

      <div className="flex-1 px-4 py-4 pb-24 space-y-3">
        {loading ? (
          <div className="flex justify-center py-16">
            <div
              className="w-8 h-8 rounded-full border-3 animate-spin"
              style={{ borderColor: 'var(--color-peach-dark)', borderTopColor: 'var(--color-coral)' }}
            />
          </div>
        ) : records.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <p className="text-2xl mb-3">📖</p>
            <p className="text-gray-600 font-medium mb-1">まだきろくがありません</p>
            <p className="text-gray-400 text-sm">声かけを使うと自動で保存されます</p>
            <button
              onClick={() => router.push('/')}
              className="btn-primary mt-6"
              style={{ width: 'auto', padding: '10px 24px' }}
            >
              声かけを使う
            </button>
          </div>
        ) : (
          records.map(record => {
            const expanded = expandedIds.has(record.id)
            const borderColor = getBorderColor(record.parent_status)
            const textColor = getStatusTextColor(record.parent_status)
            const childName = childMap[record.child_id]
            const parentMsgBody = record.result.parent_message
              ?.split('\n\n').slice(1).join('\n\n')
              || record.result.parent_message

            return (
              <div
                key={record.id}
                style={{
                  backgroundColor: 'white',
                  borderRadius: 16,
                  overflow: 'hidden',
                  borderTop: '1px solid #F0DDD0',
                  borderRight: '1px solid #F0DDD0',
                  borderBottom: '1px solid #F0DDD0',
                  borderLeft: `4px solid ${borderColor}`,
                  boxShadow: '0 2px 8px rgba(92, 64, 51, 0.06)',
                }}
              >
                {/* 常時表示部分 */}
                <button
                  onClick={() => toggleExpand(record.id)}
                  className="w-full text-left px-4 py-4"
                  style={{ fontFamily: 'inherit' }}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2 flex-wrap">
                        <span className="text-xs font-bold text-gray-400">
                          {formatDate(record.created_at)}
                        </span>
                        {childName && (
                          <span
                            className="text-xs font-bold px-2 py-0.5 rounded-full"
                            style={{ backgroundColor: 'var(--color-peach)', color: '#5C4033' }}
                          >
                            {childName}
                          </span>
                        )}
                        <span
                          className="text-xs font-bold px-2 py-0.5 rounded-full"
                          style={{
                            backgroundColor: `${borderColor}22`,
                            color: textColor,
                          }}
                        >
                          {getShortStatus(record.parent_status)}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 leading-relaxed">
                        {record.situation}
                      </p>
                    </div>
                    <span className="text-gray-400 text-xs flex-shrink-0 mt-1">
                      {expanded ? '▲' : '▼'}
                    </span>
                  </div>
                </button>

                {/* 展開時の詳細 */}
                {expanded && (
                  <div
                    className="space-y-4 px-4 py-4"
                    style={{ borderTop: '1px solid #F0DDD0' }}
                  >
                    {parentMsgBody && (
                      <div>
                        <p className="text-xs font-bold mb-1.5" style={{ color: '#c2687a' }}>
                          今日もがんばっているあなたへ
                        </p>
                        <p className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">
                          {parentMsgBody}
                        </p>
                      </div>
                    )}

                    {record.result.advice && (
                      <div>
                        <p className="text-xs font-bold mb-1.5" style={{ color: '#4a7fa5' }}>
                          知っておくと楽になること
                        </p>
                        <p className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">
                          {record.result.advice}
                        </p>
                      </div>
                    )}

                    {record.result.unexpected_advice && (
                      <div>
                        <p className="text-xs font-bold mb-1.5" style={{ color: '#b8860b' }}>
                          これだけでOK
                        </p>
                        <p className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">
                          {record.result.unexpected_advice}
                        </p>
                      </div>
                    )}

                    {record.result.reward && (
                      <div>
                        <p className="text-xs font-bold mb-1.5" style={{ color: '#7c3aed' }}>
                          今日の自分へのご褒美
                        </p>
                        <p className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">
                          {record.result.reward}
                        </p>
                      </div>
                    )}

                    {record.result.phrases?.length > 0 && (
                      <div>
                        <p className="text-xs font-bold mb-2" style={{ color: '#5C4033' }}>
                          声かけ一覧
                        </p>
                        <div className="space-y-2">
                          {record.result.phrases.map((phrase, i) => (
                            <div
                              key={i}
                              className="flex items-start gap-2 p-3 rounded-xl"
                              style={{ backgroundColor: 'var(--color-peach)' }}
                            >
                              <span
                                className="flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center text-white font-bold"
                                style={{ backgroundColor: 'var(--color-coral)', fontSize: 10 }}
                              >
                                {i + 1}
                              </span>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-gray-800">
                                  「{phrase.text}」
                                </p>
                                <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">
                                  {phrase.reason}
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )
          })
        )}
      </div>

      <BottomNav />
    </div>
  )
}
