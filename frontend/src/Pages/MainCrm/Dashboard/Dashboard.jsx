import React, { useMemo, useState } from 'react'
import { NavLink, Outlet } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import DashboardIcon from '@mui/icons-material/Dashboard'
import QueryStats from '@mui/icons-material/QueryStats'
import Group from '@mui/icons-material/Group'
import Settings from '@mui/icons-material/Settings'
import Notifications from '@mui/icons-material/Notifications'
import ViewList from '@mui/icons-material/ViewList'
import Tune from '@mui/icons-material/Tune'
import MenuIcon from '@mui/icons-material/Menu'
import ChevronLeft from '@mui/icons-material/ChevronLeft'
import Logout from '@mui/icons-material/Logout'
 

const DashBoard = () => {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false)
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false)

  const navItems = useMemo(
    () => [
      { label: 'Dashboard', to: '/dashboard', Icon: DashboardIcon },
      { label: 'Analytics', to: '/dashboard/analytics', Icon: QueryStats },
      { label: 'Users', to: '/dashboard/users', Icon: Group },
      { label: 'Segments', to: '/dashboard/segments', Icon: ViewList },
      { label: 'Segment Builder', to: '/dashboard/segments/builder', Icon: Tune },
      { label: 'Settings', to: '/dashboard/settings', Icon: Settings },
      { label: 'Notifications', to: '/dashboard/notifications', Icon: Notifications },
    ],
    []
  )

  const SidebarContent = ({ collapsed }) => (
    <div className="flex h-full flex-col">
      {/* Brand */}
      <div className="flex items-center gap-3 px-4 py-4 border-b border-gray-100">
        <div className="w-9 h-9 bg-gradient-to-r from-orange-300 via-pink-400 to-purple-500 rounded-lg flex items-center justify-center shrink-0">
          <span className="text-white font-bold">D</span>
        </div>
        {!collapsed && <span className="text-lg font-semibold text-gray-900">DataPulse</span>}
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto px-3 py-4">
        <ul className="space-y-1">
          {navItems.map(({ label, to, Icon }) => (
            <li key={label}>
              <NavLink
                to={to}
                end={to === '/dashboard' || to === '/dashboard/segments'}
                className={({ isActive }) =>
                  [
                    'group flex items-center gap-3 rounded-lg px-3 py-2 transition-colors duration-200',
                    isActive ? 'bg-gradient-to-r from-orange-100 to-purple-100 text-gray-900 ring-1 ring-orange-200/60' : 'text-gray-600 hover:bg-white/70 hover:ring-1 hover:ring-gray-200',
                  ].join(' ')
                }
                onClick={() => setIsMobileSidebarOpen(false)}
              >
                <Icon className="text-gray-500 group-hover:text-gray-700" fontSize="small" />
                {!collapsed && <span className="font-medium">{label}</span>}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>

      {/* Profile */}
      <div className="mt-auto border-t border-gray-100 p-3">
        <div className="flex items-center gap-3 px-2">
          <div className="w-9 h-9 rounded-full bg-gradient-to-r from-orange-300 via-pink-400 to-purple-500 text-white flex items-center justify-center font-semibold">
            SJ
          </div>
          {!collapsed && (
            <div className="min-w-0">
              <p className="text-sm font-semibold text-gray-900 truncate">Sujal</p>
              <button className="flex items-center gap-1 text-xs text-gray-500 hover:text-gray-700 transition-colors">
                <Logout fontSize="inherit" />
                <span>Logout</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen relative">
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-br from-orange-100 via-white to-purple-100 dark:from-gray-950 dark:via-gray-950 dark:to-gray-900" />
        <div className="absolute -top-28 -left-28 w-[28rem] h-[28rem] rounded-full bg-purple-300/40 blur-3xl" />
      </div>
      {/* Top bar */}
      <div className="sticky top-0 z-30 flex items-center justify-between border-b border-gray-100 bg-gradient-to-r from-white/90 via-orange-50/80 to-purple-50/80 backdrop-blur px-4 py-3 md:pl-6">
        <div className="flex items-center gap-3">
          {/* Mobile: open sidebar */}
          <button
            className="md:hidden inline-flex items-center justify-center rounded-lg border border-gray-200 bg-white p-2 text-gray-700 hover:bg-gray-50"
            onClick={() => setIsMobileSidebarOpen(true)}
            aria-label="Open sidebar"
          >
            <MenuIcon fontSize="small" />
          </button>
          <div className="hidden md:flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-r from-orange-300 via-pink-400 to-purple-500 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold">D</span>
            </div>
            <span className="text-base font-semibold text-gray-900">Dashboard</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Desktop: collapse toggle */}
          <button
            className="hidden md:inline-flex items-center justify-center rounded-lg border border-gray-200 bg-white p-2 text-gray-700 hover:bg-gray-50"
            onClick={() => setIsSidebarCollapsed(v => !v)}
            aria-label="Toggle sidebar"
            title="Toggle sidebar"
          >
            <ChevronLeft
              className={isSidebarCollapsed ? 'rotate-180 transition-transform' : 'transition-transform'}
              fontSize="small"
            />
          </button>
        </div>
      </div>

      {/* Sidebar (desktop) */}
      <aside
        className={[
          'hidden md:flex fixed inset-y-0 left-0 z-40 border-r border-gray-100',
          'bg-gradient-to-b from-white via-orange-50 to-purple-50',
          isSidebarCollapsed ? 'w-20' : 'w-64',
        ].join(' ')}
      >
        <SidebarContent collapsed={isSidebarCollapsed} />
      </aside>

      {/* Sidebar (mobile off-canvas) */}
      <AnimatePresence>
        {isMobileSidebarOpen && (
          <>
            <motion.div
              key="backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 z-40 bg-black/30"
              onClick={() => setIsMobileSidebarOpen(false)}
            />
            <motion.aside
              key="mobile-sidebar"
              initial={{ x: -300 }}
              animate={{ x: 0 }}
              exit={{ x: -300 }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              className="fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-gray-100"
            >
              <SidebarContent collapsed={false} />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Main content */}
      <main className={[
        'px-4 py-6 md:pl-6 min-h-[calc(100vh-64px)] pb-10',
        isSidebarCollapsed ? 'md:ml-20' : 'md:ml-64',
      ].join(' ')}>
        <div className="max-w-7xl mx-auto">
          <Outlet />
        </div>
      </main>
    </div>
  )
}

export default DashBoard
