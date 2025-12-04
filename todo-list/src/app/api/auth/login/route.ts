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

    // 查找用户（通过用户名）
    const user = await prisma.user.findFirst({
      where: { name: username },
      include: {
        todos: {
          orderBy: { createdAt: 'desc' }
        },
        categories: true
      }
    })

    if (!user || !user.password) {
      return NextResponse.json(
        { error: '用户名或密码错误' },
        { status: 401 }
      )
    }

    // 验证密码
    const isValid = await bcrypt.compare(password, user.password)

    if (!isValid) {
      return NextResponse.json(
        { error: '用户名或密码错误' },
        { status: 401 }
      )
    }

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

    // 清理该用户过期的 Refresh Token
    await prisma.refreshToken.deleteMany({
      where: {
        userId: user.id,
        expiresAt: { lt: new Date() }
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
      todos: user.todos.map(todo => ({
        id: todo.id,
        title: todo.title,
        description: todo.description,
        completed: todo.completed,
        priority: todo.priority,
        dueDate: todo.dueDate?.toISOString(),
        categoryId: todo.categoryId,
        createdAt: todo.createdAt.toISOString(),
        updatedAt: todo.updatedAt.toISOString()
      })),
      categories: user.categories
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
    console.error('Login error:', error)
    return NextResponse.json(
      { error: '登录失败，请重试' },
      { status: 500 }
    )
  }
}
