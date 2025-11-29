import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const { guestId } = await request.json()

    if (!guestId) {
      return NextResponse.json(
        { error: '游客ID不能为空' },
        { status: 400 }
      )
    }

    // 查找或创建游客用户
    let user = await prisma.user.findUnique({
      where: { guestId }
    })

    if (!user) {
      user = await prisma.user.create({
        data: {
          guestId,
          isGuest: true,
          name: '游客',
          points: 50 // 游客初始积分
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
    }

    const categories = await prisma.category.findMany({
      where: { userId: user.id }
    })

    const todos = await prisma.todo.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        isGuest: true,
        points: user.points
      },
      todos: todos.map(todo => ({
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
      categories
    })
  } catch (error) {
    console.error('Guest login error:', error)
    return NextResponse.json(
      { error: '游客登录失败，请重试' },
      { status: 500 }
    )
  }
}
