'use client'

import { useState, useMemo } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useStore } from '@/store/useStore'
import Button from './ui/Button'

interface CalendarProps {
  onSelectDate: (date: Date) => void
  onAddTask: (date: Date) => void
}

const weekDays = ['日', '一', '二', '三', '四', '五', '六']

export default function Calendar({ onSelectDate, onAddTask }: CalendarProps) {
  const { todos } = useStore()
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)

  const { year, month, days } = useMemo(() => {
    const year = currentDate.getFullYear()
    const month = currentDate.getMonth()
    
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    
    const startPadding = firstDay.getDay()
    const totalDays = lastDay.getDate()
    
    const days: (Date | null)[] = []
    
    // 填充前面的空白
    for (let i = 0; i < startPadding; i++) {
      days.push(null)
    }
    
    // 填充日期
    for (let i = 1; i <= totalDays; i++) {
      days.push(new Date(year, month, i))
    }
    
    return { year, month, days }
  }, [currentDate])

  const todosMap = useMemo(() => {
    const map = new Map<string, number>()
    todos.forEach(todo => {
      if (todo.dueDate) {
        const dateKey = new Date(todo.dueDate).toDateString()
        map.set(dateKey, (map.get(dateKey) || 0) + 1)
      }
    })
    return map
  }, [todos])

  const handlePrevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1))
  }

  const handleNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1))
  }

  const handleDateClick = (date: Date) => {
    setSelectedDate(date)
    onSelectDate(date)
  }

  const isToday = (date: Date) => {
    const today = new Date()
    return date.toDateString() === today.toDateString()
  }

  const isSelected = (date: Date) => {
    return selectedDate?.toDateString() === date.toDateString()
  }

  return (
    <div className="bg-white rounded-3xl shadow-lg shadow-orange-100/50 p-6">
      {/* 月份导航 */}
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={handlePrevMonth}
          className="p-2 rounded-full hover:bg-orange-100 transition-colors"
        >
          <ChevronLeft className="w-5 h-5 text-gray-600" />
        </button>
        <h2 className="text-lg font-bold text-gray-800">
          {year}年{month + 1}月
        </h2>
        <button
          onClick={handleNextMonth}
          className="p-2 rounded-full hover:bg-orange-100 transition-colors"
        >
          <ChevronRight className="w-5 h-5 text-gray-600" />
        </button>
      </div>

      {/* 星期标题 */}
      <div className="grid grid-cols-7 gap-1 mb-2">
        {weekDays.map(day => (
          <div key={day} className="text-center text-sm text-gray-500 py-2">
            {day}
          </div>
        ))}
      </div>

      {/* 日期网格 */}
      <div className="grid grid-cols-7 gap-1">
        {days.map((date, index) => (
          <div key={index} className="aspect-square p-1">
            {date && (
              <button
                onClick={() => handleDateClick(date)}
                className={cn(
                  'w-full h-full rounded-xl flex flex-col items-center justify-center transition-all',
                  isToday(date) && !isSelected(date) && 'bg-orange-100',
                  isSelected(date) && 'bg-gradient-to-br from-orange-400 to-orange-500 text-white shadow-lg',
                  !isToday(date) && !isSelected(date) && 'hover:bg-orange-50'
                )}
              >
                <span className={cn(
                  'text-sm font-medium',
                  isSelected(date) ? 'text-white' : isToday(date) ? 'text-orange-600' : 'text-gray-700'
                )}>
                  {date.getDate()}
                </span>
                {/* 任务指示器 */}
                {todosMap.has(date.toDateString()) && (
                  <div className={cn(
                    'w-1.5 h-1.5 rounded-full mt-0.5',
                    isSelected(date) ? 'bg-white' : 'bg-orange-400'
                  )} />
                )}
              </button>
            )}
          </div>
        ))}
      </div>

      {/* 添加任务按钮 */}
      <div className="mt-6">
        <Button
          onClick={() => selectedDate && onAddTask(selectedDate)}
          className="w-full"
          size="lg"
          disabled={!selectedDate}
        >
          添加任务
        </Button>
      </div>

      {/* 游客模式入口 */}
      <div className="mt-4 text-center">
        <span className="text-sm text-gray-400">游客模式入口</span>
      </div>
    </div>
  )
}
