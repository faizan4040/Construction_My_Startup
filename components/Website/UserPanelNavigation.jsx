'use client'

import {
  USER_DASHBOARD,
  USER_ORDERS,
  USER_PROFILE,
  WEBSITE_LOGIN
} from '@/routes/WebsiteRoute'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import React from 'react'
import { Button } from '../ui/button'
import { useDispatch } from 'react-redux'
import axios from 'axios'
import { showToast } from '@/lib/showToast'
import { logout } from '@/store/reducer/authReducer'

import {
  LayoutDashboard,
  User,
  ShoppingBag,
  LogOut
} from 'lucide-react'

const UserPanelNavigation = () => {
  const pathname = usePathname()
  const dispatch = useDispatch()
  const router = useRouter()

  const handleLogout = async () => {
    try {
      const { data: logoutResponse } = await axios.post('/api/auth/logout')

      if (!logoutResponse.success) {
        throw new Error(logoutResponse.message)
      }

      dispatch(logout())
      showToast('success', logoutResponse.message)
      router.push(WEBSITE_LOGIN)
    } catch (error) {
      showToast('error', error.message)
    }
  }

  const navItemClass = (path) =>
    `group flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all
     ${pathname.startsWith(path)
        ? 'bg-primary text-white shadow'
        : 'text-gray-600 hover:bg-primary/10 hover:text-primary'
     }`

  return (
    <aside className="bg-white border rounded-xl p-4 shadow-sm">
      <h4 className="text-xs font-semibold text-gray-400 uppercase mb-4 tracking-wider">
        Account Menu
      </h4>

      <nav className="space-y-2">
        <Link href={USER_DASHBOARD} className={navItemClass(USER_DASHBOARD)}>
          <LayoutDashboard size={18} />
          Dashboard
        </Link>

        <Link href={USER_PROFILE} className={navItemClass(USER_PROFILE)}>
          <User size={18} />
          Profile
        </Link>

        <Link href={USER_ORDERS} className={navItemClass(USER_ORDERS)}>
          <ShoppingBag size={18} />
          Orders
        </Link>
      </nav>

      <div className="border-t mt-6 pt-4">
        <Button
          type="button"
          variant="destructive"
          className="w-full flex items-center gap-2"
          onClick={handleLogout}
        >
          <LogOut size={16} />
          Logout
        </Button>
      </div>
    </aside>
  )
}

export default UserPanelNavigation
