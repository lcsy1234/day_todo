'use client'

import { useState, useEffect, useMemo } from 'react'
import { Plus, Flag, Clock, ChevronUp, ChevronDown, Check, Trash2, Edit2, Tag, X } from 'lucide-react'
import TodoEditor from '@/components/TodoEditor'
import CategoryManager from '@/components/CategoryManager'
import Button from '@/components/ui/Button'
import { cn } from '@/lib/utils'
import { useStore, Todo, Priority, Category } from '@/store/useStore'

const priorityOrder: Record<Priority, number> = {
  URGENT: 4,
  HIGH: 3,
  MEDIUM: 2,
  LOW: 1
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

export default function DashboardPage() {
  const { user, todos, setTodos, toggleTodo, deleteTodo, categories, setCategories } = useStore()
  const [isEditorOpen, setIsEditorOpen] = useState(false)
  const [editingTodo, setEditingTodo] = useState<Todo | null>(null)
  
  // 排序状态
  const [prioritySortOrder, setPrioritySortOrder] = useState<'asc' | 'desc'>('desc')
  const [timeSortOrder, setTimeSortOrder] = useState<'asc' | 'desc'>('asc')
  
  // 分类筛选状态
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null)
  const [isCategoryManagerOpen, setIsCategoryManagerOpen] = useState(false)

  useEffect(() => {
    if (user) {
      fetchTodos()
      fetchCategories()
    }
  }, [user])

  const fetchTodos = async () => {
    if (!user) return
    
    try {
      const res = await fetch(`/api/todos?userId=${user.id}`)
      if (res.ok) {
        const data = await res.json()
        setTodos(data.todos)
      }
    } catch (error) {
      console.error('Fetch todos error:', error)
    }
  }

  const fetchCategories = async () => {
    if (!user) return
    
    try {
      const res = await fetch(`/api/categories?userId=${user.id}`)
      if (res.ok) {
        const data = await res.json()
        setCategories(data.categories)
      }
    } catch (error) {
      console.error('Fetch categories error:', error)
    }
  }

  // 只显示今天的任务（支持分类筛选）
  const todayTodos = useMemo(() => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)

    return todos.filter(todo => {
      if (!todo.dueDate) return false
      const dueDate = new Date(todo.dueDate)
      const isToday = dueDate >= today && dueDate < tomorrow
      
      // 分类筛选
      if (selectedCategoryId && todo.categoryId !== selectedCategoryId) {
        return false
      }
      
      return isToday
    })
  }, [todos, selectedCategoryId])
  
  // 获取分类信息
  const getCategoryById = (id: string): Category | undefined => {
    return categories.find(c => c.id === id)
  }

  // 按优先级排序的任务
  const prioritySortedTodos = useMemo(() => {
    const sorted = [...todayTodos].filter(t => !t.completed)
    sorted.sort((a, b) => {
      const diff = priorityOrder[b.priority] - priorityOrder[a.priority]
      return prioritySortOrder === 'desc' ? diff : -diff
    })
    return sorted
  }, [todayTodos, prioritySortOrder])

  // 按时间排序的任务
  const timeSortedTodos = useMemo(() => {
    const sorted = [...todayTodos].filter(t => !t.completed)
    sorted.sort((a, b) => {
      const timeA = a.dueDate ? new Date(a.dueDate).getTime() : 0
      const timeB = b.dueDate ? new Date(b.dueDate).getTime() : 0
      return timeSortOrder === 'asc' ? timeA - timeB : timeB - timeA
    })
    return sorted
  }, [todayTodos, timeSortOrder])

  // 已完成的任务
  const completedTodos = useMemo(() => {
    return todayTodos.filter(t => t.completed)
  }, [todayTodos])

  const handleAddTodo = () => {
    setEditingTodo(null)
    setIsEditorOpen(true)
  }

  const handleEditTodo = (todo: Todo) => {
    setEditingTodo(todo)
    setIsEditorOpen(true)
  }

  const handleCloseEditor = () => {
    setIsEditorOpen(false)
    setEditingTodo(null)
  }

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
      const res = await fetch(`/api/todos/${todo.id}`, { method: 'DELETE' })
      if (res.ok) {
        deleteTodo(todo.id)
      }
    } catch (error) {
      console.error('Delete todo error:', error)
    }
  }

  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr)
    const hours = date.getHours()
    const minutes = date.getMinutes()
    if (hours === 0 && minutes === 0) return ''
    const period = hours < 12 ? '上午' : hours < 18 ? '下午' : '晚上'
    const displayHour = hours > 12 ? hours - 12 : hours
    return `${period} ${displayHour}:${minutes.toString().padStart(2, '0')}`
  }

  const today = new Date()
  const dateStr = today.toLocaleDateString('zh-CN', {
    month: 'long',
    day: 'numeric',
    weekday: 'long'
  })

  const TodoItem = ({ todo }: { todo: Todo }) => {
    const category = todo.categoryId ? getCategoryById(todo.categoryId) : null
    
    return (
      <div className={cn(
        'group flex items-start gap-3 p-4 rounded-2xl bg-white hover:bg-orange-50/50 transition-all',
        todo.completed && 'opacity-60'
      )}>
        <button
          onClick={() => handleToggle(todo)}
          className={cn(
            'flex-shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all',
            todo.completed ? 'bg-orange-400 border-orange-400' : 'border-gray-300 hover:border-orange-400'
          )}
        >
          {todo.completed && <Check className="w-4 h-4 text-white" />}
        </button>
        <div className="flex-1 min-w-0">
          <h3 className={cn('text-gray-800 font-medium', todo.completed && 'line-through text-gray-500')}>
            {todo.title}
          </h3>
          <div className="flex items-center gap-2 mt-1 flex-wrap">
            <span className={cn('px-2 py-0.5 rounded-full text-xs font-medium', priorityColors[todo.priority])}>
              <Flag className="w-3 h-3 inline mr-1" />
              {priorityLabels[todo.priority]}
            </span>
            {category && (
              <span 
                className="px-2 py-0.5 rounded-full text-xs font-medium"
                style={{ backgroundColor: `${category.color}20`, color: category.color }}
              >
                <Tag className="w-3 h-3 inline mr-1" />
                {category.name}
              </span>
            )}
            {todo.dueDate && formatTime(todo.dueDate) && (
              <span className="flex items-center gap-1 text-xs text-gray-500">
                <Clock className="w-3 h-3" />
                {formatTime(todo.dueDate)}
              </span>
            )}
          </div>
        </div>
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button onClick={() => handleEditTodo(todo)} className="p-2 rounded-full hover:bg-orange-100 text-gray-500 hover:text-orange-500">
            <Edit2 className="w-4 h-4" />
          </button>
          <button onClick={() => handleDelete(todo)} className="p-2 rounded-full hover:bg-red-100 text-gray-500 hover:text-red-500">
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto px-6 pt-8 pb-28">
      {/* 头部 */}
      <div className="mb-8">
        <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
          <span>{dateStr}</span>
        </div>
        <div className="flex items-center justify-between">
          <h1 className="text-4xl font-bold text-gray-800">今日任务</h1>
          <Button onClick={handleAddTodo} size="md">
            <Plus className="w-5 h-5 mr-1" />
            添加任务
          </Button>
        </div>
        <p className="text-base text-gray-500 mt-3">
          共 {todayTodos.length} 个任务，已完成 {completedTodos.length} 个
        </p>
      </div>

      {/* 分类筛选 */}
      <div className="mb-6">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-sm text-gray-500 mr-1">
            <Tag className="w-4 h-4 inline mr-1" />
            分类:
          </span>
          <button
            onClick={() => setSelectedCategoryId(null)}
            className={cn(
              'px-3 py-1.5 rounded-full text-sm font-medium transition-colors',
              selectedCategoryId === null
                ? 'bg-orange-500 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            )}
          >
            全部
          </button>
          {categories.map(category => (
            <button
              key={category.id}
              onClick={() => setSelectedCategoryId(category.id)}
              className={cn(
                'px-3 py-1.5 rounded-full text-sm font-medium transition-colors flex items-center gap-1',
                selectedCategoryId === category.id
                  ? 'text-white'
                  : 'hover:opacity-80'
              )}
              style={{
                backgroundColor: selectedCategoryId === category.id ? category.color : `${category.color}20`,
                color: selectedCategoryId === category.id ? 'white' : category.color
              }}
            >
              {category.name}
              {selectedCategoryId === category.id && (
                <X className="w-3 h-3" onClick={(e) => { e.stopPropagation(); setSelectedCategoryId(null) }} />
              )}
            </button>
          ))}
          <button
            onClick={() => setIsCategoryManagerOpen(true)}
            className="px-3 py-1.5 rounded-full text-sm font-medium bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors flex items-center gap-1"
          >
            <Plus className="w-3 h-3" />
            管理分类
          </button>
        </div>
      </div>

      {/* 并排显示：按优先级 & 按时间 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {/* 按优先级排序 */}
        <div className="bg-white rounded-3xl shadow-lg shadow-orange-100/50 p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-gray-700 flex items-center gap-2">
              <Flag className="w-5 h-5 text-orange-500" />
              按优先级
            </h2>
            <button
              onClick={() => setPrioritySortOrder(prev => prev === 'desc' ? 'asc' : 'desc')}
              className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-orange-100 text-orange-600 text-sm font-medium hover:bg-orange-200 transition-colors"
            >
              {prioritySortOrder === 'desc' ? (
                <>
                  <ChevronDown className="w-4 h-4" />
                  高→低
                </>
              ) : (
                <>
                  <ChevronUp className="w-4 h-4" />
                  低→高
                </>
              )}
            </button>
          </div>
          <div className="bg-gray-50 rounded-2xl overflow-hidden min-h-[200px] max-h-[400px] overflow-y-auto">
            {prioritySortedTodos.length === 0 ? (
              <div className="py-16 text-center text-gray-400">
                <Flag className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                <p className="text-base">暂无待办任务</p>
                <p className="text-sm mt-1">点击右上角添加任务</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {prioritySortedTodos.map(todo => (
                  <TodoItem key={todo.id} todo={todo} />
                ))}
              </div>
            )}
          </div>
        </div>

        {/* 按时间排序 */}
        <div className="bg-white rounded-3xl shadow-lg shadow-blue-100/50 p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-gray-700 flex items-center gap-2">
              <Clock className="w-5 h-5 text-blue-500" />
              按时间
            </h2>
            <button
              onClick={() => setTimeSortOrder(prev => prev === 'asc' ? 'desc' : 'asc')}
              className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-blue-100 text-blue-600 text-sm font-medium hover:bg-blue-200 transition-colors"
            >
              {timeSortOrder === 'asc' ? (
                <>
                  <ChevronUp className="w-4 h-4" />
                  早→晚
                </>
              ) : (
                <>
                  <ChevronDown className="w-4 h-4" />
                  晚→早
                </>
              )}
            </button>
          </div>
          <div className="bg-gray-50 rounded-2xl overflow-hidden min-h-[200px] max-h-[400px] overflow-y-auto">
            {timeSortedTodos.length === 0 ? (
              <div className="py-16 text-center text-gray-400">
                <Clock className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                <p className="text-base">暂无待办任务</p>
                <p className="text-sm mt-1">点击右上角添加任务</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {timeSortedTodos.map(todo => (
                  <TodoItem key={todo.id} todo={todo} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 已完成 */}
      {completedTodos.length > 0 && (
        <div className="bg-white/50 rounded-3xl p-5">
          <h2 className="text-lg font-bold text-gray-400 mb-4 flex items-center gap-2">
            <Check className="w-5 h-5" />
            已完成 ({completedTodos.length})
          </h2>
          <div className="bg-gray-50 rounded-2xl overflow-hidden">
            <div className="divide-y divide-gray-100">
              {completedTodos.map(todo => (
                <TodoItem key={todo.id} todo={todo} />
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 任务编辑器 */}
      <TodoEditor
        isOpen={isEditorOpen}
        onClose={handleCloseEditor}
        todo={editingTodo}
      />

      {/* 分类管理 */}
      <CategoryManager
        isOpen={isCategoryManagerOpen}
        onClose={() => setIsCategoryManagerOpen(false)}
      />
    </div>
  )
}
