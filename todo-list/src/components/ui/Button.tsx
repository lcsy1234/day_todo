'use client'

import { cn } from '@/lib/utils'
import { ButtonHTMLAttributes, forwardRef } from 'react'
import { useStore } from '@/store/useStore'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', children, style, ...props }, ref) => {
    const { themeColor } = useStore()
    
    const getVariantStyle = () => {
      if (variant === 'primary') {
        return {
          background: `linear-gradient(to right, ${themeColor.primary}, ${themeColor.accent})`,
          boxShadow: `0 10px 15px -3px ${themeColor.primary}33`
        }
      }
      if (variant === 'outline') {
        return {
          borderColor: themeColor.primary,
          color: themeColor.primary
        }
      }
      return {}
    }

    return (
      <button
        ref={ref}
        className={cn(
          'inline-flex items-center justify-center rounded-full font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed',
          {
            'text-white hover:opacity-90':
              variant === 'primary',
            'bg-gray-100 text-gray-700 hover:bg-gray-200 focus:ring-gray-400':
              variant === 'secondary',
            'border-2 hover:bg-opacity-10':
              variant === 'outline',
            'text-gray-600 hover:bg-gray-100 focus:ring-gray-400':
              variant === 'ghost',
          },
          {
            'px-3 py-1.5 text-sm': size === 'sm',
            'px-5 py-2.5 text-base': size === 'md',
            'px-8 py-3.5 text-lg': size === 'lg',
          },
          className
        )}
        style={{ ...getVariantStyle(), ...style }}
        {...props}
      >
        {children}
      </button>
    )
  }
)

Button.displayName = 'Button'

export default Button
