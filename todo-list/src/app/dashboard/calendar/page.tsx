'use client'

import { useState } from 'react'
import Calendar from '@/components/Calendar'
import TodoEditor from '@/components/TodoEditor'
import DateTaskPanel from '@/components/DateTaskPanel'
import Mascot from '@/components/Mascot'
import { Todo } from '@/store/useStore'

export default function CalendarPage() {
  const [isEditorOpen, setIsEditorOpen] = useState(false)
  const [isPanelOpen, setIsPanelOpen] = useState(false)
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [editingTodo, setEditingTodo] = useState<Todo | null>(null)

  const handleSelectDate = (date: Date) => {
    setSelectedDate(date)
    setIsPanelOpen(true)
  }

  const handleAddTask = () => {
    setEditingTodo(null)
    setIsEditorOpen(true)
  }

  const handleEditTask = (todo: Todo) => {
    setEditingTodo(todo)
    setIsEditorOpen(true)
  }

  const handleCloseEditor = () => {
    setIsEditorOpen(false)
    setEditingTodo(null)
  }

  const handleClosePanel = () => {
    setIsPanelOpen(false)
  }

  return (
    <div className="max-w-md mx-auto px-4 pt-6">
      {/* 吉祥物 */}
      <div className="flex justify-center mb-4">
        <Mascot size="lg" />
      </div>

      {/* 日历 */}
      <Calendar
        onSelectDate={handleSelectDate}
        onAddTask={(date) => {
          setSelectedDate(date)
          handleAddTask()
        }}
      />

      {/* 日期任务面板 */}
      <DateTaskPanel
        isOpen={isPanelOpen}
        onClose={handleClosePanel}
        selectedDate={selectedDate}
        onAddTask={handleAddTask}
        onEditTask={handleEditTask}
      />

      {/* 任务编辑器 */}
      <TodoEditor
        isOpen={isEditorOpen}
        onClose={handleCloseEditor}
        todo={editingTodo}
        selectedDate={selectedDate}
      />
    </div>
  )
}
