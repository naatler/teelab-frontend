"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Navbar from "@/app/components/Navbar";
import { ShoppingBag } from "lucide-react";
import axios from "@/app/lib/axios";

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
  category: Category;
}

export default function Home() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState("");
  const [subscribing, setSubscribing] = useState(false);
  const [subscribeMessage, setSubscribeMessage] = useState("");
  const [subscribeSuccess, setSubscribeSuccess] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

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
      // Here you can integrate with your newsletter API
      // For now, just simulate a successful subscription
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
          <div className="flex items-center gap-10 py-20">
            <img src="/images/ourimage1.png" alt="" className="h-90" />
            <img src="/images/ourimage.png" alt="" className="h-90" />
          </div>
        </div>
      </section>

      <section id="nearby" className="bg-white min-h-[800px] py-20">
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
          <div className="flex items-center gap-10 py-20 justify-center">
            <img src="/images/nearby1.png" alt="" className="w-[460px]" />
            <img src="/images/nearby.png" alt="" className="w-[547px]" />
            <img src="/images/nearby2.png" alt="" className="w-[480px]" />
          </div>
        </div>
      </section>

      <section id="category" className="bg-white min-h-screen py-10">
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
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                {products.map((product) => (
                  <Link
                    key={product.id}
                    href={`/products/${product.id}`}
                    className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition group"
                  >
                    <div className="relative h-70 bg-neutral-200 overflow-hidden">
                      {product.image_url ? (
                        <img
                          src={product.image_url}
                          alt={product.name}
                          className="w-full h-full object-cover group-hover:scale-110 transition duration-300"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-neutral-400 text-4xl">
                          📦
                        </div>
                      )}
                    </div>
                    <div className="p-4">
                      <p className="text-xs text-neutral-500 mb-1">
                        {product.category?.name}
                      </p>
                      <h4 className="font-semibold text-neutral-800 mb-2 truncate">
                        {product.name}
                      </h4>
                      <p className="text-lime-600 font-bold">
                        Rp {Number(product.price).toLocaleString("id-ID")}
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 text-neutral-500">
                No products available
              </div>
            )}
          </div>
        </div>
      </section>
      <section id="course" className="bg-white min-h-[600px]">
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
              {subscribeMessage && (
                <p className={`mt-4 text-sm ${subscribeSuccess ? 'text-lime-400' : 'text-red-400'}`}>
                  {subscribeMessage}
                </p>
              )}
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
