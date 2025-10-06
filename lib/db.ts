import { Pool } from 'pg'

// Create a connection pool to your Neon database
const createPool = () => {
  if (!process.env.DATABASE_URL) {
    console.warn('DATABASE_URL not found, database connection will not be created')
    return null
  }
  
  return new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
      rejectUnauthorized: false
    }
  })
}

export const pool = createPool()

// Simple query helper
export const query = async (text: string, params?: any[]) => {
  if (!pool) {
    throw new Error('Database not connected')
  }
  return pool.query(text, params)
}

// Database helper functions
export const db = {
  user: {
    findUnique: async (where: { where: { email: string } }) => {
      const result = await query('SELECT * FROM "User" WHERE email = $1', [where.where.email])
      return result.rows[0] || null
    },
    create: async (data: { data: { name: string; email: string; password: string; role: string } }) => {
      const { name, email, password, role } = data.data
      const result = await query(
        'INSERT INTO "User" (id, name, email, password, role, "createdAt", "updatedAt") VALUES ($1, $2, $3, $4, $5, NOW(), NOW()) RETURNING id, name, email, role, "createdAt"',
        [crypto.randomUUID(), name, email, password, role]
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
    findMany: async (options?: { where?: { userId: string }; include?: any; orderBy?: { createdAt: string }; take?: number }) => {
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