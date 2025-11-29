'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Mail, Lock, ChevronDown, Eye, EyeOff } from 'lucide-react'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import Tabs from '@/components/ui/Tabs'
import Card from '@/components/ui/Card'
import Mascot from '@/components/Mascot'
import { useStore } from '@/store/useStore'
import { generateGuestId } from '@/lib/utils'

export default function LoginForm() {
  const router = useRouter()
  const { setUser, setTodos, setCategories } = useStore()
  
  const [activeTab, setActiveTab] = useState('email')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  const tabs = [
    { id: 'email', label: '邮箱/' },
    { id: 'third-party', label: '第三方登录' }
  ]

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || '登录失败')
      }

      setUser(data.user)
      setTodos(data.todos || [])
      setCategories(data.categories || [])
      router.push('/dashboard')
    } catch (err) {
      setError(err instanceof Error ? err.message : '登录失败，请重试')
    } finally {
      setIsLoading(false)
    }
  }

  const handleGuestLogin = async () => {
    setIsLoading(true)
    setError('')

    try {
      const guestId = generateGuestId()
      const res = await fetch('/api/auth/guest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ guestId })
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || '游客登录失败')
      }

      setUser(data.user)
      setTodos([])
      setCategories([])
      router.push('/dashboard')
    } catch (err) {
      setError(err instanceof Error ? err.message : '游客登录失败，请重试')
    } finally {
      setIsLoading(false)
    }
  }

  const handleRegister = async () => {
    if (!email || !password) {
      setError('请输入邮箱和密码')
      return
    }
    
    setError('')
    setIsLoading(true)

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || '注册失败')
      }

      setUser(data.user)
      setTodos([])
      setCategories([])
      router.push('/dashboard')
    } catch (err) {
      setError(err instanceof Error ? err.message : '注册失败，请重试')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className="w-full max-w-md mx-auto relative pt-16">
      {/* 吉祥物 */}
      <div className="absolute -top-12 left-1/2 -translate-x-1/2">
        <Mascot size="lg" />
      </div>

      {/* 标题 */}
      <h1 className="text-3xl font-bold text-center text-gray-800 mb-6">
        todoList
      </h1>

      {/* 标签切换 */}
      <div className="flex justify-center mb-6">
        <Tabs tabs={tabs} defaultTab="email" onChange={setActiveTab} />
      </div>

      {activeTab === 'email' ? (
        <form onSubmit={handleEmailLogin} className="space-y-4">
          <Input
            type="email"
            placeholder="邮箱入八明按钮"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            icon={<Mail className="w-5 h-5" />}
          />

          <div className="relative">
            <Input
              type={showPassword ? 'text' : 'password'}
              placeholder="密码入重新链接"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              icon={<Lock className="w-5 h-5" />}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
            <ChevronDown className="absolute right-12 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          </div>

          {error && (
            <p className="text-red-500 text-sm text-center">{error}</p>
          )}

          <div className="flex items-center justify-between text-sm">
            <button
              type="button"
              className="text-gray-500 hover:text-orange-500 flex items-center gap-1"
            >
              <Lock className="w-4 h-4" />
              #00bx00
            </button>
            <button
              type="button"
              onClick={handleRegister}
              className="text-orange-500 hover:text-orange-600 font-medium"
            >
              密码重新链接
            </button>
          </div>

          <Button
            type="submit"
            className="w-full"
            size="lg"
            disabled={isLoading}
          >
            {isLoading ? '登录中...' : '游客模式'}
          </Button>
        </form>
      ) : (
        <div className="space-y-4">
          <Button variant="outline" className="w-full" size="lg">
            使用 Google 登录
          </Button>
          <Button variant="outline" className="w-full" size="lg">
            使用 GitHub 登录
          </Button>
          <Button variant="outline" className="w-full" size="lg">
            使用微信登录
          </Button>
        </div>
      )}

      <div className="mt-6 text-center">
        <button
          onClick={handleGuestLogin}
          className="text-gray-500 hover:text-orange-500 text-sm"
          disabled={isLoading}
        >
          游客模式入口
        </button>
      </div>
    </Card>
  )
}
