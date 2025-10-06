import { NextResponse } from 'next/server'
import { pool } from '@/lib/db'

export async function GET() {
  try {
    if (!pool) {
      return NextResponse.json(
        { 
          error: 'Database not connected',
          reason: 'DATABASE_URL not found or pool creation failed'
        },
        { status: 500 }
      )
    }

    // Test the connection
    const result = await pool.query('SELECT NOW() as current_time, version() as postgres_version')
    
    return NextResponse.json({
      success: true,
      message: 'Database connected successfully',
      data: result.rows[0]
    })
  } catch (error) {
    console.error('Database test error:', error)
    return NextResponse.json(
      { 
        error: 'Database connection failed',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
