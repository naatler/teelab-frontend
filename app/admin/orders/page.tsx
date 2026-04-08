'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import axios from '@/app/lib/axios';
import Navbar from '@/app/components/Navbar';
import { useAuthStore } from '@/app/store/useAuthStore';
import toast from 'react-hot-toast';
import { FiEye, FiPackage, FiTruck, FiCheck, FiX, FiClock } from 'react-icons/fi';

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

  useEffect(() => {
    if (!user) {
      router.push('/login');
      return;
    }
    if (user.role !== 'admin') {
      router.push('/');
      return;
    }
    fetchOrders();
  }, [user, filter]);

  const fetchOrders = async (page = 1) => {
    setLoading(true);
    try {
      const params: any = { page };
      if (filter) params.status = filter;
      if (search) params.search = search;
      
      const { data } = await axios.get('/orders', { params });
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
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'processing': return 'bg-blue-100 text-blue-800';
      case 'shipped': return 'bg-purple-100 text-purple-800';
      case 'delivered': return 'bg-lime-100 text-lime-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-neutral-100 text-neutral-800';
    }
  };

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case 'paid': return 'text-lime-600';
      case 'pending': return 'text-yellow-600';
      case 'expired': return 'text-red-600';
      default: return 'text-neutral-600';
    }
  };

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-neutral-50 py-8">
        <div className="container mx-auto px-4">
          <h1 className="text-3xl font-bold text-neutral-700 mb-8">Order Management</h1>

          {/* Filters */}
          <div className="bg-white p-4 rounded-lg shadow mb-6">
            <div className="flex flex-wrap gap-4 items-center">
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="border p-2 rounded"
              >
                <option value="">All Status</option>
                <option value="pending">Pending</option>
                <option value="processing">Processing</option>
                <option value="shipped">Shipped</option>
                <option value="delivered">Delivered</option>
                <option value="cancelled">Cancelled</option>
              </select>

              <form onSubmit={handleSearch} className="flex gap-2">
                <input
                  type="text"
                  placeholder="Search by user name or email..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="border p-2 rounded w-64"
                />
                <button type="submit" className="bg-neutral-800 text-white px-4 py-2 rounded">
                  Search
                </button>
              </form>
            </div>
          </div>

          {/* Orders Table */}
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <table className="w-full">
              <thead className="bg-neutral-100">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-neutral-600">Order ID</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-neutral-600">Customer</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-neutral-600">Total</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-neutral-600">Status</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-neutral-600">Payment</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-neutral-600">Date</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-neutral-600">Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={7} className="px-4 py-8 text-center">Loading...</td>
                  </tr>
                ) : orders.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-4 py-8 text-center text-neutral-500">No orders found</td>
                  </tr>
                ) : (
                  orders.map((order) => (
                    <tr key={order.id} className="border-t hover:bg-neutral-50">
                      <td className="px-4 py-3">
                        <span className="text-sm text-neutral-600 font-mono">
                          {order.id.slice(0, 8)}...
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div>
                          <p className="font-medium text-neutral-800">{order.user?.name}</p>
                          <p className="text-sm text-neutral-500">{order.user?.email}</p>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div>
                          <span className="font-medium text-lime-600">
                            Rp {Number(order.total_amount).toLocaleString('id-ID')}
                          </span>
                          {order.discount_amount > 0 && (
                            <p className="text-xs text-lime-500">
                              -Rp {Number(order.discount_amount).toLocaleString('id-ID')} discount
                            </p>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium ${getStatusColor(order.status)}`}>
                          {getStatusIcon(order.status)}
                          {order.status}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        {order.payment ? (
                          <div>
                            <span className={`font-medium ${getPaymentStatusColor(order.payment.status)}`}>
                              {order.payment.status}
                            </span>
                            {order.payment.payment_method && (
                              <p className="text-xs text-neutral-500">{order.payment.payment_method}</p>
                            )}
                          </div>
                        ) : (
                          <span className="text-neutral-400">No payment</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-sm text-neutral-600">
                          {new Date(order.created_at).toLocaleDateString('id-ID')}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <Link
                          href={`/admin/orders/${order.id}`}
                          className="text-blue-600 hover:underline text-sm flex items-center gap-1"
                        >
                          <FiEye size={16} /> View
                        </Link>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {pagination && pagination.last_page > 1 && (
            <div className="flex justify-center gap-2 mt-6">
              {pagination.prev_page_url && (
                <button
                  onClick={() => fetchOrders(pagination.current_page - 1)}
                  className="px-4 py-2 bg-neutral-200 rounded hover:bg-neutral-300"
                >
                  Previous
                </button>
              )}
              <span className="px-4 py-2">
                Page {pagination.current_page} of {pagination.last_page}
              </span>
              {pagination.next_page_url && (
                <button
                  onClick={() => fetchOrders(pagination.current_page + 1)}
                  className="px-4 py-2 bg-neutral-200 rounded hover:bg-neutral-300"
                >
                  Next
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </>
  );
}