"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Navbar from "@/app/components/Navbar";
import { ShoppingBag } from "lucide-react";
import axios from "@/app/lib/axios";
import Footer from "@/app/components/Footer";
import PageTransition, { StaggerContainer, StaggerItem, FadeIn } from "@/app/components/PageTransition";
import { useCartStore } from "@/app/store/useCartStore";
import toast from "react-hot-toast";

interface Category {
  id: string;
  name: string;
  slug: string;
}

interface Product {
  id: string;
  name: string;
  price: number;
  image_url: string | null;
  stock: number;
  category: Category;
}

export default function Home() {
  const { items: cartItems, addItem: addToCartStore, setItems: setCartItems, totalItems } = useCartStore();
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState("");
  const [subscribing, setSubscribing] = useState(false);
  const [subscribeMessage, setSubscribeMessage] = useState("");
  const [subscribeSuccess, setSubscribeSuccess] = useState(false);

  useEffect(() => {
    fetchData();
    fetchCart();
  }, []);

  const fetchCart = async () => {
    try {
      const { data } = await axios.get('/cart');
      setCartItems(data.items || []);
    } catch (error) {
      console.error('Failed to fetch cart');
    }
  };

  const handleAddToCart = async (productId: string) => {
    try {
      const { data } = await axios.post('/cart/items', {
        product_id: productId,
        quantity: 1,
      });
      toast.success('Added to cart!');
      fetchCart();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to add to cart');
    }
  };

  const fetchData = async () => {
    try {
      const [categoriesRes, productsRes] = await Promise.all([
        axios.get("/categories"),
        axios.get("/products"),
      ]);
      setCategories(categoriesRes.data);
      setProducts(productsRes.data.slice(0, 8));
    } catch (error) {
      console.error("Failed to fetch data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubscribing(true);
    setSubscribeMessage("");
    
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
       setSubscribeSuccess(true);
      setSubscribeMessage("Thank you for subscribing!");
      setEmail("");
    } catch (error) {
      setSubscribeSuccess(false);
      setSubscribeMessage("Something went wrong. Please try again.");
    } finally {
      setSubscribing(false);
    }
  };

  return (
    <div className="overflow-x-hidden">
      <main className="relative py-20">
        <div
          className="absolute inset-0 bg-contain md:bg-cover bg-no-repeat bg-center"
          style={{ backgroundImage: "url('/images/home-page/hero.png')" }}
        >
          <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-transparent"></div>
          <div className="relative z-20">
            <Navbar />
          </div>
        </div>

        <div className="relative z-10 container mx-auto px-4 py-24 min-h-[90vh] flex items-end">
          <div className="w-full md:w-2/3 text-white">
            <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6">
              <h1 className="text-3xl sm:text-5xl md:text-7xl lg:text-8xl font-medium leading-tight tracking-tight max-w-3xl">
                Performance Meets Everyday Style.
              </h1>

              <Link
                href="/products"
                className="flex items-center gap-4 px-8 py-3 rounded-full 
                bg-white/20 backdrop-blur-lg border border-white/30 
                text-white text-sm sm:text-base font-medium 
                hover:bg-white/30 hover:scale-105 transition-all duration-300 
                self-start md:self-end whitespace-nowrap -translate-x-120 -translate-y-5 "
              >
                <span className="opacity-90">Go Product</span>

                <div className="bg-white/20 p-2 rounded-full">
                  <ShoppingBag size={18} />
                </div>
              </Link>
            </div>
          </div>
        </div>
      </main>

      <section id="our-story" className="bg-white min-h-screen py-20">
        <PageTransition>
        <div className="container mx-auto px-4">
          <p className="text-center text-neutral-500 border-2 border-neutral-500 rounded-full py-2 max-w-[130px] mx-auto">
            Our Story
          </p>
          <div className="relative py-12 flex justify-center">
            <h2 className="text-center text-4xl sm:text-5xl md:text-6xl text-neutral-700 max-w-4xl leading-tight mx-auto">
              TeeLab was created for a new generation of golfers{" "}
              <img
                src="/images/golfers.png"
                alt="Golfers"
                className="inline-block ml-4 w-[90px] sm:w-[110px] md:w-[130px] object-contain align-middle"
              />{" "}
              <span className="text-neutral-400 px-2">
                who see the game as more than just a sport it's a lifestyle
                !.{" "}
              </span>
            </h2>
          </div>
          <FadeIn delay={0.2}>
          <div className="flex items-center gap-10 py-20">
            <img src="/images/ourimage1.png" alt="" className="h-90" />
            <img src="/images/ourimage.png" alt="" className="h-90" />
          </div>
          </FadeIn>
        </div>
        </PageTransition>
      </section>

      <section id="nearby" className="bg-white min-h-[800px] py-20">
        <PageTransition>
        <div className="container mx-auto px-4">
          <p className="text-center text-neutral-500 border-2 border-neutral-500 rounded-full py-2 max-w-[130px]">
            Nearby
          </p>
          <h1 className="text-neutral-700 text-right text-3xl max-w-2xl ml-auto">
            Because golf isn't just about the{" "}
            <span className="text-neutral-400">
              swing. It's about how you carry yourself, wherever you go.
            </span>
          </h1>
          <FadeIn delay={0.2}>
          <div className="flex items-center gap-10 py-20 justify-center">
            <img src="/images/nearby1.png" alt="" className="w-[460px]" />
            <img src="/images/nearby.png" alt="" className="w-[547px]" />
            <img src="/images/nearby2.png" alt="" className="w-[480px]" />
          </div>
          </FadeIn>
        </div>
        </PageTransition>
      </section>

      <section id="category" className="bg-white min-h-screen py-10">
        <PageTransition>
        <div className="container mx-auto px-4">
          <p className="text-center text-neutral-500 border-2 border-neutral-500 rounded-full py-2 max-w-[130px] mb-8">
            Category
          </p>
          <h2 className="text-5xl font-medium text-neutral-700 mb-2">
            Top-Quality Golf Equipment for
          </h2>
          <h3 className="text-5xl font-medium text-neutral-400 mb-8">
            Every Game!
          </h3>

          {!loading && categories.length > 0 && (
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-12">
                {categories.map((category) => (
                    <Link
                      href={`/products?category=${category.id}`}
                      className="bg-white hover:bg-neutral-100 p-1 rounded-full text-center transition border-2 border-neutral-300"
                    >
                      <h4 className="text-lg text-neutral-500">{category.name}</h4>
                    </Link>
                ))}
              </div>
          )}

          <div className="mb-8">
            <h3 className="text-2xl font-medium text-neutral-700 mb-6">
              Featured Products
            </h3>
            {loading ? (
              <div className="text-center py-12 text-neutral-500">
                Loading products...
              </div>
            ) : products.length > 0 ? (
              <StaggerContainer>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
                  {products.map((product) => (
                    <StaggerItem key={product.id}>
                      <div className="bg-white rounded-2xl overflow-hidden border border-neutral-100 hover:border-lime-200 hover:shadow-lg hover:shadow-lime-100/50 transition-all duration-300 group">
                        <Link href={`/products/${product.id}`}>
                          <div className="relative aspect-square bg-neutral-100 overflow-hidden">
                            {product.image_url ? (
                              <img
                                src={product.image_url}
                                alt={product.name}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center">
                                <div className="w-16 h-16 bg-neutral-200 rounded-full flex items-center justify-center">
                                  <span className="text-3xl">🏌️</span>
                                </div>
                              </div>
                            )}
                            {product.stock === 0 && (
                              <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                                <span className="bg-red-500 text-white px-3 py-1 rounded-full text-xs font-medium">
                                  Out of Stock
                                </span>
                              </div>
                            )}
                          </div>
                        </Link>
                        <div className="p-4">
                          <p className="text-xs font-medium text-neutral-400 uppercase tracking-wide mb-1">
                            {product.category?.name}
                          </p>
                          <Link href={`/products/${product.id}`}>
                            <h4 className="font-semibold text-neutral-800 mb-2 line-clamp-2 hover:text-lime-600 transition-colors min-h-[2.5rem]">
                              {product.name}
                            </h4>
                          </Link>
                          <p className="text-lg font-bold text-lime-600 mb-3">
                            Rp {Number(product.price).toLocaleString("id-ID")}
                          </p>
                          <button
                            onClick={() => handleAddToCart(product.id)}
                            disabled={product.stock === 0}
                            className="w-full bg-neutral-900 text-white py-2 rounded-xl font-medium hover:bg-lime-600 disabled:bg-neutral-300 disabled:text-neutral-500 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center gap-2 text-sm"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.5.363 1.77l9.597 9.597c.34.34.9.36 1.307.09L17 14" />
                            </svg>
                            {product.stock === 0 ? 'Sold Out' : 'Add to Cart'}
                          </button>
                        </div>
                      </div>
                    </StaggerItem>
                  ))}
                </div>
              </StaggerContainer>
            ) : (
              <div className="text-center py-12 text-neutral-500">
                No products available
              </div>
            )}
          </div>
        </div>
        </PageTransition>
      </section>
      <section id="course" className="bg-white min-h-[600px]">
        <PageTransition>
        <div className="container mx-auto px-4">
          <div className="bg-neutral-800 min-h-[400px] rounded-2xl p-6">
            <div className="flex items-start gap-8">
              <img
                src="/images/course.png"
                alt=""
                className="h-80 object-contain"
              />
              <div className="flex flex-col gap-4 ">
                <p className="text-neutral-100 border border-neutral-600 rounded-full px-4 py-2 w-fit">
                  Course
                </p>

                <h1 className="text-5xl font-medium text-neutral-100 max-w-3xl mt-20">
               Get Golf Tips & Exclusive Deals - Join Course Now!
                </h1>
                 <FadeIn delay={0.2}>
                 <form onSubmit={handleSubscribe} className="flex flex-col sm:flex-row gap-3 mt-4">
                  <input
                    type="email"
                    placeholder="Enter your email"
                    required
                    className="flex-1 px-4 py-3 rounded-full bg-neutral-800 border-2 border-neutral-700 text-white placeholder-neutral-500 focus:outline-none focus:border-lime-500 transition"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                  <button
                    type="submit"
                    disabled={subscribing}
                    className="px-8 py-3 bg-lime-600 text-white font-semibold rounded-full hover:bg-lime-700 disabled:opacity-50 transition"
                  >
                    {subscribing ? 'Subscribing...' : 'Subscribe'}
                  </button>
                </form>
                </FadeIn>
                {subscribeMessage && (
                  <p className={`mt-4 text-sm ${subscribeSuccess ? 'text-lime-400' : 'text-red-400'}`}>
                    {subscribeMessage}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
        </PageTransition>
      </section>

      <Footer />
    </div>
  );
}
