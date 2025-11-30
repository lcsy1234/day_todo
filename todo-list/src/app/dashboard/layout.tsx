'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Background from '@/components/Background'
import BottomNav from '@/components/BottomNav'
import Mascot from '@/components/Mascot'
import { useStore } from '@/store/useStore'

export default function DashboardLayout({
  children
}: {
  children: React.ReactNode
}) {
  const router = useRouter()
  const { user, hasHydrated, themeColor } = useStore()

  useEffect(() => {
    // 只有在 hydration 完成后才检查用户状态
    if (hasHydrated && !user) {
      router.push('/')
    }
  }, [user, hasHydrated, router])

  // 等待 hydration 完成
  if (!hasHydrated) {
    return (
      <Background>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div 
              className="w-12 h-12 border-4 border-t-transparent rounded-full animate-spin mx-auto mb-4"
              style={{ borderColor: themeColor.primary, borderTopColor: 'transparent' }}
            />
            <p className="text-gray-500">加载中...</p>
          </div>
        </div>
      </Background>
    )
  }

  if (!user) {
    return null
  }

  return (
    <Background>
      <div className="min-h-screen pb-24">
        {/* 顶部吉祥物 */}
        <div className="fixed top-4 right-4 z-10">
          <Mascot size="sm" />
        </div>
        
        {children}
        
        <BottomNav />
      </div>
    </Background>
  )
}
