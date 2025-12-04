import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { verifyRefreshToken } from '@/lib/jwt'

export async function POST(request: NextRequest) {
  try {
    // 从 cookie 中获取 refresh token
    const refreshToken = request.cookies.get('refreshToken')?.value

    if (refreshToken) {
      // 验证并删除该 Refresh Token
      const decoded = verifyRefreshToken(refreshToken)
      if (decoded) {
        await prisma.refreshToken.deleteMany({
          where: { token: refreshToken }
        })
      }
    }

    // 创建响应并清除 cookie
    const response = NextResponse.json({ message: '登出成功' })
    response.cookies.set('refreshToken', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 0 // 立即过期
    })

    return response
  } catch (error) {
    console.error('Logout error:', error)
    // 即使出错也返回成功，确保客户端可以清理本地状态
    return NextResponse.json({ message: '登出成功' })
  }
}

// 登出所有设备（可选）
export async function DELETE(request: NextRequest) {
  try {
    const { userId } = await request.json()

    if (!userId) {
      return NextResponse.json(
        { error: '用户 ID 不能为空' },
        { status: 400 }
      )
    }

    // 删除该用户的所有 Refresh Token
    await prisma.refreshToken.deleteMany({
      where: { userId }
    })

    return NextResponse.json({ message: '已登出所有设备' })
  } catch (error) {
    console.error('Logout all error:', error)
    return NextResponse.json(
      { error: '操作失败' },
      { status: 500 }
    )
  }
}
