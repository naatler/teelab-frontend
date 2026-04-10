"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Navbar from "@/app/components/Navbar";
import { ShoppingBag, Star, Quote } from "lucide-react";
import axios from "@/app/lib/axios";
import Footer from "@/app/components/Footer";
import PageTransition, { StaggerContainer, StaggerItem, FadeIn } from "@/app/components/PageTransition";
import { useAuthStore } from "@/app/store/useAuthStore";
import { useCartStore } from "@/app/store/useCartStore";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import Cookies from "js-cookie";

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

interface Review {
  id: string;
  rating: number;
  comment: string;
  created_at: string;
  user: {
    name: string;
  };
  product?: {
    name: string;
    image_url: string | null;
  };
}

export default function Home() {
  const router = useRouter();
  const { user } = useAuthStore();
  const { items: cartItems, addItem: addToCartStore, setItems: setCartItems, totalItems } = useCartStore();
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState("");
  const [subscribing, setSubscribing] = useState(false);
  const [subscribeMessage, setSubscribeMessage] = useState("");
  const [subscribeSuccess, setSubscribeSuccess] = useState(false);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [reviewsLoading, setReviewsLoading] = useState(true);

  useEffect(() => {
    fetchData();
    fetchFeaturedReviews();
  }, []);

  useEffect(() => {
    fetchCart();
  }, [user]);

  const fetchCart = async () => {
    try {
      const { data } = await axios.get('/cart');
      setCartItems(data.items || []);
    } catch (error) {
      console.error('Failed to fetch cart');
    }
  };

  const handleAddToCart = async (productId: string) => {
    if (!user) {
      toast.error("Please login first");
      router.push("/login");
      return;
    }

    try {
      console.log('Adding to cart, user:', user, 'token:', Cookies.get('token'));
      const { data } = await axios.post('/cart/items', {
        product_id: productId,
        quantity: 1,
      });
      toast.success('Added to cart!');
      fetchCart();
    } catch (error: any) {
      console.error('Add to cart error:', error);
      const status = error.response?.status;
      if (status === 401 || status === 403) {
        toast.error("Session expired. Please login again");
        router.push("/login");
      } else {
        toast.error(error.response?.data?.message || 'Failed to add to cart');
      }
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

  const fetchFeaturedReviews = async () => {
    try {
      const { data } = await axios.get('/reviews/featured');
      setReviews(data);
    } catch (error) {
      console.error('Failed to fetch reviews:', error);
    } finally {
      setReviewsLoading(false);
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
                self-start md:self-end whitespace-nowrap"
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
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 py-20 items-center">
            <div className="flex flex-col md:flex-row items-center gap-4 md:gap-10 justify-center">
              <img src="/images/ourimage1.png" alt="" className="w-full md:w-auto max-h-[300px] md:max-h-[360px] object-contain" />
              <img src="/images/ourimage.png" alt="" className="w-full md:w-auto max-h-[300px] md:max-h-[360px] object-contain" />
            </div>
            <div className="space-y-8 px-4">
              <h3 className="text-3xl font-semibold text-neutral-700">
                Why Choose TeeLab?
              </h3>
              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-lime-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <svg className="w-6 h-6 text-lime-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                  </div>
                  <div>
                    <h4 className="font-semibold text-neutral-800 text-lg">Premium Quality</h4>
                    <p className="text-neutral-500">We curate only the finest golf equipment from trusted brands worldwide.</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-lime-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <svg className="w-6 h-6 text-lime-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                  </div>
                  <div>
                    <h4 className="font-semibold text-neutral-800 text-lg">Best Prices</h4>
                    <p className="text-neutral-500">Competitive pricing with exclusive deals for members.</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-lime-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <svg className="w-6 h-6 text-lime-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
                  </div>
                  <div>
                    <h4 className="font-semibold text-neutral-800 text-lg">Expert Support</h4>
                    <p className="text-neutral-500">Our golf specialists are here to help you choose the right gear.</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-lime-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <svg className="w-6 h-6 text-lime-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" /></svg>
                  </div>
                  <div>
                    <h4 className="font-semibold text-neutral-800 text-lg">Fast Shipping</h4>
                    <p className="text-neutral-500">Quick delivery nationwide with careful packaging.</p>
                  </div>
                </div>
              </div>
            </div>
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
          <div className="flex flex-col md:flex-row items-center gap-6 py-10 md:py-20 justify-center">
            <img src="/images/nearby1.png" alt="" className="w-full md:w-[300px] lg:w-[460px] object-contain" />
            <img src="/images/nearby.png" alt="" className="w-full md:w-[350px] lg:w-[547px] object-contain" />
            <img src="/images/nearby2.png" alt="" className="w-full md:w-[300px] lg:w-[480px] object-contain" />
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
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-medium text-neutral-700 mb-2">
            Top-Quality Golf Equipment for
          </h2>
          <h3 className="text-3xl sm:text-4xl md:text-5xl font-medium text-neutral-400 mb-8">
            Every Game!
          </h3>

          {!loading && categories.length > 0 && (
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-12">
                {categories.map((category) => (
                    <Link
                      key={category.id}
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
                          <div className="relative aspect-square bg-white overflow-hidden">
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
            <div className="flex flex-col lg:flex-row items-center gap-6">
              <img
                src="/images/course.png"
                alt=""
                className="w-full lg:w-auto h-64 lg:h-80 object-contain order-2 lg:order-1"
              />
              <div className="flex flex-col gap-4 w-full lg:w-auto order-1 lg:order-2">
                <p className="text-neutral-100 border border-neutral-600 rounded-full px-4 py-2 w-fit">
                  Course
                </p>

                <h1 className="text-3xl sm:text-4xl lg:text-5xl font-medium text-neutral-100 max-w-3xl mt-4 lg:mt-20">
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
       <section id="reviews" className="bg-neutral-50 py-20">
        <PageTransition>
        <div className="container mx-auto px-4">
          <FadeIn>
          <div className="text-center mb-12">
            <p className="text-lime-600 font-medium mb-2">Testimonials</p>
            <h2 className="text-3xl md:text-4xl font-bold text-neutral-800">What Our Customers Say</h2>
          </div>
          </FadeIn>

          {reviewsLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="bg-white p-6 rounded-2xl animate-pulse">
                  <div className="flex gap-1 mb-4">
                    {[...Array(5)].map((_, j) => <Star key={j} className="w-5 h-5 text-neutral-200" />)}
                  </div>
                  <div className="h-4 bg-neutral-200 rounded mb-2" />
                  <div className="h-4 bg-neutral-200 rounded w-2/3" />
                </div>
              ))}
            </div>
          ) : reviews.length > 0 ? (
            <StaggerContainer>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {reviews.slice(0, 6).map((review, index) => (
                <FadeIn key={review.id} delay={index * 0.1}>
                <div className="bg-white p-6 rounded-2xl shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex gap-1 mb-4">
                    {[...Array(5)].map((_, i) => (
                      <Star 
                        key={i} 
                        size={20} 
                        className={i < review.rating ? "text-yellow-400 fill-yellow-400" : "text-neutral-200"} 
                      />
                    ))}
                  </div>
                  <div className="relative mb-4">
                    <Quote className="absolute -top-1 -left-1 w-8 h-8 text-lime-100" />
                    <p className="text-neutral-600 line-clamp-4 pl-6">{review.comment}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-lime-100 rounded-full flex items-center justify-center">
                      <span className="text-lime-600 font-semibold">
                        {review.user?.name?.charAt(0).toUpperCase() || 'U'}
                      </span>
                    </div>
                    <div>
                      <p className="font-medium text-neutral-800">{review.user?.name || 'User'}</p>
                      {review.product && (
                        <p className="text-sm text-neutral-500">{review.product.name}</p>
                      )}
                    </div>
                  </div>
                </div>
                </FadeIn>
              ))}
            </div>
            </StaggerContainer>
          ) : (
            <div className="text-center py-12 text-neutral-500">
              No reviews yet. Be the first to review!
            </div>
          )}
          
          <div className="text-center mt-10">
            <Link href="/products" className="inline-flex items-center gap-2 text-lime-600 hover:text-lime-700 font-medium">
              View all products <ShoppingBag size={18} />
            </Link>
          </div>
        </div>
        </PageTransition>
      </section>

      <Footer />
    </div>
  );
}
