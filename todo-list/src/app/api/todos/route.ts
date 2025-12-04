import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { authenticateRequest } from '@/lib/auth'

// 获取所有待办事项
export async function GET(request: NextRequest) {
  try {
    // JWT 鉴权
    const user = authenticateRequest(request)
    if (!user) {
      return NextResponse.json(
        { error: '未授权，请先登录', code: 'UNAUTHORIZED' },
        { status: 401 }
      )
    }

    const todos = await prisma.todo.findMany({
      where: { userId: user.userId },
      include: { category: true },
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json({
      todos: todos.map(todo => ({
        id: todo.id,
        title: todo.title,
        description: todo.description,
        completed: todo.completed,
        priority: todo.priority,
        dueDate: todo.dueDate?.toISOString(),
        categoryId: todo.categoryId,
        category: todo.category,
        createdAt: todo.createdAt.toISOString(),
        updatedAt: todo.updatedAt.toISOString()
      }))
    })
  } catch (error) {
    console.error('Get todos error:', error)
    return NextResponse.json(
      { error: '获取待办事项失败' },
      { status: 500 }
    )
  }
}

// 创建待办事项
export async function POST(request: NextRequest) {
  try {
    // JWT 鉴权
    const user = authenticateRequest(request)
    if (!user) {
      return NextResponse.json(
        { error: '未授权，请先登录', code: 'UNAUTHORIZED' },
        { status: 401 }
      )
    }

    const { title, description, priority, dueDate, categoryId } = await request.json()

    if (!title) {
      return NextResponse.json(
        { error: '标题不能为空' },
        { status: 400 }
      )
    }

    const todo = await prisma.todo.create({
      data: {
        title,
        description,
        priority: priority || 'MEDIUM',
        dueDate: dueDate ? new Date(dueDate) : null,
        categoryId,
        userId: user.userId
      },
      include: { category: true }
    })

    // 增加用户积分
    await prisma.user.update({
      where: { id: user.userId },
      data: { points: { increment: 5 } }
    })

    return NextResponse.json({
      todo: {
        id: todo.id,
        title: todo.title,
        description: todo.description,
        completed: todo.completed,
        priority: todo.priority,
        dueDate: todo.dueDate?.toISOString(),
        categoryId: todo.categoryId,
        category: todo.category,
        createdAt: todo.createdAt.toISOString(),
        updatedAt: todo.updatedAt.toISOString()
      }
    })
  } catch (error) {
    console.error('Create todo error:', error)
    return NextResponse.json(
      { error: '创建待办事项失败' },
      { status: 500 }
    )
  }
}
