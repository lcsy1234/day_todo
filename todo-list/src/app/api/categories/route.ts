import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

// 获取用户的所有分类
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')

    if (!userId) {
      return NextResponse.json(
        { error: '缺少用户ID' },
        { status: 400 }
      )
    }

    const categories = await prisma.category.findMany({
      where: { userId },
      orderBy: { createdAt: 'asc' }
    })

    return NextResponse.json({ categories })
  } catch (error) {
    console.error('Get categories error:', error)
    return NextResponse.json(
      { error: '获取分类失败' },
      { status: 500 }
    )
  }
}

// 创建新分类
export async function POST(request: NextRequest) {
  try {
    const { name, color, userId } = await request.json()

    if (!name || !userId) {
      return NextResponse.json(
        { error: '分类名称和用户ID不能为空' },
        { status: 400 }
      )
    }

    // 检查是否已存在同名分类
    const existing = await prisma.category.findFirst({
      where: { name, userId }
    })

    if (existing) {
      return NextResponse.json(
        { error: '该分类名称已存在' },
        { status: 400 }
      )
    }

    const category = await prisma.category.create({
      data: {
        name,
        color: color || '#FF9500',
        userId
      }
    })

    return NextResponse.json({ category })
  } catch (error) {
    console.error('Create category error:', error)
    return NextResponse.json(
      { error: '创建分类失败' },
      { status: 500 }
    )
  }
}
