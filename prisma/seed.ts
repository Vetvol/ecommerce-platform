import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  // Create admin user
  const hashedPassword = await bcrypt.hash('admin123', 12)
  
  // Check if admin user already exists
  const existingAdmin = await prisma.user.findUnique({
    where: { email: 'admin@example.com' }
  })

  if (!existingAdmin) {
    await prisma.user.create({
      data: {
        email: 'admin@example.com',
        name: 'Admin User',
        password: hashedPassword,
        role: 'ADMIN',
      },
    })
  }

  // Create sample products
  const products = [
    {
      name: 'Wireless Headphones',
      description: 'High-quality wireless headphones with noise cancellation',
      price: 199.99,
      image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500',
      category: 'Electronics',
      stock: 50,
      featured: true,
    },
    {
      name: 'Smart Watch',
      description: 'Advanced smartwatch with health tracking and GPS',
      price: 299.99,
      image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500',
      category: 'Electronics',
      stock: 30,
      featured: true,
    },
    {
      name: 'Laptop Backpack',
      description: 'Durable laptop backpack with multiple compartments',
      price: 79.99,
      image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=500',
      category: 'Accessories',
      stock: 100,
      featured: false,
    },
    {
      name: 'Coffee Maker',
      description: 'Programmable coffee maker with built-in grinder',
      price: 149.99,
      image: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=500',
      category: 'Home & Kitchen',
      stock: 25,
      featured: true,
    },
    {
      name: 'Running Shoes',
      description: 'Comfortable running shoes with excellent cushioning',
      price: 129.99,
      image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500',
      category: 'Sports',
      stock: 75,
      featured: false,
    },
    {
      name: 'Bluetooth Speaker',
      description: 'Portable Bluetooth speaker with 360-degree sound',
      price: 89.99,
      image: 'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=500',
      category: 'Electronics',
      stock: 60,
      featured: true,
    },
  ]

  for (const product of products) {
    // Check if product already exists
    const existingProduct = await prisma.product.findFirst({
      where: { name: product.name }
    })

    if (!existingProduct) {
      await prisma.product.create({
        data: product,
      })
    }
  }

  console.log('Database seeded successfully!')
  console.log('Admin user created: admin@example.com / admin123')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
