'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import axios from '@/app/lib/axios';
import Navbar from '@/app/components/Navbar';
import Footer from '@/app/components/Footer';
import { useAuthStore } from '@/app/store/useAuthStore';
import toast from 'react-hot-toast';
import Link from 'next/link';
import Cookies from 'js-cookie';
import { FiShoppingBag, FiClock, FiPackage, FiTruck, FiCheck, FiX, FiCreditCard, FiStar } from 'react-icons/fi';
import PageTransition, { StaggerContainer, StaggerItem, FadeIn } from '@/app/components/PageTransition';
import { Star } from 'lucide-react';

interface Order {
  id: string;
  total_amount: number;
  discount_amount: number;
  status: string;
  created_at: string;
  payment: {
    status: string;
    amount: number;
  } | null;
}

interface PurchasedProduct {
  id: string;
  name: string;
  image_url: string | null;
  price: number;
  has_reviewed: boolean;
}

export default function OrdersPage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [purchasedProducts, setPurchasedProducts] = useState<PurchasedProduct[]>([]);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<PurchasedProduct | null>(null);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);

  useEffect(() => {
    const token = Cookies.get('token');
    
    if (!user || !token) {
      router.push('/login');
      return;
    }

    fetchOrders();
    fetchPurchasedProducts();
  }, [user]);

  const fetchOrders = async () => {
    try {
      setError(null);
      const token = Cookies.get('token');
      console.log('Fetching orders with token:', token ? 'present' : 'missing');
      
      const response = await axios.get('/orders');
      console.log('Orders response:', response.data);
      setOrders(response.data.data || response.data || []);
    } catch (error: any) {
      console.error('Failed to fetch orders:', error);
      console.error('Response status:', error.response?.status);
      console.error('Response data:', error.response?.data);
      const errorMessage = error.response?.data?.message || error.message || 'Failed to fetch orders';
      setError(errorMessage);
      toast.error(errorMessage);
      
      if (error.response?.status === 401 || error.response?.status === 403) {
        useAuthStore.getState().logout();
        router.push('/login');
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchPurchasedProducts = async () => {
    try {
      const { data } = await axios.get('/reviews/purchased');
      setPurchasedProducts(data.filter((p: PurchasedProduct) => !p.has_reviewed));
    } catch (error) {
      console.error('Failed to fetch purchased products:', error);
    }
  };

  const submitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProduct) return;

    setSubmittingReview(true);
    try {
      await axios.post('/reviews', {
        product_id: selectedProduct.id,
        rating: reviewRating,
        comment: reviewComment,
      });
      toast.success('Review submitted!');
      setShowReviewModal(false);
      setSelectedProduct(null);
      setReviewRating(5);
      setReviewComment('');
      fetchPurchasedProducts();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to submit review');
    } finally {
      setSubmittingReview(false);
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
      case 'paid': return 'text-lime-600';
      case 'pending': return 'text-yellow-600';
      case 'expired': return 'text-red-600';
      default: return 'text-neutral-500';
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
            <span className="text-neutral-600">Loading orders...</span>
          </div>
        </div>
      </>
    );
  }

  if (error) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen bg-neutral-50 py-8">
          <div className="container mx-auto px-4 max-w-4xl">
            <h1 className="text-3xl font-bold text-neutral-800 mb-8">My Orders</h1>
            <div className="bg-white rounded-2xl shadow-sm border border-neutral-200 p-12 text-center">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <FiX className="text-red-600 text-2xl" />
              </div>
              <p className="text-red-600 text-lg mb-4">{error}</p>
              <button
                onClick={fetchOrders}
                className="inline-block bg-lime-600 text-white px-6 py-3 rounded-xl font-medium hover:bg-lime-700 transition"
              >
                Try Again
              </button>
            </div>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <PageTransition>
      <div className="min-h-screen bg-neutral-50 py-8">
        <div className="container mx-auto px-4 max-w-4xl">
          <FadeIn>
          <h1 className="text-3xl font-bold text-neutral-800 mb-8">My Orders</h1>
          </FadeIn>

          {orders.length === 0 ? (
            <FadeIn delay={0.1}>
            <div className="bg-white rounded-2xl shadow-sm border border-neutral-200 p-12 text-center">
              <div className="w-16 h-16 bg-neutral-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <FiShoppingBag className="text-neutral-400 text-2xl" />
              </div>
              <p className="text-neutral-500 text-lg mb-2">No orders yet</p>
              <p className="text-neutral-400 text-sm mb-6">Start shopping to see your orders here</p>
              <Link 
                href="/products" 
                className="inline-block bg-lime-600 text-white px-6 py-3 rounded-xl font-medium hover:bg-lime-700 transition"
              >
                Browse Products
              </Link>
            </div>
            </FadeIn>
          ) : (
            <StaggerContainer>
            <div className="space-y-4">
              {orders.map((order) => (
                <StaggerItem key={order.id}>
                <Link
                  key={order.id}
                  href={`/orders/${order.id}`}
                  className="block bg-white rounded-2xl shadow-sm border border-neutral-200 p-6 hover:shadow-md transition"
                >
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 bg-lime-100 rounded-xl flex items-center justify-center flex-shrink-0">
                        {getStatusIcon(order.status)}
                      </div>
                      <div>
                        <div className="flex items-center gap-3 mb-1">
                          <span className="font-semibold text-neutral-800">
                            Order #{order.id.slice(0, 8)}
                          </span>
                          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${getStatusColor(order.status)}`}>
                            <span className="capitalize">{order.status}</span>
                          </span>
                        </div>
                        <p className="text-sm text-neutral-500">
                          {new Date(order.created_at).toLocaleDateString('id-ID', { 
                            weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' 
                          })}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-6">
                      {order.payment && (
                        <div className="text-right">
                          <p className="text-sm text-neutral-500">Payment</p>
                          <p className={`font-medium capitalize ${getPaymentStatusColor(order.payment.status)}`}>
                            {order.payment.status}
                          </p>
                        </div>
                      )}
                      <div className="text-right">
                        <p className="text-sm text-neutral-500">Total</p>
                        <p className="text-xl font-bold text-lime-600">
                          Rp {Number(order.total_amount).toLocaleString('id-ID')}
                        </p>
                        {order.discount_amount > 0 && (
                          <p className="text-xs text-lime-500">
                            -Rp {Number(order.discount_amount).toLocaleString('id-ID')} discount
                          </p>
                        )}
                      </div>
                    </div>
                    </div>
                  </Link>
                  </StaggerItem>
                ))}
            </div>
            </StaggerContainer>
          )}

          {purchasedProducts.length > 0 && (
            <FadeIn delay={0.2}>
            <div className="mt-8">
              <h2 className="text-2xl font-bold text-neutral-800 mb-4">Rate Your Products</h2>
              <p className="text-neutral-500 mb-6">You have products waiting for your review</p>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {purchasedProducts.map((product) => (
                  <div key={product.id} className="bg-white rounded-xl p-4 border border-neutral-200">
                    <div className="aspect-square bg-neutral-100 rounded-lg mb-3 overflow-hidden">
                      {product.image_url ? (
                        <img src={product.image_url} alt={product.name} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <span className="text-4xl">🏌️</span>
                        </div>
                      )}
                    </div>
                    <h3 className="font-medium text-neutral-800 text-sm line-clamp-2 mb-2">{product.name}</h3>
                    <button
                      onClick={() => {
                        setSelectedProduct(product);
                        setShowReviewModal(true);
                      }}
                      className="w-full py-2 bg-lime-600 text-white rounded-lg text-sm font-medium hover:bg-lime-700 transition"
                    >
                      Write Review
                    </button>
                  </div>
                ))}
              </div>
            </div>
            </FadeIn>
          )}
        </div>
      </div>
      </PageTransition>

      {showReviewModal && selectedProduct && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full">
            <h3 className="text-xl font-bold text-neutral-800 mb-4">Review {selectedProduct.name}</h3>
            <form onSubmit={submitReview}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-neutral-700 mb-2">Rating</label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setReviewRating(star)}
                      className="p-1"
                    >
                      <Star
                        className={`w-8 h-8 ${
                          star <= reviewRating ? 'text-yellow-400 fill-yellow-400' : 'text-neutral-300'
                        }`}
                      />
                    </button>
                  ))}
                </div>
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-neutral-700 mb-2">Comment</label>
                <textarea
                  value={reviewComment}
                  onChange={(e) => setReviewComment(e.target.value)}
                  className="w-full px-4 py-3 border border-neutral-200 rounded-lg focus:ring-2 focus:ring-lime-500 focus:border-lime-500 outline-none"
                  rows={4}
                  placeholder="Share your experience with this product..."
                />
              </div>
              <div className="flex gap-3">
                <button
                  type="submit"
                  disabled={submittingReview}
                  className="flex-1 py-3 bg-lime-600 text-white rounded-lg font-medium hover:bg-lime-700 disabled:opacity-50 transition"
                >
                  {submittingReview ? 'Submitting...' : 'Submit Review'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowReviewModal(false);
                    setSelectedProduct(null);
                  }}
                  className="px-6 py-3 border border-neutral-300 text-neutral-700 rounded-lg font-medium hover:bg-neutral-100 transition"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <Footer />
    </>
  );
}