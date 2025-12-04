import { NextRequest, NextResponse } from 'next/server'
import { verifyAccessToken, extractTokenFromHeader, DecodedToken } from './jwt'

export interface AuthenticatedRequest extends NextRequest {
  user: DecodedToken
}

/**
 * 验证请求中的 Access Token
 * 返回解码后的用户信息，如果验证失败返回 null
 */
export function authenticateRequest(request: NextRequest): DecodedToken | null {
  const authHeader = request.headers.get('Authorization')
  const token = extractTokenFromHeader(authHeader)
  
  if (!token) {
    return null
  }
  
  return verifyAccessToken(token)
}

/**
 * 鉴权中间件包装器
 * 用于保护需要登录的 API 路由
 */
export function withAuth<T>(
  handler: (request: NextRequest, user: DecodedToken) => Promise<NextResponse<T>>
) {
  return async (request: NextRequest): Promise<NextResponse> => {
    const user = authenticateRequest(request)
    
    if (!user) {
      return NextResponse.json(
        { error: '未授权，请先登录', code: 'UNAUTHORIZED' },
        { status: 401 }
      )
    }
    
    return handler(request, user)
  }
}

/**
 * 检查用户是否有权限访问指定资源
 */
export function checkResourceOwnership(
  resourceUserId: string,
  currentUserId: string
): boolean {
  return resourceUserId === currentUserId
}

/**
 * 从请求中获取用户 ID（用于已验证的请求）
 */
export function getUserIdFromRequest(request: NextRequest): string | null {
  const user = authenticateRequest(request)
  return user?.userId || null
}
