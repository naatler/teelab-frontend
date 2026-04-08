'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import axios from '@/app/lib/axios';
import Navbar from '@/app/components/Navbar';
import toast from 'react-hot-toast';
import { useAuthStore } from '@/app/store/useAuthStore';
import Link from 'next/link';

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

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user, isAdmin } = useAuthStore();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    fetchProduct();
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
      toast.error(error.response?.data?.message || 'Failed to add to cart');
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
      <div className="min-h-screen bg-neutral-50">
        <div className="container mx-auto px-4 py-8">
          <button
            onClick={() => router.back()}
            className="mb-6 text-lime-600 hover:underline flex items-center gap-2"
          >
            ← Back to Products
          </button>

          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="grid md:grid-cols-2 gap-8 p-8">
              {/* Product Image */}
              <div className="bg-neutral-200 rounded-lg h-96 flex items-center justify-center overflow-hidden">
                {product.image_url ? (
                  <img
                    src={product.image_url}
                    alt={product.name}
                    className="w-full h-full object-cover rounded-lg"
                  />
                ) : (
                  <span className="text-neutral-400 text-9xl">📦</span>
                )}
              </div>

              {/* Product Info */}
              <div>
                <p className="text-sm text-neutral-500 mb-2">
                  {product.category.name}
                </p>
                <h1 className="text-4xl font-bold mb-4 text-neutral-700">
                  {product.name}
                </h1>
                <p className="text-5xl font-bold text-lime-600 mb-6">
                  Rp {Number(product.price).toLocaleString('id-ID')}
                </p>

                <div className="mb-6">
                  <p className="text-neutral-700 mb-2">
                    <span className="font-semibold">Stock:</span> {product.stock}{' '}
                    units
                  </p>
                  <p className="text-neutral-700 leading-relaxed">
                    {product.description || 'No description available'}
                  </p>
                </div>

                {/* Quantity Selector */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-neutral-700 mb-2">
                    Quantity
                  </label>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="w-10 h-10 bg-neutral-200 rounded-lg hover:bg-neutral-300 transition"
                    >
                      -
                    </button>
                    <input
                      type="number"
                      min="1"
                      max={product.stock}
                      value={quantity}
                      onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
                      className="w-20 px-4 py-2 border border-neutral-300 rounded-lg text-center focus:ring-2 focus:ring-lime-500 focus:outline-none"
                    />
                    <button
                      onClick={() =>
                        setQuantity(Math.min(product.stock, quantity + 1))
                      }
                      className="w-10 h-10 bg-neutral-200 rounded-lg hover:bg-neutral-300 transition"
                    >
                      +
                    </button>
                  </div>
                </div>

                {/* Add to Cart Button */}
                <button
                  onClick={addToCart}
                  disabled={product.stock === 0}
                  className="w-full bg-lime-600 text-white py-3 rounded-lg font-semibold hover:bg-lime-700 disabled:bg-neutral-400 disabled:cursor-not-allowed transition text-lg"
                >
                  {product.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
                </button>

                {/* Admin Actions */}
                {isAdmin() && (
                  <div className="mt-4">
                    <Link
                      href={`/admin/products/${product.id}/edit`}
                      className="block w-full bg-yellow-500 text-white py-3 rounded-lg text-center hover:bg-yellow-600 transition"
                    >
                      Edit Product
                    </Link>
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