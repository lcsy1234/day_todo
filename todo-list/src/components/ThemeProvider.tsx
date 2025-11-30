'use client'

import { useEffect } from 'react'
import { useStore } from '@/store/useStore'
import { applyTheme } from './ThemeSelector'

export default function ThemeProvider({ children }: { children: React.ReactNode }) {
  const { themeColor, hasHydrated } = useStore()

  useEffect(() => {
    if (hasHydrated && themeColor) {
      applyTheme(themeColor)
    }
  }, [themeColor, hasHydrated])

  return <>{children}</>
}
