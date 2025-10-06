import { Pool } from 'pg'

// Create a connection pool to your Neon database
const createPool = () => {
  console.log('Checking DATABASE_URL:', process.env.DATABASE_URL ? 'EXISTS' : 'NOT FOUND')
  console.log('DATABASE_URL length:', process.env.DATABASE_URL?.length || 0)
  
  // Temporary hardcoded connection string for testing
  const connectionString = process.env.DATABASE_URL || 'postgresql://neondb_owner:npg_oduGLvThml90@ep-ancient-waterfall-adof470u-pooler.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require'
  
  if (!connectionString) {
    console.warn('No database connection string available')
    console.warn('Available env vars:', Object.keys(process.env).filter(key => key.includes('DATABASE')))
    return null
  }
  
  try {
    const pool = new Pool({
      connectionString: connectionString,
      ssl: {
        rejectUnauthorized: false
      }
    })
    console.log('Database pool created successfully')
    return pool
  } catch (error) {
    console.error('Failed to create database pool:', error)
    return null
  }
}

export const pool = createPool()

// Simple query helper
export const query = async (text: string, params?: any[]) => {
  if (!pool) {
    throw new Error('Database not connected')
  }
  return pool.query(text, params)
}

// Database helper functions that match your Neon schema
export const db = {
  user: {
    findUnique: async (where: { where: { email: string } }) => {
      const result = await query('SELECT * FROM "User" WHERE email = $1', [where.where.email])
      return result.rows[0] || null
    },
    create: async (data: { data: { name: string; email: string; password: string; role: string } }) => {
      const { name, email, password, role } = data.data
      const id = crypto.randomUUID()
      const result = await query(
        'INSERT INTO "User" (id, name, email, password, role, "createdAt", "updatedAt") VALUES ($1, $2, $3, $4, $5, NOW(), NOW()) RETURNING id, name, email, role, "createdAt"',
        [id, name, email, password, role]
      )
      return result.rows[0]
    },
    findMany: async (options?: { orderBy?: { createdAt: string }; take?: number }) => {
      let queryText = 'SELECT * FROM "User"'
      const params: any[] = []
      
      if (options?.orderBy) {
        queryText += ` ORDER BY "${options.orderBy.createdAt}" DESC`
      }
      
      if (options?.take) {
        queryText += ` LIMIT $1`
        params.push(options.take)
      }
      
      const result = await query(queryText, params)
      return result.rows
    },
    count: async () => {
      const result = await query('SELECT COUNT(*) FROM "User"')
      return parseInt(result.rows[0].count)
    }
  },
  product: {
    findMany: async (options?: { where?: { featured?: boolean }; orderBy?: { createdAt: string }; take?: number }) => {
      let queryText = 'SELECT * FROM "Product"'
      const params: any[] = []
      let paramCount = 0
      
      if (options?.where?.featured !== undefined) {
        queryText += ` WHERE featured = $${++paramCount}`
        params.push(options.where.featured)
      }
      
      if (options?.orderBy) {
        queryText += ` ORDER BY "${options.orderBy.createdAt}" DESC`
      }
      
      if (options?.take) {
        queryText += ` LIMIT $${++paramCount}`
        params.push(options.take)
      }
      
      const result = await query(queryText, params)
      return result.rows
    },
    count: async () => {
      const result = await query('SELECT COUNT(*) FROM "Product"')
      return parseInt(result.rows[0].count)
    }
  },
  order: {
    findMany: async (options?: { where?: { userId: string }; orderBy?: { createdAt: string }; take?: number }) => {
      let queryText = 'SELECT * FROM "Order"'
      const params: any[] = []
      let paramCount = 0
      
      if (options?.where?.userId) {
        queryText += ` WHERE "userId" = $${++paramCount}`
        params.push(options.where.userId)
      }
      
      if (options?.orderBy) {
        queryText += ` ORDER BY "${options.orderBy.createdAt}" DESC`
      }
      
      if (options?.take) {
        queryText += ` LIMIT $${++paramCount}`
        params.push(options.take)
      }
      
      const result = await query(queryText, params)
      
      // For now, return basic order data
      // TODO: Add proper include logic for user and items if needed
      return result.rows
    },
    count: async () => {
      const result = await query('SELECT COUNT(*) FROM "Order"')
      return parseInt(result.rows[0].count)
    },
    aggregate: async (options: { _sum: { total: boolean } }) => {
      const result = await query('SELECT SUM(total) as sum FROM "Order"')
      return { _sum: { total: parseFloat(result.rows[0].sum) || 0 } }
    }
  }
}