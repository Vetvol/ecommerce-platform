import { NextResponse } from 'next/server'

export async function GET() {
  // Force load environment variables
  const dotenv = require('dotenv')
  const path = require('path')
  
  // Try to load .env.local
  const envPath = path.join(process.cwd(), '.env.local')
  console.log('Looking for .env.local at:', envPath)
  
  try {
    const result = dotenv.config({ path: envPath })
    console.log('Dotenv result:', result)
  } catch (error) {
    console.log('Dotenv error:', error)
  }
  
  return NextResponse.json({
    message: 'Environment test',
    DATABASE_URL: process.env.DATABASE_URL ? 'FOUND' : 'NOT FOUND',
    DATABASE_URL_LENGTH: process.env.DATABASE_URL?.length || 0,
    NODE_ENV: process.env.NODE_ENV,
    allEnvKeys: Object.keys(process.env).filter(key => key.includes('DATABASE') || key.includes('NEXTAUTH'))
  })
}
