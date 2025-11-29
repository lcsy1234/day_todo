import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

// 更新分类
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const { name, color } = await request.json()

    const category = await prisma.category.update({
      where: { id },
      data: {
        ...(name && { name }),
        ...(color && { color })
      }
    })

    return NextResponse.json({ category })
  } catch (error) {
    console.error('Update category error:', error)
    return NextResponse.json(
      { error: '更新分类失败' },
      { status: 500 }
    )
  }
}

// 删除分类
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    // 先将该分类下的任务的 categoryId 设为 null
    await prisma.todo.updateMany({
      where: { categoryId: id },
      data: { categoryId: null }
    })

    await prisma.category.delete({
      where: { id }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Delete category error:', error)
    return NextResponse.json(
      { error: '删除分类失败' },
      { status: 500 }
    )
  }
}
