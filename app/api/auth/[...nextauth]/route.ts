import NextAuth from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'

// Disable static generation for this route
export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

const handler = NextAuth({
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null
        }

        // For build-time, return null to prevent build errors
        if (process.env.NODE_ENV === 'production' && !process.env.DATABASE_URL) {
          return null
        }

        try {
          // Dynamic import to prevent build-time database access
          const { db } = await import('@/lib/db')
          const bcrypt = await import('bcryptjs')

          if (!db) return null

          const user = await db.user.findUnique({
            where: {
              email: credentials.email
            }
          })

          if (!user) {
            return null
          }

          const isPasswordValid = await bcrypt.compare(
            credentials.password,
            user.password
          )

          if (!isPasswordValid) {
            return null
          }

          return {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role,
          }
        } catch (error) {
          console.error('Auth error:', error)
          return null
        }
      }
    })
  ],
  session: {
    strategy: 'jwt'
  },
  callbacks: {
    async jwt({ token, user }: any) {
      if (user) {
        token.role = user.role
      }
      return token
    },
    async session({ session, token }: any) {
      if (token) {
        session.user.id = token.sub!
        session.user.role = token.role as string
      }
      return session
    }
  },
  pages: {
    signIn: '/auth/signin',
  },
  secret: process.env.NEXTAUTH_SECRET,
} as any)

export { handler as GET, handler as POST }