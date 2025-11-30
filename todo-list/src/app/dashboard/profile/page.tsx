'use client'

import { useRouter } from 'next/navigation'
import { User, Settings, HelpCircle, LogOut, ChevronRight, MessageSquare, Palette } from 'lucide-react'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import Mascot from '@/components/Mascot'
import FeedbackForm from '@/components/FeedbackForm'
import ThemeSelector from '@/components/ThemeSelector'
import { useStore } from '@/store/useStore'
import { useState } from 'react'

export default function ProfilePage() {
  const router = useRouter()
  const { user, logout, todos, themeColor } = useStore()
  const [showFeedback, setShowFeedback] = useState(false)
  const [showThemeSelector, setShowThemeSelector] = useState(false)

  const handleLogout = () => {
    logout()
    router.push('/')
  }

  const completedTodos = todos.filter(t => t.completed).length
  const totalTodos = todos.length

  if (showFeedback) {
    return (
      <div className="max-w-md mx-auto px-4 pt-6">
        <button
          onClick={() => setShowFeedback(false)}
          className="mb-4 text-gray-500 hover:text-gray-700"
        >
          ← 返回
        </button>
        <FeedbackForm />
      </div>
    )
  }

  return (
    <div className="max-w-md mx-auto px-4 pt-6">
      {/* 用户信息卡片 */}
      <Card className="relative pt-16 mb-6">
        <div className="absolute -top-12 left-1/2 -translate-x-1/2">
          <Mascot size="lg" />
        </div>

        <div className="text-center">
          <h2 className="text-xl font-bold text-gray-800">
            {user?.name || '用户'}
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            {user?.email || (user?.isGuest ? '游客账户' : '')}
          </p>
          
          {/* 统计 */}
          <div className="flex justify-center gap-8 mt-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-500">{user?.points || 0}</div>
              <div className="text-xs text-gray-500">积分</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-500">{completedTodos}</div>
              <div className="text-xs text-gray-500">已完成</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-500">{totalTodos}</div>
              <div className="text-xs text-gray-500">总任务</div>
            </div>
          </div>
        </div>
      </Card>

      {/* 菜单列表 */}
      <Card className="divide-y divide-gray-100">
        <button className="w-full flex items-center justify-between py-4 px-2 hover:bg-orange-50 transition-colors">
          <div className="flex items-center gap-3">
            <User className="w-5 h-5 text-gray-500" />
            <span className="text-gray-700">账户设置</span>
          </div>
          <ChevronRight className="w-5 h-5 text-gray-400" />
        </button>

        <button 
          onClick={() => setShowThemeSelector(true)}
          className="w-full flex items-center justify-between py-4 px-2 hover:bg-orange-50 transition-colors"
        >
          <div className="flex items-center gap-3">
            <Palette className="w-5 h-5" style={{ color: themeColor.primary }} />
            <span className="text-gray-700">主题颜色</span>
          </div>
          <div className="flex items-center gap-2">
            <div 
              className="w-5 h-5 rounded-full"
              style={{ backgroundColor: themeColor.primary }}
            />
            <span className="text-sm text-gray-500">{themeColor.name}</span>
            <ChevronRight className="w-5 h-5 text-gray-400" />
          </div>
        </button>

        <button className="w-full flex items-center justify-between py-4 px-2 hover:bg-orange-50 transition-colors">
          <div className="flex items-center gap-3">
            <Settings className="w-5 h-5 text-gray-500" />
            <span className="text-gray-700">偏好设置</span>
          </div>
          <ChevronRight className="w-5 h-5 text-gray-400" />
        </button>

        <button 
          onClick={() => setShowFeedback(true)}
          className="w-full flex items-center justify-between py-4 px-2 hover:bg-orange-50 transition-colors"
        >
          <div className="flex items-center gap-3">
            <MessageSquare className="w-5 h-5 text-gray-500" />
            <span className="text-gray-700">意见反馈</span>
          </div>
          <ChevronRight className="w-5 h-5 text-gray-400" />
        </button>

        <button className="w-full flex items-center justify-between py-4 px-2 hover:bg-orange-50 transition-colors">
          <div className="flex items-center gap-3">
            <HelpCircle className="w-5 h-5 text-gray-500" />
            <span className="text-gray-700">帮助中心</span>
          </div>
          <ChevronRight className="w-5 h-5 text-gray-400" />
        </button>
      </Card>

      {/* 退出登录 */}
      <div className="mt-6">
        <Button
          variant="outline"
          className="w-full"
          onClick={handleLogout}
        >
          <LogOut className="w-4 h-4 mr-2" />
          退出登录
        </Button>
      </div>

      {/* 版本信息 */}
      <p className="text-center text-xs text-gray-400 mt-6">
        todoList v1.0.0
      </p>

      {/* 主题选择器 */}
      <ThemeSelector
        isOpen={showThemeSelector}
        onClose={() => setShowThemeSelector(false)}
      />
    </div>
  )
}
