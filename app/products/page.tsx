"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import axios from "@/app/lib/axios";
import Navbar from "@/app/components/Navbar";
import toast from "react-hot-toast";
import { useAuthStore } from "@/app/store/useAuthStore";
import { useCartStore } from "@/app/store/useCartStore";
import { useRouter } from "next/navigation";
import Cookies from "js-cookie";
import PageTransition, { StaggerContainer, StaggerItem, HoverCard, FadeIn } from "@/app/components/PageTransition";

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
  const { items: cartItems, addItem: addToCartStore, setItems: setCartItems } = useCartStore();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");

  useEffect(() => {
    fetchCategories();
    fetchProducts();
    fetchCart();
  }, [search, selectedCategory]);

  const fetchCart = async () => {
    try {
      const { data } = await axios.get('/cart');
      setCartItems(data.items || []);
    } catch (error) {
      console.error('Failed to fetch cart');
    }
  };

  const fetchCategories = async () => {
    try {
      const { data } = await axios.get("/categories");
      setCategories(data);
    } catch (error) {
      console.error("Failed to fetch categories");
    }
  };

  const fetchProducts = async () => {
    try {
      const params: any = {};
      if (search) params.search = search;
      if (selectedCategory) params.category_id = selectedCategory;

      const { data } = await axios.get("/products", { params });
      setProducts(data);
    } catch (error) {
      toast.error("Failed to fetch products");
    } finally {
      setLoading(false);
    }
  };

  const addToCart = async (productId: string) => {
    const token = Cookies.get("token");
    if (!token) {
      toast.error("Please login first");
      router.push("/login");
      return;
    }

    try {
      const { data } = await axios.post("/cart/items", {
        product_id: productId,
        quantity: 1,
      });
      toast.success("Added to cart!");
      
      // Update local cart store - check if product exists, update qty or add new
      const existingItem = cartItems.find(item => item.product_id === productId);
      if (existingItem) {
        addToCartStore({ ...existingItem, quantity: existingItem.quantity + 1 });
      } else {
        // Fetch the updated cart to get the new item
        fetchCart();
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to add to cart");
    }
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen bg-neutral-50 flex items-center justify-center">
          <div className="text-xl text-neutral-700">Loading products...</div>
        </div>
      </>
    );
  }

  return (
    <>
      <main className="relative py-20">
        <div
          className="absolute inset-0 bg-contain md:bg-cover bg-no-repeat bg-center "
          style={{ backgroundImage: "url('/images/shopping-page/hero.png')" }}
        >
          <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-transparent "></div>
          <div className="relative z-20">
            <Navbar />
          </div>
        </div>

        <div className="relative z-10 container mx-auto px-4 py-24 min-h-[90vh] flex items-end">
          <div className="w-full md:w-2/3 text-white">
            <div className="flex flex-col items-start justify-between gap-6">
              <h1 className="text-3xl sm:text-7xl md:text-8xl lg:text-8xl font-medium leading-tight tracking-tight max-w-xl">
                Shop the Essentials
              </h1>

              <p className="text-xl md:text-4xl text-white max-w-lg">
                Modern golf gear design for performance and everyday style.
              </p>
            </div>
          </div>
        </div>
      </main>

      <div className="min-h-screen bg-neutral-50 py-5">
        <PageTransition>
        <div className="container mx-auto px-4 py-1">
          
          <FadeIn>
          <div className="mb-8 space-y-4">
            <input
              type="text"
              placeholder="Search products..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full px-4 py-3 border border-neutral-300 rounded-full text-neutral-700 focus:ring-2 focus:ring-lime-500 focus:outline-none"
            />

            <div className="flex gap-3 overflow-x-auto pb-2">
              <button
                onClick={() => setSelectedCategory("")}
                className={`px-6 py-2 rounded-full whitespace-nowrap font-medium transition ${
                  selectedCategory === ""
                    ? "bg-lime-500 text-white"
                    : "bg-neutral-200 text-neutral-700 hover:bg-neutral-300"
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
                      ? "bg-lime-500 text-white"
                      : "bg-neutral-200 text-neutral-700 hover:bg-neutral-300"
                  }`}
                >
                  {category.name}
                </button>
              ))}
            </div>
          </div>
          </FadeIn>

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
                            <div className="w-20 h-20 bg-neutral-200 rounded-full flex items-center justify-center">
                              <span className="text-4xl">🏌️</span>
                            </div>
                          </div>
                        )}
                        {product.stock === 0 && (
                          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                            <span className="bg-red-500 text-white px-4 py-1.5 rounded-full text-sm font-medium">
                              Out of Stock
                            </span>
                          </div>
                        )}
                      </div>
                    </Link>

                    <div className="p-4">
                      <p className="text-xs font-medium text-neutral-400 uppercase tracking-wide mb-1">
                        {product.category.name}
                      </p>
                      <Link href={`/products/${product.id}`}>
                        <h3 className="font-semibold text-neutral-800 mb-2 line-clamp-2 hover:text-lime-600 transition-colors min-h-[2.5rem]">
                          {product.name}
                        </h3>
                      </Link>
                      
                      <div className="flex items-baseline justify-between mb-3">
                        <p className="text-lg font-bold text-lime-600">
                          Rp {Number(product.price).toLocaleString("id-ID")}
                        </p>
                        <p className={`text-xs font-medium ${product.stock > 5 ? 'text-lime-600' : product.stock > 0 ? 'text-yellow-600' : 'text-red-500'}`}>
                          {product.stock > 0 ? `${product.stock} available` : 'Unavailable'}
                        </p>
                      </div>

                      <button
                        onClick={() => addToCart(product.id)}
                        disabled={product.stock === 0}
                        className="w-full bg-neutral-900 text-white py-2.5 rounded-xl font-medium hover:bg-lime-600 disabled:bg-neutral-300 disabled:text-neutral-500 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center gap-2"
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

          {products.length === 0 && (
            <div className="text-center py-12">
              <p className="text-neutral-500 text-xl">No products found</p>
            </div>
          )}
        </div>
        </PageTransition>
      </div>
    </>
  );
}
