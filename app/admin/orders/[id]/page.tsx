'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import axios from '@/app/lib/axios';
import Navbar from '@/app/components/Navbar';
import { useAuthStore } from '@/app/store/useAuthStore';
import toast from 'react-hot-toast';
import { 
  FiArrowLeft, FiPackage, FiTruck, FiCheck, FiX, FiClock, 
  FiCreditCard, FiMapPin, FiUser, FiShoppingBag 
} from 'react-icons/fi';

interface OrderItem {
  id: string;
  quantity: number;
  price: number;
  product: {
    id: string;
    name: string;
    image_url: string | null;
  };
}

interface Order {
  id: string;
  status: string;
  total_amount: number;
  discount_amount: number;
  notes: string;
  created_at: string;
  user: {
    id: string;
    name: string;
    email: string;
    phone: string;
  };
  address: {
    label: string;
    recipient_name: string;
    phone: string;
    address: string;
    city: string;
    province: string;
    postal_code: string;
  };
  items: OrderItem[];
  payment: {
    id: string;
    status: string;
    amount: number;
    payment_method: string;
    paid_at: string;
    xendit_invoice_id: string;
    xendit_external_id: string;
  } | null;
  discount: {
    code: string;
    type: string;
    value: number;
  } | null;
}

const statusOptions = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];

export default function AdminOrderDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const { user } = useAuthStore();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    if (!user) {
      router.push('/login');
      return;
    }
    if (user.role !== 'admin') {
      router.push('/');
      return;
    }
    fetchOrder();
  }, [user]);

  const fetchOrder = async () => {
    try {
      const { data } = await axios.get(`/orders/${id}`);
      setOrder(data);
    } catch (error) {
      toast.error('Failed to load order');
      router.push('/admin/orders');
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (status: string) => {
    setUpdating(true);
    try {
      await axios.patch(`/orders/${id}/status`, { status });
      toast.success('Order status updated!');
      fetchOrder();
    } catch (error) {
      toast.error('Failed to update status');
    } finally {
      setUpdating(false);
    }
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
      case 'paid': return 'bg-lime-100 text-lime-800 border-lime-200';
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'expired': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-neutral-100 text-neutral-800 border-neutral-200';
    }
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen bg-neutral-50 flex items-center justify-center">
          <div className="flex items-center gap-3">
            <svg className="animate-spin h-6 w-6 text-lime-600" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            <span className="text-neutral-600">Loading order...</span>
          </div>
        </div>
      </>
    );
  }

  if (!order) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen bg-neutral-50 flex items-center justify-center">
          <div className="text-xl">Order not found</div>
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-neutral-50 py-8">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="flex items-center justify-between mb-8">
            <div>
              <Link
                href="/admin/orders"
                className="flex items-center gap-2 text-neutral-500 hover:text-lime-600 mb-2"
              >
                <FiArrowLeft size={18} />
                <span>Back to Orders</span>
              </Link>
              <h1 className="text-3xl font-bold text-neutral-800">
                Order Details
              </h1>
              <p className="text-neutral-500 mt-1">
                Order #{order.id.slice(0, 8)} • {new Date(order.created_at).toLocaleDateString('id-ID', { 
                  weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' 
                })}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-white rounded-2xl shadow-sm border border-neutral-200 p-6">
                <h2 className="text-lg font-semibold text-neutral-800 mb-4">Order Status</h2>
                
                <div className="flex items-center gap-2 mb-6 flex-wrap">
                  {statusOptions.map((status, index) => {
                    const statusIndex = statusOptions.indexOf(order.status);
                    const isActive = index <= statusIndex;
                    const isCurrent = status === order.status;
                    
                    return (
                      <div key={status} className="flex items-center overflow-hidden">
                        <button
                          onClick={() => updateStatus(status)}
                          disabled={updating}
                          className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm  border transition-all${
                            isCurrent
                              ? getStatusColor(status)
                              : isActive
                                ? 'bg-neutral-100 text-neutral-700 border-neutral-300'
                                : 'bg-neutral-50 text-neutral-400 border-neutral-200'
                          } ${!isCurrent ? 'hover:bg-neutral-100' : ''}`}
                        >
                          {getStatusIcon(status)}
                          <span className="ml-1.5 capitalize">{status}</span>
                        </button>
                        {index < statusOptions.length - 1 && (
                          <div className={`w-8 h-0.5 mx-1 ${index < statusIndex ? 'bg-lime-400' : 'bg-neutral-200'}`} />
                        )}
                      </div>
                    );
                  })}
                </div>

                <div className="border-t border-neutral-200 pt-6">
                  <h3 className="font-semibold text-neutral-800 mb-4">Order Items</h3>
                  <div className="space-y-4">
                    {order.items.map((item) => (
                      <div key={item.id} className="flex justify-between items-center p-4 bg-neutral-50 rounded-xl">
                        <div className="flex items-center gap-4">
                          {item.product.image_url ? (
                            <img
                              src={item.product.image_url}
                              alt={item.product.name}
                              className="w-16 h-16 object-cover rounded-lg"
                            />
                          ) : (
                            <div className="w-16 h-16 bg-neutral-200 rounded-lg flex items-center justify-center">
                              <FiShoppingBag className="text-neutral-400 text-xl" />
                            </div>
                          )}
                          <div>
                            <p className="font-medium text-neutral-800">{item.product.name}</p>
                            <p className="text-sm text-neutral-500">Qty: {item.quantity} × Rp {Number(item.price).toLocaleString('id-ID')}</p>
                          </div>
                        </div>
                        <p className="font-semibold text-neutral-800">
                          Rp {(Number(item.price) * item.quantity).toLocaleString('id-ID')}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="border-t border-neutral-200 mt-6 pt-6">
                  <div className="space-y-3">
                    <div className="flex justify-between text-neutral-600">
                      <span>Subtotal</span>
                      <span>Rp {Number(order.total_amount + order.discount_amount).toLocaleString('id-ID')}</span>
                    </div>
                    {order.discount_amount > 0 && (
                      <div className="flex justify-between text-lime-600">
                        <span>Discount ({order.discount?.code})</span>
                        <span>- Rp {Number(order.discount_amount).toLocaleString('id-ID')}</span>
                      </div>
                    )}
                    <div className="flex justify-between text-xl font-bold pt-3 border-t border-neutral-200">
                      <span>Total</span>
                      <span className="text-lime-600">
                        Rp {Number(order.total_amount).toLocaleString('id-ID')}
                      </span>
                    </div>
                  </div>
                </div>

                {order.notes && (
                  <div className="border-t border-neutral-200 mt-6 pt-6">
                    <h3 className="font-semibold text-neutral-800 mb-2">Notes</h3>
                    <p className="text-neutral-600 bg-neutral-50 p-4 rounded-xl">{order.notes}</p>
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-6">
              <div className="bg-white rounded-2xl shadow-sm border border-neutral-200 p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-lime-100 rounded-xl flex items-center justify-center">
                    <FiUser className="text-lime-600" />
                  </div>
                  <h3 className="font-semibold text-neutral-800">Customer</h3>
                </div>
                <div className="space-y-3">
                  <p className="font-medium text-neutral-800">{order.user.name}</p>
                  <p className="text-sm text-neutral-600">{order.user.email}</p>
                  {order.user.phone && (
                    <p className="text-sm text-neutral-600">{order.user.phone}</p>
                  )}
                </div>
              </div>
 
              <div className="bg-white rounded-2xl shadow-sm border border-neutral-200 p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                    <FiMapPin className="text-blue-600" />
                  </div>
                  <h3 className="font-semibold text-neutral-800">Shipping Address</h3>
                </div>
                <div className="space-y-2">
                  <p className="font-medium text-neutral-800">{order.address.recipient_name}</p>
                  <p className="text-sm text-neutral-600">{order.address.phone}</p>
                  <p className="text-sm text-neutral-600">
                    {order.address.address}
                  </p>
                  <p className="text-sm text-neutral-600">
                    {order.address.city}, {order.address.province} {order.address.postal_code}
                  </p>
                </div>
              </div>

              <div className="bg-white rounded-2xl shadow-sm border border-neutral-200 p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center">
                    <FiCreditCard className="text-purple-600" />
                  </div>
                  <h3 className="font-semibold text-neutral-800">Payment</h3>
                </div>
                
                {order.payment ? (
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-neutral-500">Status</span>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getPaymentStatusColor(order.payment.status)}`}>
                        {order.payment.status}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-neutral-500">Amount</span>
                      <span className="font-semibold text-lime-600">
                        Rp {Number(order.payment.amount).toLocaleString('id-ID')}
                      </span>
                    </div>
                    {order.payment.payment_method && (
                      <div className="flex justify-between">
                        <span className="text-sm text-neutral-500">Method</span>
                        <span className="text-neutral-700">{order.payment.payment_method}</span>
                      </div>
                    )}
                    {order.payment.paid_at && (
                      <div className="flex justify-between">
                        <span className="text-sm text-neutral-500">Paid at</span>
                        <span className="text-neutral-700 text-sm">
                          {new Date(order.payment.paid_at).toLocaleString('id-ID')}
                        </span>
                      </div>
                    )}
                    
                    <div className="border-t border-neutral-200 pt-4 mt-4">
                      <p className="text-xs font-semibold text-neutral-500 mb-2">Invoice Details</p>
                      <div className="space-y-1 text-xs">
                        {order.payment.xendit_invoice_id && (
                          <p className="text-neutral-600">
                            <span className="font-medium">Invoice ID:</span>{' '}
                            <span className="font-mono">{order.payment.xendit_invoice_id}</span>
                          </p>
                        )}
                        {order.payment.xendit_external_id && (
                          <p className="text-neutral-600">
                            <span className="font-medium">External ID:</span>{' '}
                            <span className="font-mono">{order.payment.xendit_external_id}</span>
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-4">
                    <p className="text-neutral-400">No payment information</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}