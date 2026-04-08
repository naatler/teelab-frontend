'use client';

import { useEffect, useState } from 'react';
import { useParams, useSearchParams, useRouter } from 'next/navigation';
import axios from '@/app/lib/axios';
import Navbar from '@/app/components/Navbar';
import toast from 'react-hot-toast';
import Link from 'next/link';
import { FiArrowLeft, FiPackage, FiTruck, FiCheck, FiX, FiClock, FiCreditCard, FiMapPin, FiShoppingBag } from 'react-icons/fi';
import PageTransition, { StaggerContainer, StaggerItem, FadeIn } from '@/app/components/PageTransition';

interface OrderItem {
  id: string;
  quantity: number;
  price: number;
  product: { id: string; name: string; image_url: string | null };
}

interface Order {
  id: string;
  status: string;
  total_amount: number;
  discount_amount: number;
  notes: string;
  created_at: string;
  address: { recipient_name: string; phone: string; address: string; city: string; postal_code: string };
  items: OrderItem[];
  payment: { id: string; status: string; amount: number; payment_method: string; paid_at: string } | null;
}

const statusOptions = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];

export default function OrderDetailPage() {
  const { id } = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const [order, setOrder] = useState<Order | null>(null);
  const [payment, setPayment] = useState<Order['payment']>(null);
  const [loading, setLoading] = useState(true);
  const [processingPayment, setProcessingPayment] = useState(false);
  const [cancelling, setCancelling] = useState(false);

  useEffect(() => {
    fetchOrder();
  }, [id]);

  useEffect(() => {
    const paymentStatus = searchParams.get('payment');
    if (paymentStatus === 'success') {
      toast.success('Payment successful!');
      const interval = setInterval(() => fetchOrder(), 3000);
      return () => clearInterval(interval);
    }
    else if (paymentStatus === 'failed') toast.error('Payment failed');
  }, [searchParams]);

  const fetchOrder = async () => {
    try {
      const response = await axios.get(`/orders/${id}`);
      setOrder(response.data);
      if (response.data.payment) setPayment(response.data.payment);
    } catch { toast.error('Failed to fetch order'); }
    finally { setLoading(false); }
  };

  const createPayment = async () => {
    setProcessingPayment(true);
    try {
      const { data } = await axios.post(`/payments/${id}/invoice`);
      if (data.invoice_url) {
        window.location.href = data.invoice_url;
      } else {
        toast.error('Failed to get invoice URL');
      }
    } catch (error: any) { 
      toast.error(error.response?.data?.message || 'Failed to create payment'); 
    }
    finally { setProcessingPayment(false); }
  };

  const handleCancelOrder = async () => {
    if (!confirm('Are you sure you want to cancel this order?')) return;
    
    setCancelling(true);
    try {
      await axios.post(`/orders/${id}/cancel`);
      toast.success('Order cancelled successfully!');
      setOrder((prev) => prev ? { ...prev, status: 'cancelled' } : null);
      setTimeout(() => {
        router.push('/orders');
      }, 1500);
    } catch (error: any) { 
      toast.error(error.response?.data?.message || 'Failed to cancel order'); 
    } finally { 
      setCancelling(false); 
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <FiClock className="text-yellow-600" />;
      case 'processing': return <FiPackage className="text-blue-600" />;
      case 'shipped': return <FiTruck className="text-purple-600" />;
      case 'delivered': return <FiCheck className="text-lime-600" />;
      case 'cancelled': return <FiX className="text-red-600" />;
      default: return <FiShoppingBag className="text-neutral-400" />;
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
      <PageTransition>
        <div className="min-h-screen bg-neutral-50 py-8">
          <div className="container mx-auto px-4 max-w-5xl">
            <FadeIn>
              <div className="flex items-center justify-between mb-8">
                <div>
                  <Link href="/orders" className="flex items-center gap-2 text-neutral-500 hover:text-lime-600 mb-2">
                    <FiArrowLeft size={18} />
                    <span>Back to Orders</span>
                  </Link>
                  <h1 className="text-3xl font-bold text-neutral-800">Order Details</h1>
                  <p className="text-neutral-500 mt-1">
                    Order #{order.id.slice(0, 8)} • {new Date(order.created_at).toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                  </p>
                </div>
                <div className="flex items-center gap-4">
                  <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium border ${getStatusColor(order.status)}`}>
                    {getStatusIcon(order.status)}
                    <span className="capitalize">{order.status}</span>
                  </span>
                  {order.status === 'pending' && (
                    <button
                      onClick={handleCancelOrder}
                      disabled={cancelling}
                      className="px-4 py-1.5 bg-red-500 text-white rounded-full text-sm font-medium hover:bg-red-600 disabled:bg-red-300 disabled:cursor-not-allowed transition"
                    >
                      {cancelling ? 'Cancelling...' : 'Cancel Order'}
                    </button>
                  )}
                </div>
              </div>
            </FadeIn>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-6">
                <FadeIn delay={0.1}>
                  <div className="bg-white rounded-2xl shadow-sm border border-neutral-200 p-6">
                    <h2 className="text-lg font-semibold text-neutral-800 mb-4">Order Items</h2>
                    <StaggerContainer>
                      <div className="space-y-4">
                        {order.items.map((item) => (
                          <StaggerItem key={item.id}>
                            <div className="flex justify-between items-center p-4 bg-neutral-50 rounded-xl">
                              <div className="flex items-center gap-4">
                                {item.product.image_url ? (
                                  <img src={item.product.image_url} alt={item.product.name} className="w-16 h-16 object-cover rounded-lg" />
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
                              <p className="font-semibold text-neutral-800">Rp {(Number(item.price) * item.quantity).toLocaleString('id-ID')}</p>
                            </div>
                          </StaggerItem>
                        ))}
                      </div>
                    </StaggerContainer>

                    <div className="border-t border-neutral-200 mt-6 pt-6">
                      <div className="space-y-3">
                        <div className="flex justify-between text-neutral-600">
                          <span>Subtotal</span>
                          <span>Rp {Number(order.total_amount + order.discount_amount).toLocaleString('id-ID')}</span>
                        </div>
                        {order.discount_amount > 0 && (
                          <div className="flex justify-between text-lime-600">
                            <span>Discount</span>
                            <span>- Rp {Number(order.discount_amount).toLocaleString('id-ID')}</span>
                          </div>
                        )}
                        <div className="flex justify-between text-xl font-bold pt-3 border-t border-neutral-200">
                          <span>Total</span>
                          <span className="text-lime-600">Rp {Number(order.total_amount).toLocaleString('id-ID')}</span>
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
                </FadeIn>

                {order.address && (
                  <FadeIn delay={0.2}>
                    <div className="bg-white rounded-2xl shadow-sm border border-neutral-200 p-6">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                          <FiMapPin className="text-blue-600" />
                        </div>
                        <h2 className="text-lg font-semibold text-neutral-800">Shipping Address</h2>
                      </div>
                      <div className="space-y-2">
                        <p className="font-medium text-neutral-800">{order.address.recipient_name}</p>
                        <p className="text-sm text-neutral-600">{order.address.phone}</p>
                        <p className="text-sm text-neutral-600">{order.address.address}</p>
                        <p className="text-sm text-neutral-600">{order.address.city} {order.address.postal_code}</p>
                      </div>
                    </div>
                  </FadeIn>
                )}
              </div>

              <div className="space-y-6">
                <FadeIn delay={0.3}>
                  <div className="bg-white rounded-2xl shadow-sm border border-neutral-200 p-6">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center">
                        <FiCreditCard className="text-purple-600" />
                      </div>
                      <h2 className="text-lg font-semibold text-neutral-800">Payment</h2>
                    </div>
                    {!payment ? (
                      <div className="text-center py-4">
                        <p className="text-neutral-600 mb-4">Complete your payment to process the order.</p>
                        <button onClick={createPayment} disabled={processingPayment} className="w-full bg-lime-600 text-white py-3 rounded-xl font-medium hover:bg-lime-700 disabled:bg-neutral-300 transition">
                          {processingPayment ? 'Processing...' : 'Pay Now'}
                        </button>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-neutral-500">Status</span>
                          <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getPaymentStatusColor(payment.status)}`}>{payment.status}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-neutral-500">Amount</span>
                          <span className="font-semibold text-lime-600">Rp {Number(payment.amount).toLocaleString('id-ID')}</span>
                        </div>
                        {payment.payment_method && (
                          <div className="flex justify-between">
                            <span className="text-sm text-neutral-500">Method</span>
                            <span className="text-neutral-700">{payment.payment_method}</span>
                          </div>
                        )}
                        {payment.paid_at && (
                          <div className="flex justify-between">
                            <span className="text-sm text-neutral-500">Paid at</span>
                            <span className="text-neutral-700 text-sm">{new Date(payment.paid_at).toLocaleString('id-ID')}</span>
                          </div>
                        )}
                        {payment.status === 'paid' && (
                          <div className="pt-4 border-t">
                            <div className="bg-lime-50 text-lime-700 p-4 rounded-xl text-center font-medium">✓ Payment Complete</div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </FadeIn>
              </div>
            </div>
          </div>
        </div>
      </PageTransition>
    </>
  );
}