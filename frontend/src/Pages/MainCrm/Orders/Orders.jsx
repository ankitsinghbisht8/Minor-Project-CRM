import React, { useEffect, useMemo, useState } from 'react'
import axios from 'axios'

const Orders = () => {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(0)
  const limit = 10
  const [filters, setFilters] = useState({ search: '', status: '', payment: '', minAmount: '', maxAmount: '' })
  const [draft, setDraft] = useState(filters)
  const [showNew, setShowNew] = useState(false)
  const [creating, setCreating] = useState(false)
  const [createError, setCreateError] = useState(null)
  const [form, setForm] = useState({ customer_id: '', customer_name: '', order_amount: '', category: '', order_status: 'Completed', payment_method: 'Card' })
  const [userQuery, setUserQuery] = useState('')
  const [userResults, setUserResults] = useState([])
  const [userLoading, setUserLoading] = useState(false)

  const params = useMemo(() => {
    const p = { page, limit }
    Object.entries(filters).forEach(([k,v]) => { if (v !== '') p[k] = v })
    return p
  }, [page, limit, filters])

  useEffect(() => {
    let cancelled = false
    const fetchOrders = async () => {
      try {
        setLoading(true); setError(null)
        const base = (process.env.REACT_APP_BACKEND_URL || 'http://localhost:5000').replace(/\/$/, '')
        const res = await axios.get(`${base}/api/orders`, { params, withCredentials: true })
        if (!cancelled) { setOrders(res.data.data || []); setTotal(res.data.total || 0) }
      } catch (e) {
        if (!cancelled) setError(e.response?.data?.error || 'Failed to load orders')
      } finally { if (!cancelled) setLoading(false) }
    }
    fetchOrders()
    return () => { cancelled = true }
  }, [params])

  useEffect(() => {
    let cancelled = false
    const fetchUsers = async () => {
      if (!userQuery.trim()) { setUserResults([]); return }
      try {
        setUserLoading(true)
        const base = (process.env.REACT_APP_BACKEND_URL || 'http://localhost:5000').replace(/\/$/, '')
        const res = await axios.get(`${base}/api/customers`, { params: { page: 1, limit: 5, search: userQuery }, withCredentials: true })
        if (!cancelled) setUserResults(res.data.data || [])
      } catch (_) { if (!cancelled) setUserResults([]) }
      finally { if (!cancelled) setUserLoading(false) }
    }
    const t = setTimeout(fetchUsers, 250)
    return () => { cancelled = true; clearTimeout(t) }
  }, [userQuery])

  return (
    <div className="rounded-xl border border-gray-100 bg-white p-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold text-gray-900">Orders</h2>
        <button className="px-3 py-2 text-sm rounded bg-gray-900 text-white" onClick={() => setShowNew(true)}>+ Add Order</button>
      </div>

      <div className="mt-4 grid grid-cols-1 md:grid-cols-5 gap-3">
        <input className="border rounded px-3 py-2 text-sm" placeholder="Search user name/email" value={draft.search} onChange={(e)=> setDraft({ ...draft, search: e.target.value })} />
        <select className="border rounded px-3 py-2 text-sm" value={draft.status} onChange={(e)=> setDraft({ ...draft, status: e.target.value })}>
          <option value="">Status</option>
          <option>Completed</option>
          <option>Pending</option>
          <option>Cancelled</option>
          <option>Returned</option>
        </select>
        <select className="border rounded px-3 py-2 text-sm" value={draft.payment} onChange={(e)=> setDraft({ ...draft, payment: e.target.value })}>
          <option value="">Payment</option>
          <option>Card</option>
          <option>Cash</option>
          <option>UPI</option>
          <option>Wallet</option>
          <option>NetBanking</option>
        </select>
        <input className="border rounded px-3 py-2 text-sm" placeholder="Min amount" type="number" value={draft.minAmount} onChange={(e)=> setDraft({ ...draft, minAmount: e.target.value })} />
        <input className="border rounded px-3 py-2 text-sm" placeholder="Max amount" type="number" value={draft.maxAmount} onChange={(e)=> setDraft({ ...draft, maxAmount: e.target.value })} />
        <div className="md:col-span-5">
          <button className="border rounded px-3 py-2 text-sm bg-gray-900 text-white" onClick={()=> { setPage(1); setFilters(draft) }}>Apply</button>
        </div>
      </div>

      {loading && <div className="mt-4 text-sm text-gray-500">Loading...</div>}
      {error && <div className="mt-4 text-sm text-red-600">{error}</div>}

      {!loading && !error && (
        <div className="mt-4 overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 text-sm">
            <thead>
              <tr>
                <th className="px-4 py-2 text-left text-gray-500">Date</th>
                <th className="px-4 py-2 text-left text-gray-500">Customer</th>
                <th className="px-4 py-2 text-left text-gray-500">Amount</th>
                <th className="px-4 py-2 text-left text-gray-500">Status</th>
                <th className="px-4 py-2 text-left text-gray-500">Payment</th>
                <th className="px-4 py-2 text-left text-gray-500">Category</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {orders.map(o => (
                <tr key={o.order_id}>
                  <td className="px-4 py-2">{new Date(o.order_date).toLocaleString()}</td>
                  <td className="px-4 py-2">{o.full_name} <span className="text-gray-500">({o.email})</span></td>
                  <td className="px-4 py-2">₹{Number(o.order_amount).toFixed(2)}</td>
                  <td className="px-4 py-2">{o.order_status}</td>
                  <td className="px-4 py-2">{o.payment_method}</td>
                  <td className="px-4 py-2">{o.category || '-'}</td>
                </tr>
              ))}
              {!orders.length && (
                <tr><td className="px-4 py-6 text-gray-500" colSpan={6}>No orders</td></tr>
              )}
            </tbody>
          </table>

          <div className="mt-4 flex items-center justify-between">
            <button className="px-3 py-1 rounded border text-sm" onClick={()=> setPage(p=> Math.max(1,p-1))} disabled={page===1}>Previous</button>
            <div className="text-sm text-gray-600">Page {page}</div>
            <button className="px-3 py-1 rounded border text-sm" onClick={()=> setPage(p=> (p*limit<total ? p+1 : p))} disabled={page*limit>=total}>Next</button>
          </div>
        </div>
      )}

      {showNew && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50 p-3">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6">
            <h3 className="text-lg font-semibold mb-4">Add Order</h3>
            {createError && <div className="text-sm text-red-600 mb-2">{createError}</div>}
            <div className="grid grid-cols-1 gap-3">
              <div>
                <input className="border rounded px-3 py-2 text-sm w-full" placeholder="Search user (name or email)" value={form.customer_id ? form.customer_name : userQuery} onChange={(e)=> { setUserQuery(e.target.value); setForm(prev => ({ ...prev, customer_id: '', customer_name: '' })) }} />
                {userLoading && <div className="text-xs text-gray-500 mt-1">Searching...</div>}
                {userResults.length > 0 && (
                  <div className="mt-2 border rounded max-h-40 overflow-auto">
                    {userResults.map(u => (
                      <button key={u.customer_id} className={`block w-full text-left px-3 py-2 text-sm hover:bg-gray-50 ${form.customer_id===u.customer_id ? 'bg-gray-100' : ''}`} onClick={()=> { setForm({ ...form, customer_id: u.customer_id, customer_name: u.full_name }); setUserResults([]) }}>
                        {u.full_name} <span className="text-gray-500">({u.email})</span>
                      </button>
                    ))}
                  </div>
                )}
                {form.customer_id && <div className="mt-1 text-xs text-green-700">Selected: {form.customer_name}</div>}
              </div>
              <input className="border rounded px-3 py-2 text-sm" placeholder="Amount" type="number" value={form.order_amount} onChange={(e)=> setForm({ ...form, order_amount: e.target.value })} />
              <input className="border rounded px-3 py-2 text-sm" placeholder="Category" value={form.category} onChange={(e)=> setForm({ ...form, category: e.target.value })} />
              <select className="border rounded px-3 py-2 text-sm" value={form.order_status} onChange={(e)=> setForm({ ...form, order_status: e.target.value })}>
                <option>Completed</option>
                <option>Pending</option>
                <option>Cancelled</option>
                <option>Returned</option>
              </select>
              <select className="border rounded px-3 py-2 text-sm" value={form.payment_method} onChange={(e)=> setForm({ ...form, payment_method: e.target.value })}>
                <option>Card</option>
                <option>Cash</option>
                <option>UPI</option>
                <option>Wallet</option>
                <option>NetBanking</option>
              </select>
            </div>
            <div className="mt-4 flex justify-end gap-2">
              <button className="px-3 py-1 rounded border text-sm" onClick={()=> setShowNew(false)}>Cancel</button>
              <button className="px-3 py-1 rounded bg-gray-900 text-white text-sm disabled:opacity-50" disabled={creating} onClick={async ()=>{
                try{
                  if (!form.customer_id) throw new Error('Select a user')
                  if (!form.order_amount) throw new Error('Enter amount')
                  setCreating(true); setCreateError(null)
                  const base = (process.env.REACT_APP_BACKEND_URL || 'http://localhost:5000').replace(/\/$/, '')
                  await axios.post(`${base}/api/orders`, { ...form, customer_name: undefined }, { withCredentials: true })
                  setShowNew(false)
                  setForm({ customer_id: '', customer_name: '', order_amount: '', category: '', order_status: 'Completed', payment_method: 'Card' })
                  // refresh
                  const res = await axios.get(`${base}/api/orders`, { params, withCredentials: true })
                  setOrders(res.data.data || []); setTotal(res.data.total || 0)
                }catch(e){ setCreateError(e.response?.data?.error || e.message || 'Failed to create order') }
                finally{ setCreating(false) }
              }}>Save</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Orders


