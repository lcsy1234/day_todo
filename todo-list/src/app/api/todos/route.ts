import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

// 获取所有待办事项
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')

    if (!userId) {
      return NextResponse.json(
        { error: '用户ID不能为空' },
        { status: 400 }
      )
    }

    const todos = await prisma.todo.findMany({
      where: { userId },
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
    const { title, description, priority, dueDate, categoryId, userId } = await request.json()

    if (!title || !userId) {
      return NextResponse.json(
        { error: '标题和用户ID不能为空' },
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
        userId
      },
      include: { category: true }
    })

    // 增加用户积分
    await prisma.user.update({
      where: { id: userId },
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
