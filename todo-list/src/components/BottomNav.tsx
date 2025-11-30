'use client'

import { usePathname, useRouter } from 'next/navigation'
import { Home, List, Calendar, User, Coins } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useStore } from '@/store/useStore'

const navItems = [
  { id: 'home', icon: Home, label: '首页', path: '/dashboard' },
  { id: 'tasks', icon: List, label: '任务', path: '/dashboard/tasks' },
  { id: 'calendar', icon: Calendar, label: '日历', path: '/dashboard/calendar' },
  { id: 'profile', icon: User, label: '我的', path: '/dashboard/profile' }
]

export default function BottomNav() {
  const pathname = usePathname()
  const router = useRouter()
  const { user, themeColor } = useStore()

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 px-4 pb-safe">
      <div className="max-w-md mx-auto flex items-center justify-around py-2">
        {/* 积分显示 */}
        <div 
          className="flex items-center gap-1 px-3 py-1.5 rounded-full"
          style={{ backgroundColor: `${themeColor.primary}20` }}
        >
          <Coins className="w-4 h-4" style={{ color: themeColor.primary }} />
          <span className="text-sm font-medium" style={{ color: themeColor.accent }}>
            积分余额
          </span>
          <span className="text-sm font-bold ml-1" style={{ color: themeColor.accent }}>
            {user?.points || 0}
          </span>
        </div>

        {/* 导航项 */}
        {navItems.map(item => {
          const isActive = pathname === item.path
          const Icon = item.icon
          
          return (
            <button
              key={item.id}
              onClick={() => router.push(item.path)}
              className={cn(
                'flex flex-col items-center gap-1 px-4 py-2 rounded-xl transition-colors',
                !isActive && 'text-gray-400 hover:text-gray-600'
              )}
              style={isActive ? { color: themeColor.primary } : undefined}
            >
              <Icon className="w-6 h-6" />
              <span className="text-xs">{item.label}</span>
            </button>
          )
        })}
      </div>
      
      {/* 底部安全区域指示器 */}
      <div className="h-1 w-32 bg-gray-200 rounded-full mx-auto mb-2" />
    </div>
  )
}
