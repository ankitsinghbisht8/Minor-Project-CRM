import React from 'react'
import axios from 'axios'
import { useSelector } from 'react-redux'
import { useDarkMode } from '../../../contexts/DarkModeContext'

const Overview = () => {
  const { user } = useSelector(state => state.auth)
  const { isDarkMode } = useDarkMode()
  const [imgError, setImgError] = React.useState(false)
  const [totalUsers, setTotalUsers] = React.useState(null)
  const [segmentsCount, setSegmentsCount] = React.useState(null)
  const [loadingCounts, setLoadingCounts] = React.useState(true)
  const [countsError, setCountsError] = React.useState(null)
  
  // Get user's first name or fallback to email
  const getUserDisplayName = () => {
    if (user?.name) {
      return user.name.split(' ')[0] // Get first name
    }
    if (user?.email) {
      return user.email.split('@')[0] // Get username from email
    }
    return 'User'
  }

  const displayName = getUserDisplayName()

  React.useEffect(() => {
    let cancelled = false
    const base = (process.env.REACT_APP_BACKEND_URL || 'http://localhost:5000').replace(/\/$/, '')

    const fetchCounts = async () => {
      try {
        setLoadingCounts(true)
        setCountsError(null)

        const [usersRes, segmentsRes] = await Promise.all([
          axios.get(`${base}/api/customers`, { params: { page: 1, limit: 1 } }),
          axios.get(`${base}/api/customers/segments`),
        ])

        if (cancelled) return
        const usersTotal = usersRes?.data?.total ?? null
        const segCount = Array.isArray(segmentsRes?.data) ? segmentsRes.data.length : null

        setTotalUsers(usersTotal)
        setSegmentsCount(segCount)
      } catch (e) {
        if (cancelled) return
        setCountsError('Failed to load counts')
      } finally {
        if (!cancelled) setLoadingCounts(false)
      }
    }

    fetchCounts()
    return () => { cancelled = true }
  }, [])

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className={`rounded-xl border ${isDarkMode ? 'border-gray-700 bg-gradient-to-r from-gray-800 to-gray-700' : 'border-gray-100 bg-gradient-to-r from-blue-50 to-indigo-50'} p-6`}>
        <div className="flex items-center gap-4">
          {user?.profilePicture && !imgError ? (
            <img
              src={(user.profilePicture && (/^https?:\/\//i.test(user.profilePicture) ? user.profilePicture : `${(process.env.REACT_APP_BACKEND_URL || 'http://localhost:5000').replace(/\/$/, '')}/${String(user.profilePicture).replace(/^\//, '')}`))}
              alt={displayName}
              className="w-12 h-12 rounded-full object-cover border border-white/20"
              onError={() => setImgError(true)}
            />
          ) : (
            <div className="w-12 h-12 bg-gradient-to-r from-orange-300 via-pink-400 to-purple-500 rounded-full flex items-center justify-center">
              <span className="text-white font-bold text-lg">
                {displayName.charAt(0).toUpperCase()}
              </span>
            </div>
          )}
          <div>
            <h1 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              Welcome back, {displayName}! 👋
            </h1>
            <p className={`${isDarkMode ? 'text-gray-300' : 'text-gray-600'} mt-1`}>
              Here's what's happening with your CRM today.
            </p>
          </div>
        </div>
      </div>

      {/* Dashboard Content */}
      <div className={`rounded-xl border ${isDarkMode ? 'border-gray-700 bg-gray-800' : 'border-gray-100 bg-white'} p-6`}>
        <h2 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'} mb-4`}>Dashboard Overview</h2>
        <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Select a section from the sidebar to explore your CRM data.</p>
        
        {/* Quick Stats Placeholder */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
          <div className={`${isDarkMode ? 'bg-gray-700' : 'bg-gray-50'} rounded-lg p-4`}>
            <h3 className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Total Users</h3>
            <p className="text-2xl font-bold text-blue-600 mt-2">{loadingCounts ? '...' : (totalUsers ?? '--')}</p>
            <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>{countsError ? countsError : 'All customers in database'}</p>
          </div>
          <div className={`${isDarkMode ? 'bg-gray-700' : 'bg-gray-50'} rounded-lg p-4`}>
            <h3 className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Active Segments</h3>
            <p className="text-2xl font-bold text-green-600 mt-2">{loadingCounts ? '...' : (segmentsCount ?? '--')}</p>
            <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>{countsError ? countsError : 'Computed by backend RFM logic'}</p>
          </div>
          <div className={`${isDarkMode ? 'bg-gray-700' : 'bg-gray-50'} rounded-lg p-4`}>
            <h3 className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Analytics</h3>
            <p className="text-2xl font-bold text-purple-600 mt-2">--</p>
            <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Coming soon</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Overview


