import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  ChartBarIcon,
  CurrencyDollarIcon,
  ClipboardDocumentListIcon,
  UsersIcon,
  ArrowTrendingUpIcon,
} from '@heroicons/react/24/outline';
import Skeleton from '../../components/Skeleton';
import toast from 'react-hot-toast';

// Import recharts components
let LineChart: any, Line: any, XAxis: any, YAxis: any, CartesianGrid: any, Tooltip: any, Legend: any, ResponsiveContainer: any;
let BarChart: any, Bar: any;
let PieChart: any, Pie: any, Cell: any;
let AreaChart: any, Area: any;

try {
  const recharts = require('recharts');
  LineChart = recharts.LineChart;
  Line = recharts.Line;
  XAxis = recharts.XAxis;
  YAxis = recharts.YAxis;
  CartesianGrid = recharts.CartesianGrid;
  Tooltip = recharts.Tooltip;
  Legend = recharts.Legend;
  ResponsiveContainer = recharts.ResponsiveContainer;
  BarChart = recharts.BarChart;
  Bar = recharts.Bar;
  PieChart = recharts.PieChart;
  Pie = recharts.Pie;
  Cell = recharts.Cell;
  AreaChart = recharts.AreaChart;
  Area = recharts.Area;
} catch (e) {
  console.warn('Recharts not installed. Please run: npm install recharts');
}

interface AnalyticsData {
  timeSeries: Array<{
    date: string;
    dateLabel: string;
    revenue: number;
    bookings: number;
    users: number;
  }>;
  bookingsByStatus: {
    PENDING: number;
    CONFIRMED: number;
    COMPLETED: number;
    CANCELLED: number;
  };
  topDestinations: Array<{
    name: string;
    bookings: number;
  }>;
  revenueByMonth: Array<{
    month: string;
    revenue: number;
  }>;
  summary: {
    totalRevenue: number;
    totalBookings: number;
    totalUsers: number;
    averageRevenuePerDay: number;
  };
}

async function fetchAnalytics(period: string) {
  const token = localStorage.getItem('tg_token');
  const response = await fetch(`/api/admin/analytics?period=${period}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  if (!response.ok) throw new Error('Failed to fetch analytics');
  return response.json() as Promise<AnalyticsData>;
}

export default function AdminAnalytics() {
  const [period, setPeriod] = useState<'7days' | '30days' | '3months' | '1year'>('30days');
  const { data, isLoading, error } = useQuery({
    queryKey: ['admin-analytics', period],
    queryFn: () => fetchAnalytics(period),
  });

  if (error) {
    toast.error('Không thể tải dữ liệu phân tích');
  }

  const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899'];

  const formatCurrency = (n: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(n);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 border border-white/20">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="bg-gradient-to-br from-blue-500 to-indigo-500 p-4 rounded-2xl shadow-lg">
                <ChartBarIcon className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                  Phân tích Dữ liệu
                </h1>
                <p className="text-gray-600 mt-1">Thống kê và biểu đồ chi tiết</p>
              </div>
            </div>
            <select
              value={period}
              onChange={(e) => setPeriod(e.target.value as any)}
              className="text-sm border-2 border-gray-200 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 cursor-pointer bg-white"
            >
              <option value="7days">7 ngày qua</option>
              <option value="30days">30 ngày qua</option>
              <option value="3months">3 tháng qua</option>
              <option value="1year">1 năm qua</option>
            </select>
          </div>
        </div>

        {/* Summary Cards */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-32 rounded-2xl" />
            ))}
          </div>
        ) : data ? (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <StatCard
              title="Tổng Doanh thu"
              value={formatCurrency(data.summary.totalRevenue)}
              icon={CurrencyDollarIcon}
              gradient="from-green-500 to-emerald-600"
            />
            <StatCard
              title="Tổng Đặt chỗ"
              value={data.summary.totalBookings}
              icon={ClipboardDocumentListIcon}
              gradient="from-blue-500 to-cyan-600"
            />
            <StatCard
              title="Người dùng mới"
              value={data.summary.totalUsers}
              icon={UsersIcon}
              gradient="from-purple-500 to-pink-600"
            />
            <StatCard
              title="Doanh thu TB/ngày"
              value={formatCurrency(data.summary.averageRevenuePerDay)}
              icon={ArrowTrendingUpIcon}
              gradient="from-orange-500 to-red-600"
            />
          </div>
        ) : null}

        {/* Revenue Chart */}
        {isLoading ? (
          <Skeleton className="h-96 rounded-2xl" />
        ) : data && LineChart ? (
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 border border-white/20">
            <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
              <ChartBarIcon className="h-6 w-6 text-blue-600" />
              Doanh thu theo thời gian
            </h2>
            <ResponsiveContainer width="100%" height={400}>
              <AreaChart data={data.timeSeries}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10B981" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#10B981" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                <XAxis 
                  dataKey="dateLabel" 
                  stroke="#6B7280"
                  style={{ fontSize: '12px' }}
                />
                <YAxis 
                  stroke="#6B7280"
                  style={{ fontSize: '12px' }}
                  tickFormatter={(value: number) => `${(value / 1000000).toFixed(1)}M`}
                />
                <Tooltip
                  contentStyle={{ 
                    backgroundColor: 'white', 
                    border: '1px solid #E5E7EB',
                    borderRadius: '8px'
                  }}
                  formatter={(value: number) => formatCurrency(value)}
                />
                <Legend />
                <Area
                  type="monotone"
                  dataKey="revenue"
                  stroke="#10B981"
                  fillOpacity={1}
                  fill="url(#colorRevenue)"
                  name="Doanh thu"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="bg-yellow-50 border-2 border-yellow-300 rounded-2xl p-6">
            <p className="text-yellow-800 font-semibold">
              ⚠️ Vui lòng cài đặt recharts: <code className="bg-yellow-100 px-2 py-1 rounded">npm install recharts</code>
            </p>
          </div>
        )}

        {/* Bookings & Users Chart */}
        {isLoading ? (
          <Skeleton className="h-96 rounded-2xl" />
        ) : data && LineChart ? (
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 border border-white/20">
            <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
              <ChartBarIcon className="h-6 w-6 text-purple-600" />
              Đặt chỗ & Người dùng mới
            </h2>
            <ResponsiveContainer width="100%" height={400}>
              <LineChart data={data.timeSeries}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                <XAxis 
                  dataKey="dateLabel" 
                  stroke="#6B7280"
                  style={{ fontSize: '12px' }}
                />
                <YAxis 
                  stroke="#6B7280"
                  style={{ fontSize: '12px' }}
                />
                <Tooltip
                  contentStyle={{ 
                    backgroundColor: 'white', 
                    border: '1px solid #E5E7EB',
                    borderRadius: '8px'
                  }}
                />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="bookings" 
                  stroke="#3B82F6" 
                  strokeWidth={3}
                  name="Đặt chỗ"
                  dot={{ r: 4 }}
                />
                <Line 
                  type="monotone" 
                  dataKey="users" 
                  stroke="#8B5CF6" 
                  strokeWidth={3}
                  name="Người dùng mới"
                  dot={{ r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        ) : null}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Bookings by Status */}
          {isLoading ? (
            <Skeleton className="h-96 rounded-2xl" />
          ) : data && PieChart ? (
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 border border-white/20">
              <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                <ChartBarIcon className="h-6 w-6 text-orange-600" />
                Đặt chỗ theo trạng thái
              </h2>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={[
                      { name: 'Chờ xác nhận', value: data.bookingsByStatus.PENDING },
                      { name: 'Đã xác nhận', value: data.bookingsByStatus.CONFIRMED },
                      { name: 'Hoàn thành', value: data.bookingsByStatus.COMPLETED },
                      { name: 'Đã hủy', value: data.bookingsByStatus.CANCELLED },
                    ]}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }: { name: string; percent: number }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {[0, 1, 2, 3].map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          ) : null}

          {/* Top Destinations */}
          {isLoading ? (
            <Skeleton className="h-96 rounded-2xl" />
          ) : data && BarChart ? (
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 border border-white/20">
              <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                <ChartBarIcon className="h-6 w-6 text-green-600" />
                Điểm đến phổ biến
              </h2>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart 
                  data={data.topDestinations.slice(0, 5)}
                  layout="vertical"
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                  <XAxis type="number" stroke="#6B7280" style={{ fontSize: '12px' }} />
                  <YAxis 
                    type="category" 
                    dataKey="name" 
                    stroke="#6B7280"
                    style={{ fontSize: '12px' }}
                    width={120}
                  />
                  <Tooltip
                    contentStyle={{ 
                      backgroundColor: 'white', 
                      border: '1px solid #E5E7EB',
                      borderRadius: '8px'
                    }}
                  />
                  <Bar dataKey="bookings" fill="#10B981" radius={[0, 8, 8, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  gradient: string;
}

function StatCard({ title, value, icon: Icon, gradient }: StatCardProps) {
  return (
    <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-6 hover:shadow-2xl transition-all duration-300">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm font-semibold text-gray-600 mb-2">{title}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
        </div>
        <div className={`bg-gradient-to-br ${gradient} p-4 rounded-2xl shadow-lg`}>
          <Icon className="h-7 w-7 text-white" />
        </div>
      </div>
    </div>
  );
}

