'use client'

import { usePathname, useRouter } from 'next/navigation'

const tabs = [
  { path: '/', label: 'ホーム', icon: '🏠' },
  { path: '/records', label: 'きろく', icon: '📖' },
]

export default function BottomNav() {
  const router = useRouter()
  const pathname = usePathname()

  return (
    <div
      className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[480px]"
      style={{ borderTop: '1px solid #F0DDD0', backgroundColor: 'white' }}
    >
      <div className="flex">
        {tabs.map(tab => {
          const active = pathname === tab.path
          return (
            <button
              key={tab.path}
              onClick={() => router.push(tab.path)}
              className="flex-1 flex flex-col items-center py-2"
              style={{ fontFamily: 'inherit', color: active ? '#F4907A' : '#9CA3AF' }}
            >
              <span className="text-xl mb-0.5">{tab.icon}</span>
              <span style={{ fontSize: 11, fontWeight: active ? 700 : 500 }}>{tab.label}</span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
