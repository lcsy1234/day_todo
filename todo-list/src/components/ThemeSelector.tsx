'use client'

import { useState } from 'react'
import { Palette, Check, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useStore } from '@/store/useStore'

interface ThemeSelectorProps {
  isOpen: boolean
  onClose: () => void
}

// 预设主题色
const themeColors = [
  { name: '活力橙', primary: '#FF9500', light: '#FFF7ED', accent: '#EA580C' },
  { name: '天空蓝', primary: '#3B82F6', light: '#EFF6FF', accent: '#1D4ED8' },
  { name: '森林绿', primary: '#22C55E', light: '#F0FDF4', accent: '#15803D' },
  { name: '优雅紫', primary: '#A855F7', light: '#FAF5FF', accent: '#7C3AED' },
  { name: '玫瑰红', primary: '#F43F5E', light: '#FFF1F2', accent: '#E11D48' },
  { name: '青色', primary: '#06B6D4', light: '#ECFEFF', accent: '#0891B2' },
  { name: '琥珀黄', primary: '#F59E0B', light: '#FFFBEB', accent: '#D97706' },
  { name: '石墨灰', primary: '#6B7280', light: '#F9FAFB', accent: '#374151' },
]

export default function ThemeSelector({ isOpen, onClose }: ThemeSelectorProps) {
  const { themeColor, setThemeColor } = useStore()
  const [selectedColor, setSelectedColor] = useState(themeColor || themeColors[0])

  const handleSave = () => {
    setThemeColor(selectedColor)
    // 应用主题色到 CSS 变量
    applyTheme(selectedColor)
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={onClose} />
      
      <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-md mx-4">
        {/* 头部 */}
        <div className="flex items-center justify-between p-4 border-b border-gray-100">
          <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
            <Palette className="w-5 h-5" style={{ color: selectedColor.primary }} />
            选择主题色
          </h2>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-100">
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* 预览区域 */}
        <div className="p-4 border-b border-gray-100">
          <div 
            className="rounded-2xl p-4 transition-colors"
            style={{ backgroundColor: selectedColor.light }}
          >
            <div className="flex items-center gap-3 mb-3">
              <div 
                className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold"
                style={{ backgroundColor: selectedColor.primary }}
              >
                T
              </div>
              <div>
                <p className="font-medium text-gray-800">预览效果</p>
                <p className="text-sm text-gray-500">这是主题色的预览</p>
              </div>
            </div>
            <div className="flex gap-2">
              <button 
                className="px-4 py-2 rounded-full text-white text-sm font-medium"
                style={{ backgroundColor: selectedColor.primary }}
              >
                主要按钮
              </button>
              <button 
                className="px-4 py-2 rounded-full text-sm font-medium"
                style={{ backgroundColor: `${selectedColor.primary}20`, color: selectedColor.primary }}
              >
                次要按钮
              </button>
            </div>
          </div>
        </div>

        {/* 颜色选择 */}
        <div className="p-4">
          <p className="text-sm font-medium text-gray-700 mb-3">选择颜色</p>
          <div className="grid grid-cols-4 gap-3">
            {themeColors.map((color) => (
              <button
                key={color.name}
                onClick={() => setSelectedColor(color)}
                className={cn(
                  'flex flex-col items-center gap-2 p-3 rounded-xl transition-all',
                  selectedColor.name === color.name 
                    ? 'bg-gray-100 ring-2 ring-offset-2'
                    : 'hover:bg-gray-50'
                )}
                style={{ 
                  // @ts-ignore - ringColor is a valid CSS property
                  '--tw-ring-color': selectedColor.name === color.name ? color.primary : undefined 
                } as React.CSSProperties}
              >
                <div 
                  className="w-10 h-10 rounded-full flex items-center justify-center"
                  style={{ backgroundColor: color.primary }}
                >
                  {selectedColor.name === color.name && (
                    <Check className="w-5 h-5 text-white" />
                  )}
                </div>
                <span className="text-xs text-gray-600">{color.name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* 底部按钮 */}
        <div className="p-4 border-t border-gray-100 flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 text-gray-600 font-medium hover:bg-gray-50 transition-colors"
          >
            取消
          </button>
          <button
            onClick={handleSave}
            className="flex-1 px-4 py-2.5 rounded-xl text-white font-medium transition-colors"
            style={{ backgroundColor: selectedColor.primary }}
          >
            应用主题
          </button>
        </div>
      </div>
    </div>
  )
}

// 应用主题色到 CSS 变量
export function applyTheme(color: { primary: string; light: string; accent: string }) {
  if (typeof document === 'undefined') return
  
  const root = document.documentElement
  root.style.setProperty('--color-primary', color.primary)
  root.style.setProperty('--color-primary-light', color.light)
  root.style.setProperty('--color-primary-accent', color.accent)
  
  // 生成不同透明度的颜色
  root.style.setProperty('--color-primary-10', `${color.primary}1A`)
  root.style.setProperty('--color-primary-20', `${color.primary}33`)
  root.style.setProperty('--color-primary-50', `${color.primary}80`)
}
