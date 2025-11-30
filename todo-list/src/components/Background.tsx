'use client'

import { useStore } from '@/store/useStore'

export default function Background({ children }: { children: React.ReactNode }) {
  const { themeColor } = useStore()
  
  // 根据主题色生成背景渐变
  const bgGradient = `linear-gradient(to bottom, ${themeColor.light}, ${themeColor.primary}10, ${themeColor.light})`
  
  return (
    <div 
      className="min-h-screen relative overflow-hidden"
      style={{ background: bgGradient }}
    >
      {/* 云朵装饰 */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {/* 左上云朵 */}
        <div 
          className="absolute -top-10 -left-20 w-80 h-40 rounded-full blur-3xl"
          style={{ background: `linear-gradient(to right, ${themeColor.primary}40, ${themeColor.primary}20)` }}
        />
        <div 
          className="absolute top-20 -left-10 w-60 h-32 rounded-full blur-2xl"
          style={{ background: `linear-gradient(to right, ${themeColor.primary}30, ${themeColor.primary}15)` }}
        />
        
        {/* 右上云朵 */}
        <div 
          className="absolute -top-10 -right-20 w-80 h-40 rounded-full blur-3xl"
          style={{ background: `linear-gradient(to left, ${themeColor.primary}40, ${themeColor.primary}20)` }}
        />
        <div 
          className="absolute top-32 -right-10 w-60 h-32 rounded-full blur-2xl"
          style={{ background: `linear-gradient(to left, ${themeColor.primary}30, ${themeColor.primary}15)` }}
        />
        
        {/* 左下云朵 */}
        <div 
          className="absolute -bottom-10 -left-20 w-96 h-48 rounded-full blur-3xl"
          style={{ background: `linear-gradient(to right, ${themeColor.primary}40, ${themeColor.primary}20)` }}
        />
        <div 
          className="absolute bottom-20 left-10 w-72 h-36 rounded-full blur-2xl"
          style={{ background: `linear-gradient(to right, ${themeColor.primary}25, ${themeColor.primary}15)` }}
        />
        
        {/* 右下云朵 */}
        <div 
          className="absolute -bottom-10 -right-20 w-96 h-48 rounded-full blur-3xl"
          style={{ background: `linear-gradient(to left, ${themeColor.primary}40, ${themeColor.primary}20)` }}
        />
        <div 
          className="absolute bottom-32 right-10 w-72 h-36 rounded-full blur-2xl"
          style={{ background: `linear-gradient(to left, ${themeColor.primary}25, ${themeColor.primary}15)` }}
        />
        
        {/* 中间装饰 */}
        <div 
          className="absolute top-1/2 left-1/4 w-40 h-20 rounded-full blur-2xl"
          style={{ background: `${themeColor.primary}20` }}
        />
        <div 
          className="absolute top-1/3 right-1/4 w-32 h-16 rounded-full blur-2xl"
          style={{ background: `${themeColor.primary}20` }}
        />
      </div>
      
      {/* 邮件图标装饰 - 左侧 */}
      <div className="absolute left-8 top-1/2 -translate-y-1/2 hidden lg:block">
        <div 
          className="w-20 h-16 rounded-lg shadow-lg transform -rotate-12 relative"
          style={{ background: `linear-gradient(to bottom right, ${themeColor.primary}80, ${themeColor.accent})` }}
        >
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-12 h-8 border-2 border-white/80 rounded" />
          </div>
          <div className="absolute top-1 left-1/2 -translate-x-1/2 w-0 h-0 border-l-6 border-r-6 border-t-4 border-l-transparent border-r-transparent border-t-white/80" />
        </div>
      </div>
      
      {children}
    </div>
  )
}
