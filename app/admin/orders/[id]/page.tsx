'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import axios from '@/app/lib/axios';
import Navbar from '@/app/components/Navbar';
import { useAuthStore } from '@/app/store/useAuthStore';
import toast from 'react-hot-toast';
import { FiArrowLeft, FiPackage, FiTruck, FiCheck, FiX, FiClock, FiCreditCard } from 'react-icons/fi';

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
  updated_at: string;
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
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'processing': return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'shipped': return 'bg-purple-100 text-purple-800 border-purple-300';
      case 'delivered': return 'bg-lime-100 text-lime-800 border-lime-300';
      case 'cancelled': return 'bg-red-100 text-red-800 border-red-300';
      default: return 'bg-neutral-100 text-neutral-800 border-neutral-300';
    }
  };

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case 'paid': return 'bg-lime-100 text-lime-800 border-lime-300';
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'expired': return 'bg-red-100 text-red-800 border-red-300';
      default: return 'bg-neutral-100 text-neutral-800 border-neutral-300';
    }
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen bg-neutral-50 flex items-center justify-center">
          <div className="text-xl">Loading...</div>
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

  const statusOptions = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-neutral-50 py-8">
        <div className="container mx-auto px-4">
          <Link
            href="/admin/orders"
            className="flex items-center gap-2 text-neutral-600 hover:text-neutral-800 mb-6"
          >
            <FiArrowLeft /> Back to Orders
          </Link>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Order Status Card */}
              <div className="bg-white p-6 rounded-lg shadow">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h1 className="text-2xl font-bold text-neutral-800">
                      Order #{order.id.slice(0, 8)}
                    </h1>
                    <p className="text-sm text-neutral-500">
                      {new Date(order.created_at).toLocaleString('id-ID')}
                    </p>
                  </div>
                  <span className={`inline-flex items-center gap-2 px-4 py-2 rounded-full border ${getStatusColor(order.status)}`}>
                    {getStatusIcon(order.status)}
                    <span className="font-medium capitalize">{order.status}</span>
                  </span>
                </div>

                {/* Status Timeline */}
                <div className="flex items-center gap-2 mb-6 overflow-x-auto pb-2">
                  {statusOptions.map((status, index) => {
                    const statusIndex = statusOptions.indexOf(order.status);
                    const isActive = index <= statusIndex;
                    const isCurrent = status === order.status;
                    
                    return (
                      <div key={status} className="flex items-center">
                        <button
                          onClick={() => updateStatus(status)}
                          disabled={updating}
                          className={`px-3 py-1 rounded-full text-xs font-medium border transition ${
                            isCurrent
                              ? getStatusColor(status)
                              : isActive
                                ? 'bg-neutral-200 text-neutral-700 border-neutral-300'
                                : 'bg-neutral-50 text-neutral-400 border-neutral-200'
                          } ${!isCurrent ? 'hover:bg-neutral-100' : ''}`}
                        >
                          {status}
                        </button>
                        {index < statusOptions.length - 1 && (
                          <div className={`w-4 h-0.5 mx-1 ${index < statusIndex ? 'bg-neutral-300' : 'bg-neutral-200'}`} />
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Order Items */}
                <div className="border-t pt-4">
                  <h2 className="font-semibold mb-3">Order Items</h2>
                  <div className="space-y-3">
                    {order.items.map((item) => (
                      <div key={item.id} className="flex justify-between items-center p-3 bg-neutral-50 rounded">
                        <div className="flex items-center gap-3">
                          {item.product.image_url ? (
                            <img
                              src={item.product.image_url}
                              alt={item.product.name}
                              className="w-16 h-16 object-cover rounded"
                            />
                          ) : (
                            <div className="w-16 h-16 bg-neutral-200 rounded flex items-center justify-center">
                              📦
                            </div>
                          )}
                          <div>
                            <p className="font-medium">{item.product.name}</p>
                            <p className="text-sm text-neutral-500">Qty: {item.quantity}</p>
                          </div>
                        </div>
                        <p className="font-medium">
                          Rp {(Number(item.price) * item.quantity).toLocaleString('id-ID')}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Totals */}
                <div className="border-t mt-4 pt-4">
                  <div className="space-y-2">
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
                    <div className="flex justify-between text-lg font-bold pt-2 border-t">
                      <span>Total</span>
                      <span className="text-lime-600">
                        Rp {Number(order.total_amount).toLocaleString('id-ID')}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Notes */}
                {order.notes && (
                  <div className="border-t mt-4 pt-4">
                    <h3 className="font-semibold mb-2">Notes</h3>
                    <p className="text-neutral-600">{order.notes}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Customer Info */}
              <div className="bg-white p-6 rounded-lg shadow">
                <h2 className="font-semibold mb-3">Customer</h2>
                <div className="space-y-2">
                  <p className="font-medium">{order.user.name}</p>
                  <p className="text-sm text-neutral-600">{order.user.email}</p>
                  {order.user.phone && (
                    <p className="text-sm text-neutral-600">{order.user.phone}</p>
                  )}
                </div>
              </div>

              {/* Shipping Address */}
              <div className="bg-white p-6 rounded-lg shadow">
                <h2 className="font-semibold mb-3">Shipping Address</h2>
                <div className="space-y-2">
                  <p className="font-medium">{order.address.recipient_name}</p>
                  <p className="text-sm text-neutral-600">{order.address.phone}</p>
                  <p className="text-sm text-neutral-600">
                    {order.address.address}, {order.address.city}
                  </p>
                  <p className="text-sm text-neutral-600">
                    {order.address.province} {order.address.postal_code}
                  </p>
                </div>
              </div>

              {/* Payment / Invoice */}
              <div className="bg-white p-6 rounded-lg shadow">
                <div className="flex items-center gap-2 mb-3">
                  <FiCreditCard className="text-neutral-600" />
                  <h2 className="font-semibold">Payment & Invoice</h2>
                </div>
                
                {order.payment ? (
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-neutral-600">Status</span>
                      <span className={`px-2 py-1 rounded text-xs font-medium ${getPaymentStatusColor(order.payment.status)}`}>
                        {order.payment.status}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-neutral-600">Amount</span>
                      <span className="font-medium text-lime-600">
                        Rp {Number(order.payment.amount).toLocaleString('id-ID')}
                      </span>
                    </div>
                    {order.payment.payment_method && (
                      <div className="flex justify-between">
                        <span className="text-neutral-600">Method</span>
                        <span className="font-medium">{order.payment.payment_method}</span>
                      </div>
                    )}
                    {order.payment.paid_at && (
                      <div className="flex justify-between">
                        <span className="text-neutral-600">Paid at</span>
                        <span className="text-sm">
                          {new Date(order.payment.paid_at).toLocaleString('id-ID')}
                        </span>
                      </div>
                    )}
                    
                    {/* Invoice Details */}
                    <div className="border-t pt-3 mt-3">
                      <h3 className="text-sm font-semibold mb-2">Invoice Details</h3>
                      <div className="space-y-1 text-sm">
                        {order.payment.xendit_invoice_id && (
                          <p className="text-neutral-600">
                            <span className="font-medium">Invoice ID:</span>{' '}
                            <span className="font-mono text-xs">{order.payment.xendit_invoice_id}</span>
                          </p>
                        )}
                        {order.payment.xendit_external_id && (
                          <p className="text-neutral-600">
                            <span className="font-medium">External ID:</span>{' '}
                            <span className="font-mono text-xs">{order.payment.xendit_external_id}</span>
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-4">
                    <p className="text-neutral-500">No payment information</p>
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