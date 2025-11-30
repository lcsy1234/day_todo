'use client'

import { useState, useEffect, useMemo } from 'react'
import { Search, Filter, Flag, Clock, Tag, Check, Trash2, Edit2, X, ChevronDown, Calendar } from 'lucide-react'
import TodoEditor from '@/components/TodoEditor'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
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

export default function TasksPage() {
  const { user, todos, setTodos, toggleTodo, deleteTodo, categories, setCategories } = useStore()
  const [isEditorOpen, setIsEditorOpen] = useState(false)
  const [editingTodo, setEditingTodo] = useState<Todo | null>(null)
  
  // 搜索筛选状态
  const [keyword, setKeyword] = useState('')
  const [selectedPriority, setSelectedPriority] = useState<Priority | 'ALL'>('ALL')
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | 'ALL'>('ALL')
  const [dateRange, setDateRange] = useState<'ALL' | 'TODAY' | 'WEEK' | 'MONTH' | 'CUSTOM'>('ALL')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [showCompleted, setShowCompleted] = useState(true)
  const [showFilters, setShowFilters] = useState(false)

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

  // 筛选任务
  const filteredTodos = useMemo(() => {
    return todos.filter(todo => {
      // 关键词搜索
      if (keyword.trim()) {
        const searchLower = keyword.toLowerCase()
        const matchTitle = todo.title.toLowerCase().includes(searchLower)
        const matchDesc = todo.description?.toLowerCase().includes(searchLower)
        if (!matchTitle && !matchDesc) return false
      }

      // 优先级筛选
      if (selectedPriority !== 'ALL' && todo.priority !== selectedPriority) {
        return false
      }

      // 分类筛选
      if (selectedCategoryId !== 'ALL') {
        if (selectedCategoryId === 'NONE' && todo.categoryId) return false
        if (selectedCategoryId !== 'NONE' && todo.categoryId !== selectedCategoryId) return false
      }

      // 时间筛选
      if (dateRange !== 'ALL' && todo.dueDate) {
        const dueDate = new Date(todo.dueDate)
        const today = new Date()
        today.setHours(0, 0, 0, 0)

        if (dateRange === 'TODAY') {
          const tomorrow = new Date(today)
          tomorrow.setDate(tomorrow.getDate() + 1)
          if (dueDate < today || dueDate >= tomorrow) return false
        } else if (dateRange === 'WEEK') {
          const weekEnd = new Date(today)
          weekEnd.setDate(weekEnd.getDate() + 7)
          if (dueDate < today || dueDate >= weekEnd) return false
        } else if (dateRange === 'MONTH') {
          const monthEnd = new Date(today)
          monthEnd.setMonth(monthEnd.getMonth() + 1)
          if (dueDate < today || dueDate >= monthEnd) return false
        } else if (dateRange === 'CUSTOM') {
          if (startDate) {
            const start = new Date(startDate)
            start.setHours(0, 0, 0, 0)
            if (dueDate < start) return false
          }
          if (endDate) {
            const end = new Date(endDate)
            end.setHours(23, 59, 59, 999)
            if (dueDate > end) return false
          }
        }
      } else if (dateRange !== 'ALL' && !todo.dueDate) {
        return false
      }

      // 完成状态
      if (!showCompleted && todo.completed) return false

      return true
    }).sort((a, b) => {
      // 未完成的排前面
      if (a.completed !== b.completed) return a.completed ? 1 : -1
      // 按优先级排序
      return priorityOrder[b.priority] - priorityOrder[a.priority]
    })
  }, [todos, keyword, selectedPriority, selectedCategoryId, dateRange, startDate, endDate, showCompleted])

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

  const getCategoryById = (id: string): Category | undefined => {
    return categories.find(c => c.id === id)
  }

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    return date.toLocaleDateString('zh-CN', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const clearFilters = () => {
    setKeyword('')
    setSelectedPriority('ALL')
    setSelectedCategoryId('ALL')
    setDateRange('ALL')
    setStartDate('')
    setEndDate('')
    setShowCompleted(true)
  }

  const hasActiveFilters = keyword || selectedPriority !== 'ALL' || selectedCategoryId !== 'ALL' || dateRange !== 'ALL' || !showCompleted

  const TodoItem = ({ todo }: { todo: Todo }) => {
    const category = todo.categoryId ? getCategoryById(todo.categoryId) : null
    
    return (
      <div className={cn(
        'group flex items-start gap-3 p-4 bg-white rounded-2xl hover:bg-orange-50/50 transition-all border border-gray-100',
        todo.completed && 'opacity-60'
      )}>
        <button
          onClick={() => handleToggle(todo)}
          className={cn(
            'flex-shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all mt-0.5',
            todo.completed ? 'bg-orange-400 border-orange-400' : 'border-gray-300 hover:border-orange-400'
          )}
        >
          {todo.completed && <Check className="w-4 h-4 text-white" />}
        </button>
        <div className="flex-1 min-w-0">
          <h3 className={cn('text-gray-800 font-medium', todo.completed && 'line-through text-gray-500')}>
            {todo.title}
          </h3>
          {todo.description && (
            <p className="text-sm text-gray-500 mt-1 line-clamp-2">{todo.description}</p>
          )}
          <div className="flex items-center gap-2 mt-2 flex-wrap">
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
            {todo.dueDate && (
              <span className="flex items-center gap-1 text-xs text-gray-500">
                <Clock className="w-3 h-3" />
                {formatDate(todo.dueDate)}
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
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">所有任务</h1>
        <p className="text-gray-500">
          共 {todos.length} 个任务，筛选后显示 {filteredTodos.length} 个
        </p>
      </div>

      {/* 搜索栏 */}
      <div className="bg-white rounded-2xl shadow-lg shadow-orange-100/50 p-4 mb-6">
        <div className="flex gap-3 mb-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="搜索任务标题或描述..."
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 focus:border-orange-400 focus:ring-2 focus:ring-orange-100 outline-none transition-all"
            />
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={cn(
              'px-4 py-2.5 rounded-xl border flex items-center gap-2 transition-colors',
              showFilters || hasActiveFilters
                ? 'bg-orange-500 text-white border-orange-500'
                : 'border-gray-200 text-gray-600 hover:bg-gray-50'
            )}
          >
            <Filter className="w-4 h-4" />
            筛选
            {hasActiveFilters && <span className="w-2 h-2 rounded-full bg-white" />}
          </button>
        </div>

        {/* 筛选选项 */}
        {showFilters && (
          <div className="pt-4 border-t border-gray-100 space-y-4">
            {/* 优先级 */}
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">优先级</label>
              <div className="flex gap-2 flex-wrap">
                <button
                  onClick={() => setSelectedPriority('ALL')}
                  className={cn(
                    'px-3 py-1.5 rounded-full text-sm font-medium transition-colors',
                    selectedPriority === 'ALL' ? 'bg-orange-500 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  )}
                >
                  全部
                </button>
                {(['URGENT', 'HIGH', 'MEDIUM', 'LOW'] as Priority[]).map(p => (
                  <button
                    key={p}
                    onClick={() => setSelectedPriority(p)}
                    className={cn(
                      'px-3 py-1.5 rounded-full text-sm font-medium transition-colors',
                      selectedPriority === p ? priorityColors[p].replace('100', '500') + ' text-white' : priorityColors[p]
                    )}
                  >
                    {priorityLabels[p]}
                  </button>
                ))}
              </div>
            </div>

            {/* 分类 */}
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">分类</label>
              <div className="flex gap-2 flex-wrap">
                <button
                  onClick={() => setSelectedCategoryId('ALL')}
                  className={cn(
                    'px-3 py-1.5 rounded-full text-sm font-medium transition-colors',
                    selectedCategoryId === 'ALL' ? 'bg-orange-500 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  )}
                >
                  全部
                </button>
                <button
                  onClick={() => setSelectedCategoryId('NONE')}
                  className={cn(
                    'px-3 py-1.5 rounded-full text-sm font-medium transition-colors',
                    selectedCategoryId === 'NONE' ? 'bg-gray-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  )}
                >
                  未分类
                </button>
                {categories.map(category => (
                  <button
                    key={category.id}
                    onClick={() => setSelectedCategoryId(category.id)}
                    className="px-3 py-1.5 rounded-full text-sm font-medium transition-colors"
                    style={{
                      backgroundColor: selectedCategoryId === category.id ? category.color : `${category.color}20`,
                      color: selectedCategoryId === category.id ? 'white' : category.color
                    }}
                  >
                    {category.name}
                  </button>
                ))}
              </div>
            </div>

            {/* 时间范围 */}
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">时间范围</label>
              <div className="flex gap-2 flex-wrap items-center">
                {[
                  { value: 'ALL', label: '全部' },
                  { value: 'TODAY', label: '今天' },
                  { value: 'WEEK', label: '本周' },
                  { value: 'MONTH', label: '本月' },
                  { value: 'CUSTOM', label: '自定义' }
                ].map(option => (
                  <button
                    key={option.value}
                    onClick={() => setDateRange(option.value as typeof dateRange)}
                    className={cn(
                      'px-3 py-1.5 rounded-full text-sm font-medium transition-colors',
                      dateRange === option.value ? 'bg-orange-500 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    )}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
              {dateRange === 'CUSTOM' && (
                <div className="flex gap-3 mt-3">
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-500">从</span>
                    <input
                      type="date"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      className="px-3 py-1.5 rounded-lg border border-gray-200 text-sm"
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-500">到</span>
                    <input
                      type="date"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      className="px-3 py-1.5 rounded-lg border border-gray-200 text-sm"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* 显示已完成 */}
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-gray-700">显示已完成任务</label>
              <button
                onClick={() => setShowCompleted(!showCompleted)}
                className={cn(
                  'w-12 h-6 rounded-full transition-colors relative',
                  showCompleted ? 'bg-orange-500' : 'bg-gray-300'
                )}
              >
                <span className={cn(
                  'absolute top-1 w-4 h-4 rounded-full bg-white transition-transform',
                  showCompleted ? 'left-7' : 'left-1'
                )} />
              </button>
            </div>

            {/* 清除筛选 */}
            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="text-sm text-orange-500 hover:text-orange-600 flex items-center gap-1"
              >
                <X className="w-4 h-4" />
                清除所有筛选
              </button>
            )}
          </div>
        )}
      </div>

      {/* 任务列表 */}
      <div className="space-y-3">
        {filteredTodos.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 text-center">
            <Search className="w-12 h-12 mx-auto mb-3 text-gray-300" />
            <p className="text-gray-500">没有找到匹配的任务</p>
            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="mt-3 text-orange-500 hover:text-orange-600 text-sm"
              >
                清除筛选条件
              </button>
            )}
          </div>
        ) : (
          filteredTodos.map(todo => (
            <TodoItem key={todo.id} todo={todo} />
          ))
        )}
      </div>

      {/* 任务编辑器 */}
      <TodoEditor
        isOpen={isEditorOpen}
        onClose={handleCloseEditor}
        todo={editingTodo}
      />
    </div>
  )
}
