import jwt from 'jsonwebtoken'

// 从环境变量获取密钥，生产环境必须设置
const ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET || 'access-secret-key-change-in-production'
const REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET || 'refresh-secret-key-change-in-production'

// Token 过期时间
const ACCESS_TOKEN_EXPIRES_IN = '15m'  // 15分钟
const REFRESH_TOKEN_EXPIRES_IN = '7d'  // 7天

export interface TokenPayload {
  userId: string
  name?: string
  isGuest: boolean
}

export interface DecodedToken extends TokenPayload {
  iat: number
  exp: number
}

/**
 * 生成 Access Token
 */
export function generateAccessToken(payload: TokenPayload): string {
  return jwt.sign(payload, ACCESS_TOKEN_SECRET, {
    expiresIn: ACCESS_TOKEN_EXPIRES_IN
  })
}

/**
 * 生成 Refresh Token
 */
export function generateRefreshToken(payload: TokenPayload): string {
  return jwt.sign(payload, REFRESH_TOKEN_SECRET, {
    expiresIn: REFRESH_TOKEN_EXPIRES_IN
  })
}

/**
 * 生成双 Token
 */
export function generateTokens(payload: TokenPayload): {
  accessToken: string
  refreshToken: string
} {
  return {
    accessToken: generateAccessToken(payload),
    refreshToken: generateRefreshToken(payload)
  }
}

/**
 * 验证 Access Token
 */
export function verifyAccessToken(token: string): DecodedToken | null {
  try {
    return jwt.verify(token, ACCESS_TOKEN_SECRET) as DecodedToken
  } catch {
    return null
  }
}

/**
 * 验证 Refresh Token
 */
export function verifyRefreshToken(token: string): DecodedToken | null {
  try {
    return jwt.verify(token, REFRESH_TOKEN_SECRET) as DecodedToken
  } catch {
    return null
  }
}

/**
 * 从 Authorization header 中提取 token
 */
export function extractTokenFromHeader(authHeader: string | null): string | null {
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null
  }
  return authHeader.slice(7)
}

/**
 * 计算 Refresh Token 过期时间（用于数据库存储）
 */
export function getRefreshTokenExpiry(): Date {
  return new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7天后
}
