import { NextResponse } from 'next/server'
import { Pool } from 'pg'

export async function GET() {
  try {
    // Test different connection string formats
    const connectionStrings = [
      // Your original connection string
      'postgresql://neondb_owner:npg_oduGLvThml90@ep-ancient-waterfall-adof470u-pooler.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require',
      // Without channel_binding
      'postgresql://neondb_owner:npg_oduGLvThml90@ep-ancient-waterfall-adof470u-pooler.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require',
      // With different SSL options
      'postgresql://neondb_owner:npg_oduGLvThml90@ep-ancient-waterfall-adof470u-pooler.c-2.us-east-1.aws.neon.tech/neondb?sslmode=prefer',
    ]

    const results = []

    for (let i = 0; i < connectionStrings.length; i++) {
      const connStr = connectionStrings[i]
      try {
        console.log(`Testing connection string ${i + 1}:`, connStr.substring(0, 50) + '...')
        
        const pool = new Pool({
          connectionString: connStr,
          ssl: {
            rejectUnauthorized: false
          },
          max: 1,
          connectionTimeoutMillis: 5000,
        })

        const client = await pool.connect()
        const result = await client.query('SELECT NOW() as current_time, version() as postgres_version')
        client.release()
        await pool.end()

        results.push({
          connectionString: i + 1,
          status: 'SUCCESS',
          data: result.rows[0]
        })
        
        // If one works, use it
        break
        
      } catch (error) {
        results.push({
          connectionString: i + 1,
          status: 'FAILED',
          error: error instanceof Error ? error.message : 'Unknown error'
        })
      }
    }

    return NextResponse.json({
      message: 'Neon connection test results',
      results: results,
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    return NextResponse.json(
      { 
        error: 'Connection test failed',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
