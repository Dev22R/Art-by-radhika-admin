import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Link } from 'react-router-dom';
import {
  Users,
  Palette,
  Film,
  MailQuestion,
  TrendingUp,
  Sparkles,
  Calendar,
  Phone,
  Eye,
  Plus,
  ArrowUpRight,
  ShieldCheck,
  HeartHandshake,
  RefreshCw,
  Clock,
  Layers,
  Heart,
  MessageCircle,
  Share2,
  CalendarDays,
  DollarSign
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend
} from 'recharts';
import ReactECharts from 'echarts-for-react';
import { fetchDashboardOverview, setTimeRange } from '../redux/slices/dashboardSlice';
import StatsCard from '../components/common/StatsCard';
import StatusBadge from '../components/common/StatusBadge';
import { formatCurrency, formatDate, formatTimeAgo } from '../utils/formatters';
import { toast } from 'sonner';

export const Dashboard = () => {
  const dispatch = useDispatch();
  const user = useSelector((state) => state.auth.user);
  const theme = useSelector((state) => state.theme.mode);
  const { stats, charts, range, loading, error, lastUpdated } = useSelector(
    (state) => state.dashboard
  );

  const [activeChartTab, setActiveChartTab] = useState('revenue');

  // Fetch Dashboard data on mount and whenever time range changes
  useEffect(() => {
    dispatch(fetchDashboardOverview(range));
  }, [dispatch, range]);

  const handleRefresh = async () => {
    try {
      await dispatch(fetchDashboardOverview(range)).unwrap();
      toast.success('Dashboard data refreshed from server');
    } catch (err) {
      toast.error('Failed to refresh dashboard data');
    }
  };

  const handleRangeChange = (newRange) => {
    dispatch(setTimeRange(newRange));
  };

  // Metrics Extract
  const metrics = stats?.metrics || {};
  const revenueMetric = metrics.revenue || {};
  const bookingsMetric = metrics.bookings || {};
  const clientsMetric = metrics.clients || {};
  const designsMetric = metrics.designs || {};
  const reelsMetric = metrics.reels || {};
  const inquiriesMetric = metrics.inquiries || {};

  // Recent Inquiries & Top Designs from API
  const recentInquiries = stats?.recentInquiries || [];
  const topDesigns = stats?.topDesigns || [];
  const topReels = charts?.topPerformingReels || [];

  // Chart Data Extracts
  const revenueTrends = charts?.revenueTrends || [];
  const clientGrowthTrends = charts?.clientGrowthTrends || [];
  const categoryPerformance = charts?.categoryPerformance || [];
  const weekdayDistribution = charts?.weekdayDistribution || [];

  // Fallback / default data for revenue trends if empty
  const displayRevenueTrends =
    revenueTrends.length > 0
      ? revenueTrends
      : [
          { month: 'May', revenue: 0, bookings: 0 },
          { month: 'Jun', revenue: 0, bookings: 0 },
          { month: 'Jul', revenue: 0, bookings: 0 },
          { month: 'Aug', revenue: 0, bookings: 0 },
          { month: 'Sep', revenue: 0, bookings: 0 },
          { month: 'Oct', revenue: 0, bookings: 0 }
        ];

  // ECharts Category Performance Options
  const echartsCategoryOptions = {
    tooltip: {
      trigger: 'item',
      formatter: '{b}: {c} Designs ({d}%)'
    },
    legend: {
      bottom: '0%',
      left: 'center',
      textStyle: {
        color: theme === 'dark' ? '#d1d5db' : '#4b5563',
        fontSize: 11
      }
    },
    series: [
      {
        name: 'Design Categories',
        type: 'pie',
        radius: ['45%', '70%'],
        avoidLabelOverlap: false,
        itemStyle: {
          borderRadius: 8,
          borderColor: theme === 'dark' ? '#18181b' : '#fff',
          borderWidth: 2
        },
        label: { show: false, position: 'center' },
        emphasis: {
          label: { show: true, fontSize: 13, fontWeight: 'bold' }
        },
        data:
          categoryPerformance.length > 0
            ? categoryPerformance.map((c, idx) => {
                const colors = ['#b45309', '#d97706', '#9a3412', '#047857', '#7c3aed', '#ec4899'];
                return {
                  value: c.designsCount || 1,
                  name: c.category || `Category ${idx + 1}`,
                  itemStyle: { color: colors[idx % colors.length] }
                };
              })
            : [
                { value: designsMetric.published || 3, name: 'Bridal Henna', itemStyle: { color: '#b45309' } },
                { value: 1, name: 'Arabic', itemStyle: { color: '#d97706' } },
                { value: 1, name: 'Rajasthani', itemStyle: { color: '#9a3412' } }
              ]
      }
    ]
  };

  return (
    <div className="space-y-8">
      {/* Top Banner & Timeframe Controls */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-amber-800 via-amber-700 to-yellow-600 p-6 sm:p-8 text-white shadow-xl shadow-amber-900/20">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-white/15 backdrop-blur-md text-amber-100 border border-white/20">
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              Live Studio Overview • {range.toUpperCase()}
            </div>
            <h1 className="text-2xl sm:text-4xl font-bold font-royal leading-tight">
              Welcome back, {user?.name || 'Radhika'}!
            </h1>
            <p className="text-amber-100/90 text-xs sm:text-sm leading-relaxed">
              Track real-time inquiries, booking revenue, and bridal portfolio engagement.
            </p>
          </div>

          {/* Time Range Selector & Actions */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="bg-black/30 backdrop-blur-md p-1 rounded-2xl flex items-center gap-1 border border-white/10 text-xs font-semibold">
              {[
                { label: '1M', value: '1month' },
                { label: '2M', value: '2months' },
                { label: '6M', value: '6months' },
                { label: '12M', value: '12months' }
              ].map((r) => (
                <button
                  key={r.value}
                  onClick={() => handleRangeChange(r.value)}
                  className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer ${
                    range === r.value
                      ? 'bg-white text-amber-900 shadow-md font-bold'
                      : 'text-amber-100 hover:text-white hover:bg-white/10'
                  }`}
                >
                  {r.label}
                </button>
              ))}
            </div>

            <button
              onClick={handleRefresh}
              disabled={loading}
              className="p-2.5 rounded-2xl bg-white/15 hover:bg-white/25 border border-white/20 text-white transition-all cursor-pointer"
              title="Refresh Stats"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        {/* Decorative gold shimmer glow */}
        <div className="absolute -right-16 -top-16 w-64 h-64 rounded-full bg-yellow-400/20 blur-3xl pointer-events-none" />
      </div>

      {/* KPI Stats Grid (From Real API Metrics) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <StatsCard
          title="Total Revenue"
          value={formatCurrency(revenueMetric.total || 0)}
          change={`${revenueMetric.growthPercentage || 0}%`}
          isPositive={(revenueMetric.growthPercentage || 0) >= 0}
          icon={TrendingUp}
          color="amber"
        />
        <StatsCard
          title="Total Clients"
          value={clientsMetric.total || 0}
          change={`${clientsMetric.growthPercentage || 100}%`}
          isPositive={(clientsMetric.growthPercentage || 0) >= 0}
          icon={Users}
          color="emerald"
        />
        <StatsCard
          title="Portfolio Designs"
          value={designsMetric.total || 0}
          change={`${designsMetric.featured || 0} featured`}
          isPositive={true}
          icon={Palette}
          color="purple"
        />
        <StatsCard
          title="Reels Total Views"
          value={reelsMetric.totalViews || 0}
          change={`${reelsMetric.totalLikes || 0} likes`}
          isPositive={true}
          icon={Film}
          color="rose"
        />
      </div>

      {/* Secondary Metrics Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 rounded-3xl bg-white dark:bg-zinc-900 border border-stone-200/80 dark:border-zinc-800 shadow-sm text-center">
        <div className="p-2">
          <span className="text-[11px] font-bold uppercase tracking-wider text-stone-400 block">Total Inquiries</span>
          <span className="text-lg font-bold font-royal text-stone-900 dark:text-white">
            {inquiriesMetric.total || 0} ({inquiriesMetric.accepted || 0} Accepted)
          </span>
        </div>
        <div className="p-2 border-l border-stone-100 dark:border-zinc-800">
          <span className="text-[11px] font-bold uppercase tracking-wider text-stone-400 block">Bookings Pending</span>
          <span className="text-lg font-bold font-royal text-amber-700 dark:text-amber-400">
            {bookingsMetric.pending || 0}
          </span>
        </div>
        <div className="p-2 border-l border-stone-100 dark:border-zinc-800">
          <span className="text-[11px] font-bold uppercase tracking-wider text-stone-400 block">Published Reels</span>
          <span className="text-lg font-bold font-royal text-emerald-700 dark:text-emerald-400">
            {reelsMetric.published || 0}
          </span>
        </div>
        <div className="p-2 border-l border-stone-100 dark:border-zinc-800">
          <span className="text-[11px] font-bold uppercase tracking-wider text-stone-400 block">Design Categories</span>
          <span className="text-lg font-bold font-royal text-purple-700 dark:text-purple-400">
            {metrics.catalogs?.categories || 8}
          </span>
        </div>
      </div>

      {/* Analytics Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Revenue & Growth Chart (Recharts) */}
        <div className="lg:col-span-2 rounded-3xl p-6 bg-white dark:bg-zinc-900 border border-stone-200/80 dark:border-zinc-800 shadow-sm flex flex-col justify-between">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-stone-100 dark:border-zinc-800 mb-4 gap-2">
            <div>
              <h2 className="text-lg font-bold font-royal text-stone-900 dark:text-white">
                Revenue & Client Analytics
              </h2>
              <p className="text-xs text-stone-500 dark:text-stone-400">
                Performance trends across {range} timeframe
              </p>
            </div>

            {/* Chart Mode Toggle */}
            <div className="flex items-center gap-1 bg-stone-100 dark:bg-zinc-800 p-1 rounded-2xl text-xs font-semibold">
              <button
                onClick={() => setActiveChartTab('revenue')}
                className={`px-3 py-1 rounded-xl transition-all cursor-pointer ${
                  activeChartTab === 'revenue'
                    ? 'bg-white dark:bg-zinc-900 text-amber-800 dark:text-amber-400 shadow-sm font-bold'
                    : 'text-stone-500 hover:text-stone-800 dark:hover:text-stone-300'
                }`}
              >
                Revenue (₹)
              </button>
              <button
                onClick={() => setActiveChartTab('clients')}
                className={`px-3 py-1 rounded-xl transition-all cursor-pointer ${
                  activeChartTab === 'clients'
                    ? 'bg-white dark:bg-zinc-900 text-amber-800 dark:text-amber-400 shadow-sm font-bold'
                    : 'text-stone-500 hover:text-stone-800 dark:hover:text-stone-300'
                }`}
              >
                Client Growth
              </button>
            </div>
          </div>

          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              {activeChartTab === 'revenue' ? (
                <AreaChart
                  data={displayRevenueTrends}
                  margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                >
                  <defs>
                    <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#d97706" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#d97706" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke={theme === 'dark' ? '#27272a' : '#f3f4f6'}
                  />
                  <XAxis
                    dataKey="month"
                    stroke={theme === 'dark' ? '#a1a1aa' : '#78716c'}
                    fontSize={12}
                  />
                  <YAxis
                    stroke={theme === 'dark' ? '#a1a1aa' : '#78716c'}
                    fontSize={12}
                    tickFormatter={(v) => `₹${v}`}
                  />
                  <Tooltip
                    formatter={(value) => [`₹${Number(value).toLocaleString('en-IN')}`, 'Revenue']}
                    contentStyle={{
                      backgroundColor: theme === 'dark' ? '#18181b' : '#ffffff',
                      borderColor: '#f59e0b',
                      borderRadius: '12px',
                      fontSize: '12px'
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="revenue"
                    stroke="#b45309"
                    strokeWidth={3}
                    fillOpacity={1}
                    fill="url(#revenueGrad)"
                  />
                </AreaChart>
              ) : (
                <BarChart
                  data={clientGrowthTrends}
                  margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke={theme === 'dark' ? '#27272a' : '#f3f4f6'}
                  />
                  <XAxis
                    dataKey="month"
                    stroke={theme === 'dark' ? '#a1a1aa' : '#78716c'}
                    fontSize={12}
                  />
                  <YAxis
                    stroke={theme === 'dark' ? '#a1a1aa' : '#78716c'}
                    fontSize={12}
                    allowDecimals={false}
                  />
                  <Tooltip
                    formatter={(value) => [value, 'New Clients']}
                    contentStyle={{
                      backgroundColor: theme === 'dark' ? '#18181b' : '#ffffff',
                      borderColor: '#10b981',
                      borderRadius: '12px',
                      fontSize: '12px'
                    }}
                  />
                  <Bar dataKey="newClients" fill="#059669" radius={[6, 6, 0, 0]} />
                </BarChart>
              )}
            </ResponsiveContainer>
          </div>
        </div>

        {/* ECharts Category Distribution */}
        <div className="rounded-3xl p-6 bg-white dark:bg-zinc-900 border border-stone-200/80 dark:border-zinc-800 shadow-sm flex flex-col justify-between">
          <div className="pb-4 border-b border-stone-100 dark:border-zinc-800 mb-2">
            <h2 className="text-lg font-bold font-royal text-stone-900 dark:text-white">
              Category Distribution
            </h2>
            <p className="text-xs text-stone-500 dark:text-stone-400">
              Live portfolio mehndi breakdown
            </p>
          </div>
          <div className="flex-1 min-h-[260px] flex items-center justify-center">
            <ReactECharts option={echartsCategoryOptions} style={{ height: '260px', width: '100%' }} />
          </div>
        </div>
      </div>

      {/* Top Performing Reels Showcase (From API) */}
      {topReels.length > 0 && (
        <div className="rounded-3xl p-6 bg-white dark:bg-zinc-900 border border-stone-200/80 dark:border-zinc-800 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-stone-100 dark:border-zinc-800">
            <div>
              <h2 className="text-lg font-bold font-royal text-stone-900 dark:text-white">
                Top Performing Video Reels
              </h2>
              <p className="text-xs text-stone-500 dark:text-stone-400">
                Most engaged video tutorials & stain reveals
              </p>
            </div>
            <Link
              to="/reels"
              className="text-xs font-bold text-amber-700 dark:text-amber-400 hover:underline flex items-center gap-1"
            >
              View All Reels <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {topReels.slice(0, 6).map((reel) => (
              <div
                key={reel._id}
                className="group relative rounded-2xl overflow-hidden bg-stone-900 aspect-[9/13] flex flex-col justify-end p-2.5 text-white border border-stone-800 hover:border-amber-500 transition-all shadow-sm"
              >
                <img
                  src={reel.thumbnail?.url || 'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=500&auto=format&fit=crop&q=80'}
                  alt={reel.title}
                  className="absolute inset-0 w-full h-full object-cover opacity-80 group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent" />

                <div className="relative z-10 space-y-1">
                  <h4 className="text-[11px] font-bold leading-tight line-clamp-1">
                    {reel.title}
                  </h4>
                  <div className="flex items-center justify-between text-[10px] text-stone-300">
                    <span className="flex items-center gap-0.5">
                      <Eye className="w-3 h-3 text-amber-400" /> {reel.viewCount || 0}
                    </span>
                    <span className="flex items-center gap-0.5">
                      <Heart className="w-3 h-3 text-rose-400" /> {reel.likeCount || 0}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Bottom Section: Recent Inquiries (API) & Top Designs (API) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Inquiries Section (API: stats.recentInquiries) */}
        <div className="lg:col-span-2 rounded-3xl p-6 bg-white dark:bg-zinc-900 border border-stone-200/80 dark:border-zinc-800 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-4 border-b border-stone-100 dark:border-zinc-800 mb-4">
              <div>
                <h2 className="text-lg font-bold font-royal text-stone-900 dark:text-white">
                  Recent Booking Inquiries
                </h2>
                <p className="text-xs text-stone-500 dark:text-stone-400">
                  Click any inquiry card to view full details & manage bookings
                </p>
              </div>
              <Link
                to="/enquiries"
                className="text-xs font-bold text-amber-700 dark:text-amber-400 hover:underline flex items-center gap-1"
              >
                All Inquiries ({recentInquiries.length}) <ArrowUpRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {/* Small Interactive Cards Grid */}
            {recentInquiries.length === 0 ? (
              <div className="p-8 text-center text-stone-400 bg-stone-50/50 dark:bg-zinc-800/40 rounded-2xl border border-dashed border-stone-200 dark:border-zinc-700">
                <MailQuestion className="w-8 h-8 mx-auto text-amber-600/60 mb-2" />
                <p className="text-xs font-semibold">No recent booking inquiries right now.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                {recentInquiries.map((inq) => (
                  <Link
                    key={inq._id}
                    to="/enquiries"
                    className="group relative p-4 rounded-2xl bg-gradient-to-br from-amber-50/50 via-stone-50/40 to-white dark:from-zinc-800/60 dark:via-zinc-800/40 dark:to-zinc-900 border border-amber-200/60 dark:border-zinc-700/60 hover:border-amber-500 dark:hover:border-amber-400/80 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 flex flex-col justify-between"
                  >
                    <div>
                      {/* Card Header: Client Name & Status */}
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-amber-600 to-yellow-600 text-white font-bold text-xs flex items-center justify-center shadow-sm">
                            {inq.name ? inq.name.charAt(0).toUpperCase() : 'A'}
                          </div>
                          <div>
                            <h3 className="font-bold text-xs sm:text-sm text-stone-900 dark:text-white group-hover:text-amber-700 dark:group-hover:text-amber-400 transition-colors leading-tight">
                              {inq.name}
                            </h3>
                            <span className="text-[11px] text-stone-400">
                              {inq.phone}
                            </span>
                          </div>
                        </div>
                        <StatusBadge status={inq.status} />
                      </div>

                      {/* Project Title */}
                      <p className="text-xs font-semibold text-stone-700 dark:text-stone-300 line-clamp-1 mt-1">
                        {inq.projectTitle || inq.requestType || 'Custom Bridal Mehndi'}
                      </p>
                    </div>

                    {/* Card Footer: Price, Date & Actions */}
                    <div className="mt-3 pt-3 border-t border-stone-100 dark:border-zinc-700/60 flex items-center justify-between">
                      <div>
                        <span className="text-[10px] text-stone-400 uppercase font-semibold block">Quoted Price</span>
                        <span className="font-royal font-bold text-xs sm:text-sm text-amber-800 dark:text-amber-400">
                          {formatCurrency(inq.quotedPrice || 0)}
                        </span>
                      </div>

                      <div className="flex items-center gap-1.5">
                        <span className="text-[10px] text-stone-400 hidden xs:inline">
                          {formatDate(inq.createdAt)}
                        </span>

                        <a
                          href={`https://wa.me/${inq.phone ? inq.phone.replace(/[^0-9]/g, '') : ''}?text=Hello%20${encodeURIComponent(inq.name)},%20this%20is%20Art%20By%20Radhika!`}
                          target="_blank"
                          rel="noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          className="p-1.5 rounded-xl bg-emerald-100/80 hover:bg-emerald-200 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300 border border-emerald-300/50 dark:border-emerald-800 text-xs transition-colors"
                          title="Chat on WhatsApp"
                        >
                          <Phone className="w-3.5 h-3.5" />
                        </a>

                        <div className="p-1.5 rounded-xl text-stone-400 group-hover:text-amber-600 dark:group-hover:text-amber-400 group-hover:translate-x-0.5 transition-all">
                          <ArrowUpRight className="w-4 h-4" />
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Top Designs Grid (API: stats.topDesigns) */}
        <div className="rounded-3xl p-6 bg-white dark:bg-zinc-900 border border-stone-200/80 dark:border-zinc-800 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-4 border-b border-stone-100 dark:border-zinc-800 mb-4">
              <div>
                <h2 className="text-lg font-bold font-royal text-stone-900 dark:text-white">
                  Top Designs
                </h2>
                <p className="text-xs text-stone-500 dark:text-stone-400">
                  Most viewed portfolio artworks
                </p>
              </div>
              <Link
                to="/designs"
                className="text-xs font-bold text-amber-700 dark:text-amber-400 hover:underline"
              >
                Manage
              </Link>
            </div>

            <div className="space-y-3">
              {topDesigns.length === 0 ? (
                <p className="text-xs text-stone-400 text-center py-6">No top designs found.</p>
              ) : (
                topDesigns.slice(0, 3).map((des) => (
                  <div
                    key={des._id}
                    className="flex items-center gap-3 p-2.5 rounded-2xl bg-stone-50 dark:bg-zinc-800/50 border border-stone-200/60 dark:border-zinc-700/60 hover:border-amber-400 transition-colors"
                  >
                    <img
                      src={des.coverImage || 'https://images.unsplash.com/photo-1599818499218-55ed400708b8?q=80&w=1200&auto=format&fit=crop'}
                      alt={des.title}
                      className="w-14 h-14 rounded-xl object-cover ring-1 ring-amber-500/20 shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <h4 className="text-xs font-bold text-stone-900 dark:text-white truncate">
                        {des.title}
                      </h4>
                      <p className="text-[11px] text-amber-700 dark:text-amber-400 font-semibold">
                        {formatCurrency(des.price || 0)} • {des.category?.toUpperCase() || 'BRIDAL'}
                      </p>
                      <div className="flex items-center gap-3 text-[10px] text-stone-400 mt-0.5">
                        <span className="flex items-center gap-1">
                          <Eye className="w-3 h-3 text-amber-500" /> {des.viewCount || 0} views
                        </span>
                        <span className="flex items-center gap-1">
                          <Heart className="w-3 h-3 text-rose-500" /> {des.likeCount || 0} likes
                        </span>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-stone-100 dark:border-zinc-800">
            <Link
              to="/designs"
              className="w-full py-3 rounded-2xl bg-amber-50 dark:bg-zinc-800 text-amber-800 dark:text-amber-300 hover:bg-amber-100 text-xs font-bold flex items-center justify-center gap-2 transition-colors border border-amber-200 dark:border-zinc-700"
            >
              <Palette className="w-4 h-4" /> View All Portfolio Designs
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
