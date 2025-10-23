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
import CampaignIcon from '@mui/icons-material/Campaign'
import MenuIcon from '@mui/icons-material/Menu'
import ChevronLeft from '@mui/icons-material/ChevronLeft'
import Logout from '@mui/icons-material/Logout'
import DarkModeIcon from '@mui/icons-material/DarkMode'
import LightModeIcon from '@mui/icons-material/LightMode'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { logout } from '../../../redux/slices/authslice'
import { useDarkMode } from '../../../contexts/DarkModeContext'
import { Snackbar, Alert, CircularProgress, Backdrop } from '@mui/material'

const DashBoard = () => {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false)
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false)
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' })

  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { loading: logoutLoading, error: logoutError, user } = useSelector(state => state.auth)
  const { isDarkMode, toggleDarkMode } = useDarkMode()

  const navItems = useMemo(
    () => [
      { label: 'Dashboard', to: '/dashboard', Icon: DashboardIcon },
      { label: 'Analytics', to: '/analytics', Icon: QueryStats },
      { label: 'Users', to: '/users', Icon: Group },
      { label: 'Segments', to: '/segments', Icon: ViewList },
      { label: 'Segment Builder', to: '/segments/builder', Icon: Tune },
      { label: 'Campaigns', to: '/campaigns', Icon: CampaignIcon },
      { label: 'Settings', to: '/settings', Icon: Settings },
      { label: 'Notifications', to: '/notifications', Icon: Notifications },
    ],
    []
  )

  const handleLogout = async () => {
    try {
      const result = await dispatch(logout()).unwrap()
      
      // Show success message
      setSnackbar({
        open: true,
        message: 'Logged out successfully',
        severity: 'success'
      })
      
      // Navigate after a short delay to show the success message
      setTimeout(() => {
        navigate('/')
      }, 1000)
      
    } catch (error) {
      console.error('Logout error:', error)
      
      // Show error message
      setSnackbar({
        open: true,
        message: error.message || 'Logout failed. Please try again.',
        severity: 'error'
      })
    }
  }

  const handleCloseSnackbar = () => {
    setSnackbar(prev => ({ ...prev, open: false }))
  }

  const getUserDisplayName = () => {
    if (user?.name) {
      return user.name.split(' ')[0]
    }
    if (user?.email) {
      return user.email.split('@')[0]
    }
    return 'User'
  }

  const getUserInitials = () => {
    if (user?.name) {
      const parts = user.name.trim().split(' ').filter(Boolean)
      const initials = parts.slice(0, 2).map(p => p[0].toUpperCase()).join('')
      return initials || 'U'
    }
    if (user?.email) {
      return user.email[0]?.toUpperCase() || 'U'
    }
    return 'U'
  }

  const SidebarContent = ({ collapsed }) => (
    <div className="flex h-full flex-col">
      {/* Brand */}
      <div className={`flex items-center gap-3 px-4 py-4 border-b ${isDarkMode ? 'border-gray-700' : 'border-gray-100'}`}>
        <div className="w-9 h-9 bg-gradient-to-r from-orange-300 via-pink-400 to-purple-500 rounded-lg flex items-center justify-center shrink-0">
          <span className="text-white font-bold">D</span>
        </div>
        {!collapsed && <span className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>DataPulse</span>}
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto px-3 py-4">
        <ul className="space-y-1">
          {navItems.map(({ label, to, Icon }) => (
            <li key={label}>
              <NavLink
                to={to}
                end={to === '/dashboard' || to === '/segments'}
                className={({ isActive }) =>
                  [
                    'group flex items-center gap-3 rounded-lg px-3 py-2 transition-colors duration-200',
                    isActive 
                      ? isDarkMode 
                        ? 'bg-gradient-to-r from-orange-900/30 to-purple-900/30 text-white ring-1 ring-orange-500/30' 
                        : 'bg-gradient-to-r from-orange-100 to-purple-100 text-gray-900 ring-1 ring-orange-200/60'
                      : isDarkMode
                        ? 'text-gray-300 hover:bg-gray-800/70 hover:ring-1 hover:ring-gray-600'
                        : 'text-gray-600 hover:bg-white/70 hover:ring-1 hover:ring-gray-200',
                  ].join(' ')
                }
                onClick={() => setIsMobileSidebarOpen(false)}
              >
                <Icon className={`${isDarkMode ? 'text-gray-400 group-hover:text-gray-200' : 'text-gray-500 group-hover:text-gray-700'}`} fontSize="small" />
                {!collapsed && <span className="font-medium">{label}</span>}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>

      {/* Profile */}
      <div className={`mt-auto border-t ${isDarkMode ? 'border-gray-700' : 'border-gray-100'} p-3`}>
        <div className="flex items-center gap-3 px-2">
          {user?.profilePicture ? (
            <img
              src={user.profilePicture}
              alt={getUserDisplayName()}
              className="w-9 h-9 rounded-full object-cover border border-white/20"
            />
          ) : (
            <div className="w-9 h-9 rounded-full bg-gradient-to-r from-orange-300 via-pink-400 to-purple-500 text-white flex items-center justify-center font-semibold">
              {getUserInitials()}
            </div>
          )}
          {!collapsed && (
            <div className="min-w-0">
              <p className={`text-sm font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'} truncate`}>{getUserDisplayName()}</p>
              <button 
                onClick={handleLogout}
                disabled={logoutLoading}
                className={`flex items-center gap-1 text-xs ${isDarkMode ? 'text-gray-400 hover:text-gray-200' : 'text-gray-500 hover:text-gray-700'} transition-colors disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                {logoutLoading ? (
                  <CircularProgress size={12} />
                ) : (
                  <Logout onClick={handleLogout} fontSize="inherit" />
                )}
                <span>{logoutLoading ? 'Logging out...' : 'Logout'}</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )

  return (
    <div className={`min-h-screen relative ${isDarkMode ? 'dark' : ''}`}>
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className={`absolute inset-0 ${isDarkMode ? 'bg-gradient-to-br from-gray-950 via-gray-900 to-gray-800' : 'bg-gradient-to-br from-orange-100 via-white to-purple-100'}`} />
        <div className={`absolute -top-28 -left-28 w-[28rem] h-[28rem] rounded-full ${isDarkMode ? 'bg-purple-500/20' : 'bg-purple-300/40'} blur-3xl`} />
      </div>
      {/* Top bar */}
      <div className={`sticky top-0 z-30 flex items-center justify-between border-b ${isDarkMode ? 'border-gray-700 bg-gray-900/90' : 'border-gray-100 bg-gradient-to-r from-white/90 via-orange-50/80 to-purple-50/80'} backdrop-blur px-4 py-3 md:pl-6`}>
        <div className="flex items-center gap-3">
          {/* Mobile: open sidebar */}
          <button
            className={`md:hidden inline-flex items-center justify-center rounded-lg border ${isDarkMode ? 'border-gray-600 bg-gray-800 text-gray-300 hover:bg-gray-700' : 'border-gray-200 bg-white text-gray-700 hover:bg-gray-50'} p-2`}
            onClick={() => setIsMobileSidebarOpen(true)}
            aria-label="Open sidebar"
          >
            <MenuIcon fontSize="small" />
          </button>
          <div className="hidden md:flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-r from-orange-300 via-pink-400 to-purple-500 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold">D</span>
            </div>
            <span className={`text-base font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Dashboard</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Dark Mode Toggle */}
          <button
            className={`inline-flex items-center justify-center rounded-lg border ${isDarkMode ? 'border-gray-600 bg-gray-800 text-gray-300 hover:bg-gray-700' : 'border-gray-200 bg-white text-gray-700 hover:bg-gray-50'} p-2 transition-colors duration-200`}
            onClick={toggleDarkMode}
            aria-label={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
            title={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
          >
            {isDarkMode ? <LightModeIcon fontSize="small" /> : <DarkModeIcon fontSize="small" />}
          </button>
          
          {/* Desktop: collapse toggle */}
          <button
            className={`hidden md:inline-flex items-center justify-center rounded-lg border ${isDarkMode ? 'border-gray-600 bg-gray-800 text-gray-300 hover:bg-gray-700' : 'border-gray-200 bg-white text-gray-700 hover:bg-gray-50'} p-2`}
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
          `hidden md:flex fixed inset-y-0 left-0 z-40 border-r ${isDarkMode ? 'border-gray-700' : 'border-gray-100'}`,
          isDarkMode ? 'bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900' : 'bg-gradient-to-b from-white via-orange-50 to-purple-50',
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
              className={`fixed inset-y-0 left-0 z-50 w-64 ${isDarkMode ? 'bg-gray-900 border-r border-gray-700' : 'bg-white border-r border-gray-100'}`}
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

      {/* Loading Backdrop */}
      <Backdrop
        sx={{ color: '#fff', zIndex: (theme) => theme.zIndex.drawer + 1 }}
        open={logoutLoading}
      >
        <div className="flex flex-col items-center gap-4">
          <CircularProgress color="inherit" />
          <p className="text-white">Logging out...</p>
        </div>
      </Backdrop>

      {/* Success/Error Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert 
          onClose={handleCloseSnackbar} 
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </div>
  )
}

export default DashBoard