import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

interface RouteParams {
  params: Promise<{ id: string }>
}

// 获取单个待办事项
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params

    const todo = await prisma.todo.findUnique({
      where: { id },
      include: { category: true }
    })

    if (!todo) {
      return NextResponse.json(
        { error: '待办事项不存在' },
        { status: 404 }
      )
    }

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
    console.error('Get todo error:', error)
    return NextResponse.json(
      { error: '获取待办事项失败' },
      { status: 500 }
    )
  }
}

// 更新待办事项
export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params
    const updates = await request.json()

    const todo = await prisma.todo.update({
      where: { id },
      data: {
        ...updates,
        dueDate: updates.dueDate ? new Date(updates.dueDate) : undefined
      },
      include: { category: true }
    })

    // 如果完成任务，增加积分
    if (updates.completed === true) {
      await prisma.user.update({
        where: { id: todo.userId },
        data: { points: { increment: 10 } }
      })
    }

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
    console.error('Update todo error:', error)
    return NextResponse.json(
      { error: '更新待办事项失败' },
      { status: 500 }
    )
  }
}

// 删除待办事项
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params

    await prisma.todo.delete({
      where: { id }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Delete todo error:', error)
    return NextResponse.json(
      { error: '删除待办事项失败' },
      { status: 500 }
    )
  }
}
