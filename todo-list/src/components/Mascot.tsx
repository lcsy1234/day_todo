'use client'

import { cn } from '@/lib/utils'

interface MascotProps {
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

export default function Mascot({ size = 'md', className }: MascotProps) {
  const sizeClasses = {
    sm: 'w-16 h-16',
    md: 'w-24 h-24',
    lg: 'w-32 h-32'
  }

  return (
    <div className={cn('relative', sizeClasses[size], className)}>
      {/* 太阳吉祥物 */}
      <div className="absolute inset-0 animate-pulse">
        {/* 光芒 */}
        <div className="absolute inset-0 flex items-center justify-center">
          {[...Array(8)].map((_, i) => (
            <div
              key={i}
              className="absolute w-3 h-8 bg-gradient-to-t from-orange-300 to-orange-100 rounded-full"
              style={{
                transform: `rotate(${i * 45}deg) translateY(-120%)`,
                opacity: 0.8
              }}
            />
          ))}
        </div>
      </div>
      {/* 主体 */}
      <div className="absolute inset-2 bg-gradient-to-br from-orange-300 via-orange-400 to-orange-500 rounded-full shadow-lg shadow-orange-200">
        {/* 脸部 */}
        <div className="absolute inset-0 flex items-center justify-center">
          {/* 眼睛 */}
          <div className="flex gap-3 -mt-2">
            <div className="w-2 h-2 bg-gray-800 rounded-full" />
            <div className="w-2 h-2 bg-gray-800 rounded-full" />
          </div>
        </div>
        {/* 微笑 */}
        <div className="absolute bottom-1/3 left-1/2 -translate-x-1/2 w-6 h-3 border-b-2 border-gray-800 rounded-b-full" />
        {/* 腮红 */}
        <div className="absolute bottom-1/3 left-1/4 w-3 h-2 bg-orange-200/60 rounded-full" />
        <div className="absolute bottom-1/3 right-1/4 w-3 h-2 bg-orange-200/60 rounded-full" />
      </div>
    </div>
  )
}
