'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import axios from '@/app/lib/axios';
import Navbar from '@/app/components/Navbar';
import { useAuthStore } from '@/app/store/useAuthStore';
import toast from 'react-hot-toast';
import { FiEye, FiPackage, FiTruck, FiCheck, FiX, FiClock, FiSearch, FiShoppingBag } from 'react-icons/fi';
import PageTransition, { StaggerContainer, StaggerItem, FadeIn } from '@/app/components/PageTransition';

interface Order {
  id: string;
  user_id: string;
  status: string;
  total_amount: number;
  discount_amount: number;
  created_at: string;
  user: {
    name: string;
    email: string;
  };
  payment: {
    status: string;
    amount: number;
    payment_method: string;
    paid_at: string;
  } | null;
}

export default function AdminOrdersPage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState<any>(null);
  const [filter, setFilter] = useState('');
  const [search, setSearch] = useState('');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    
    if (!user) {
      router.push('/login');
      return;
    }
    if (user.role !== 'admin') {
      router.push('/');
      return;
    }
    fetchOrders();
  }, [user, mounted, filter]);

  const fetchOrders = async (page = 1) => {
    setLoading(true);
    try {
      const params: any = { page };
      if (filter) params.status = filter;
      if (search) params.search = search;
      
      const { data } = await axios.get('/admin/orders', { params });
      setOrders(data.data);
      setPagination({
        current_page: data.current_page,
        last_page: data.last_page,
        next_page_url: data.next_page_url,
        prev_page_url: data.prev_page_url,
      });
    } catch (error) {
      toast.error('Failed to fetch orders');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchOrders(1);
  };

  const handleFilterChange = (value: string) => {
    setFilter(value);
    fetchOrders(1);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <FiClock className="text-yellow-600" />;
      case 'processing': return <FiPackage className="text-blue-600" />;
      case 'shipped': return <FiTruck className="text-purple-600" />;
      case 'delivered': return <FiCheck className="text-lime-600" />;
      case 'cancelled': return <FiX className="text-red-600" />;
      default: return null;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'processing': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'shipped': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'delivered': return 'bg-lime-100 text-lime-800 border-lime-200';
      case 'cancelled': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-neutral-100 text-neutral-800 border-neutral-200';
    }
  };

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case 'paid': return 'text-lime-600';
      case 'pending': return 'text-yellow-600';
      case 'expired': return 'text-red-600';
      default: return 'text-neutral-500';
    }
  };

  const statusOptions = [
    { value: '', label: 'All Orders', icon: FiShoppingBag },
    { value: 'pending', label: 'Pending', icon: FiClock },
    { value: 'processing', label: 'Processing', icon: FiPackage },
    { value: 'shipped', label: 'Shipped', icon: FiTruck },
    { value: 'delivered', label: 'Delivered', icon: FiCheck },
    { value: 'cancelled', label: 'Cancelled', icon: FiX },
  ];

  return (
    <>
      <Navbar />
      <PageTransition>
      <div className="min-h-screen bg-neutral-50 py-8">
        <div className="container mx-auto px-4 max-w-6xl">
          {/* Header */}
          <FadeIn>
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-neutral-800">Orders Management</h1>
            <p className="text-neutral-500 mt-1">Monitor and manage customer orders</p>
          </div>
          </FadeIn>

          {/* Filters Bar */}
          <div className="bg-white rounded-2xl shadow-sm border border-neutral-200 p-4 mb-6">
            <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
              {/* Status Filter Pills */}
              <div className="flex flex-wrap gap-2">
                {statusOptions.map((option) => {
                  const Icon = option.icon;
                  const isActive = filter === option.value;
                  return (
                    <button
                      key={option.value}
                      onClick={() => handleFilterChange(option.value)}
                      className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all ${
                        isActive
                          ? 'bg-lime-600 text-white'
                          : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
                      }`}
                    >
                      <Icon size={16} />
                      {option.label}
                    </button>
                  );
                })}
              </div>

              {/* Search */}
              <form onSubmit={handleSearch} className="flex gap-2 w-full lg:w-auto">
                <div className="relative flex-1 lg:w-64">
                  <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
                  <input
                    type="text"
                    placeholder="Search customer..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 rounded-xl border border-neutral-200 text-neutral-700 focus:ring-2 focus:ring-lime-500 focus:border-lime-500 outline-none transition"
                  />
                </div>
                <button 
                  type="submit" 
                  className="bg-neutral-800 text-white px-4 py-2 rounded-xl hover:bg-neutral-700 transition"
                >
                  <FiSearch />
                </button>
              </form>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-white rounded-2xl shadow-sm border border-neutral-200 p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-yellow-100 rounded-xl flex items-center justify-center">
                  <FiClock className="text-yellow-600" />
                </div>
                <div>
                  <p className="text-sm text-neutral-500">Pending</p>
                  <p className="text-xl font-bold text-neutral-800">
                    {orders.filter(o => o.status === 'pending').length}
                  </p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-2xl shadow-sm border border-neutral-200 p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                  <FiPackage className="text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-neutral-500">Processing</p>
                  <p className="text-xl font-bold text-neutral-800">
                    {orders.filter(o => o.status === 'processing').length}
                  </p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-2xl shadow-sm border border-neutral-200 p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-lime-100 rounded-xl flex items-center justify-center">
                  <FiCheck className="text-lime-600" />
                </div>
                <div>
                  <p className="text-sm text-neutral-500">Delivered</p>
                  <p className="text-xl font-bold text-neutral-800">
                    {orders.filter(o => o.status === 'delivered').length}
                  </p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-2xl shadow-sm border border-neutral-200 p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-neutral-100 rounded-xl flex items-center justify-center">
                  <FiShoppingBag className="text-neutral-600" />
                </div>
                <div>
                  <p className="text-sm text-neutral-500">Total</p>
                  <p className="text-xl font-bold text-neutral-800">{orders.length}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Orders List */}
          <div className="space-y-4">
            {loading ? (
              <div className="bg-white rounded-2xl shadow-sm border border-neutral-200 p-12 text-center">
                <div className="flex items-center justify-center gap-3">
                  <svg className="animate-spin h-6 w-6 text-lime-600" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  <span className="text-neutral-600">Loading orders...</span>
                </div>
              </div>
            ) : orders.length === 0 ? (
              <div className="bg-white rounded-2xl shadow-sm border border-neutral-200 p-12 text-center">
                <div className="w-16 h-16 bg-neutral-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <FiShoppingBag className="text-neutral-400 text-2xl" />
                </div>
                <p className="text-neutral-500 text-lg">No orders found</p>
                <p className="text-neutral-400 text-sm mt-1">Orders will appear here when customers make purchases</p>
              </div>
            ) : (
              orders.map((order) => (
                <div 
                  key={order.id} 
                  className="bg-white rounded-2xl shadow-sm border border-neutral-200 p-6 hover:shadow-md transition-shadow"
                >
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    {/* Order Info */}
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 bg-lime-100 rounded-xl flex items-center justify-center flex-shrink-0">
                        <FiShoppingBag className="text-lime-600 text-xl" />
                      </div>
                      <div>
                        <div className="flex items-center gap-3 mb-1">
                          <span className="font-mono text-sm text-neutral-500">
                            #{order.id.slice(0, 8)}
                          </span>
                          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${getStatusColor(order.status)}`}>
                            {getStatusIcon(order.status)}
                            <span className="capitalize">{order.status}</span>
                          </span>
                        </div>
                        <p className="font-semibold text-neutral-800">{order.user?.name}</p>
                        <p className="text-sm text-neutral-500">{order.user?.email}</p>
                      </div>
                    </div>

                    {/* Order Details */}
                    <div className="flex items-center gap-8">
                      <div className="text-right">
                        <p className="text-sm text-neutral-500">Total Amount</p>
                        <p className="text-xl font-bold text-lime-600">
                          Rp {Number(order.total_amount).toLocaleString('id-ID')}
                        </p>
                        {order.discount_amount > 0 && (
                          <p className="text-xs text-lime-500">
                            -Rp {Number(order.discount_amount).toLocaleString('id-ID')} discount
                          </p>
                        )}
                      </div>

                      <div className="text-right">
                        <p className="text-sm text-neutral-500">Payment</p>
                        {order.payment ? (
                          <p className={`font-medium ${getPaymentStatusColor(order.payment.status)}`}>
                            {order.payment.status}
                          </p>
                        ) : (
                          <p className="text-neutral-400">—</p>
                        )}
                      </div>

                      <div className="text-right">
                        <p className="text-sm text-neutral-500">Date</p>
                        <p className="text-neutral-700">
                          {new Date(order.created_at).toLocaleDateString('id-ID')}
                        </p>
                      </div>

                      <Link
                        href={`/admin/orders/${order.id}`}
                        className="flex items-center gap-2 px-4 py-2 bg-neutral-800 text-white rounded-xl hover:bg-neutral-700 transition"
                      >
                        <FiEye size={18} />
                        <span className="hidden sm:inline">View</span>
                      </Link>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Pagination */}
          {pagination && pagination.last_page > 1 && (
            <div className="flex justify-center items-center gap-2 mt-8">
              <button
                onClick={() => fetchOrders(pagination.current_page - 1)}
                disabled={!pagination.prev_page_url}
                className="px-4 py-2 bg-white border border-neutral-200 rounded-xl text-neutral-600 hover:bg-neutral-50 disabled:opacity-50 disabled:cursor-not-allowed transition"
              >
                Previous
              </button>
              <div className="flex items-center gap-2">
                {Array.from({ length: pagination.last_page }, (_, i) => i + 1).map((page) => (
                  <button
                    key={page}
                    onClick={() => fetchOrders(page)}
                    className={`w-10 h-10 rounded-xl transition ${
                      page === pagination.current_page
                        ? 'bg-lime-600 text-white'
                        : 'bg-white border border-neutral-200 text-neutral-600 hover:bg-neutral-50'
                    }`}
                  >
                    {page}
                  </button>
                ))}
              </div>
              <button
                onClick={() => fetchOrders(pagination.current_page + 1)}
                disabled={!pagination.next_page_url}
                className="px-4 py-2 bg-white border border-neutral-200 rounded-xl text-neutral-600 hover:bg-neutral-50 disabled:opacity-50 disabled:cursor-not-allowed transition"
              >
                Next
              </button>
            </div>
          )}
        </div>
      </div>
      </PageTransition>
    </>
  );
}