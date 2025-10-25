import React from 'react'
import axios from 'axios'
import { useSelector } from 'react-redux'
import { useDarkMode } from '../../../contexts/DarkModeContext'

const Overview = () => {
  const { user } = useSelector(state => state.auth)
  const { isDarkMode } = useDarkMode()
  const [imgError, setImgError] = React.useState(false)
  const [totalUsers, setTotalUsers] = React.useState(null)
  const [successfulCampaigns, setSuccessfulCampaigns] = React.useState(null)
  const [overallSuccessRate, setOverallSuccessRate] = React.useState(null)
  const [loadingCounts, setLoadingCounts] = React.useState(true)
  const [countsError, setCountsError] = React.useState(null)
  const [kpis, setKpis] = React.useState({ revenue: 0, total_orders: 0, completed_orders: 0, avg_order: 0 })
  const [recentOrders, setRecentOrders] = React.useState([])
  const [recentActivity, setRecentActivity] = React.useState([])
  
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

        const [usersRes, campaignsRes, metricsRes] = await Promise.all([
          axios.get(`${base}/api/customers`, { params: { page: 1, limit: 1 } }),
          axios.get(`${base}/api/campaigns`),
          axios.get(`${base}/api/orders/metrics`),
        ])

        if (cancelled) return
        const usersTotal = usersRes?.data?.total ?? null
        const campaigns = Array.isArray(campaignsRes?.data) ? campaignsRes.data : []

        const successfulCount = campaigns.filter(c => String(c.status).toLowerCase() === 'completed' && Number(c.successCount || 0) > 0).length
        const totals = campaigns.reduce((acc, c) => {
          acc.success += Number(c.successCount || 0)
          acc.sent += Number(c.sentCount || 0)
          return acc
        }, { success: 0, sent: 0 })
        const successRate = totals.sent > 0 ? Math.round((totals.success / totals.sent) * 1000) / 10 : 0

        setTotalUsers(usersTotal)
        setSuccessfulCampaigns(successfulCount)
        setOverallSuccessRate(successRate)
        setKpis(metricsRes?.data?.kpis || {})
        setRecentOrders(metricsRes?.data?.recentOrders || [])
        setRecentActivity(metricsRes?.data?.recentActivity || [])
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

      {/* KPI Cards */}
      <div className={`rounded-xl border ${isDarkMode ? 'border-gray-700 bg-gray-800' : 'border-gray-100 bg-white'} p-4 mb-2`}>
        <h2 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray'} mb-4`}>Overview</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-2">
          <div className={`${isDarkMode ? 'bg-gray-700' : 'bg-gray-50'} rounded-lg p-4`}>
            <h3 className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Total Users</h3>
            <p className="text-2xl font-bold text-blue-600 mt-2">{loadingCounts ? '...' : (totalUsers ?? '--')}</p>
            <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>{countsError ? countsError : 'All customers in database'}</p>
          </div>
          <div className={`${isDarkMode ? 'bg-gray-700' : 'bg-gray-50'} rounded-lg p-4`}>
            <h3 className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Revenue</h3>
            <p className="text-2xl font-bold text-green-600 mt-2">{loadingCounts ? '...' : `₹${Number(kpis.revenue || 0).toFixed(2)}`}</p>
            <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Completed orders revenue</p>
          </div>
          <div className={`${isDarkMode ? 'bg-gray-700' : 'bg-gray-50'} rounded-lg p-4`}>
            <h3 className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Total Orders</h3>
            <p className="text-2xl font-bold text-purple-600 mt-2">{loadingCounts ? '...' : (kpis.total_orders ?? 0)}</p>
            <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>All orders</p>
          </div>
          <div className={`${isDarkMode ? 'bg-gray-700' : 'bg-gray-50'} rounded-lg p-4`}>
            <h3 className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Avg Order</h3>
            <p className="text-2xl font-bold text-indigo-600 mt-2">{loadingCounts ? '...' : `₹${Number(kpis.avg_order || 0).toFixed(2)}`}</p>
            <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Average amount</p>
          </div>
        </div>
      </div>

      {/* Recent Orders & Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6 mt-2">
        <div className={`rounded-xl border ${isDarkMode ? 'border-gray-700 bg-gray-800' : 'border-gray-100 bg-white'} p-6 lg:col-span-2`}>
          <div className="flex items-center justify-between mb-4">
            <h3 className={`text-base font-semibold ${isDarkMode ? 'text-white' : 'text-gray'}`}>Recent Orders</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 text-sm">
              <thead>
                <tr>
                  <th className="px-4 py-2 text-left text-gray-500">Order</th>
                  <th className="px-4 py-2 text-left text-gray-500">Customer</th>
                  <th className="px-4 py-2 text-left text-gray-500">Date</th>
                  <th className="px-4 py-2 text-left text-gray-500">Amount</th>
                  <th className="px-4 py-2 text-left text-gray-500">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {recentOrders.map((o) => (
                  <tr key={o.order_id}>
                    <td className="px-4 py-2">#{String(o.order_id).slice(0,8)}</td>
                    <td className="px-4 py-2">{o.full_name}</td>
                    <td className="px-4 py-2">{new Date(o.order_date).toLocaleDateString()}</td>
                    <td className="px-4 py-2">₹{Number(o.order_amount).toFixed(2)}</td>
                    <td className="px-4 py-2">{o.order_status}</td>
                  </tr>
                ))}
                {!recentOrders.length && (
                  <tr><td className="px-4 py-6 text-gray-500" colSpan={5}>No recent orders</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

          <div className={`rounded-xl border ${isDarkMode ? 'border-gray-700 bg-gray-800' : 'border-gray-100 bg-white'} p-6`}>
            <h3 className={`text-base font-semibold ${isDarkMode ? 'text-white' : 'text-gray'} mb-4`}>Recent Activity</h3>
            <div className='space-y-8'>
            {recentActivity.map(a => (
              <div key={a.id} className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center">✓</div>
                <div className="min-w-0">
                  <p className={`${isDarkMode ? 'text-white' : 'text-gray-900'} text-sm font-medium`}>{a.title}</p>
                  <p className="text-xs text-gray-500 truncate">{a.subtitle} • ₹{Number(a.amount || 0).toFixed(2)}</p>
                </div>
                <div className="ml-auto text-xs text-gray-500">{new Date(a.ts).toLocaleTimeString()}</div>
              </div>
            ))}
            {!recentActivity.length && <p className="text-sm text-gray-500">No recent activity</p>}
          </div>
        </div>
      </div>
    </div>
  )
}

export default Overview


