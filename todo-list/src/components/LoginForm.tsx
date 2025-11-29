'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { User, Lock, Eye, EyeOff } from 'lucide-react'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import Card from '@/components/ui/Card'
import Mascot from '@/components/Mascot'
import { useStore } from '@/store/useStore'
import { generateGuestId } from '@/lib/utils'

export default function LoginForm() {
  const router = useRouter()
  const { setUser, setTodos, setCategories } = useStore()
  
  const [isRegister, setIsRegister] = useState(false)
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!username.trim() || !password) {
      setError('请输入用户名和密码')
      return
    }

    setIsLoading(true)

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
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

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!username.trim()) {
      setError('请输入用户名')
      return
    }

    if (username.length < 2 || username.length > 20) {
      setError('用户名长度需要在 2-20 个字符之间')
      return
    }

    if (!password || password.length < 6) {
      setError('密码长度至少 6 位')
      return
    }

    if (password !== confirmPassword) {
      setError('两次输入的密码不一致')
      return
    }

    setIsLoading(true)

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || '注册失败')
      }

      setUser(data.user)
      setTodos([])
      setCategories(data.categories || [])
      router.push('/dashboard')
    } catch (err) {
      setError(err instanceof Error ? err.message : '注册失败，请重试')
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
      setCategories(data.categories || [])
      router.push('/dashboard')
    } catch (err) {
      setError(err instanceof Error ? err.message : '游客登录失败，请重试')
    } finally {
      setIsLoading(false)
    }
  }

  const switchMode = () => {
    setIsRegister(!isRegister)
    setError('')
    setPassword('')
    setConfirmPassword('')
  }

  return (
    <Card className="w-full max-w-md mx-auto relative pt-16">
      {/* 吉祥物 */}
      <div className="absolute -top-12 left-1/2 -translate-x-1/2">
        <Mascot size="lg" />
      </div>

      {/* 标题 */}
      <h1 className="text-3xl font-bold text-center text-gray-800 mb-2">
        todoList
      </h1>
      <p className="text-center text-gray-500 mb-6">
        {isRegister ? '创建新账号' : '欢迎回来'}
      </p>

      <form onSubmit={isRegister ? handleRegister : handleLogin} className="space-y-4">
        <Input
          type="text"
          placeholder="请输入用户名"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          icon={<User className="w-5 h-5" />}
        />

        <div className="relative">
          <Input
            type={showPassword ? 'text' : 'password'}
            placeholder="请输入密码"
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
        </div>

        {isRegister && (
          <div className="relative">
            <Input
              type={showPassword ? 'text' : 'password'}
              placeholder="请确认密码"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              icon={<Lock className="w-5 h-5" />}
            />
          </div>
        )}

        {error && (
          <p className="text-red-500 text-sm text-center">{error}</p>
        )}

        <Button
          type="submit"
          className="w-full"
          size="lg"
          disabled={isLoading}
        >
          {isLoading ? (isRegister ? '注册中...' : '登录中...') : (isRegister ? '注册' : '登录')}
        </Button>
      </form>

      <div className="mt-4 text-center">
        <button
          type="button"
          onClick={switchMode}
          className="text-orange-500 hover:text-orange-600 text-sm font-medium"
        >
          {isRegister ? '已有账号？去登录' : '没有账号？去注册'}
        </button>
      </div>

      <div className="mt-6 pt-4 border-t border-gray-100 text-center">
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
