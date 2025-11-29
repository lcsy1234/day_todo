'use client'

import { useState } from 'react'
import Calendar from '@/components/Calendar'
import TodoEditor from '@/components/TodoEditor'
import Mascot from '@/components/Mascot'

export default function CalendarPage() {
  const [isEditorOpen, setIsEditorOpen] = useState(false)
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)

  const handleSelectDate = (date: Date) => {
    setSelectedDate(date)
  }

  const handleAddTask = (date: Date) => {
    setSelectedDate(date)
    setIsEditorOpen(true)
  }

  const handleCloseEditor = () => {
    setIsEditorOpen(false)
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
        onAddTask={handleAddTask}
      />

      {/* 任务编辑器 */}
      <TodoEditor
        isOpen={isEditorOpen}
        onClose={handleCloseEditor}
        selectedDate={selectedDate}
      />
    </div>
  )
}
