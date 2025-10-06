import { NextResponse } from 'next/server'

export async function GET() {
  return NextResponse.json({
    message: 'Environment test',
    DATABASE_URL: process.env.DATABASE_URL ? 'FOUND' : 'NOT FOUND',
    DATABASE_URL_LENGTH: process.env.DATABASE_URL?.length || 0,
    NODE_ENV: process.env.NODE_ENV,
    allEnvKeys: Object.keys(process.env).filter(key => key.includes('DATABASE') || key.includes('NEXTAUTH')),
    timestamp: new Date().toISOString()
  })
}
