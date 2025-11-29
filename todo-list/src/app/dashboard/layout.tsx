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
  const { user } = useStore()

  useEffect(() => {
    if (!user) {
      router.push('/')
    }
  }, [user, router])

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
