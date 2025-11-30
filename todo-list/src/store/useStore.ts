import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'

export type Priority = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT'

export interface Todo {
  id: string
  title: string
  description?: string
  completed: boolean
  priority: Priority
  dueDate?: string
  categoryId?: string
  createdAt: string
  updatedAt: string
}

export interface Category {
  id: string
  name: string
  color: string
}

export interface User {
  id: string
  email?: string
  name?: string
  isGuest: boolean
  points: number
}

export interface ThemeColor {
  name: string
  primary: string
  light: string
  accent: string
}

interface AppState {
  user: User | null
  todos: Todo[]
  categories: Category[]
  isLoading: boolean
  hasHydrated: boolean
  themeColor: ThemeColor
  sortBy: 'priority' | 'dueDate' | 'createdAt' | 'title'
  sortOrder: 'asc' | 'desc'
  filterCategory: string | null
  
  // Actions
  setHasHydrated: (state: boolean) => void
  setThemeColor: (color: ThemeColor) => void
  setUser: (user: User | null) => void
  setTodos: (todos: Todo[]) => void
  addTodo: (todo: Todo) => void
  updateTodo: (id: string, updates: Partial<Todo>) => void
  deleteTodo: (id: string) => void
  toggleTodo: (id: string) => void
  setCategories: (categories: Category[]) => void
  addCategory: (category: Category) => void
  deleteCategory: (id: string) => void
  setLoading: (loading: boolean) => void
  setSortBy: (sortBy: 'priority' | 'dueDate' | 'createdAt' | 'title') => void
  setSortOrder: (order: 'asc' | 'desc') => void
  setFilterCategory: (categoryId: string | null) => void
  addPoints: (points: number) => void
  logout: () => void
}

// 默认主题色
const defaultTheme: ThemeColor = {
  name: '活力橙',
  primary: '#FF9500',
  light: '#FFF7ED',
  accent: '#EA580C'
}

export const useStore = create<AppState>()(
  persist(
    (set) => ({
      user: null,
      todos: [],
      categories: [],
      isLoading: false,
      hasHydrated: false,
      themeColor: defaultTheme,
      sortBy: 'createdAt',
      sortOrder: 'desc',
      filterCategory: null,

      setHasHydrated: (state) => set({ hasHydrated: state }),
      setThemeColor: (themeColor) => set({ themeColor }),
      setUser: (user) => set({ user }),
      
      setTodos: (todos) => set({ todos }),
      
      addTodo: (todo) => set((state) => ({ 
        todos: [todo, ...state.todos] 
      })),
      
      updateTodo: (id, updates) => set((state) => ({
        todos: state.todos.map((todo) =>
          todo.id === id ? { ...todo, ...updates, updatedAt: new Date().toISOString() } : todo
        )
      })),
      
      deleteTodo: (id) => set((state) => ({
        todos: state.todos.filter((todo) => todo.id !== id)
      })),
      
      toggleTodo: (id) => set((state) => ({
        todos: state.todos.map((todo) =>
          todo.id === id ? { ...todo, completed: !todo.completed, updatedAt: new Date().toISOString() } : todo
        )
      })),
      
      setCategories: (categories) => set({ categories }),
      
      addCategory: (category) => set((state) => ({
        categories: [...state.categories, category]
      })),
      
      deleteCategory: (id) => set((state) => ({
        categories: state.categories.filter((cat) => cat.id !== id)
      })),
      
      setLoading: (isLoading) => set({ isLoading }),
      
      setSortBy: (sortBy) => set({ sortBy }),
      
      setSortOrder: (sortOrder) => set({ sortOrder }),
      
      setFilterCategory: (filterCategory) => set({ filterCategory }),
      
      addPoints: (points) => set((state) => ({
        user: state.user ? { ...state.user, points: state.user.points + points } : null
      })),
      
      logout: () => set({ user: null, todos: [], categories: [] })
    }),
    {
      name: 'todo-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ 
        user: state.user,
        themeColor: state.themeColor,
        sortBy: state.sortBy,
        sortOrder: state.sortOrder
      }),
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true)
      }
    }
  )
)
