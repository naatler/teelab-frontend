"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import axios from "@/app/lib/axios";
import Navbar from "@/app/components/Navbar";
import Footer from "@/app/components/Footer";
import { useAuthStore } from "@/app/store/useAuthStore";
import toast from "react-hot-toast";
import Link from "next/link";
import {
  MapPin,
  Package,
  ChevronLeft,
  Loader2,
  Check,
  X,
  Truck,
  Shield,
  Tag,
} from "lucide-react";

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
  const [selectedAddress, setSelectedAddress] = useState<string>("");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [discountCode, setDiscountCode] = useState("");
  const [appliedDiscount, setAppliedDiscount] = useState<{
    code: string;
    amount: number;
  } | null>(null);
  const [discountLoading, setDiscountLoading] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    if (!user) {
      router.push("/login");
      return;
    }
    fetchData();
  }, [user, mounted]);

  const fetchData = async () => {
    try {
      const [cartRes, addressRes] = await Promise.all([
        axios.get("/cart"),
        axios.get("/addresses"),
      ]);
      setCart(cartRes.data);
      setAddresses(addressRes.data);
      const defaultAddress = addressRes.data.find(
        (addr: Address) => addr.is_default,
      );
      if (defaultAddress) {
        setSelectedAddress(defaultAddress.id);
      }
    } catch (error) {
      toast.error("Failed to load checkout data");
    } finally {
      setLoading(false);
    }
  };

  const calculateTotal = () => {
    if (!cart) return 0;
    return cart.items.reduce(
      (sum, item) => sum + Number(item.product.price) * item.quantity,
      0,
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
      toast.error("Please enter a discount code");
      return;
    }
    setDiscountLoading(true);
    try {
      const { data } = await axios.post("/discounts/apply", {
        code: discountCode,
        order_amount: calculateTotal(),
      });
      if (data.success) {
        setAppliedDiscount({
          code: data.discount.code,
          amount: data.discount_amount,
        });
        toast.success(
          `Discount applied: Rp ${data.discount_amount.toLocaleString("id-ID")} off`,
        );
      }
    } catch (error: any) {
      const message = error.response?.data?.message || "Invalid discount code";
      toast.error(message);
      setAppliedDiscount(null);
    } finally {
      setDiscountLoading(false);
    }
  };

  const removeDiscount = () => {
    setAppliedDiscount(null);
    setDiscountCode("");
  };

  const handlePlaceOrder = async () => {
    if (!selectedAddress) {
      toast.error("Please select a delivery address");
      return;
    }

    if (!cart || cart.items.length === 0) {
      toast.error("Your cart is empty");
      return;
    }

    setProcessing(true);

    try {
      // 🧾 1. CREATE ORDER
      const orderPayload: any = {
        address_id: selectedAddress,
        notes,
      };

      if (appliedDiscount) {
        orderPayload.discount_code = appliedDiscount.code;
      }

      const { data: order } = await axios.post("/orders", orderPayload);

      toast.success("Order created! Redirecting to payment...");

      // 💳 2. CREATE INVOICE KE XENDIT
      const { data: payment } = await axios.post(
        `/payments/${order.id}/invoice`,
      );

      if (!payment.invoice_url) {
        throw new Error("Invoice URL not found");
      }

      // 🚀 3. REDIRECT KE XENDIT
      window.location.href = payment.invoice_url;
    } catch (error: any) {
      console.error(error);
      toast.error(error.response?.data?.message || "Checkout failed");
    } finally {
      setProcessing(false);
    }
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="flex items-center gap-3">
            <Loader2 className="w-6 h-6 animate-spin text-lime-600" />
            <span className="text-gray-600">Loading checkout...</span>
          </div>
        </div>
      </>
    );
  }

  if (!cart || cart.items.length === 0) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen bg-gray-50">
          <div className="container mx-auto px-4 py-12">
            <div className="max-w-md mx-auto bg-white rounded-2xl shadow-lg p-10 text-center">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Package className="w-8 h-8 text-gray-400" />
              </div>
              <h2 className="text-2xl font-bold text-gray-800 mb-2">
                Your cart is empty
              </h2>
              <p className="text-gray-500 mb-6">
                Add some products to get started
              </p>
              <Link
                href="/products"
                className="inline-block bg-lime-600 text-white px-8 py-3 rounded-lg font-medium hover:bg-lime-700 transition-colors"
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
        <div className="container mx-auto px-4 py-8 max-w-6xl">
          <div className="flex items-center gap-3 mb-8">
            <Link
              href="/cart"
              className="p-2 rounded-lg hover:bg-gray-200 transition-colors"
            >
              <ChevronLeft className="w-5 h-5 text-gray-600" />
            </Link>
            <h1 className="text-2xl font-bold text-gray-900">Checkout</h1>
          </div>

          <div className="grid lg:grid-cols-12 gap-6">
            <div className="lg:col-span-8 space-y-5">
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-center gap-2 mb-5">
                  <div className="p-2 bg-lime-100 rounded-lg">
                    <MapPin className="w-5 h-5 text-lime-600" />
                  </div>
                  <h2 className="text-lg font-semibold text-gray-900">
                    Delivery Address
                  </h2>
                </div>
                {addresses.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-gray-500 mb-4">No addresses found</p>
                    <Link
                      href="/profile/addresses"
                      className="inline-block bg-lime-600 text-white px-6 py-2.5 rounded-lg font-medium hover:bg-lime-700 transition-colors"
                    >
                      Add Address
                    </Link>
                  </div>
                ) : (
                  <div className="grid gap-3">
                    {addresses.map((address) => (
                      <button
                        key={address.id}
                        onClick={() => setSelectedAddress(address.id)}
                        className={`p-4 rounded-xl border-2 text-left transition-all ${
                          selectedAddress === address.id
                            ? "border-lime-500 bg-lime-50/50"
                            : "border-gray-200 hover:border-gray-300"
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <div
                            className={`w-5 h-5 rounded-full border-2 flex items-center justify-center mt-0.5 ${
                              selectedAddress === address.id
                                ? "border-lime-500 bg-lime-500"
                                : "border-gray-300"
                            }`}
                          >
                            {selectedAddress === address.id && (
                              <Check className="w-3 h-3 text-white" />
                            )}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <span className="font-semibold text-gray-900">
                                {address.label}
                              </span>
                              {address.is_default && (
                                <span className="text-xs bg-lime-100 text-lime-700 px-2 py-0.5 rounded-full font-medium">
                                  Default
                                </span>
                              )}
                            </div>
                            <p className="text-sm text-gray-600 mt-0.5">
                              {address.recipient_name} - {address.phone}
                            </p>
                            <p className="text-sm text-gray-500 mt-1">
                              {address.address}, {address.city}{" "}
                              {address.postal_code}
                            </p>
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-center gap-2 mb-5">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <Package className="w-5 h-5 text-blue-600" />
                  </div>
                  <h2 className="text-lg font-semibold text-gray-900">
                    Order Items
                  </h2>
                </div>
                <div className="space-y-3">
                  {cart.items.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center gap-4 p-3 bg-gray-50 rounded-xl"
                    >
                      <div className="w-14 h-14 bg-white rounded-lg flex items-center justify-center flex-shrink-0 overflow-hidden border border-gray-200">
                        {item.product.image_url ? (
                          <img
                            src={item.product.image_url}
                            alt={item.product.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <Package className="w-6 h-6 text-gray-400" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium text-gray-900 truncate">
                          {item.product.name}
                        </h3>
                        <p className="text-sm text-gray-500">
                          Qty: {item.quantity}
                        </p>
                      </div>
                      <p className="font-semibold text-gray-900 whitespace-nowrap">
                        Rp{" "}
                        {Number(
                          item.product.price * item.quantity,
                        ).toLocaleString("id-ID")}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                <h2 className="font-semibold text-gray-900 mb-4">
                  Order Notes
                </h2>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-lime-500 focus:border-lime-500 outline-none transition resize-none"
                  rows={3}
                  placeholder="Add notes for your order..."
                />
              </div>
            </div>

            <div className="lg:col-span-4">
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 sticky top-8">
                <h2 className="text-xl font-bold text-gray-900 mb-5">
                  Order Summary
                </h2>

                <div className="space-y-3 mb-5">
                  <div className="flex justify-between text-gray-600">
                    <span>Subtotal ({cart.items.length} items)</span>
                    <span className="font-medium">
                      Rp {calculateTotal().toLocaleString("id-ID")}
                    </span>
                  </div>

                  {!appliedDiscount ? (
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={discountCode}
                        onChange={(e) =>
                          setDiscountCode(e.target.value.toUpperCase())
                        }
                        placeholder="Discount code"
                        className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm text-neutral-700 focus:ring-2 focus:ring-lime-500 focus:border-lime-500 outline-none"
                      />
                      <button
                        type="button"
                        onClick={applyDiscount}
                        disabled={discountLoading || !discountCode.trim()}
                        className="px-4 py-2 bg-gray-900 text-white rounded-lg text-sm font-medium hover:bg-gray-800 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                      >
                        {discountLoading ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          "Apply"
                        )}
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between bg-lime-50 p-3 rounded-lg">
                      <div className="flex items-center gap-2">
                        <Tag className="w-4 h-4 text-lime-600" />
                        <span className="text-sm font-medium text-lime-700">
                          {appliedDiscount.code}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={removeDiscount}
                        className="text-lime-600 hover:text-lime-700"
                      >
                        <X className="w-4 h-4" />
                      </button>
                      <span className="text-sm text-lime-600">
                        -Rp {appliedDiscount.amount.toLocaleString("id-ID")}
                      </span>
                    </div>
                  )}

                  <div className="flex justify-between text-gray-600">
                    <span className="flex items-center gap-1">
                      <Truck className="w-4 h-4" />
                      Shipping
                    </span>
                    <span className="font-medium text-lime-600">Free</span>
                  </div>
                </div>

                <div className="border-t border-gray-200 pt-4 mb-5">
                  <div className="flex justify-between text-xl font-bold">
                    <span className="text-gray-900">Total</span>
                    <span className="text-lime-600">
                      Rp {calculateFinalTotal().toLocaleString("id-ID")}
                    </span>
                  </div>
                </div>

                <button
                  onClick={handlePlaceOrder}
                  disabled={processing || !selectedAddress}
                  className="w-full bg-lime-600 text-white py-4 rounded-xl font-semibold hover:bg-lime-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
                >
                  {processing ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    "Place Order"
                  )}
                </button>

                <Link
                  href="/products"
                  className="block w-full mt-3 bg-gray-100 text-gray-700 text-center py-3 rounded-xl font-medium hover:bg-gray-200 transition-colors"
                >
                  Continue Shopping
                </Link>

                <div className="flex items-center justify-center gap-1 mt-4 text-xs text-gray-500">
                  <Shield className="w-3 h-3" />
                  <span>Secured by Xendit</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}
