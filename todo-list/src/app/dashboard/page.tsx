'use client'

import { useState, useEffect } from 'react'
import { Link2 } from 'lucide-react'
import TodoList from '@/components/TodoList'
import TodoEditor from '@/components/TodoEditor'
import { useStore, Todo } from '@/store/useStore'

export default function DashboardPage() {
  const { user, setTodos, setCategories } = useStore()
  const [isEditorOpen, setIsEditorOpen] = useState(false)
  const [editingTodo, setEditingTodo] = useState<Todo | null>(null)

  useEffect(() => {
    if (user) {
      fetchTodos()
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

  const today = new Date()
  const dateStr = today.toLocaleDateString('zh-CN', {
    month: 'long',
    day: 'numeric',
    weekday: 'long'
  })

  return (
    <div className="max-w-md mx-auto px-4 pt-6">
      {/* 头部 */}
      <div className="mb-6">
        <div className="flex items-center gap-2 text-sm text-gray-500 mb-1">
          <span>{dateStr}</span>
        </div>
        <div className="flex items-center gap-2">
          <h1 className="text-3xl font-bold text-gray-800">今日</h1>
          <button className="p-1 rounded-full hover:bg-orange-100 transition-colors">
            <Link2 className="w-5 h-5 text-gray-400" />
          </button>
        </div>
        <p className="text-sm text-gray-500 mt-2">
          今天清晨今天 动起来吧
          <br />
          这道人应该做义，只需要需要应该义义。
        </p>
      </div>

      {/* 任务列表 */}
      <TodoList onAddTodo={handleAddTodo} onEditTodo={handleEditTodo} />

      {/* 任务编辑器 */}
      <TodoEditor
        isOpen={isEditorOpen}
        onClose={handleCloseEditor}
        todo={editingTodo}
      />
    </div>
  )
}
