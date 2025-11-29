'use client'

import { useState } from 'react'
import { Upload, X } from 'lucide-react'
import Card from './ui/Card'
import Button from './ui/Button'
import Tabs from './ui/Tabs'
import Mascot from './Mascot'
import { useStore } from '@/store/useStore'

const feedbackTypes = [
  { id: 'BUG', label: '问题类型' },
  { id: 'FEATURE', label: '内容输入区' }
]

export default function FeedbackForm() {
  const { user } = useStore()
  const [type, setType] = useState('BUG')
  const [content, setContent] = useState('')
  const [image, setImage] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setImage(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!content.trim() || !user) return

    setIsLoading(true)
    try {
      const res = await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type,
          content,
          imageUrl: image,
          userId: user.id
        })
      })

      if (res.ok) {
        setSuccess(true)
        setContent('')
        setImage(null)
        setTimeout(() => setSuccess(false), 3000)
      }
    } catch (error) {
      console.error('Submit feedback error:', error)
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

      <h1 className="text-2xl font-bold text-center text-gray-800 mb-6">
        todoList
      </h1>

      {/* 类型选择 */}
      <div className="flex justify-center mb-6">
        <Tabs
          tabs={feedbackTypes}
          defaultTab="BUG"
          onChange={setType}
        />
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* 内容输入 */}
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="请描述您遇到的问题或建议..."
          rows={6}
          className="w-full px-4 py-3 rounded-xl border border-gray-200 resize-none focus:border-orange-400 focus:outline-none focus:ring-2 focus:ring-orange-100"
        />

        {/* 图片上传 */}
        <div className="relative">
          {image ? (
            <div className="relative rounded-xl overflow-hidden">
              <img src={image} alt="上传的图片" className="w-full h-40 object-cover" />
              <button
                type="button"
                onClick={() => setImage(null)}
                className="absolute top-2 right-2 p-1 bg-black/50 rounded-full text-white hover:bg-black/70"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-200 rounded-xl cursor-pointer hover:border-orange-400 hover:bg-orange-50/50 transition-colors">
              <Upload className="w-8 h-8 text-gray-400 mb-2" />
              <span className="text-sm text-gray-500">截图上传区域</span>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
              />
            </label>
          )}
        </div>

        {success && (
          <div className="text-center text-green-500 text-sm">
            反馈提交成功！感谢您的反馈。
          </div>
        )}

        <Button
          type="submit"
          className="w-full"
          size="lg"
          disabled={isLoading || !content.trim()}
        >
          {isLoading ? '提交中...' : '截图上传区域'}
        </Button>
      </form>
    </Card>
  )
}
