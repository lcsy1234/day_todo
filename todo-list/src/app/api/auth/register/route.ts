import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import bcrypt from 'bcryptjs'
import { generateTokens, getRefreshTokenExpiry } from '@/lib/jwt'

export async function POST(request: NextRequest) {
  try {
    const { username, password } = await request.json()

    if (!username || !password) {
      return NextResponse.json(
        { error: '用户名和密码不能为空' },
        { status: 400 }
      )
    }

    if (username.length < 2 || username.length > 20) {
      return NextResponse.json(
        { error: '用户名长度需要在 2-20 个字符之间' },
        { status: 400 }
      )
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: '密码长度至少 6 位' },
        { status: 400 }
      )
    }

    // 检查用户名是否已存在
    const existingUser = await prisma.user.findFirst({
      where: { name: username }
    })

    if (existingUser) {
      return NextResponse.json(
        { error: '该用户名已被注册' },
        { status: 400 }
      )
    }

    // 加密密码
    const hashedPassword = await bcrypt.hash(password, 10)

    // 创建用户
    const user = await prisma.user.create({
      data: {
        name: username,
        password: hashedPassword,
        points: 100 // 初始积分
      }
    })

    // 创建默认分类
    await prisma.category.createMany({
      data: [
        { name: '工作', color: '#FF9500', userId: user.id },
        { name: '学习', color: '#4CAF50', userId: user.id },
        { name: '生活', color: '#2196F3', userId: user.id }
      ]
    })

    const categories = await prisma.category.findMany({
      where: { userId: user.id }
    })

    // 生成双 Token
    const { accessToken, refreshToken } = generateTokens({
      userId: user.id,
      name: user.name || undefined,
      isGuest: false
    })

    // 将 Refresh Token 存入数据库
    await prisma.refreshToken.create({
      data: {
        token: refreshToken,
        userId: user.id,
        expiresAt: getRefreshTokenExpiry()
      }
    })

    // 创建响应
    const response = NextResponse.json({
      user: {
        id: user.id,
        name: user.name,
        isGuest: false,
        points: user.points
      },
      accessToken,
      categories
    })

    // 将 Refresh Token 设置到 HttpOnly Cookie
    response.cookies.set('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 7 * 24 * 60 * 60 // 7天
    })

    return response
  } catch (error) {
    console.error('Register error:', error)
    return NextResponse.json(
      { error: '注册失败，请重试' },
      { status: 500 }
    )
  }
}
