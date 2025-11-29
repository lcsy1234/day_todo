'use client'

import { useState, useEffect } from 'react'
import { User, FileText, Calendar, Flag, Clock } from 'lucide-react'
import Modal from './ui/Modal'
import Input from './ui/Input'
import Button from './ui/Button'
import Switch from './ui/Switch'
import { Todo, Priority, useStore } from '@/store/useStore'

interface TodoEditorProps {
  isOpen: boolean
  onClose: () => void
  todo?: Todo | null
  selectedDate?: Date | null
}

const priorityOptions: { value: Priority; label: string; color: string }[] = [
  { value: 'LOW', label: '低', color: 'bg-gray-100 text-gray-600' },
  { value: 'MEDIUM', label: '中', color: 'bg-blue-100 text-blue-600' },
  { value: 'HIGH', label: '高', color: 'bg-orange-100 text-orange-600' },
  { value: 'URGENT', label: '紧急', color: 'bg-red-100 text-red-600' }
]

// 时间选项
const timeOptions = [
  { value: '', label: '不设置时间' },
  { value: '06:00', label: '上午 6:00' },
  { value: '07:00', label: '上午 7:00' },
  { value: '08:00', label: '上午 8:00' },
  { value: '09:00', label: '上午 9:00' },
  { value: '10:00', label: '上午 10:00' },
  { value: '11:00', label: '上午 11:00' },
  { value: '12:00', label: '中午 12:00' },
  { value: '13:00', label: '下午 1:00' },
  { value: '14:00', label: '下午 2:00' },
  { value: '15:00', label: '下午 3:00' },
  { value: '16:00', label: '下午 4:00' },
  { value: '17:00', label: '下午 5:00' },
  { value: '18:00', label: '下午 6:00' },
  { value: '19:00', label: '晚上 7:00' },
  { value: '20:00', label: '晚上 8:00' },
  { value: '21:00', label: '晚上 9:00' },
  { value: '22:00', label: '晚上 10:00' },
  { value: '23:00', label: '晚上 11:00' }
]

export default function TodoEditor({ isOpen, onClose, todo, selectedDate }: TodoEditorProps) {
  const { user, addTodo, updateTodo, categories } = useStore()
  
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [priority, setPriority] = useState<Priority>('MEDIUM')
  const [isUrgent, setIsUrgent] = useState(false)
  const [dueDate, setDueDate] = useState('')
  const [dueTime, setDueTime] = useState('')
  const [categoryId, setCategoryId] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (todo) {
      setTitle(todo.title)
      setDescription(todo.description || '')
      setPriority(todo.priority)
      setIsUrgent(todo.priority === 'URGENT')
      if (todo.dueDate) {
        const date = new Date(todo.dueDate)
        setDueDate(date.toISOString().split('T')[0])
        const hours = date.getHours().toString().padStart(2, '0')
        const minutes = date.getMinutes().toString().padStart(2, '0')
        setDueTime(minutes === '00' ? `${hours}:00` : '')
      } else {
        setDueDate('')
        setDueTime('')
      }
      setCategoryId(todo.categoryId || '')
    } else {
      setTitle('')
      setDescription('')
      setPriority('MEDIUM')
      setIsUrgent(false)
      setDueDate(selectedDate ? selectedDate.toISOString().split('T')[0] : new Date().toISOString().split('T')[0])
      setDueTime('')
      setCategoryId('')
    }
  }, [todo, selectedDate, isOpen])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim() || !user) return

    setIsLoading(true)
    
    const finalPriority = isUrgent ? 'URGENT' : priority
    
    // 组合日期和时间
    let finalDueDate: string | null = null
    if (dueDate) {
      if (dueTime) {
        finalDueDate = `${dueDate}T${dueTime}:00`
      } else {
        finalDueDate = `${dueDate}T00:00:00`
      }
    }

    try {
      if (todo) {
        // 更新任务
        const res = await fetch(`/api/todos/${todo.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            title,
            description,
            priority: finalPriority,
            dueDate: finalDueDate,
            categoryId: categoryId || null
          })
        })

        if (res.ok) {
          const data = await res.json()
          updateTodo(todo.id, data.todo)
          onClose()
        }
      } else {
        // 创建任务
        const res = await fetch('/api/todos', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            title,
            description,
            priority: finalPriority,
            dueDate: finalDueDate,
            categoryId: categoryId || null,
            userId: user.id
          })
        })

        if (res.ok) {
          const data = await res.json()
          addTodo(data.todo)
          onClose()
        }
      }
    } catch (error) {
      console.error('Save todo error:', error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="任务编辑">
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          placeholder="标题"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          icon={<User className="w-5 h-5" />}
        />

        <Input
          placeholder="标题"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          icon={<FileText className="w-5 h-5" />}
        />

        {/* 紧急度选择 */}
        <div className="flex items-center justify-between py-2">
          <div className="flex items-center gap-2 text-gray-600">
            <Flag className="w-5 h-5" />
            <span>紧急度选择按</span>
          </div>
          <Switch
            checked={isUrgent}
            onChange={setIsUrgent}
          />
        </div>

        {/* 优先级选择 */}
        {!isUrgent && (
          <div className="flex gap-2">
            {priorityOptions.filter(p => p.value !== 'URGENT').map(option => (
              <button
                key={option.value}
                type="button"
                onClick={() => setPriority(option.value)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                  priority === option.value
                    ? option.color + ' ring-2 ring-offset-2 ring-orange-300'
                    : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        )}

        {/* 日期选择器 */}
        <div className="flex items-center gap-2 text-gray-600">
          <Calendar className="w-5 h-5" />
          <span>选择日期</span>
        </div>

        <input
          type="date"
          value={dueDate}
          onChange={(e) => setDueDate(e.target.value)}
          className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-orange-400 focus:outline-none focus:ring-2 focus:ring-orange-100"
        />

        {/* 时间选择器 */}
        <div className="flex items-center gap-2 text-gray-600">
          <Clock className="w-5 h-5" />
          <span>选择时间</span>
        </div>

        <select
          value={dueTime}
          onChange={(e) => setDueTime(e.target.value)}
          className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-orange-400 focus:outline-none focus:ring-2 focus:ring-orange-100 bg-white"
        >
          {timeOptions.map(option => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>

        {/* 分类选择 */}
        {categories.length > 0 && (
          <div className="flex gap-2 flex-wrap">
            {categories.map(cat => (
              <button
                key={cat.id}
                type="button"
                onClick={() => setCategoryId(cat.id === categoryId ? '' : cat.id)}
                className={`px-3 py-1.5 rounded-full text-sm transition-all ${
                  categoryId === cat.id
                    ? 'text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
                style={categoryId === cat.id ? { backgroundColor: cat.color } : {}}
              >
                {cat.name}
              </button>
            ))}
          </div>
        )}

        <Button
          type="submit"
          className="w-full"
          size="lg"
          disabled={isLoading || !title.trim()}
        >
          {isLoading ? '保存中...' : '保存任务'}
        </Button>
      </form>
    </Modal>
  )
}
