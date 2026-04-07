'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import axios from '@/app/lib/axios';
import Navbar from '@/app/components/Navbar';
import { useAuthStore } from '@/app/store/useAuthStore';
import toast from 'react-hot-toast';
import Link from 'next/link';

interface CartItem {
  id: string;
  quantity: number;
  product: {
    id: string;
    name: string;
    price: number;
    image_url?: string;
  };
}

interface Address {
  id: string;
  label: string;
  recipient_name: string;
  phone: string;
  address: string;
  city: string;
  province: string;
  postal_code: string;
  is_default: boolean;
}

export default function CheckoutPage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const [cart, setCart] = useState<{ items: CartItem[] } | null>(null);
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [selectedAddress, setSelectedAddress] = useState<string>('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  
  // Discount state
  const [discountCode, setDiscountCode] = useState('');
  const [appliedDiscount, setAppliedDiscount] = useState<{
    code: string;
    amount: number;
  } | null>(null);
  const [discountLoading, setDiscountLoading] = useState(false);

  useEffect(() => {
    if (!user) {
      router.push('/login');
      return;
    }
    fetchData();
  }, [user]);

  const fetchData = async () => {
    try {
      const [cartRes, addressRes] = await Promise.all([
        axios.get('/cart'),
        axios.get('/addresses'),
      ]);

      setCart(cartRes.data);
      setAddresses(addressRes.data);

      // Auto-select default address
      const defaultAddress = addressRes.data.find((addr: Address) => addr.is_default);
      if (defaultAddress) {
        setSelectedAddress(defaultAddress.id);
      }
    } catch (error) {
      toast.error('Failed to load checkout data');
    } finally {
      setLoading(false);
    }
  };

  const calculateTotal = () => {
    if (!cart) return 0;
    return cart.items.reduce(
      (sum, item) => sum + Number(item.product.price) * item.quantity,
      0
    );
  };

  const calculateFinalTotal = () => {
    const total = calculateTotal();
    if (appliedDiscount) {
      return total - appliedDiscount.amount;
    }
    return total;
  };

  const applyDiscount = async () => {
    if (!discountCode.trim()) {
      toast.error('Please enter a discount code');
      return;
    }

    setDiscountLoading(true);
    try {
      const { data } = await axios.post('/discounts/apply', {
        code: discountCode,
        order_amount: calculateTotal(),
      });

      if (data.success) {
        setAppliedDiscount({
          code: data.discount.code,
          amount: data.discount_amount,
        });
        toast.success(`Discount applied: Rp ${data.discount_amount.toLocaleString('id-ID')} off`);
      }
    } catch (error: any) {
      const message = error.response?.data?.message || 'Invalid discount code';
      toast.error(message);
      setAppliedDiscount(null);
    } finally {
      setDiscountLoading(false);
    }
  };

  const removeDiscount = () => {
    setAppliedDiscount(null);
    setDiscountCode('');
  };

  const handlePlaceOrder = async () => {
    if (!selectedAddress) {
      toast.error('Please select a delivery address');
      return;
    }

    if (!cart || cart.items.length === 0) {
      toast.error('Your cart is empty');
      return;
    }

    setProcessing(true);

    try {
      const orderData: any = {
        address_id: selectedAddress,
        notes,
      };

      if (appliedDiscount) {
        orderData.discount_code = appliedDiscount.code;
      }

      const { data } = await axios.post('/orders', orderData);

      toast.success('Order placed successfully!');
      router.push(`/orders/${data.id}`);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to place order');
    } finally {
      setProcessing(false);
    }
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-xl">Loading checkout...</div>
        </div>
      </>
    );
  }

  if (!cart || cart.items.length === 0) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen bg-gray-50">
          <div className="container mx-auto px-4 py-8">
            <div className="bg-white rounded-lg shadow-md p-12 text-center">
              <h2 className="text-2xl font-semibold mb-4 text-neutral-700">
                Your cart is empty
              </h2>
              <Link
                href="/products"
                className="inline-block bg-green-600 text-white px-8 py-3 rounded-lg hover:bg-green-700 transition"
              >
                Browse Products
              </Link>
            </div>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-8">
          <h1 className="text-4xl font-bold mb-8 text-neutral-700">Checkout</h1>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Delivery Address */}
              <div className="bg-white rounded-lg shadow-md p-6">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-bold text-neutral-700">
                    Delivery Address
                  </h2>
                  <Link
                    href="/profile/addresses"
                    className="text-green-600 hover:underline text-sm"
                  >
                    + Add New Address
                  </Link>
                </div>

                {addresses.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-gray-600 mb-4">No addresses found</p>
                    <Link
                      href="/profile/addresses"
                      className="inline-block bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition"
                    >
                      Add Address
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {addresses.map((address) => (
                      <label
                        key={address.id}
                        className={`block p-4 border-2 rounded-lg cursor-pointer transition ${
                          selectedAddress === address.id
                            ? 'border-green-500 bg-green-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <input
                          type="radio"
                          name="address"
                          value={address.id}
                          checked={selectedAddress === address.id}
                          onChange={(e) => setSelectedAddress(e.target.value)}
                          className="mr-3"
                        />
                        <div className="inline-block">
                          <p className="font-semibold">
                            {address.label}{' '}
                            {address.is_default && (
                              <span className="text-xs bg-green-500 text-white px-2 py-1 rounded ml-2">
                                Default
                              </span>
                            )}
                          </p>
                          <p className="text-sm font-medium mt-1">
                            {address.recipient_name} - {address.phone}
                          </p>
                          <p className="text-sm text-gray-600 mt-1">
                            {address.address}, {address.city}, {address.province}{' '}
                            {address.postal_code}
                          </p>
                        </div>
                      </label>
                    ))}
                  </div>
                )}
              </div>

              {/* Order Items */}
              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-xl font-bold mb-4 text-neutral-700">
                  Order Items
                </h2>
                <div className="space-y-4">
                  {cart.items.map((item) => (
                    <div key={item.id} className="flex items-center gap-4">
                      <div className="w-20 h-20 bg-gray-200 rounded-lg flex items-center justify-center flex-shrink-0 overflow-hidden">
                        {item.product.image_url ? (
                          <img
                            src={item.product.image_url}
                            alt={item.product.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <span className="text-3xl">📦</span>
                        )}
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold">{item.product.name}</h3>
                        <p className="text-gray-600">Qty: {item.quantity}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold">
                          Rp{' '}
                          {(
                            Number(item.product.price) * item.quantity
                          ).toLocaleString('id-ID')}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Notes */}
              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-xl font-bold mb-4 text-neutral-700">
                  Order Notes (Optional)
                </h2>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:outline-none"
                  rows={3}
                  placeholder="Any special instructions for your order..."
                />
              </div>
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg shadow-md p-6 sticky top-8">
                <h2 className="text-xl font-bold mb-4 text-neutral-700">
                  Order Summary
                </h2>

                <div className="space-y-3 mb-6">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Items ({cart.items.length})</span>
                    <span className="font-semibold">
                      Rp {calculateTotal().toLocaleString('id-ID')}
                    </span>
                  </div>
                  
                  {/* Discount Input */}
                  {!appliedDiscount ? (
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={discountCode}
                        onChange={(e) => setDiscountCode(e.target.value.toUpperCase())}
                        placeholder="Discount code"
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm"
                      />
                      <button
                        type="button"
                        onClick={applyDiscount}
                        disabled={discountLoading || !discountCode.trim()}
                        className="px-4 py-2 bg-gray-800 text-white rounded-lg text-sm font-medium hover:bg-gray-700 disabled:bg-gray-400 transition"
                      >
                        {discountLoading ? '...' : 'Apply'}
                      </button>
                    </div>
                  ) : (
                    <div className="flex justify-between items-center bg-green-50 p-2 rounded">
                      <div>
                        <span className="text-sm text-green-700 font-medium">
                          {appliedDiscount.code}
                        </span>
                        <span className="text-sm text-green-600 ml-2">
                          -Rp {appliedDiscount.amount.toLocaleString('id-ID')}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={removeDiscount}
                        className="text-red-500 text-sm hover:underline"
                      >
                        Remove
                      </button>
                    </div>
                  )}
                  
                  <div className="flex justify-between">
                    <span className="text-gray-600">Shipping</span>
                    <span className="font-semibold text-green-600">FREE</span>
                  </div>
                  
                  {appliedDiscount && (
                    <div className="flex justify-between text-green-600">
                      <span>Discount</span>
                      <span className="font-semibold">
                        -Rp {appliedDiscount.amount.toLocaleString('id-ID')}
                      </span>
                    </div>
                  )}
                  
                  <div className="border-t pt-3">
                    <div className="flex justify-between text-lg font-bold">
                      <span>Total</span>
                      <span className="text-green-600">
                        Rp {calculateFinalTotal().toLocaleString('id-ID')}
                      </span>
                    </div>
                  </div>
                </div>

                <button
                  onClick={handlePlaceOrder}
                  disabled={processing || !selectedAddress}
                  className="w-full bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition"
                >
                  {processing ? 'Processing...' : 'Place Order'}
                </button>

                <p className="text-xs text-gray-500 mt-4 text-center">
                  By placing an order, you agree to our terms and conditions
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}