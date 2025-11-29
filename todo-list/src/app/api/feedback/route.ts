import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const { type, content, imageUrl, userId } = await request.json()

    if (!type || !content || !userId) {
      return NextResponse.json(
        { error: '反馈类型、内容和用户ID不能为空' },
        { status: 400 }
      )
    }

    const feedback = await prisma.feedback.create({
      data: {
        type,
        content,
        imageUrl,
        userId
      }
    })

    return NextResponse.json({ feedback })
  } catch (error) {
    console.error('Create feedback error:', error)
    return NextResponse.json(
      { error: '提交反馈失败' },
      { status: 500 }
    )
  }
}
