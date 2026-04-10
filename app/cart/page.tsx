'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import axios from '@/app/lib/axios';
import Navbar from '@/app/components/Navbar';
import Footer from '@/app/components/Footer';
import { useAuthStore } from '@/app/store/useAuthStore';
import { useCartStore } from '@/app/store/useCartStore';
import toast from 'react-hot-toast';
import Link from 'next/link';
import { ShoppingCart, Package, Trash2 } from 'lucide-react';
import PageTransition, { StaggerContainer, StaggerItem, HoverCard } from '@/app/components/PageTransition';

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
        <div className="min-h-screen bg-neutral-50 flex items-center justify-center">
          <div className="text-xl">Loading cart...</div>
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <PageTransition>
        <div className="min-h-screen bg-neutral-50">
          <div className="container mx-auto px-4 py-8 max-w-6xl">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold text-neutral-800">Shopping Cart</h1>
            {cart && cart.items.length > 0 && (
              <button
                onClick={clearCart}
                className="text-red-500 hover:text-red-600 text-sm font-medium transition"
              >
                Clear Cart
              </button>
            )}
          </div>

          {!cart || cart.items.length === 0 ? (
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
              >
                Browse Products
              </Link>
            </div>
          ) : (
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
              </div>

              {/* Order Summary */}
              <div className="lg:col-span-1">
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
                          Rp {calculateTotal().toLocaleString('id-ID')}
                        </span>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={handleCheckout}
                    className="w-full bg-lime-600 text-white py-4 rounded-xl font-semibold hover:bg-lime-700 transition shadow-sm"
                  >
                    Proceed to Checkout
                  </button>

                  <Link
                    href="/products"
                    className="block w-full mt-3 bg-neutral-100 text-neutral-700 text-center py-3 rounded-xl font-medium hover:bg-neutral-200 transition"
                  >
                    Continue Shopping
                  </Link>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
      </PageTransition>
      <Footer />
    </>
  );
}