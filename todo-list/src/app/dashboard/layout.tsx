'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Background from '@/components/Background'
import BottomNav from '@/components/BottomNav'
import Mascot from '@/components/Mascot'
import { useStore } from '@/store/useStore'
import { initAuth } from '@/lib/api'

export default function DashboardLayout({
  children
}: {
  children: React.ReactNode
}) {
  const router = useRouter()
  const { user, hasHydrated, themeColor, logout } = useStore()
  const [isAuthReady, setIsAuthReady] = useState(false)

  // 页面加载时初始化认证状态（从 refresh token 恢复 access token）
  useEffect(() => {
    if (hasHydrated && user) {
      initAuth().then((success) => {
        if (success) {
          setIsAuthReady(true)
        } else {
          // refresh token 无效，登出
          logout()
          router.push('/')
        }
      })
    }
  }, [hasHydrated, user, logout, router])

  useEffect(() => {
    // 只有在 hydration 完成后才检查用户状态
    if (hasHydrated && !user) {
      router.push('/')
    }
  }, [user, hasHydrated, router])

  // 监听 token 刷新失败事件，自动登出
  useEffect(() => {
    const handleAuthLogout = () => {
      logout()
      router.push('/')
    }

    window.addEventListener('auth:logout', handleAuthLogout)
    return () => window.removeEventListener('auth:logout', handleAuthLogout)
  }, [logout, router])

  // 等待 hydration 和认证初始化完成
  if (!hasHydrated || (user && !isAuthReady)) {
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
