import React, { useState, useEffect, useCallback } from 'react';
import { api } from '../../services/api';

/* ───── helpers ───── */

const ACTION_CONFIG = {
  vendor_approved:   { label: 'Vendor Approved',   color: 'bg-green-100 text-green-800',  dot: 'bg-green-500',  icon: '✅' },
  vendor_rejected:   { label: 'Vendor Rejected',   color: 'bg-red-100 text-red-800',      dot: 'bg-red-500',    icon: '❌' },
  vendor_suspended:  { label: 'Vendor Suspended',  color: 'bg-orange-100 text-orange-800', dot: 'bg-orange-500', icon: '⏸️' },
  vendor_reactivated:{ label: 'Vendor Reactivated', color: 'bg-blue-100 text-blue-800',    dot: 'bg-blue-500',   icon: '▶️' },
  vendor_deleted:    { label: 'Vendor Deleted',     color: 'bg-red-100 text-red-800',      dot: 'bg-red-600',    icon: '🗑️' },
  product_updated:   { label: 'Product Updated',    color: 'bg-indigo-100 text-indigo-800', dot: 'bg-indigo-500', icon: '✏️' },
  product_deleted:   { label: 'Product Deleted',    color: 'bg-red-100 text-red-800',      dot: 'bg-red-500',    icon: '🗑️' },
  order_status_updated:       { label: 'Order Updated',          color: 'bg-purple-100 text-purple-800', dot: 'bg-purple-500', icon: '📦' },
  vendor_order_status_updated:{ label: 'Vendor Order Updated',   color: 'bg-purple-100 text-purple-800', dot: 'bg-purple-400', icon: '📦' },
  admin_profile_updated:      { label: 'Profile Updated',        color: 'bg-gray-100 text-gray-800',     dot: 'bg-gray-500',   icon: '👤' },
  other:             { label: 'Other',              color: 'bg-gray-100 text-gray-700',     dot: 'bg-gray-400',   icon: '📋' }
};

const PERIODS = [
  { key: 'today',    label: 'Today' },
  { key: 'week',     label: 'This Week' },
  { key: 'month',    label: 'This Month' },
  { key: 'year',     label: 'This Year' },
  { key: 'lifetime', label: 'Lifetime' }
];

const CATEGORIES = [
  { key: '',        label: 'All Categories' },
  { key: 'vendor',  label: 'Vendor' },
  { key: 'product', label: 'Product' },
  { key: 'order',   label: 'Order' },
  { key: 'admin',   label: 'Admin' }
];

const formatDate = (dateStr) => {
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-US', {
    year: 'numeric', month: 'short', day: 'numeric'
  });
};

const formatTime = (dateStr) => {
  const d = new Date(dateStr);
  return d.toLocaleTimeString('en-US', {
    hour: '2-digit', minute: '2-digit', hour12: true
  });
};

const timeAgo = (dateStr) => {
  const seconds = Math.floor((Date.now() - new Date(dateStr)) / 1000);
  if (seconds < 60)   return 'just now';
  if (seconds < 3600)  return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;
  return formatDate(dateStr);
};

/* ───── sub-components ───── */

const StatCard = ({ label, value, icon, color }) => (
  <div className={`rounded-xl p-4 ${color} border`}>
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm font-medium opacity-70">{label}</p>
        <p className="text-2xl font-bold mt-1">{value}</p>
      </div>
      <span className="text-3xl">{icon}</span>
    </div>
  </div>
);

const ActivityCard = ({ activity }) => {
  const cfg = ACTION_CONFIG[activity.action] || ACTION_CONFIG.other;
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-4 hover:shadow-md transition-shadow">
      {/* header row */}
      <div className="flex items-start gap-3">
        {/* icon */}
        <div className="flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center bg-gray-50 text-xl">
          {cfg.icon}
        </div>

        {/* body */}
        <div className="flex-1 min-w-0">
          {/* action badge + time */}
          <div className="flex items-center flex-wrap gap-2 mb-1">
            <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${cfg.color}`}>
              {cfg.label}
            </span>
            <span className="text-xs text-gray-400">{timeAgo(activity.createdAt)}</span>
          </div>

          {/* description */}
          <p className="text-sm text-gray-800 font-medium">{activity.description}</p>

          {/* admin info */}
          <p className="text-xs text-gray-500 mt-1">
            by <span className="font-semibold text-gray-700">{activity.adminName}</span>
            {' '}({activity.adminEmail})
          </p>

          {/* target info */}
          {activity.target?.name && (
            <div className="mt-2 text-xs text-gray-500 flex flex-wrap gap-x-4 gap-y-1">
              <span>
                <span className="font-medium text-gray-600">Target:</span> {activity.target.name}
              </span>
              {activity.target.email && (
                <span>
                  <span className="font-medium text-gray-600">Email:</span> {activity.target.email}
                </span>
              )}
            </div>
          )}

          {/* expandable details */}
          {activity.details && Object.keys(activity.details).length > 0 && (
            <button
              onClick={() => setExpanded(!expanded)}
              className="text-xs text-blue-600 hover:text-blue-800 mt-2 font-medium"
            >
              {expanded ? '▲ Hide Details' : '▼ Show Details'}
            </button>
          )}

          {expanded && activity.details && (
            <div className="mt-2 bg-gray-50 rounded-lg p-3 text-xs space-y-1">
              {Object.entries(activity.details).map(([key, val]) => {
                if (key === 'changes' && typeof val === 'object' && val !== null) {
                  return (
                    <div key={key}>
                      <span className="font-semibold text-gray-600">Changes:</span>
                      <div className="ml-3 mt-1 space-y-1">
                        {Object.entries(val).map(([field, change]) => (
                          <div key={field} className="flex gap-2">
                            <span className="font-medium text-gray-700">{field}:</span>
                            <span className="text-red-600 line-through">{String(change.from)}</span>
                            <span>→</span>
                            <span className="text-green-600">{String(change.to)}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                }
                return (
                  <div key={key} className="flex gap-2">
                    <span className="font-medium text-gray-600 capitalize">
                      {key.replace(/([A-Z])/g, ' $1')}:
                    </span>
                    <span className="text-gray-700">{String(val)}</span>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* timestamp right */}
        <div className="flex-shrink-0 text-right hidden sm:block">
          <p className="text-xs text-gray-500">{formatDate(activity.createdAt)}</p>
          <p className="text-xs text-gray-400">{formatTime(activity.createdAt)}</p>
        </div>
      </div>
    </div>
  );
};

/* ───── main page ───── */

const AdminHistory = () => {
  const [activities, setActivities] = useState([]);
  const [stats, setStats] = useState(null);
  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statsLoading, setStatsLoading] = useState(true);
  const [error, setError] = useState('');

  // filters
  const [period, setPeriod] = useState('lifetime');
  const [actionCategory, setActionCategory] = useState('');
  const [adminId, setAdminId] = useState('');
  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ total: 0, pages: 1 });
  const LIMIT = 20;

  // ── fetch admin list (once) ──
  useEffect(() => {
    const fetchAdmins = async () => {
      try {
        const res = await api.get('/admin/activity-history/admins');
        if (res.success) setAdmins(res.data);
      } catch (err) {
        console.error('Failed to load admins:', err);
      }
    };
    fetchAdmins();
  }, []);

  // ── fetch stats ──
  const fetchStats = useCallback(async () => {
    setStatsLoading(true);
    try {
      const res = await api.get(`/admin/activity-history/stats?period=${period}`);
      if (res.success) setStats(res.data);
    } catch (err) {
      console.error('Failed to load stats:', err);
    } finally {
      setStatsLoading(false);
    }
  }, [period]);

  // ── fetch activities ──
  const fetchActivities = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const params = new URLSearchParams({
        period,
        page: String(page),
        limit: String(LIMIT),
        ...(actionCategory && { actionCategory }),
        ...(adminId && { adminId }),
        ...(search && { search })
      });

      const res = await api.get(`/admin/activity-history?${params.toString()}`);
      if (res.success) {
        setActivities(res.data);
        setPagination(res.pagination);
      }
    } catch (err) {
      setError(err.message || 'Failed to load activity history');
    } finally {
      setLoading(false);
    }
  }, [period, page, actionCategory, adminId, search]);

  // trigger fetches when filters change
  useEffect(() => {
    fetchActivities();
    fetchStats();
  }, [fetchActivities, fetchStats]);

  // reset page when filters change
  useEffect(() => {
    setPage(1);
  }, [period, actionCategory, adminId, search]);

  // debounce search
  useEffect(() => {
    const t = setTimeout(() => setSearch(searchInput), 400);
    return () => clearTimeout(t);
  }, [searchInput]);

  const handleRefresh = () => {
    fetchActivities();
    fetchStats();
  };

  /* ── render ── */
  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6 lg:p-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Admin Activity History</h1>
          <p className="text-sm text-gray-500 mt-1">
            Track all admin actions across the platform
          </p>
        </div>
        <button
          onClick={handleRefresh}
          className="self-start sm:self-auto inline-flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50 transition"
        >
          🔄 Refresh
        </button>
      </div>

      {/* Stats */}
      {stats && !statsLoading && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <StatCard
            label="Total Activities"
            value={stats.total}
            icon="📊"
            color="bg-white border-gray-200"
          />
          <StatCard
            label="Vendor Actions"
            value={stats.byCategory.find(c => c._id === 'vendor')?.count || 0}
            icon="🏪"
            color="bg-green-50 border-green-200"
          />
          <StatCard
            label="Product Actions"
            value={stats.byCategory.find(c => c._id === 'product')?.count || 0}
            icon="💊"
            color="bg-blue-50 border-blue-200"
          />
          <StatCard
            label="Order Actions"
            value={stats.byCategory.find(c => c._id === 'order')?.count || 0}
            icon="📦"
            color="bg-purple-50 border-purple-200"
          />
        </div>
      )}

      {/* Admin breakdown */}
      {stats?.byAdmin && stats.byAdmin.length > 0 && (
        <div className="bg-white border border-gray-200 rounded-xl p-4 mb-6">
          <h3 className="text-sm font-semibold text-gray-700 mb-3">Activity by Admin</h3>
          <div className="flex flex-wrap gap-4">
            {stats.byAdmin.map(a => (
              <div
                key={a._id}
                className="flex items-center gap-3 bg-gray-50 rounded-lg px-4 py-2 cursor-pointer hover:bg-gray-100 transition"
                onClick={() => setAdminId(adminId === a._id ? '' : a._id)}
              >
                <div className="w-8 h-8 rounded-full bg-blue-500 text-white flex items-center justify-center text-sm font-bold">
                  {a.adminName?.charAt(0)?.toUpperCase() || '?'}
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-800">{a.adminName}</p>
                  <p className="text-xs text-gray-500">{a.count} actions</p>
                </div>
                {adminId === a._id && (
                  <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">
                    Filtered
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white border border-gray-200 rounded-xl p-4 mb-6 space-y-4">
        {/* Period tabs */}
        <div className="flex flex-wrap gap-2">
          {PERIODS.map(p => (
            <button
              key={p.key}
              onClick={() => setPeriod(p.key)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                period === p.key
                  ? 'bg-blue-600 text-white shadow'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>

        {/* Second row: category, admin, search */}
        <div className="flex flex-col sm:flex-row gap-3">
          {/* category */}
          <select
            value={actionCategory}
            onChange={e => setActionCategory(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            {CATEGORIES.map(c => (
              <option key={c.key} value={c.key}>{c.label}</option>
            ))}
          </select>

          {/* admin */}
          <select
            value={adminId}
            onChange={e => setAdminId(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">All Admins</option>
            {admins.map(a => (
              <option key={a._id} value={a._id}>{a.name} ({a.email})</option>
            ))}
          </select>

          {/* search */}
          <div className="flex-1">
            <input
              type="text"
              value={searchInput}
              onChange={e => setSearchInput(e.target.value)}
              placeholder="Search activities..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>

        {/* Active filters */}
        {(adminId || actionCategory || search) && (
          <div className="flex items-center gap-2 text-xs">
            <span className="text-gray-500">Active filters:</span>
            {adminId && (
              <span className="inline-flex items-center gap-1 bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">
                Admin: {admins.find(a => a._id === adminId)?.name || adminId}
                <button onClick={() => setAdminId('')} className="hover:text-blue-900">✕</button>
              </span>
            )}
            {actionCategory && (
              <span className="inline-flex items-center gap-1 bg-green-100 text-green-700 px-2 py-0.5 rounded-full">
                {CATEGORIES.find(c => c.key === actionCategory)?.label}
                <button onClick={() => setActionCategory('')} className="hover:text-green-900">✕</button>
              </span>
            )}
            {search && (
              <span className="inline-flex items-center gap-1 bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded-full">
                "{search}"
                <button onClick={() => { setSearch(''); setSearchInput(''); }} className="hover:text-yellow-900">✕</button>
              </span>
            )}
            <button
              onClick={() => { setAdminId(''); setActionCategory(''); setSearch(''); setSearchInput(''); }}
              className="text-gray-500 hover:text-gray-700 underline ml-2"
            >
              Clear all
            </button>
          </div>
        )}
      </div>

      {/* Error */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-xl mb-6">
          <p className="text-sm">{error}</p>
          <button onClick={handleRefresh} className="text-sm underline mt-1">Try again</button>
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div className="flex items-center justify-center py-20">
          <div className="animate-spin h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full" />
          <span className="ml-3 text-gray-500">Loading activities...</span>
        </div>
      )}

      {/* Activity list */}
      {!loading && activities.length === 0 && (
        <div className="text-center py-20 bg-white border border-gray-200 rounded-xl">
          <p className="text-4xl mb-3">📭</p>
          <p className="text-gray-500 font-medium">No activities found</p>
          <p className="text-sm text-gray-400 mt-1">
            Try changing the filters or time period
          </p>
        </div>
      )}

      {!loading && activities.length > 0 && (
        <>
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm text-gray-500">
              Showing {(page - 1) * LIMIT + 1}–{Math.min(page * LIMIT, pagination.total)} of{' '}
              {pagination.total} activities
            </p>
          </div>

          <div className="space-y-3">
            {activities.map(activity => (
              <ActivityCard key={activity._id} activity={activity} />
            ))}
          </div>

          {/* Pagination */}
          {pagination.pages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-6">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm disabled:opacity-40 hover:bg-gray-50"
              >
                ← Prev
              </button>

              {Array.from({ length: Math.min(pagination.pages, 7) }, (_, i) => {
                let pageNum;
                if (pagination.pages <= 7) {
                  pageNum = i + 1;
                } else if (page <= 4) {
                  pageNum = i + 1;
                } else if (page >= pagination.pages - 3) {
                  pageNum = pagination.pages - 6 + i;
                } else {
                  pageNum = page - 3 + i;
                }
                return (
                  <button
                    key={pageNum}
                    onClick={() => setPage(pageNum)}
                    className={`px-3 py-2 rounded-lg text-sm font-medium transition ${
                      page === pageNum
                        ? 'bg-blue-600 text-white shadow'
                        : 'border border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    {pageNum}
                  </button>
                );
              })}

              <button
                onClick={() => setPage(p => Math.min(pagination.pages, p + 1))}
                disabled={page === pagination.pages}
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm disabled:opacity-40 hover:bg-gray-50"
              >
                Next →
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default AdminHistory;