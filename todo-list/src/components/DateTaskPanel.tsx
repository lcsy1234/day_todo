'use client'

import { useMemo } from 'react'
import { X, Plus, Check, Trash2, Edit2, Clock, Flag } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Todo, Priority, useStore } from '@/store/useStore'
import Button from './ui/Button'

interface DateTaskPanelProps {
  isOpen: boolean
  onClose: () => void
  selectedDate: Date | null
  onAddTask: () => void
  onEditTask: (todo: Todo) => void
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

export default function DateTaskPanel({ 
  isOpen, 
  onClose, 
  selectedDate, 
  onAddTask,
  onEditTask 
}: DateTaskPanelProps) {
  const { todos, toggleTodo, deleteTodo } = useStore()

  // 获取选中日期的任务
  const dateTodos = useMemo(() => {
    if (!selectedDate) return []
    const dateStr = selectedDate.toDateString()
    return todos.filter(todo => {
      if (!todo.dueDate) return false
      return new Date(todo.dueDate).toDateString() === dateStr
    })
  }, [todos, selectedDate])

  const handleToggle = async (todo: Todo) => {
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

  const handleDelete = async (todo: Todo) => {
    if (!confirm('确定要删除这个任务吗？')) return
    try {
      const res = await fetch(`/api/todos/${todo.id}`, {
        method: 'DELETE'
      })
      if (res.ok) {
        deleteTodo(todo.id)
      }
    } catch (error) {
      console.error('Delete todo error:', error)
    }
  }

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      weekday: 'long'
    })
  }

  if (!isOpen || !selectedDate) return null

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      {/* 背景遮罩 */}
      <div 
        className="absolute inset-0 bg-black/30 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* 面板 */}
      <div className="relative bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl w-full max-w-md mx-auto sm:mx-4 max-h-[80vh] flex flex-col animate-in">
        {/* 头部 */}
        <div className="flex items-center justify-between p-4 border-b border-gray-100">
          <div>
            <h2 className="text-lg font-bold text-gray-800">
              {formatDate(selectedDate)}
            </h2>
            <p className="text-sm text-gray-500">
              {dateTodos.length} 个任务
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-gray-100 transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* 任务列表 */}
        <div className="flex-1 overflow-y-auto p-4">
          {dateTodos.length === 0 ? (
            <div className="py-12 text-center">
              <div className="w-16 h-16 mx-auto mb-4 bg-orange-100 rounded-full flex items-center justify-center">
                <Clock className="w-8 h-8 text-orange-400" />
              </div>
              <p className="text-gray-500">这一天还没有任务</p>
              <p className="text-sm text-gray-400 mt-1">点击下方按钮添加新任务</p>
            </div>
          ) : (
            <div className="space-y-3">
              {dateTodos.map(todo => (
                <div
                  key={todo.id}
                  className={cn(
                    'group flex items-start gap-3 p-4 rounded-2xl bg-gray-50 hover:bg-orange-50/50 transition-all',
                    todo.completed && 'opacity-60'
                  )}
                >
                  {/* 复选框 */}
                  <button
                    onClick={() => handleToggle(todo)}
                    className={cn(
                      'flex-shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all',
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
                        'text-gray-800 font-medium',
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
                      <span
                        className={cn(
                          'px-2 py-0.5 rounded-full text-xs font-medium',
                          priorityColors[todo.priority]
                        )}
                      >
                        <Flag className="w-3 h-3 inline mr-1" />
                        {priorityLabels[todo.priority]}
                      </span>
                    </div>
                  </div>

                  {/* 操作按钮 */}
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => onEditTask(todo)}
                      className="p-2 rounded-full hover:bg-orange-100 text-gray-500 hover:text-orange-500 transition-colors"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(todo)}
                      className="p-2 rounded-full hover:bg-red-100 text-gray-500 hover:text-red-500 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 底部按钮 */}
        <div className="p-4 border-t border-gray-100">
          <Button onClick={onAddTask} className="w-full" size="lg">
            <Plus className="w-5 h-5 mr-2" />
            添加任务
          </Button>
        </div>
      </div>
    </div>
  )
}
