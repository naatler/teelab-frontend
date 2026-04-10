'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import axios from '@/app/lib/axios';
import Navbar from '@/app/components/Navbar';
import Footer from '@/app/components/Footer';
import toast from 'react-hot-toast';
import { useAuthStore } from '@/app/store/useAuthStore';
import Link from 'next/link';
import PageTransition, { FadeIn, ScaleIn, HoverCard } from '@/app/components/PageTransition';
import { Star } from 'lucide-react';

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  stock: number;
  image_url?: string;
  category: {
    id: string;
    name: string;
  };
}

interface Review {
  id: string;
  rating: number;
  comment: string;
  created_at: string;
  user: {
    name: string;
  };
}

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user, isAdmin } = useAuthStore();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [reviewsLoading, setReviewsLoading] = useState(true);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);

  useEffect(() => {
    fetchProduct();
    fetchReviews();
  }, [params.id]);

  const fetchProduct = async () => {
    try {
      const { data } = await axios.get(`/products/${params.id}`);
      setProduct(data);
    } catch (error) {
      toast.error('Product not found');
      router.push('/products');
    } finally {
      setLoading(false);
    }
  };

  const fetchReviews = async () => {
    try {
      const { data } = await axios.get(`/products/${params.id}/reviews`);
      setReviews(data.reviews || []);
    } catch (error) {
      console.error('Failed to fetch reviews:', error);
    } finally {
      setReviewsLoading(false);
    }
  };

  const submitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast.error('Please login first');
      router.push('/login');
      return;
    }

    setSubmittingReview(true);
    try {
      await axios.post('/reviews', {
        product_id: params.id,
        rating: reviewRating,
        comment: reviewComment,
      });
      toast.success('Review submitted!');
      setShowReviewForm(false);
      setReviewRating(5);
      setReviewComment('');
      fetchReviews();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to submit review');
    } finally {
      setSubmittingReview(false);
    }
  };

  const addToCart = async () => {
    if (!user) {
      toast.error('Please login first');
      router.push('/login');
      return;
    }

    try {
      await axios.post('/cart/items', {
        product_id: product?.id,
        quantity,
      });
      toast.success('Added to cart!');
      router.push('/cart');
    } catch (error: any) {
      const status = error.response?.status;
      if (status === 401 || status === 403) {
        toast.error("Session expired. Please login again");
        router.push("/login");
      } else {
        toast.error(error.response?.data?.message || 'Failed to add to cart');
      }
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

  if (!product) return null;

  return (
    <>
      <Navbar />
      <PageTransition>
      <div className="min-h-screen bg-neutral-50">
        <div className="container mx-auto px-4 py-8">
          <FadeIn>
          <button
            onClick={() => router.back()}
            className="mb-6 text-neutral-500 hover:text-lime-600 flex items-center gap-2 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Products
          </button>
          </FadeIn>

          <div className="bg-white rounded-2xl shadow-sm border border-neutral-100 overflow-hidden">
            <div className="grid lg:grid-cols-2 gap-0">
              <ScaleIn delay={0.1}>
              <div className="relative aspect-square lg:aspect-auto lg:min-h-[500px] bg-neutral-100">
                {product.image_url ? (
                  <img
                    src={product.image_url}
                    alt={product.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <div className="w-32 h-32 bg-neutral-200 rounded-full flex items-center justify-center">
                      <span className="text-6xl">🏌️</span>
                    </div>
                  </div>
                )}
                {product.stock === 0 && (
                  <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                    <span className="bg-red-500 text-white px-6 py-2 rounded-full text-lg font-semibold">
                      Out of Stock
                    </span>
                  </div>
                )}
              </div>
              </ScaleIn>

              <FadeIn delay={0.2}>
              <div className="p-8 lg:p-10 flex flex-col">
                <div className="mb-2">
                  <span className="inline-block bg-neutral-100 text-neutral-600 text-xs font-medium px-3 py-1 rounded-full uppercase tracking-wide">
                    {product.category?.name || 'Uncategorized'}
                  </span>
                </div>
                <h1 className="text-3xl lg:text-4xl font-bold mb-4 text-neutral-800">
                  {product.name}
                </h1>
                <div className="mb-6">
                  <p className="text-3xl lg:text-4xl font-bold text-lime-600">
                    Rp {Number(product.price).toLocaleString('id-ID')}
                  </p>
                </div>

                <div className="space-y-4 mb-8">
                  <div className="flex items-center gap-3">
                    <div className={`w-3 h-3 rounded-full ${product.stock > 0 ? 'bg-lime-500' : 'bg-red-500'}`}></div>
                    <span className={`font-medium ${product.stock > 0 ? 'text-lime-600' : 'text-red-500'}`}>
                      {product.stock > 0 ? `In Stock (${product.stock} units available)` : 'Out of Stock'}
                    </span>
                  </div>
                </div>

                <div className="mb-8">
                  <p className="text-neutral-600 leading-relaxed">
                    {product.description || 'No description available for this product.'}
                  </p>
                </div>

                {product.stock > 0 && (
                  <div className="mb-6">
                    <label className="block text-sm font-medium text-neutral-700 mb-3">
                      Quantity
                    </label>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setQuantity(Math.max(1, quantity - 1))}
                        className="w-12 h-12 bg-neutral-800 rounded-xl hover:bg-neutral-200 transition flex items-center justify-center text-xl font-medium"
                      >
                        −
                      </button>
                      <input
                        type="number"
                        min="1"
                        max={product.stock}
                        value={quantity}
                        onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
                        className="w-20 h-12 px-3 border border-neutral-200 rounded-xl text-center font-medium text-lg text-neutral-700 focus:ring-2 focus:ring-lime-500 focus:border-lime-500 outline-none"
                      />
                      <button
                        onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                        className="w-12 h-12 bg-neutral-800 rounded-xl hover:bg-neutral-200 transition flex items-center justify-center text-xl font-medium"
                      >
                        +
                      </button>
                    </div>
                  </div>
                )}

                <button
                  onClick={addToCart}
                  disabled={product.stock === 0}
                  className="w-full bg-neutral-900 text-white py-4 rounded-xl font-semibold hover:bg-lime-600 disabled:bg-neutral-300 disabled:text-neutral-500 disabled:cursor-not-allowed transition-all duration-300 flex items-center justify-center gap-3 text-lg mt-auto"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.5.363 1.77l9.597 9.597c.34.34.9.36 1.307.09L17 14" />
                  </svg>
                  {product.stock === 0 ? 'Sold Out' : 'Add to Cart'}
                </button>

                {isAdmin() && (
                  <div className="mt-4">
                    <Link
                      href={`/admin/products/${product.id}/edit`}
                      className="block w-full bg-yellow-500 text-white py-3 rounded-xl text-center font-medium hover:bg-yellow-600 transition"
                    >
                      Edit Product
                    </Link>
                  </div>
                )}
                </div>
              </FadeIn>
            </div>
          </div>
        </div>

        <FadeIn delay={0.3}>
        <div className="mt-12">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-2xl font-bold text-neutral-800">
              Reviews ({reviews.length})
            </h3>
            {user && !isAdmin() && (
              <button
                onClick={() => setShowReviewForm(!showReviewForm)}
                className="px-4 py-2 bg-lime-600 text-white rounded-lg font-medium hover:bg-lime-700 transition"
              >
                Write a Review
              </button>
            )}
          </div>

          {showReviewForm && (
            <form onSubmit={submitReview} className="bg-neutral-50 p-6 rounded-xl mb-6">
              <h4 className="text-lg font-medium text-neutral-800 mb-4">Write Your Review</h4>
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
                  className="w-full px-4 py-3 border border-neutral-200 rounded-lg focus:ring-2 focus:ring-lime-500 focus:border-lime-500 outline-none text-neutral-800"
                  rows={4}
                  placeholder="Share your experience with this product..."
                />
              </div>
              <div className="flex gap-3">
                <button
                  type="submit"
                  disabled={submittingReview}
                  className="px-6 py-2 bg-lime-600 text-white rounded-lg font-medium hover:bg-lime-700 disabled:opacity-50 transition"
                >
                  {submittingReview ? 'Submitting...' : 'Submit Review'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowReviewForm(false)}
                  className="px-6 py-2 border border-neutral-300 text-neutral-700 rounded-lg font-medium hover:bg-neutral-100 transition"
                >
                  Cancel
                </button>
              </div>
            </form>
          )}

          {reviewsLoading ? (
            <div className="text-center py-8 text-neutral-500">Loading reviews...</div>
          ) : reviews.length > 0 ? (
            <div className="space-y-4">
              {reviews.map((review) => (
                <div key={review.id} className="bg-white p-6 rounded-xl border border-neutral-100">
                  <div className="flex items-center gap-2 mb-3">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-4 h-4 ${
                          i < review.rating ? 'text-yellow-400 fill-yellow-400' : 'text-neutral-300'
                        }`}
                      />
                    ))}
                    <span className="text-sm text-neutral-500 ml-2">
                      {new Date(review.created_at).toLocaleDateString('id-ID', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric'
                      })}
                    </span>
                  </div>
                  <p className="text-neutral-600">{review.comment}</p>
                  <p className="text-sm font-medium text-neutral-800 mt-3">- {review.user.name}</p>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-neutral-500">
              No reviews yet. Be the first to review this product!
            </div>
          )}
        </div>
        </FadeIn>
      </div>
      </PageTransition>
      <Footer />
    </>
  );
}