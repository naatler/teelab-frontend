'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import axios from '@/app/lib/axios';
import Navbar from '@/app/components/Navbar';
import Footer from '@/app/components/Footer';
import { useAuthStore } from '@/app/store/useAuthStore';
import { useCartStore } from '@/app/store/useCartStore';
import toast from 'react-hot-toast';
import Swal from 'sweetalert2';
import Link from 'next/link';
import { ShoppingBag, Package, Trash2, Minus, Plus, ArrowRight, ShieldCheck } from 'lucide-react';
import PageTransition, { FadeIn, ScaleIn } from '@/app/components/PageTransition';

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
  const { setItems } = useCartStore();
  const [cart, setCart] = useState<Cart | null>(null);
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);
  const [updatingIds, setUpdatingIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;

    if (!user) {
      router.push('/login');
      return;
    }

    fetchCart();
  }, [user, mounted]);

  const fetchCart = async () => {
    try {
      const { data } = await axios.get('/cart');
      setCart(data);
      setItems(data.items || []);
    } catch (error: any) {
      console.error(error);
      toast.error('Failed to fetch cart');
    } finally {
      setLoading(false);
    }
  };

  const updateQuantity = async (itemId: string, quantity: number) => {
    if (quantity < 1) return;
    if (updatingIds.has(itemId)) return;

    setUpdatingIds(prev => new Set(prev).add(itemId));
    
    try {
      await axios.patch(`/cart/items/${itemId}`, { quantity });
      fetchCart();
      toast.success('Cart updated');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to update cart');
    } finally {
      setUpdatingIds(prev => {
        const next = new Set(prev);
        next.delete(itemId);
        return next;
      });
    }
  };

  const removeItem = async (itemId: string) => {
    try {
      await axios.delete(`/cart/items/${itemId}`);
      fetchCart();
      toast.success('Item removed');
    } catch {
      toast.error('Failed to remove item');
    }
  };

  const clearCart = async () => {
    const result = await Swal.fire({
      title: 'Clear Cart?',
      html: 'Are you sure you want to remove all items from your cart?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#dc2626',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Yes, clear it',
      cancelButtonText: 'Cancel',
      width: '400px',
    });

    if (!result.isConfirmed) return;

    try {
      await axios.delete('/cart');
      fetchCart();
      
      await Swal.fire({
        title: 'Cleared!',
        text: 'Your cart has been cleared.',
        icon: 'success',
        timer: 2000,
        showConfirmButton: false,
        width: '350px',
      });
    } catch {
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
          <div className="flex flex-col items-center gap-3">
            <div className="w-10 h-10 border-3 border-lime-500 border-t-transparent rounded-full animate-spin" />
            <p className="text-neutral-500">Loading cart...</p>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <PageTransition>
        <div className="min-h-screen bg-neutral-50">
          <div className="container mx-auto px-4 py-10 max-w-6xl">
            
            <FadeIn>
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h1 className="text-3xl font-bold text-neutral-900">Shopping Cart</h1>
                  <p className="text-neutral-500 mt-1">
                    {cart?.items.length || 0} {cart?.items.length === 1 ? 'item' : 'items'}
                  </p>
                </div>
                {cart && cart.items.length > 0 && (
                  <button
                    onClick={clearCart}
                    className="text-sm text-red-500 hover:text-red-600 font-medium transition-colors"
                  >
                    Clear all
                  </button>
                )}
              </div>
            </FadeIn>

            {!cart || cart.items.length === 0 ? (
              <FadeIn>
                <div className="bg-white rounded-3xl shadow-sm border border-neutral-100 p-16 text-center">
                  <div className="w-24 h-24 mx-auto mb-6 bg-neutral-100 rounded-full flex items-center justify-center">
                    <ShoppingBag size={40} className="text-neutral-400" />
                  </div>
                  <h2 className="text-2xl font-bold text-neutral-800 mb-2">Your cart is empty</h2>
                  <p className="text-neutral-500 mb-8 max-w-md mx-auto">
                    Looks like you haven't added any items to your cart yet. Start shopping to fill it up!
                  </p>
                  <Link
                    href="/products"
                    className="inline-flex items-center gap-2 bg-lime-600 hover:bg-lime-700 text-white px-8 py-3.5 rounded-full font-semibold transition-all hover:shadow-lg hover:shadow-lime-500/25"
                  >
                    Browse Products
                    <ArrowRight size={18} />
                  </Link>
                </div>
              </FadeIn>
            ) : (
              <div className="grid lg:grid-cols-3 gap-8">
                
                <div className="lg:col-span-2 space-y-4">
                  {cart.items.map((item, index) => (
                    <ScaleIn key={item.id} delay={index * 0.1}>
                      <div className="bg-white rounded-2xl shadow-sm border border-neutral-100 p-4 sm:p-6 hover:shadow-md transition-shadow">
                        <div className="flex gap-4 sm:gap-6">
                          
                          <div className="w-24 h-24 sm:w-28 sm:h-28 bg-neutral-100 rounded-xl flex-shrink-0 overflow-hidden">
                            {item.product.image_url ? (
                              <img 
                                src={item.product.image_url} 
                                alt={item.product.name}
                                className="w-full h-full object-cover hover:scale-105 transition-transform duration-300" 
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center">
                                <Package size={32} className="text-neutral-300" />
                              </div>
                            )}
                          </div>

                          <div className="flex-1 min-w-0">
                            <div className="flex justify-between gap-4">
                              <div className="min-w-0">
                                <h3 className="font-semibold text-neutral-800 truncate">{item.product.name}</h3>
                                <p className="text-lime-600 font-bold text-lg mt-1">
                                  Rp {Number(item.product.price).toLocaleString('id-ID')}
                                </p>
                              </div>
                              <button 
                                onClick={() => removeItem(item.id)}
                                className="text-neutral-400 hover:text-red-500 p-2 transition-colors"
                                aria-label="Remove item"
                              >
                                <Trash2 size={18} />
                              </button>
                            </div>

                            <div className="flex items-center justify-between mt-4">
                              <div className="flex items-center gap-1">
                                <button
                                  onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                  disabled={updatingIds.has(item.id) || item.quantity <= 1}
                                  className="w-9 h-9 bg-neutral-600 hover:bg-neutral-800 rounded-xl flex items-center justify-center transition-colors disabled:opacity-50"
                                >
                                  <Minus size={16} />
                                </button>
                                <span className="w-12 text-center text-neutral-800 font-semibold">{item.quantity}</span>
                                <button
                                  onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                  disabled={updatingIds.has(item.id) || item.quantity >= item.product.stock}
                                  className="w-9 h-9 bg-neutral-600 hover:bg-neutral-800 rounded-xl flex items-center justify-center transition-colors disabled:opacity-50"
                                >
                                  <Plus size={16} />
                                </button>
                              </div>
                              
                              <div className="text-right">
                                <p className="text-xs text-neutral-500">Subtotal</p>
                                <p className="font-bold text-neutral-800">
                                  Rp {(Number(item.product.price) * item.quantity).toLocaleString('id-ID')}
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </ScaleIn>
                  ))}
                </div>

                <div className="lg:col-span-1">
                  <div className="bg-white rounded-2xl shadow-sm border border-neutral-100 p-6 sticky top-24">
                    <h2 className="font-bold text-lg text-neutral-800 mb-6">Order Summary</h2>
                    
                    <div className="space-y-3 mb-6">
                      <div className="flex justify-between text-neutral-500">
                        <span>Subtotal</span>
                        <span>Rp {calculateTotal().toLocaleString('id-ID')}</span>
                      </div>
                      <div className="flex justify-between text-neutral-500">
                        <span>Shipping</span>
                        <span>Calculated at checkout</span>
                      </div>
                    </div>
                    
                    <div className="border-t border-neutral-100 pt-4 mb-6">
                      <div className="flex justify-between text-lg font-bold">
                        <span>Total</span>
                        <span className="text-lime-600">Rp {calculateTotal().toLocaleString('id-ID')}</span>
                      </div>
                    </div>

                    <button
                      onClick={handleCheckout}
                      className="w-full bg-neutral-900 hover:bg-lime-600 text-white py-4 rounded-xl font-semibold transition-all hover:shadow-lg flex items-center justify-center gap-2"
                    >
                      Proceed to Checkout
                      <ArrowRight size={18} />
                    </button>

                    <div className="mt-6 pt-4 border-t border-neutral-100">
                      <div className="flex items-center gap-2 text-neutral-500 text-sm">
                        <ShieldCheck size={16} className="text-lime-500" />
                        <span>Secure checkout guaranteed</span>
                      </div>
                    </div>
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