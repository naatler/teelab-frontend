'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import axios from '@/app/lib/axios';
import Navbar from '@/app/components/Navbar';
<<<<<<< HEAD
import Footer from '@/app/components/Footer';
=======
>>>>>>> 687640a364110c573b580e6a98b33ac2f5ffabb8
import { useAuthStore } from '@/app/store/useAuthStore';
import { useCartStore } from '@/app/store/useCartStore';
import toast from 'react-hot-toast';
import Link from 'next/link';
<<<<<<< HEAD
import { ShoppingCart, Package, Trash2 } from 'lucide-react';
import PageTransition, { StaggerContainer, StaggerItem, HoverCard } from '@/app/components/PageTransition';
=======
>>>>>>> 687640a364110c573b580e6a98b33ac2f5ffabb8

interface CartItem {
  id: string;
  quantity: number;
  product: {
    id: string;
    name: string;
    price: number;
    stock: number;
    image_url?: string;
  };
}

interface Cart {
  id: string;
  items: CartItem[];
}

export default function CartPage() {
  const router = useRouter();
  const { user } = useAuthStore();
<<<<<<< HEAD
  const { setItems, items } = useCartStore();
  const [cart, setCart] = useState<Cart | null>(null);
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    
    // Debug: log user state
    console.log('Cart page - user:', user);
    
    // Check if user exists in zustand store
    const checkAuth = () => {
      const authStorage = localStorage.getItem('auth-storage');
      console.log('Cart page - auth storage:', authStorage);
      
      if (!authStorage) {
        router.push('/login');
        return;
      }
      fetchCart();
    };
    
    // If user state is set, fetch cart
    if (user) {
      fetchCart();
    } else {
      // Check localStorage directly for persisted state
      setTimeout(checkAuth, 50);
    }
  }, [user, mounted]);

  const fetchCart = async () => {
    if (!mounted) return;
    
    try {
      const response = await axios.get('/cart');
      console.log('Cart response:', response.data);
      setCart(response.data);
      setItems(response.data.items || []);
    } catch (error: any) {
      console.error('Failed to fetch cart:', error);
=======
  const { setItems } = useCartStore();
  const [cart, setCart] = useState<Cart | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      router.push('/login');
      return;
    }
    fetchCart();
  }, [user]);

  const fetchCart = async () => {
    try {
      const { data } = await axios.get('/cart');
      setCart(data);
      setItems(data.items || []);
    } catch (error) {
>>>>>>> 687640a364110c573b580e6a98b33ac2f5ffabb8
      toast.error('Failed to fetch cart');
    } finally {
      setLoading(false);
    }
  };

  const updateQuantity = async (itemId: string, quantity: number) => {
    if (quantity < 1) return;

    try {
      await axios.patch(`/cart/items/${itemId}`, { quantity });
      fetchCart();
      toast.success('Cart updated');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to update cart');
    }
  };

  const removeItem = async (itemId: string) => {
    if (!confirm('Remove this item from cart?')) return;

    try {
      await axios.delete(`/cart/items/${itemId}`);
      fetchCart();
      toast.success('Item removed');
    } catch (error) {
      toast.error('Failed to remove item');
    }
  };

  const clearCart = async () => {
    if (!confirm('Clear all items from cart?')) return;

    try {
      await axios.delete('/cart');
      fetchCart();
      toast.success('Cart cleared');
    } catch (error) {
      toast.error('Failed to clear cart');
    }
  };

  const calculateTotal = () => {
    if (!cart) return 0;
    return cart.items.reduce(
      (sum, item) => sum + Number(item.product.price) * item.quantity,
      0
    );
  };

  const handleCheckout = () => {
    if (!cart || cart.items.length === 0) {
      toast.error('Cart is empty');
      return;
    }
    router.push('/checkout');
  };

  if (loading) {
    return (
      <>
        <Navbar />
<<<<<<< HEAD
        <div className="min-h-screen bg-neutral-50 flex items-center justify-center">
=======
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
>>>>>>> 687640a364110c573b580e6a98b33ac2f5ffabb8
          <div className="text-xl">Loading cart...</div>
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />
<<<<<<< HEAD
      <PageTransition>
        <div className="min-h-screen bg-neutral-50">
          <div className="container mx-auto px-4 py-8 max-w-6xl">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold text-neutral-800">Shopping Cart</h1>
            {cart && cart.items.length > 0 && (
              <button
                onClick={clearCart}
                className="text-red-500 hover:text-red-600 text-sm font-medium transition"
=======
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-8">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-4xl font-bold text-neutral-700">Shopping Cart</h1>
            {cart && cart.items.length > 0 && (
              <button
                onClick={clearCart}
                className="text-red-600 hover:underline"
>>>>>>> 687640a364110c573b580e6a98b33ac2f5ffabb8
              >
                Clear Cart
              </button>
            )}
          </div>

          {!cart || cart.items.length === 0 ? (
<<<<<<< HEAD
            <div className="bg-white rounded-2xl shadow-sm border border-neutral-200 p-16 text-center">
              <div className="w-20 h-20 bg-neutral-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <ShoppingCart className="w-10 h-10 text-neutral-400" />
              </div>
              <h2 className="text-2xl font-semibold mb-2 text-neutral-800">
                Your cart is empty
              </h2>
              <p className="text-neutral-500 mb-8">
                Add some golf equipment to get started
              </p>
              <Link
                href="/products"
                className="inline-block bg-lime-600 text-white px-8 py-3 rounded-xl font-medium hover:bg-lime-700 transition"
=======
            <div className="bg-white rounded-lg shadow-md p-12 text-center">
              <div className="text-6xl mb-4">🛒</div>
              <h2 className="text-2xl font-semibold mb-2 text-neutral-700">
                Your cart is empty
              </h2>
              <p className="text-gray-600 mb-6">
                Add some products to get started
              </p>
              <Link
                href="/products"
                className="inline-block bg-green-600 text-white px-8 py-3 rounded-lg hover:bg-green-700 transition"
>>>>>>> 687640a364110c573b580e6a98b33ac2f5ffabb8
              >
                Browse Products
              </Link>
            </div>
          ) : (
<<<<<<< HEAD
            <div className="grid lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-4">
                <StaggerContainer>
                  {cart.items.map((item) => (
                    <StaggerItem key={item.id}>
                      <HoverCard>
                      <div
                        className="bg-white rounded-2xl shadow-sm border border-neutral-200 p-6 flex items-center gap-6"
                      >
                    <div className="w-24 h-24 bg-neutral-100 rounded-xl flex items-center justify-center flex-shrink-0 overflow-hidden">
                      {item.product.image_url ? (
                        <img
                          src={item.product.image_url}
                          alt={item.product.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <Package className="w-8 h-8 text-neutral-400" />
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-neutral-800 truncate">
                        {item.product.name}
                      </h3>
                      <p className="text-lime-600 font-bold mt-1">
                        Rp {Number(item.product.price).toLocaleString('id-ID')}
                      </p>
                      <p className="text-xs text-neutral-500 mt-1">
                        Stock: {item.product.stock}
                      </p>
                    </div>

                    <div className="flex items-center gap-2 bg-neutral-100 rounded-xl p-1">
                      <button
                        onClick={() =>
                          updateQuantity(item.id, item.quantity - 1)
                        }
                        disabled={item.quantity <= 1}
                        className="w-10 h-10 bg-white rounded-lg hover:bg-neutral-50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center font-medium text-neutral-700 transition"
                      >
                        −
                      </button>
                      <span className="w-12 text-center font-semibold text-neutral-800">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() =>
                          updateQuantity(item.id, item.quantity + 1)
                        }
                        disabled={item.quantity >= item.product.stock}
                        className="w-10 h-10 bg-white rounded-lg hover:bg-neutral-50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center font-medium text-neutral-700 transition"
                      >
                        +
                      </button>
                    </div>

                    <div className="text-right hidden sm:block">
                      <p className="font-bold text-lg text-neutral-800">
                        Rp{' '}
                        {(
                          Number(item.product.price) * item.quantity
                        ).toLocaleString('id-ID')}
                      </p>
                      <button
                        onClick={() => removeItem(item.id)}
                        className="text-red-500 hover:text-red-600 text-sm mt-2 transition flex items-center gap-1"
                      >
                        <Trash2 size={14} /> Remove
                      </button>
                    </div>
                    
                    <button
                      onClick={() => removeItem(item.id)}
                      className="text-red-500 hover:text-red-600 sm:hidden transition p-2"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                  </HoverCard>
                  </StaggerItem>
                ))}
                </StaggerContainer>
=======
            <div className="grid lg:grid-cols-3 gap-8">
              {/* Cart Items */}
              <div className="lg:col-span-2">
                <div className="bg-white rounded-lg shadow-md divide-y">
                  {cart.items.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center gap-4 p-6"
                    >
                      {/* Product Image */}
                      <div className="w-24 h-24 bg-gray-200 rounded-lg flex items-center justify-center flex-shrink-0 overflow-hidden">
                        {item.product.image_url ? (
                          <img
                            src={item.product.image_url}
                            alt={item.product.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <span className="text-4xl">📦</span>
                        )}
                      </div>

                      {/* Product Info */}
                      <div className="flex-1">
                        <h3 className="font-semibold text-lg mb-1">
                          {item.product.name}
                        </h3>
                        <p className="text-green-600 font-bold text-xl">
                          Rp {Number(item.product.price).toLocaleString('id-ID')}
                        </p>
                        <p className="text-sm text-gray-600 mt-1">
                          Stock: {item.product.stock}
                        </p>
                      </div>

                      {/* Quantity Controls */}
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() =>
                            updateQuantity(item.id, item.quantity - 1)
                          }
                          disabled={item.quantity <= 1}
                          className="w-8 h-8 bg-gray-200 rounded hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          -
                        </button>
                        <span className="w-12 text-center font-semibold">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() =>
                            updateQuantity(item.id, item.quantity + 1)
                          }
                          disabled={item.quantity >= item.product.stock}
                          className="w-8 h-8 bg-gray-200 rounded hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          +
                        </button>
                      </div>

                      {/* Item Total & Remove */}
                      <div className="text-right">
                        <p className="font-bold text-lg mb-2">
                          Rp{' '}
                          {(
                            Number(item.product.price) * item.quantity
                          ).toLocaleString('id-ID')}
                        </p>
                        <button
                          onClick={() => removeItem(item.id)}
                          className="text-red-600 hover:underline text-sm"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
>>>>>>> 687640a364110c573b580e6a98b33ac2f5ffabb8
              </div>

              {/* Order Summary */}
              <div className="lg:col-span-1">
<<<<<<< HEAD
                <div className="bg-white rounded-2xl shadow-sm border border-neutral-200 p-6 sticky top-8">
                  <h2 className="text-xl font-bold mb-6 text-neutral-800">
                    Order Summary
                  </h2>

                  <div className="space-y-4 mb-6">
                    <div className="flex justify-between text-neutral-600">
                      <span>Items ({cart.items.length})</span>
                      <span className="font-medium">
                        Rp {calculateTotal().toLocaleString('id-ID')}
                      </span>
                    </div>
                    <div className="flex justify-between text-neutral-600">
                      <span>Shipping</span>
                      <span className="font-medium text-lime-600">FREE</span>
                    </div>
                    
                    <div className="border-t border-neutral-200 pt-4">
                      <div className="flex justify-between text-xl font-bold">
                        <span className="text-neutral-800">Total</span>
                        <span className="text-lime-600">
=======
                <div className="bg-white rounded-lg shadow-md p-6 sticky top-8">
                  <h2 className="text-xl font-bold mb-4 text-neutral-700">
                    Order Summary
                  </h2>

                  <div className="space-y-3 mb-6">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Items</span>
                      <span className="font-semibold">{cart.items.length}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Subtotal</span>
                      <span className="font-semibold">
                        Rp {calculateTotal().toLocaleString('id-ID')}
                      </span>
                    </div>
                    <div className="border-t pt-3">
                      <div className="flex justify-between text-lg font-bold">
                        <span>Total</span>
                        <span className="text-green-600">
>>>>>>> 687640a364110c573b580e6a98b33ac2f5ffabb8
                          Rp {calculateTotal().toLocaleString('id-ID')}
                        </span>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={handleCheckout}
<<<<<<< HEAD
                    className="w-full bg-lime-600 text-white py-4 rounded-xl font-semibold hover:bg-lime-700 transition shadow-sm"
=======
                    className="w-full bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-700 transition"
>>>>>>> 687640a364110c573b580e6a98b33ac2f5ffabb8
                  >
                    Proceed to Checkout
                  </button>

                  <Link
                    href="/products"
<<<<<<< HEAD
                    className="block w-full mt-3 bg-neutral-100 text-neutral-700 text-center py-3 rounded-xl font-medium hover:bg-neutral-200 transition"
=======
                    className="block w-full mt-3 bg-gray-200 text-gray-700 text-center py-3 rounded-lg font-semibold hover:bg-gray-300 transition"
>>>>>>> 687640a364110c573b580e6a98b33ac2f5ffabb8
                  >
                    Continue Shopping
                  </Link>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
<<<<<<< HEAD
      </PageTransition>
      <Footer />
=======
>>>>>>> 687640a364110c573b580e6a98b33ac2f5ffabb8
    </>
  );
}