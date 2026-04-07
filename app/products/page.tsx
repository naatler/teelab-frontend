'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import axios from '@/app/lib/axios';
import Navbar from '@/app/components/Navbar';
import toast from 'react-hot-toast';
import { useAuthStore } from '@/app/store/useAuthStore';
import { useRouter } from 'next/navigation';

interface Product {
  id: string;
  name: string;
  slug: string;
  price: number;
  stock: number;
  image_url?: string;
  category: {
    id: string;
    name: string;
  };
}

interface Category {
  id: string;
  name: string;
  slug: string;
}

export default function ProductsPage() {
  const router = useRouter();
  const { user, isAdmin } = useAuthStore();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');

  useEffect(() => {
    fetchCategories();
    fetchProducts();
  }, [search, selectedCategory]);

  const fetchCategories = async () => {
    try {
      const { data } = await axios.get('/categories');
      setCategories(data);
    } catch (error) {
      console.error('Failed to fetch categories');
    }
  };

  const fetchProducts = async () => {
    try {
      const params: any = {};
      if (search) params.search = search;
      if (selectedCategory) params.category_id = selectedCategory;

      const { data } = await axios.get('/products', { params });
      setProducts(data);
    } catch (error) {
      toast.error('Failed to fetch products');
    } finally {
      setLoading(false);
    }
  };

  const addToCart = async (productId: string) => {
    if (!user) {
      toast.error('Please login first');
      router.push('/login');
      return;
    }

    try {
      await axios.post('/cart/items', {
        product_id: productId,
        quantity: 1,
      });
      toast.success('Added to cart!');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to add to cart');
    }
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-xl text-neutral-700">Loading products...</div>
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-8">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-4xl font-bold text-neutral-700">Our Products</h1>
            {isAdmin() && (
              <Link
                href="/admin/products/create"
                className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition"
              >
                + Add Product
              </Link>
            )}
          </div>

          {/* Search & Filter */}
          <div className="mb-8 space-y-4">
            <input
              type="text"
              placeholder="Search products..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:outline-none"
            />

            <div className="flex gap-3 overflow-x-auto pb-2">
              <button
                onClick={() => setSelectedCategory('')}
                className={`px-6 py-2 rounded-full whitespace-nowrap font-medium transition ${
                  selectedCategory === ''
                    ? 'bg-green-500 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                All Products
              </button>
              {categories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategory(category.id)}
                  className={`px-6 py-2 rounded-full whitespace-nowrap font-medium transition ${
                    selectedCategory === category.id
                      ? 'bg-green-500 text-white'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  {category.name}
                </button>
              ))}
            </div>
          </div>

          {/* Products Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {products.map((product) => (
              <div
                key={product.id}
                className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition group"
              >
                <Link href={`/products/${product.id}`}>
                  <div className="relative h-64 bg-gray-200 overflow-hidden">
                    {product.image_url ? (
                      <img
                        src={product.image_url}
                        alt={product.name}
                        className="w-full h-full object-cover group-hover:scale-110 transition duration-300"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400 text-6xl">
                        📦
                      </div>
                    )}
                  </div>
                </Link>

                <div className="p-6">
                  <p className="text-xs text-gray-500 mb-1">
                    {product.category.name}
                  </p>
                  <Link href={`/products/${product.id}`}>
                    <h3 className="font-semibold text-lg mb-2 truncate hover:text-green-600 transition">
                      {product.name}
                    </h3>
                  </Link>
                  <p className="text-green-600 font-bold text-xl mb-2">
                    Rp {Number(product.price).toLocaleString('id-ID')}
                  </p>
                  <p className="text-sm text-gray-600 mb-4">
                    Stock: {product.stock}
                  </p>

                  <div className="flex gap-2">
                    <Link
                      href={`/products/${product.id}`}
                      className="flex-1 bg-gray-200 text-center py-2 rounded-lg hover:bg-gray-300 transition"
                    >
                      View
                    </Link>
                    <button
                      onClick={() => addToCart(product.id)}
                      disabled={product.stock === 0}
                      className="flex-1 bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition"
                    >
                      {product.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {products.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500 text-xl">No products found</p>
            </div>
          )}
        </div>
      </div>
    </>
  );
}