'use client'

import { useState } from 'react'
import { Check, Trash2, Edit2, Clock, Flag } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Todo, Priority, useStore } from '@/store/useStore'

interface TodoItemProps {
  todo: Todo
  onEdit: (todo: Todo) => void
}

const priorityColors: Record<Priority, string> = {
  LOW: 'bg-gray-100 text-gray-600',
  MEDIUM: 'bg-blue-100 text-blue-600',
  HIGH: 'bg-orange-100 text-orange-600',
  URGENT: 'bg-red-100 text-red-600'
}

const priorityLabels: Record<Priority, string> = {
  LOW: '低',
  MEDIUM: '中',
  HIGH: '高',
  URGENT: '紧急'
}

export default function TodoItem({ todo, onEdit }: TodoItemProps) {
  const { toggleTodo, deleteTodo, user } = useStore()
  const [isDeleting, setIsDeleting] = useState(false)

  const handleToggle = async () => {
    try {
      const res = await fetch(`/api/todos/${todo.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ completed: !todo.completed })
      })

      if (res.ok) {
        toggleTodo(todo.id)
      }
    } catch (error) {
      console.error('Toggle todo error:', error)
    }
  }

  const handleDelete = async () => {
    if (!confirm('确定要删除这个任务吗？')) return
    
    setIsDeleting(true)
    try {
      const res = await fetch(`/api/todos/${todo.id}`, {
        method: 'DELETE'
      })

      if (res.ok) {
        deleteTodo(todo.id)
      }
    } catch (error) {
      console.error('Delete todo error:', error)
    } finally {
      setIsDeleting(false)
    }
  }

  const formatDueDate = (dateStr?: string) => {
    if (!dateStr) return null
    const date = new Date(dateStr)
    const today = new Date()
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)

    if (date.toDateString() === today.toDateString()) {
      return '今天'
    } else if (date.toDateString() === tomorrow.toDateString()) {
      return '明天'
    } else {
      return date.toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' })
    }
  }

  return (
    <div
      className={cn(
        'group flex items-start gap-3 p-4 rounded-2xl transition-all duration-200 hover:bg-orange-50/50',
        todo.completed && 'opacity-60'
      )}
    >
      {/* 复选框 */}
      <button
        onClick={handleToggle}
        className={cn(
          'flex-shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all duration-200',
          todo.completed
            ? 'bg-orange-400 border-orange-400'
            : 'border-gray-300 hover:border-orange-400'
        )}
      >
        {todo.completed && <Check className="w-4 h-4 text-white" />}
      </button>

      {/* 内容 */}
      <div className="flex-1 min-w-0">
        <h3
          className={cn(
            'text-gray-800 font-medium truncate',
            todo.completed && 'line-through text-gray-500'
          )}
        >
          {todo.title}
        </h3>
        {todo.description && (
          <p className="text-sm text-gray-500 mt-1 line-clamp-2">
            {todo.description}
          </p>
        )}
        <div className="flex items-center gap-2 mt-2">
          {/* 优先级标签 */}
          <span
            className={cn(
              'px-2 py-0.5 rounded-full text-xs font-medium',
              priorityColors[todo.priority]
            )}
          >
            <Flag className="w-3 h-3 inline mr-1" />
            {priorityLabels[todo.priority]}
          </span>
          
          {/* 截止日期 */}
          {todo.dueDate && (
            <span className="flex items-center gap-1 text-xs text-gray-500">
              <Clock className="w-3 h-3" />
              {formatDueDate(todo.dueDate)}
            </span>
          )}
        </div>
      </div>

      {/* 操作按钮 */}
      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          onClick={() => onEdit(todo)}
          className="p-2 rounded-full hover:bg-orange-100 text-gray-500 hover:text-orange-500 transition-colors"
        >
          <Edit2 className="w-4 h-4" />
        </button>
        <button
          onClick={handleDelete}
          disabled={isDeleting}
          className="p-2 rounded-full hover:bg-red-100 text-gray-500 hover:text-red-500 transition-colors disabled:opacity-50"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  )
}
