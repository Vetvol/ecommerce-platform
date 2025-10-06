'use client'

import { useSession, signOut } from 'next-auth/react'
import { ShoppingCart, User, LogOut, LogIn } from 'lucide-react'
import Link from 'next/link'

export default function Navbar() {
  const { data: session, status } = useSession()

  return (
    <nav className="bg-white shadow-lg sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link href="/" className="flex-shrink-0 flex items-center">
              <span className="text-2xl font-bold text-indigo-600">E-Shop</span>
            </Link>
          </div>
          
          <div className="flex items-center space-x-4">
            <Link 
              href="/products" 
              className="text-gray-700 hover:text-indigo-600 px-3 py-2 rounded-md text-sm font-medium transition-colors"
            >
              Products
            </Link>
            
            <button className="text-gray-700 hover:text-indigo-600 p-2 rounded-md transition-colors">
              <ShoppingCart className="h-5 w-5" />
            </button>
            
            {status === 'loading' ? (
              <div className="animate-pulse bg-gray-200 h-8 w-8 rounded-full"></div>
            ) : session ? (
              <div className="flex items-center space-x-2">
                <div className="flex items-center space-x-2">
                  <User className="h-5 w-5 text-gray-700" />
                  <span className="text-sm text-gray-700">{session.user?.name || session.user?.email}</span>
                  {session.user?.role === 'ADMIN' && (
                    <span className="bg-red-100 text-red-800 text-xs px-2 py-1 rounded-full">Admin</span>
                  )}
                </div>
                <button
                  onClick={() => signOut()}
                  className="text-gray-700 hover:text-red-600 p-2 rounded-md transition-colors"
                  title="Sign Out"
                >
                  <LogOut className="h-5 w-5" />
                </button>
              </div>
            ) : (
              <Link
                href="/auth/signin"
                className="text-gray-700 hover:text-indigo-600 p-2 rounded-md transition-colors"
                title="Sign In"
              >
                <LogIn className="h-5 w-5" />
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}
