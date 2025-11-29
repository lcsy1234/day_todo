'use client'

import { useMemo, useState } from 'react'
import { ArrowUpDown, Filter, Plus } from 'lucide-react'
import { useStore, Todo, Priority } from '@/store/useStore'
import TodoItem from './TodoItem'
import Button from './ui/Button'

interface TodoListProps {
  onAddTodo: () => void
  onEditTodo: (todo: Todo) => void
}

const sortOptions = [
  { id: 'createdAt', label: '创建时间' },
  { id: 'priority', label: '重要性' },
  { id: 'dueDate', label: '截止日期' },
  { id: 'title', label: '标题' }
] as const

const priorityOrder: Record<Priority, number> = {
  URGENT: 4,
  HIGH: 3,
  MEDIUM: 2,
  LOW: 1
}

export default function TodoList({ onAddTodo, onEditTodo }: TodoListProps) {
  const { todos, sortBy, sortOrder, setSortBy, setSortOrder, filterCategory, categories } = useStore()
  const [showSortMenu, setShowSortMenu] = useState(false)

  const sortedTodos = useMemo(() => {
    let filtered = [...todos]
    
    // 按分类过滤
    if (filterCategory) {
      filtered = filtered.filter(todo => todo.categoryId === filterCategory)
    }

    // 排序
    filtered.sort((a, b) => {
      let comparison = 0
      
      switch (sortBy) {
        case 'priority':
          comparison = priorityOrder[b.priority] - priorityOrder[a.priority]
          break
        case 'dueDate':
          if (!a.dueDate && !b.dueDate) comparison = 0
          else if (!a.dueDate) comparison = 1
          else if (!b.dueDate) comparison = -1
          else comparison = new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()
          break
        case 'title':
          comparison = a.title.localeCompare(b.title, 'zh-CN')
          break
        case 'createdAt':
        default:
          comparison = new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      }
      
      return sortOrder === 'desc' ? -comparison : comparison
    })

    // 未完成的排在前面
    return filtered.sort((a, b) => {
      if (a.completed === b.completed) return 0
      return a.completed ? 1 : -1
    })
  }, [todos, sortBy, sortOrder, filterCategory])

  const incompleteTodos = sortedTodos.filter(t => !t.completed)
  const completedTodos = sortedTodos.filter(t => t.completed)

  const handleSortChange = (newSortBy: typeof sortBy) => {
    if (newSortBy === sortBy) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
    } else {
      setSortBy(newSortBy)
      setSortOrder('desc')
    }
    setShowSortMenu(false)
  }

  return (
    <div className="space-y-4">
      {/* 排序和筛选栏 */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="relative">
            <button
              onClick={() => setShowSortMenu(!showSortMenu)}
              className="flex items-center gap-2 px-4 py-2 bg-orange-100 text-orange-600 rounded-full text-sm font-medium hover:bg-orange-200 transition-colors"
            >
              <ArrowUpDown className="w-4 h-4" />
              切换排序
            </button>
            
            {showSortMenu && (
              <div className="absolute top-full left-0 mt-2 bg-white rounded-xl shadow-lg border border-gray-100 py-2 z-10 min-w-[140px]">
                {sortOptions.map(option => (
                  <button
                    key={option.id}
                    onClick={() => handleSortChange(option.id)}
                    className={`w-full px-4 py-2 text-left text-sm hover:bg-orange-50 transition-colors ${
                      sortBy === option.id ? 'text-orange-500 font-medium' : 'text-gray-600'
                    }`}
                  >
                    {option.label}
                    {sortBy === option.id && (
                      <span className="ml-2">{sortOrder === 'asc' ? '↑' : '↓'}</span>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>
          
          <button className="flex items-center gap-2 px-4 py-2 text-gray-500 rounded-full text-sm hover:bg-gray-100 transition-colors">
            <Filter className="w-4 h-4" />
            筛选
          </button>
        </div>

        <Button onClick={onAddTodo} size="sm">
          <Plus className="w-4 h-4 mr-1" />
          添加任务
        </Button>
      </div>

      {/* 任务列表 */}
      <div className="bg-white rounded-3xl shadow-lg shadow-orange-100/50 overflow-hidden">
        {sortedTodos.length === 0 ? (
          <div className="py-16 text-center text-gray-400">
            <p className="text-lg">暂无待办事项</p>
            <p className="text-sm mt-2">点击上方按钮添加新任务</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {/* 未完成任务 */}
            {incompleteTodos.map(todo => (
              <TodoItem key={todo.id} todo={todo} onEdit={onEditTodo} />
            ))}
            
            {/* 已完成任务 */}
            {completedTodos.length > 0 && (
              <>
                <div className="px-4 py-2 bg-gray-50 text-sm text-gray-500">
                  已完成 ({completedTodos.length})
                </div>
                {completedTodos.map(todo => (
                  <TodoItem key={todo.id} todo={todo} onEdit={onEditTodo} />
                ))}
              </>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
