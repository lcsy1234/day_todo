import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { 
  verifyRefreshToken, 
  generateTokens, 
  getRefreshTokenExpiry 
} from '@/lib/jwt'

export async function POST(request: NextRequest) {
  try {
    // 从 cookie 中获取 refresh token
    const refreshToken = request.cookies.get('refreshToken')?.value

    if (!refreshToken) {
      return NextResponse.json(
        { error: 'Refresh token 不存在' },
        { status: 401 }
      )
    }

    // 验证 Refresh Token 签名
    const decoded = verifyRefreshToken(refreshToken)
    if (!decoded) {
      return NextResponse.json(
        { error: 'Refresh token 无效或已过期' },
        { status: 401 }
      )
    }

    // 检查数据库中是否存在该 token（防止重放攻击）
    const storedToken = await prisma.refreshToken.findUnique({
      where: { token: refreshToken },
      include: { user: true }
    })

    if (!storedToken) {
      return NextResponse.json(
        { error: 'Refresh token 不存在或已被撤销' },
        { status: 401 }
      )
    }

    // 检查 token 是否过期
    if (storedToken.expiresAt < new Date()) {
      // 删除过期的 token
      await prisma.refreshToken.delete({
        where: { id: storedToken.id }
      })
      return NextResponse.json(
        { error: 'Refresh token 已过期，请重新登录' },
        { status: 401 }
      )
    }

    const user = storedToken.user

    // 生成新的双 Token（Token Rotation）
    const newTokens = generateTokens({
      userId: user.id,
      name: user.name || undefined,
      isGuest: user.isGuest
    })

    // 删除旧的 Refresh Token
    await prisma.refreshToken.delete({
      where: { id: storedToken.id }
    })

    // 存储新的 Refresh Token
    await prisma.refreshToken.create({
      data: {
        token: newTokens.refreshToken,
        userId: user.id,
        expiresAt: getRefreshTokenExpiry()
      }
    })

    // 创建响应
    const response = NextResponse.json({
      accessToken: newTokens.accessToken,
      user: {
        id: user.id,
        name: user.name,
        isGuest: user.isGuest,
        points: user.points
      }
    })

    // 将新的 Refresh Token 设置到 HttpOnly Cookie
    response.cookies.set('refreshToken', newTokens.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 7 * 24 * 60 * 60 // 7天
    })

    return response
  } catch (error) {
    console.error('Token refresh error:', error)
    return NextResponse.json(
      { error: 'Token 刷新失败' },
      { status: 500 }
    )
  }
}
