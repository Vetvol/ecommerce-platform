import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

// Force fresh build

export async function GET() {
  try {
    if (!db) {
      return NextResponse.json(
        { message: 'Database not available' },
        { status: 500 }
      )
    }

    const products = await db.product.findMany({
      orderBy: {
        createdAt: 'desc'
      }
    })

    return NextResponse.json(products)
  } catch (error) {
    console.error('Error fetching products:', error)
    return NextResponse.json(
      { error: 'Failed to fetch products' },
      { status: 500 }
    )
  }
}
