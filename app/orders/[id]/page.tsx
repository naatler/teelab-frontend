'use client';

import { useEffect, useState } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import axios from '@/app/lib/axios';
import Navbar from '@/app/components/Navbar';
import toast from 'react-hot-toast';
import Link from 'next/link';

export default function OrderDetailPage() {
  const { id } = useParams();
  const searchParams = useSearchParams();
  const [order, setOrder] = useState<any>(null);
  const [payment, setPayment] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [processingPayment, setProcessingPayment] = useState(false);

  useEffect(() => {
    fetchOrder();
  }, []);

  useEffect(() => {
    const paymentStatus = searchParams.get('payment');
    if (paymentStatus === 'success') {
      toast.success('Payment successful!');
    } else if (paymentStatus === 'failed') {
      toast.error('Payment failed');
    }
  }, [searchParams]);

  const fetchOrder = async () => {
    try {
      const { data } = await axios.get(`/orders/${id}`);
      setOrder(data);
      if (data.payment) {
        setPayment(data.payment);
      }
    } catch {
      toast.error('Failed to fetch order');
    } finally {
      setLoading(false);
    }
  };

  const createPayment = async () => {
    setProcessingPayment(true);
    try {
      const { data } = await axios.post(`/payments/orders/${id}/create`);
      setPayment(data.payment);
      
      if (data.invoice_url && data.invoice_url.startsWith('http')) {
        window.location.href = data.invoice_url;
      } else {
        toast.success('Payment created! Use the mock payment to complete.');
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to create payment');
    } finally {
      setProcessingPayment(false);
    }
  };

  const simulatePayment = async () => {
    if (!payment) return;
    
    setProcessingPayment(true);
    try {
      const { data } = await axios.post(`/payments/mock/${payment.id}/success`);
      toast.success('Payment successful!');
      fetchOrder();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to simulate payment');
    } finally {
      setProcessingPayment(false);
    }
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen flex items-center justify-center">
          Loading...
        </div>
      </>
    );
  }

  if (!order) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen flex items-center justify-center">
          Order not found
        </div>
      </>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'processing': return 'bg-blue-100 text-blue-800';
      case 'shipped': return 'bg-purple-100 text-purple-800';
      case 'delivered': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="container mx-auto px-4">
          <Link href="/orders" className="text-green-600 mb-4 inline-block">
            ← Back to Orders
          </Link>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Order Details */}
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-white p-6 rounded-lg shadow">
                <div className="flex justify-between items-center mb-4">
                  <h1 className="text-2xl font-bold text-neutral-700">
                    Order #{order.id.slice(0, 8)}
                  </h1>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(order.status)}`}>
                    {order.status}
                  </span>
                </div>

                <p className="text-gray-500 text-sm mb-4">
                  {new Date(order.created_at).toLocaleString('id-ID')}
                </p>

                <div className="border-t pt-4">
                  <h2 className="font-semibold mb-3">Items</h2>
                  <div className="space-y-3">
                    {order.items?.map((item: any) => (
                      <div key={item.id} className="flex justify-between items-center">
                        <div className="flex items-center gap-3">
                          {item.product?.image_url ? (
                            <img 
                              src={item.product.image_url} 
                              alt={item.product.name}
                              className="w-16 h-16 object-cover rounded"
                            />
                          ) : (
                            <div className="w-16 h-16 bg-gray-200 rounded flex items-center justify-center">
                              📦
                            </div>
                          )}
                          <div>
                            <p className="font-medium">{item.product?.name}</p>
                            <p className="text-sm text-gray-500">Qty: {item.quantity}</p>
                          </div>
                        </div>
                        <p className="font-medium">
                          Rp {(item.price * item.quantity).toLocaleString('id-ID')}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="border-t mt-4 pt-4">
                  <div className="flex justify-between text-lg font-bold">
                    <span>Total</span>
                    <span className="text-green-600">
                      Rp {Number(order.total_amount).toLocaleString('id-ID')}
                    </span>
                  </div>
                </div>
              </div>

              {/* Shipping Address */}
              {order.address && (
                <div className="bg-white p-6 rounded-lg shadow">
                  <h2 className="font-semibold mb-3">Shipping Address</h2>
                  <p className="text-gray-600">{order.address.recipient_name}</p>
                  <p className="text-gray-600">{order.address.phone}</p>
                  <p className="text-gray-600">
                    {order.address.address}, {order.address.city}, {order.address.postal_code}
                  </p>
                </div>
              )}
            </div>

            {/* Payment Section */}
            <div className="space-y-6">
              <div className="bg-white p-6 rounded-lg shadow">
                <h2 className="text-xl font-bold mb-4">Payment</h2>
                
                {!payment ? (
                  <div>
                    <p className="text-gray-600 mb-4">
                      Complete your payment to process the order.
                    </p>
                    <button
                      onClick={createPayment}
                      disabled={processingPayment}
                      className="w-full bg-green-600 text-white py-3 rounded-lg font-medium hover:bg-green-700 disabled:bg-gray-400 transition"
                    >
                      {processingPayment ? 'Processing...' : 'Pay Now'}
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Status</span>
                      <span className={`font-medium ${
                        payment.status === 'paid' ? 'text-green-600' : 
                        payment.status === 'expired' ? 'text-red-600' : 'text-yellow-600'
                      }`}>
                        {payment.status}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Amount</span>
                      <span className="font-medium">
                        Rp {Number(payment.amount).toLocaleString('id-ID')}
                      </span>
                    </div>
                    {payment.payment_method && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Method</span>
                        <span className="font-medium">{payment.payment_method}</span>
                      </div>
                    )}
                    {payment.paid_at && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Paid at</span>
                        <span className="font-medium">
                          {new Date(payment.paid_at).toLocaleString('id-ID')}
                        </span>
                      </div>
                    )}

                    {payment.status === 'pending' && (
                      <div className="pt-4 border-t">
                        <p className="text-sm text-gray-600 mb-3">
                          Simulate payment for testing:
                        </p>
                        <button
                          onClick={simulatePayment}
                          disabled={processingPayment}
                          className="w-full bg-blue-600 text-white py-2 rounded-lg font-medium hover:bg-blue-700 disabled:bg-gray-400 transition"
                        >
                          {processingPayment ? 'Processing...' : 'Simulate Payment Success'}
                        </button>
                      </div>
                    )}

                    {payment.status === 'paid' && (
                      <div className="pt-4 border-t">
                        <div className="bg-green-50 text-green-700 p-4 rounded-lg text-center">
                          ✓ Payment Complete
                        </div>
                      </div>
                    )}
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