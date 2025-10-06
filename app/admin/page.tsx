import { redirect } from 'next/navigation'
import { getServerSession } from 'next-auth'
import { db } from '@/lib/db'
import AdminDashboard from '@/components/AdminDashboard'

export default async function AdminPage() {
  const session = await getServerSession()

  // Redirect if not authenticated or not admin
  if (!session || session.user.role !== 'ADMIN') {
    redirect('/auth/signin')
  }

  // Get dashboard data
  if (!db) {
    redirect('/')
  }

  const [products, users, orders] = await Promise.all([
    db.product.findMany({
      orderBy: { createdAt: 'desc' },
      take: 10
    }),
    db.user.findMany({
      orderBy: { createdAt: 'desc' },
      take: 10
    }),
    db.order.findMany({
      orderBy: { createdAt: 'desc' },
      take: 10
    })
  ])

  const stats = {
    totalProducts: await db.product.count(),
    totalUsers: await db.user.count(),
    totalOrders: await db.order.count(),
    totalRevenue: await db.order.aggregate({
      _sum: { total: true }
    })
  }

  return (
    <AdminDashboard 
      products={products}
      users={users}
      orders={orders}
      stats={stats}
    />
  )
}
