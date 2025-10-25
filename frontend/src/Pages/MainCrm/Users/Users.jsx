import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import "./Users.css";
const Users = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const limit = 10;
  const [filters, setFilters] = useState({
    search: "",
    location: "",
    minOrders: "",
    segment: "",
    subscribed: "",
  });
  const [draftFilters, setDraftFilters] = useState({
    search: "",
    location: "",
    minOrders: "",
    segment: "",
    subscribed: "",
  });
  const [sortBy, setSortBy] = useState("created_at");
  const [sortDir, setSortDir] = useState("DESC");
  const [selected, setSelected] = useState(null);
  const [details, setDetails] = useState({
    orders: [],
    interactions: [],
    loading: false,
    error: null,
  });

  const params = useMemo(() => {
    const p = { page, limit, sortBy, sortDir };
    if (filters.search) p.search = filters.search;
    if (filters.location) p.location = filters.location;
    if (filters.minOrders) p.minOrders = filters.minOrders;
    if (filters.segment) p.segment = filters.segment;
    if (filters.subscribed !== "") p.subscribed = filters.subscribed;
    return p;
  }, [page, limit, sortBy, sortDir, filters]);

  useEffect(() => {
    let canceled = false;
    async function fetchCustomers() {
      try {
        setLoading(true);
        setError(null);
        const res = await axios.get(
          `${process.env.REACT_APP_BACKEND_URL || "http://localhost:5000"}/api/customers`,
          {
            params,
            withCredentials: true,
          }
        );
        if (!canceled) {
          setData(res.data.data || []);
          setTotal(res.data.total || 0);
        }
      } catch (e) {
        if (!canceled) setError(e.response?.data?.error || "Failed to load users");
      } finally {
        if (!canceled) setLoading(false);
      }
    }
    fetchCustomers();
    return () => {
      canceled = true;
    };
  }, [params]);

  useEffect(() => {
    let canceled = false;
    async function fetchSegments() {
      try {
        const res = await axios.get(
          `${process.env.REACT_APP_BACKEND_URL || "http://localhost:5000"}/api/customers/segments`,
          { withCredentials: true }
        );
        if (!canceled) {
          const map = new Map(res.data.map((s) => [s.customer_id, s.segment]));
          setData((prev) =>
            prev.map((c) => ({
              ...c,
              customer_segment: map.get(c.customer_id) || c.customer_segment,
            }))
          );
        }
      } catch (_) {}
    }
    fetchSegments();
    return () => {
      canceled = true;
    };
  }, []);

  useEffect(() => {
    let canceled = false;
    async function fetchDetails() {
      if (!selected) return;
      try {
        setDetails((prev) => ({ ...prev, loading: true, error: null }));
        const base = `${process.env.REACT_APP_BACKEND_URL || "http://localhost:5000"}`;
        const [ordersRes, interactionsRes] = await Promise.all([
          axios.get(`${base}/api/customers/${selected.customer_id}/orders`, {
            withCredentials: true,
            params: { limit: 10 },
          }),
          axios.get(`${base}/api/customers/${selected.customer_id}/interactions`, {
            withCredentials: true,
            params: { limit: 10 },
          }),
        ]);
        if (!canceled)
          setDetails({
            orders: ordersRes.data.data || [],
            interactions: interactionsRes.data.data || [],
            loading: false,
            error: null,
          });
      } catch (e) {
        if (!canceled)
          setDetails({
            orders: [],
            interactions: [],
            loading: false,
            error: e.response?.data?.error || "Failed to load details",
          });
      }
    }
    fetchDetails();
    return () => {
      canceled = true;
    };
  }, [selected]);

  return (
    <div className="rounded-xl border border-gray-100 bg-white p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="mt-1 text-2xl font-semibold text-gray-900">Manage your users here.</p>
        </div>
        <div className="text-sm text-gray-600">Total: {total}</div>
      </div>

      {loading && <div className="mt-4 text-sm text-gray-500">Loading...</div>}
      {error && <div className="mt-4 text-sm text-red-600">{error}</div>}

      {!loading && !error && (
        <div className="mt-4 overflow-x-auto">
          <div className="mb-3 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            <input
              className="border rounded px-3 py-2 text-sm"
              placeholder="Search name or email"
              value={draftFilters.search}
              onChange={(e) => {
                setDraftFilters({ ...draftFilters, search: e.target.value });
              }}
            />
            <input
              className="border rounded px-3 py-2 text-sm"
              placeholder="Location"
              value={draftFilters.location}
              onChange={(e) => {
                setDraftFilters({ ...draftFilters, location: e.target.value });
              }}
            />
            <input
              className="border rounded px-3 py-2 text-sm"
              placeholder="Min orders"
              type="number"
              value={draftFilters.minOrders}
              onChange={(e) => {
                setDraftFilters({ ...draftFilters, minOrders: e.target.value });
              }}
            />
            <input
              className="border rounded px-3 py-2 text-sm"
              placeholder="Segment"
              value={draftFilters.segment}
              onChange={(e) => {
                setDraftFilters({ ...draftFilters, segment: e.target.value });
              }}
            />
            <select
              className="border rounded px-3 py-2 text-sm"
              value={draftFilters.subscribed}
              onChange={(e) => {
                setDraftFilters({ ...draftFilters, subscribed: e.target.value });
              }}
            >
              <option value="">Subscribed?</option>
              <option value="true">Yes</option>
              <option value="false">No</option>
            </select>
            <button
              className="border rounded px-3 py-2 text-sm bg-gray-900 text-white w-full"
              onClick={() => {
                setPage(1);
                setFilters(draftFilters);
              }}
            >
              Search
            </button>
          </div>

          {/* Mobile cards (shown on small screens) */}
          <div className="block md:hidden space-y-2">
            {data.map((c) => (
              <button
                key={c.customer_id}
                className="w-full text-left border rounded-lg p-3 bg-white shadow-sm active:shadow"
                onClick={() => setSelected(c)}
              >
                <div className="flex items-center justify-between">
                  <div className="text-sm font-medium text-gray-900">{c.full_name}</div>
                  <div className="ml-2 inline-flex items-center rounded-full bg-gray-100 px-2 py-0.5 text-[10px] text-gray-700">
                    {c.customer_segment || "-"}
                  </div>
                </div>
                <div className="mt-1 text-xs text-gray-600 break-all">{c.email}</div>
                <div className="mt-1 flex items-center justify-between text-xs text-gray-600">
                  <span>{c.location || "-"}</span>
                  <span>
                    {c.total_orders ?? 0} • ₹{Number(c.total_amount || 0).toFixed(2)}
                  </span>
                </div>
              </button>
            ))}
            {!data.length && (
              <div className="text-sm text-gray-500">No users found.</div>
            )}
          </div>

          <div className="mb-3 flex items-center gap-2 text-sm">
            <span>Sort by:</span>
            <select
              className="border rounded px-2 py-1"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
            >
              <option value="created_at">Created</option>
              <option value="total_orders">Orders</option>
              <option value="total_amount">Spend</option>
              <option value="full_name">Name</option>
            </select>
            <select
              className="border rounded px-2 py-1"
              value={sortDir}
              onChange={(e) => setSortDir(e.target.value)}
            >
              <option value="DESC">DESC</option>
              <option value="ASC">ASC</option>
            </select>
          </div>
          <div className="hidden md:block">
          <table className="min-w-full divide-y divide-gray-200">
            <thead>
              <tr>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Name
                </th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Email
                </th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Location
                </th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Orders
                </th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Spend
                </th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Segment
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {data.map((c) => (
                <tr
                  key={c.customer_id}
                  className="cursor-pointer hover:bg-gray-50"
                  onClick={() => setSelected(c)}
                >
                  <td className="px-4 py-2 text-sm text-gray-900">{c.full_name}</td>
                  <td className="px-4 py-2 text-sm text-gray-600">{c.email}</td>
                  <td className="px-4 py-2 text-sm text-gray-600">{c.location || "-"}</td>
                  <td className="px-4 py-2 text-sm text-gray-600">{c.total_orders ?? 0}</td>
                  <td className="px-4 py-2 text-sm text-gray-600">
                    ₹{Number(c.total_amount || 0).toFixed(2)}
                  </td>
                  <td className="px-4 py-2 text-sm text-gray-600">{c.customer_segment || "-"}</td>
                </tr>
              ))}
            </tbody>
          </table>
          </div>
        </div>
      )}

      <div className="mt-4 flex items-center justify-between flex-wrap gap-2">
        <button
          className="px-3 py-1 rounded border text-sm"
          onClick={() => setPage((p) => Math.max(1, p - 1))}
          disabled={page === 1}
        >
          Previous
        </button>
        <div className="text-sm text-gray-600">Page {page}</div>
        <button
          className="px-3 py-1 rounded border text-sm"
          onClick={() => setPage((p) => (p * limit < total ? p + 1 : p))}
          disabled={page * limit >= total}
        >
          Next
        </button>
      </div>

      {selected && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50 p-3">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-full sm:max-w-3xl p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">{selected.full_name}</h2>
                <p className="text-sm text-gray-500">
                  {selected.email} • {selected.location || "-"} • Segment:{" "}
                  {selected.customer_segment || "-"}
                </p>
              </div>
              <button
                className="text-sm px-3 py-1 rounded border"
                onClick={() => setSelected(null)}
              >
                Close
              </button>
            </div>

            <div className="mt-4">
              {details.loading && <div className="text-sm text-gray-500">Loading details...</div>}
              {details.error && <div className="text-sm text-red-600">{details.error}</div>}

              {!details.loading && !details.error && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h3 className="text-sm font-medium text-gray-700 mb-2">Recent Orders</h3>
                    <div className="border rounded">
                      <table className="min-w-full text-sm">
                        <thead>
                          <tr className="bg-gray-50">
                            <th className="px-3 py-2 text-left text-gray-500">Date</th>
                            <th className="px-3 py-2 text-left text-gray-500">Amount</th>
                            <th className="px-3 py-2 text-left text-gray-500">Status</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y">
                          {details.orders.map((o) => (
                            <tr key={o.order_id}>
                              <td className="px-3 py-2">
                                {new Date(o.order_date).toLocaleDateString()}
                              </td>
                              <td className="px-3 py-2">₹{Number(o.order_amount).toFixed(2)}</td>
                              <td className="px-3 py-2">{o.order_status}</td>
                            </tr>
                          ))}
                          {!details.orders.length && (
                            <tr>
                              <td className="px-3 py-2 text-gray-500" colSpan={3}>
                                No orders
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-700 mb-2">Recent Interactions</h3>
                    <div className="border rounded">
                      <table className="min-w-full text-sm">
                        <thead>
                          <tr className="bg-gray-50">
                            <th className="px-3 py-2 text-left text-gray-500">Date</th>
                            <th className="px-3 py-2 text-left text-gray-500">Type</th>
                            <th className="px-3 py-2 text-left text-gray-500">Notes</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y">
                          {details.interactions.map((i) => (
                            <tr key={i.interaction_id}>
                              <td className="px-3 py-2">
                                {new Date(i.interaction_date).toLocaleString()}
                              </td>
                              <td className="px-3 py-2">{i.interaction_type}</td>
                              <td className="px-3 py-2">{i.notes}</td>
                            </tr>
                          ))}
                          {!details.interactions.length && (
                            <tr>
                              <td className="px-3 py-2 text-gray-500" colSpan={3}>
                                No interactions
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Users;
