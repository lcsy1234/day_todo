'use client'

import { useState } from 'react'
import { X, Plus, Trash2, Edit2, Check, Tag } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useStore, Category } from '@/store/useStore'
import Button from './ui/Button'
import Input from './ui/Input'

interface CategoryManagerProps {
  isOpen: boolean
  onClose: () => void
}

const defaultColors = [
  '#FF9500', // 橙色
  '#4CAF50', // 绿色
  '#2196F3', // 蓝色
  '#9C27B0', // 紫色
  '#E91E63', // 粉色
  '#F44336', // 红色
  '#00BCD4', // 青色
  '#795548', // 棕色
]

export default function CategoryManager({ isOpen, onClose }: CategoryManagerProps) {
  const { user, categories, addCategory, deleteCategory, setCategories } = useStore()
  const [newName, setNewName] = useState('')
  const [newColor, setNewColor] = useState(defaultColors[0])
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editName, setEditName] = useState('')
  const [editColor, setEditColor] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  const handleAdd = async () => {
    if (!newName.trim() || !user) return
    
    setIsLoading(true)
    setError('')

    try {
      const res = await fetch('/api/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newName.trim(),
          color: newColor,
          userId: user.id
        })
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || '创建失败')
      }

      addCategory(data.category)
      setNewName('')
      setNewColor(defaultColors[0])
    } catch (err) {
      setError(err instanceof Error ? err.message : '创建失败')
    } finally {
      setIsLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('删除分类后，该分类下的任务将变为未分类。确定删除吗？')) return

    try {
      const res = await fetch(`/api/categories/${id}`, { method: 'DELETE' })
      if (res.ok) {
        deleteCategory(id)
      }
    } catch (error) {
      console.error('Delete category error:', error)
    }
  }

  const handleStartEdit = (category: Category) => {
    setEditingId(category.id)
    setEditName(category.name)
    setEditColor(category.color)
  }

  const handleSaveEdit = async () => {
    if (!editingId || !editName.trim()) return

    try {
      const res = await fetch(`/api/categories/${editingId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: editName.trim(),
          color: editColor
        })
      })

      if (res.ok) {
        const data = await res.json()
        setCategories(categories.map(c => c.id === editingId ? data.category : c))
        setEditingId(null)
      }
    } catch (error) {
      console.error('Update category error:', error)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={onClose} />
      
      <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-md mx-4 max-h-[80vh] flex flex-col">
        {/* 头部 */}
        <div className="flex items-center justify-between p-4 border-b border-gray-100">
          <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
            <Tag className="w-5 h-5 text-orange-500" />
            管理分类
          </h2>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-100">
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* 添加新分类 */}
        <div className="p-4 border-b border-gray-100">
          <div className="flex gap-2 mb-3">
            <Input
              type="text"
              placeholder="输入分类名称"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              className="flex-1"
            />
            <Button onClick={handleAdd} disabled={!newName.trim() || isLoading}>
              <Plus className="w-4 h-4" />
            </Button>
          </div>
          <div className="flex gap-2 flex-wrap">
            {defaultColors.map(color => (
              <button
                key={color}
                onClick={() => setNewColor(color)}
                className={cn(
                  'w-8 h-8 rounded-full transition-transform',
                  newColor === color && 'ring-2 ring-offset-2 ring-gray-400 scale-110'
                )}
                style={{ backgroundColor: color }}
              />
            ))}
          </div>
          {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
        </div>

        {/* 分类列表 */}
        <div className="flex-1 overflow-y-auto p-4">
          {categories.length === 0 ? (
            <div className="py-12 text-center text-gray-400">
              <Tag className="w-12 h-12 mx-auto mb-3 text-gray-300" />
              <p>还没有分类</p>
              <p className="text-sm mt-1">添加分类来组织你的任务</p>
            </div>
          ) : (
            <div className="space-y-2">
              {categories.map(category => (
                <div
                  key={category.id}
                  className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors"
                >
                  {editingId === category.id ? (
                    <>
                      <div
                        className="w-6 h-6 rounded-full flex-shrink-0"
                        style={{ backgroundColor: editColor }}
                      />
                      <input
                        type="text"
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        className="flex-1 px-2 py-1 rounded border border-gray-300 text-sm"
                        autoFocus
                      />
                      <div className="flex gap-1">
                        {defaultColors.slice(0, 4).map(color => (
                          <button
                            key={color}
                            onClick={() => setEditColor(color)}
                            className={cn(
                              'w-5 h-5 rounded-full',
                              editColor === color && 'ring-2 ring-offset-1 ring-gray-400'
                            )}
                            style={{ backgroundColor: color }}
                          />
                        ))}
                      </div>
                      <button
                        onClick={handleSaveEdit}
                        className="p-1.5 rounded-full hover:bg-green-100 text-green-600"
                      >
                        <Check className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setEditingId(null)}
                        className="p-1.5 rounded-full hover:bg-gray-200 text-gray-500"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </>
                  ) : (
                    <>
                      <div
                        className="w-6 h-6 rounded-full flex-shrink-0"
                        style={{ backgroundColor: category.color }}
                      />
                      <span className="flex-1 font-medium text-gray-700">{category.name}</span>
                      <button
                        onClick={() => handleStartEdit(category)}
                        className="p-1.5 rounded-full hover:bg-orange-100 text-gray-500 hover:text-orange-500"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(category.id)}
                        className="p-1.5 rounded-full hover:bg-red-100 text-gray-500 hover:text-red-500"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
