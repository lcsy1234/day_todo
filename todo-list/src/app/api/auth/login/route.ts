import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import bcrypt from 'bcryptjs'

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

    return NextResponse.json({
      user: {
        id: user.id,
        name: user.name,
        isGuest: false,
        points: user.points
      },
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
  } catch (error) {
    console.error('Login error:', error)
    return NextResponse.json(
      { error: '登录失败，请重试' },
      { status: 500 }
    )
  }
}
