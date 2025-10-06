import { redirect } from 'next/navigation'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'
import CustomerDashboard from '@/components/CustomerDashboard'

export default async function DashboardPage() {
  const session = await getServerSession(authOptions)

  // Redirect if not authenticated
  if (!session) {
    redirect('/auth/signin')
  }

  // Get user's orders
  const orders = await db.order.findMany({
    where: {
      userId: session.user.id
    },
    include: {
      items: {
        include: {
          product: {
            select: {
              name: true,
              image: true
            }
          }
        }
      }
    },
    orderBy: {
      createdAt: 'desc'
    }
  })

  return (
    <CustomerDashboard 
      orders={orders} 
      user={{
        id: session.user.id,
        email: session.user.email,
        name: session.user.name || null,
        role: session.user.role
      }} 
    />
  )
}
