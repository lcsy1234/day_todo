/**
 * API 请求工具 - 自动处理 JWT token 刷新
 * Access Token 存储在内存中（更安全，防止 XSS 攻击）
 * Refresh Token 存储在 HttpOnly Cookie（由服务端管理）
 */

// Access Token 存储在内存中
let accessToken: string | null = null

// 是否正在刷新 token
let isRefreshing = false
// 等待刷新完成的请求队列
let refreshSubscribers: ((token: string) => void)[] = []

/**
 * 获取 Access Token
 */
export function getAccessToken(): string | null {
  return accessToken
}

/**
 * 保存 Access Token
 */
export function saveAccessToken(token: string) {
  accessToken = token
}

/**
 * 清除 Access Token
 */
export function clearTokens() {
  accessToken = null
}

/**
 * 初始化认证状态
 * 页面刷新后通过 refresh token 重新获取 access token
 */
export async function initAuth(): Promise<boolean> {
  if (accessToken) return true
  
  try {
    const response = await fetch('/api/auth/refresh', {
      method: 'POST',
      credentials: 'include'
    })

    if (!response.ok) {
      return false
    }

    const data = await response.json()
    accessToken = data.accessToken
    return true
  } catch {
    return false
  }
}

/**
 * 订阅 token 刷新完成事件
 */
function subscribeTokenRefresh(callback: (token: string) => void) {
  refreshSubscribers.push(callback)
}

/**
 * 通知所有订阅者 token 已刷新
 */
function onTokenRefreshed(token: string) {
  refreshSubscribers.forEach(callback => callback(token))
  refreshSubscribers = []
}

/**
 * 刷新 Access Token
 * Refresh Token 会自动通过 cookie 发送
 */
async function refreshAccessToken(): Promise<string | null> {
  try {
    const response = await fetch('/api/auth/refresh', {
      method: 'POST',
      credentials: 'include' // 确保发送 cookie
    })

    if (!response.ok) {
      // Refresh token 无效，需要重新登录
      clearTokens()
      return null
    }

    const data = await response.json()
    saveAccessToken(data.accessToken)
    return data.accessToken
  } catch {
    clearTokens()
    return null
  }
}

/**
 * 带鉴权的 fetch 请求
 * 自动添加 Authorization header，并在 token 过期时自动刷新
 */
export async function authFetch(
  url: string,
  options: RequestInit = {}
): Promise<Response> {
  const accessToken = getAccessToken()

  // 添加 Authorization header
  const headers = new Headers(options.headers)
  if (accessToken) {
    headers.set('Authorization', `Bearer ${accessToken}`)
  }

  let response = await fetch(url, { ...options, headers })

  // 如果返回 401，尝试刷新 token
  if (response.status === 401) {
    if (!isRefreshing) {
      isRefreshing = true

      const newToken = await refreshAccessToken()
      isRefreshing = false

      if (newToken) {
        onTokenRefreshed(newToken)
        // 使用新 token 重试请求
        headers.set('Authorization', `Bearer ${newToken}`)
        response = await fetch(url, { ...options, headers })
      } else {
        // 刷新失败，触发登出
        window.dispatchEvent(new CustomEvent('auth:logout'))
      }
    } else {
      // 等待其他请求刷新完成
      const newToken = await new Promise<string>((resolve) => {
        subscribeTokenRefresh(resolve)
      })
      headers.set('Authorization', `Bearer ${newToken}`)
      response = await fetch(url, { ...options, headers })
    }
  }

  return response
}

/**
 * 便捷的 API 请求方法
 */
export const api = {
  async get<T>(url: string): Promise<T> {
    const response = await authFetch(url)
    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || '请求失败')
    }
    return response.json()
  },

  async post<T>(url: string, data?: unknown): Promise<T> {
    const response = await authFetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: data ? JSON.stringify(data) : undefined
    })
    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || '请求失败')
    }
    return response.json()
  },

  async put<T>(url: string, data?: unknown): Promise<T> {
    const response = await authFetch(url, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: data ? JSON.stringify(data) : undefined
    })
    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || '请求失败')
    }
    return response.json()
  },

  async delete<T>(url: string): Promise<T> {
    const response = await authFetch(url, { method: 'DELETE' })
    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || '请求失败')
    }
    return response.json()
  }
}
