import React, { useEffect, useMemo, useState } from 'react'
import { useLocation } from 'react-router-dom'
import axios from 'axios'
import { Pagination, PaginationContent, PaginationEllipsis, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "../../../components/ui/pagination"

const statusColors = {
  queued: '#a78bfa',
  in_progress: '#60a5fa',
  completed: '#22c55e',
  failed: '#ef4444'
}

const Campaign = () => {
  const location = useLocation()
  const query = useMemo(() => new URLSearchParams(location.search), [location.search])
  const [campaigns, setCampaigns] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const highlightedId = query.get('id') || ''
  const [sortBy, setSortBy] = useState('time_desc') // time_desc | time_asc | users_desc | users_asc | ratio_desc | ratio_asc
  const [page, setPage] = useState(1)
  const pageSize = 10

  const fetchCampaigns = async () => {
    try {
      const base = process.env.REACT_APP_BACKEND_URL || 'http://localhost:5000'
      const res = await axios.get(`${base}/api/campaigns`, { withCredentials: true })
      setCampaigns(Array.isArray(res.data) ? res.data : [])
      setError('')
    } catch (e) {
      setError(e.response?.data?.error || e.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchCampaigns()
    const id = setInterval(fetchCampaigns, 2000)
    return () => clearInterval(id)
  }, [])

  const sorted = useMemo(() => {
    const arr = [...campaigns]
    const successRatio = (c) => (c.totalUsers ? (c.successCount || 0) / c.totalUsers : 0)
    switch (sortBy) {
      case 'time_asc':
        arr.sort((a,b) => new Date(a.createdAt) - new Date(b.createdAt)); break
      case 'users_desc':
        arr.sort((a,b) => (b.totalUsers||0) - (a.totalUsers||0)); break
      case 'users_asc':
        arr.sort((a,b) => (a.totalUsers||0) - (b.totalUsers||0)); break
      case 'ratio_desc':
        arr.sort((a,b) => successRatio(b) - successRatio(a)); break
      case 'ratio_asc':
        arr.sort((a,b) => successRatio(a) - successRatio(b)); break
      case 'time_desc':
      default:
        arr.sort((a,b) => new Date(b.createdAt) - new Date(a.createdAt)); break
    }
    return arr
  }, [campaigns, sortBy])

  const totalPages = Math.max(1, Math.ceil(sorted.length / pageSize))
  const pageItems = useMemo(() => {
    const start = (page - 1) * pageSize
    return sorted.slice(start, start + pageSize)
  }, [sorted, page])

  useEffect(() => { if (page > totalPages) setPage(totalPages) }, [totalPages, page])

  const ratio = (c) => {
    const total = c.totalUsers || 0
    if (!total) return '0.00%'
    return `${((c.successCount || 0) * 100 / total).toFixed(2)}%`
  }

  const renderPageNumbers = () => {
    const items = []
    const maxButtons = 5
    let start = Math.max(1, page - 2)
    let end = Math.min(totalPages, start + maxButtons - 1)
    if (end - start < maxButtons - 1) start = Math.max(1, end - (maxButtons - 1))

    if (start > 1) {
      items.push(
        <PaginationItem key={1}>
          <PaginationLink isActive={page===1} onClick={() => setPage(1)}>1</PaginationLink>
        </PaginationItem>
      )
      if (start > 2) {
        items.push(
          <PaginationItem key="start-ellipsis"><PaginationEllipsis /></PaginationItem>
        )
      }
    }

    for (let p = start; p <= end; p++) {
      items.push(
        <PaginationItem key={p}>
          <PaginationLink isActive={p===page} onClick={() => setPage(p)}>{p}</PaginationLink>
        </PaginationItem>
      )
    }

    if (end < totalPages) {
      if (end < totalPages - 1) {
        items.push(
          <PaginationItem key="end-ellipsis"><PaginationEllipsis /></PaginationItem>
        )
      }
      items.push(
        <PaginationItem key={totalPages}>
          <PaginationLink isActive={page===totalPages} onClick={() => setPage(totalPages)}>{totalPages}</PaginationLink>
        </PaginationItem>
      )
    }

    return items
  }

  return (
    <div style={{ padding: 16 }}>
      <div className="flex justify-between items-center">
        <h2 style={{ marginBottom: 12,fontSize: 40,fontWeight: 700 }}>Campaigns</h2>
        <div className="flex items-center gap-2 mb-3">
          <label htmlFor="sort" className="text-sm text-gray-600">Sort by:</label>
          <div className="relative">
            <select
              id="sort"
              value={sortBy}
              onChange={(e)=>setSortBy(e.target.value)}
              className="h-9 appearance-none rounded-md border border-gray-200 bg-white pr-10 pl-4 w-64 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-black/10"
            >
              <option value="time_desc">Start Time (Newest)</option>
              <option value="time_asc">Start Time (Oldest)</option>
              <option value="users_desc">Users (Descending)</option>
              <option value="users_asc">Users (Ascending)</option>
              <option value="ratio_desc">Success Ratio (Descending)</option>
              <option value="ratio_asc">Success Ratio (Ascending)</option>
            </select>
            <span className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-gray-500">▾</span>
          </div>
        </div>
      </div>

      {loading ? (
        <div>Loading campaigns...</div>
      ) : error ? (
        <div style={{ color: 'red' }}>{error}</div>
      ) : sorted.length === 0 ? (
        <div>No campaigns yet.</div>
      ) : (
        <div style={{ display: 'grid', gap: 12 }}>
          {pageItems.map(c => (
            <div key={c.id} style={{
              border: highlightedId === c.id ? '2px solid #22c55e' : '1px solid #e5e7eb',
              borderRadius: 8,
              padding: 12,
              background: '#fff'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontWeight: 600 }}>{c.name}</div>
                  <div style={{ fontSize: 12, color: '#6b7280' }}>ID: {c.id}</div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{
                    display: 'inline-block',
                    padding: '4px 8px',
                    borderRadius: 999,
                    background: statusColors[c.status] || '#e5e7eb',
                    color: '#fff',
                    fontSize: 12,
                    textTransform: 'capitalize'
                  }}>{c.status.replace('_', ' ')}</span>
                </div>
              </div>

              <div style={{ marginTop: 10, fontSize: 14, display: 'flex', justifyContent: 'space-between', gap: 8, flexWrap: 'wrap' }}>
                <div><strong>Segment ID:</strong> {c.segmentId}</div>
                <div><strong>Started:</strong> {new Date(c.createdAt).toLocaleString()}</div>
              </div>
              <div style={{ marginTop: 6, fontSize: 14 }}>
                <div><strong>Message:</strong> {c.message}</div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8, marginTop: 12 }}>
                <div style={{ background: '#f9fafb', borderRadius: 8, padding: 8 }}>
                  <div style={{ fontSize: 12, color: '#6b7280' }}>Users</div>
                  <div style={{ fontWeight: 700 }}>{c.totalUsers}</div>
                </div>
                <div style={{ background: '#f9fafb', borderRadius: 8, padding: 8 }}>
                  <div style={{ fontSize: 12, color: '#6b7280' }}>Sent</div>
                  <div style={{ fontWeight: 700 }}>{c.sentCount}</div>
                </div>
                <div style={{ background: '#f9fafb', borderRadius: 8, padding: 8 }}>
                  <div style={{ fontSize: 12, color: '#6b7280' }}>Success</div>
                  <div style={{ fontWeight: 700 }}>{c.successCount}</div>
                </div>
                <div style={{ background: '#f9fafb', borderRadius: 8, padding: 8 }}>
                  <div style={{ fontSize: 12, color: '#6b7280' }}>Success Ratio</div>
                  <div style={{ fontWeight: 700 }}>{ratio(c)}</div>
                </div>
              </div>

              <div style={{ marginTop: 12, height: 8, background: '#e5e7eb', borderRadius: 999 }}>
                <div style={{
                  height: '100%',
                  width: `${Math.min(100, (c.totalUsers ? (c.sentCount * 100 / c.totalUsers) : 0))}%`,
                  background: statusColors[c.status] || '#60a5fa',
                  borderRadius: 999,
                  transition: 'width 0.5s ease'
                }} />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Bottom pagination */}
      {sorted.length > 0 && (
        <div className="mt-6">
          <div className="flex justify-center mb-2 text-sm text-gray-600">Page {page} of {totalPages}</div>
          <Pagination>
            <PaginationContent>
              {page > 1 && (
                <PaginationItem>
                  <PaginationPrevious onClick={() => setPage(p=>Math.max(1, p-1))} />
                </PaginationItem>
              )}
              {renderPageNumbers()}
              {page < totalPages && (
                <PaginationItem>
                  <PaginationNext onClick={() => setPage(p=>Math.min(totalPages, p+1))} />
                </PaginationItem>
              )}
            </PaginationContent>
          </Pagination>
        </div>
      )}
    </div>
  )
}

export default Campaign
