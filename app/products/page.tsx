"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import axios from "@/app/lib/axios";
import Navbar from "@/app/components/Navbar";
import Footer from "@/app/components/Footer";
import toast from "react-hot-toast";
import { useAuthStore } from "@/app/store/useAuthStore";
import { useCartStore } from "@/app/store/useCartStore";
import { useRouter } from "next/navigation";
import {
  Search,
  X,
  Package,
  ShoppingCart,
  Grid3X3,
  RotateCcw,
} from "lucide-react";
import PageTransition, {
  StaggerContainer,
  StaggerItem,
  FadeIn,
} from "@/app/components/PageTransition";

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
  const { user } = useAuthStore();
  const { setItems: setCartItems } = useCartStore();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  
  const searchInputRef = useRef<HTMLInputElement>(null);
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  const fetchProducts = async (searchVal: string, categoryVal: string) => {
    try {
      setLoading(true);
      const params: Record<string, string> = {};
      
      if (searchVal.trim()) params.search = searchVal.trim();
      if (categoryVal) params.category_id = categoryVal;

      const { data } = await axios.get("/products", { params });
      setProducts(data);
    } catch (error) {
      toast.error("Failed to fetch products");
    } finally {
      setLoading(false);
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

  const fetchCart = async () => {
    try {
      const { data } = await axios.get("/cart");
      setCartItems(data.items || []);
    } catch (error) {
      console.error("Failed to fetch cart");
    }
  };

  useEffect(() => {
    fetchCategories();
    fetchProducts("", "");
  }, []);

  // Single effect for filtering - debounced
  useEffect(() => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    debounceTimerRef.current = setTimeout(() => {
      fetchProducts(search, selectedCategory);
    }, 500);

    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, [search, selectedCategory]);

  useEffect(() => {
    if (user) {
      fetchCart();
    }
  }, [user]);

  const handleSearchChange = (value: string) => {
    setSearch(value);
  };

  const handleCategorySelect = (categoryId: string) => {
    setSelectedCategory(categoryId === selectedCategory ? "" : categoryId);
  };

  const clearFilters = () => {
    setSearch("");
    setSelectedCategory("");
    if (searchInputRef.current) {
      searchInputRef.current.value = "";
    }
    fetchProducts("", "");
  };

  const addToCart = async (productId: string) => {
    if (!user) {
      toast.error("Please login first");
      router.push("/login");
      return;
    }

    try {
      await axios.post("/cart/items", {
        product_id: productId,
        quantity: 1,
      });
      toast.success("Added to cart!");
      await fetchCart();
    } catch (error: any) {
      const status = error.response?.status;
      if (status === 401 || status === 403) {
        toast.error("Session expired. Please login again");
        router.push("/login");
      } else {
        toast.error(error.response?.data?.message || "Failed to add to cart");
      }
    }
  };

  const hasActiveFilters = search.trim() || selectedCategory;

  return (
    <>
      <main className="relative py-20">
        <div
          className="absolute inset-0 bg-contain md:bg-cover bg-no-repeat bg-center"
          style={{ backgroundImage: "url('/images/shopping-page/hero.png')" }}
        >
          <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-transparent"></div>
          <div className="relative z-20">
            <Navbar />
          </div>
        </div>

        <div className="relative z-10 container mx-auto px-4 py-24 min-h-[90vh] flex items-end">
          <div className="w-full md:w-2/3 text-white">
            <div className="flex flex-col items-start justify-between gap-6">
              <h1 className="text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-medium leading-tight tracking-tight max-w-xl">
                Shop
              </h1>
              <p className="text-lg md:text-2xl text-white/80 max-w-lg">
                Premium golf equipment for the modern golfer.
              </p>
            </div>
          </div>
        </div>
      </main>

      <div className="min-h-screen bg-neutral-50 py-6">
        <PageTransition>
          <div className="container mx-auto px-4">
            
            <FadeIn>
              <div className="mb-8 space-y-4">
                <div className="relative">
                  <div className={`flex items-center bg-white rounded-2xl border-2 transition-all duration-200 ${
                    isSearchFocused ? 'border-lime-500 shadow-lg shadow-lime-100' : 'border-neutral-200'
                  }`}>
                    <Search size={20} className="ml-4 text-neutral-400" />
                    <input
                      ref={searchInputRef}
                      type="text"
                      placeholder="Search products by name..."
                      defaultValue={search}
                      onChange={(e) => handleSearchChange(e.target.value)}
                      onFocus={() => setIsSearchFocused(true)}
                      onBlur={() => setIsSearchFocused(false)}
                      className="flex-1 px-4 py-4 text-neutral-700 focus:outline-none placeholder:text-neutral-400"
                    />
                    {search && (
                      <button
                        onClick={clearFilters}
                        className="mr-2 p-2 hover:bg-neutral-100 rounded-full transition-colors"
                      >
                        <X size={18} className="text-neutral-400" />
                      </button>
                    )}
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <button
                    onClick={() => handleCategorySelect("")}
                    className={`px-5 py-2.5 rounded-full whitespace-nowrap font-medium transition-all duration-200 ${
                      selectedCategory === ""
                        ? "bg-neutral-900 text-white"
                        : "bg-white text-neutral-600 border border-neutral-200 hover:border-neutral-300 hover:bg-neutral-50"
                    }`}
                  >
                    All
                  </button>
                  {categories.map((category) => (
                    <button
                      key={category.id}
                      onClick={() => handleCategorySelect(category.id)}
                      className={`px-5 py-2.5 rounded-full whitespace-nowrap font-medium transition-all duration-200 ${
                        selectedCategory === category.id
                          ? "bg-neutral-900 text-white"
                          : "bg-white text-neutral-600 border border-neutral-200 hover:border-neutral-300 hover:bg-neutral-50"
                      }`}
                    >
                      {category.name}
                    </button>
                  ))}

                  {hasActiveFilters && (
                    <button
                      onClick={clearFilters}
                      className="flex items-center gap-1.5 text-sm text-neutral-500 hover:text-lime-600 underline underline-offset-2"
                    >
                      <RotateCcw size={14} />
                      Clear filters
                    </button>
                  )}
                </div>
              </div>
            </FadeIn>

            {loading ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
                {[...Array(8)].map((_, i) => (
                  <div key={i} className="bg-white rounded-2xl overflow-hidden border border-neutral-100">
                    <div className="aspect-square bg-neutral-100 animate-pulse" />
                    <div className="p-4 space-y-3">
                      <div className="h-3 bg-neutral-100 rounded w-16" />
                      <div className="h-4 bg-neutral-100 rounded w-full" />
                      <div className="h-4 bg-neutral-100 rounded w-20" />
                      <div className="h-10 bg-neutral-100 rounded-xl" />
                    </div>
                  </div>
                ))}
              </div>
            ) : products.length === 0 ? (
              <div className="text-center py-20 bg-white rounded-3xl border border-neutral-100">
                <div className="w-20 h-20 mx-auto mb-4 bg-neutral-100 rounded-full flex items-center justify-center">
                  <Package size={32} className="text-neutral-400" />
                </div>
                <p className="text-neutral-800 font-semibold text-xl mb-2">No products found</p>
                <p className="text-neutral-500 mb-6">
                  {hasActiveFilters
                    ? "Try adjusting your search or filters"
                    : "No products available yet"}
                </p>
                {hasActiveFilters && (
                  <button
                    onClick={clearFilters}
                    className="px-6 py-2.5 bg-lime-600 text-white rounded-full font-medium hover:bg-lime-700 transition-colors"
                  >
                    Clear filters
                  </button>
                )}
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between mb-4">
                  <p className="text-neutral-500 text-sm">
                    {products.length} {products.length === 1 ? 'product' : 'products'} found
                  </p>
                  <div className="flex items-center gap-2 text-neutral-500 text-sm">
                    <Grid3X3 size={16} />
                    {products.length} items
                  </div>
                </div>
                <StaggerContainer>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
                    {products.map((product) => (
                      <StaggerItem key={product.id}>
                        <div className="bg-white rounded-2xl overflow-hidden border border-neutral-100 hover:border-lime-200 hover:shadow-xl hover:shadow-lime-100/30 transition-all duration-300 group">
                          <Link href={`/products/${product.id}`}>
                            <div className="relative aspect-square bg-neutral-50 overflow-hidden">
                              {product.image_url ? (
                                <img
                                  src={product.image_url}
                                  alt={product.name}
                                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center bg-neutral-100">
                                  <Package size={48} className="text-neutral-300" />
                                </div>
                              )}
                              {product.stock === 0 && (
                                <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                                  <span className="bg-red-500 text-white px-4 py-1.5 rounded-full text-sm font-medium">
                                    Sold Out
                                  </span>
                                </div>
                              )}
                              {product.stock > 0 && product.stock <= 3 && (
                                <div className="absolute top-3 left-3">
                                  <span className="bg-yellow-500 text-white px-3 py-1 rounded-full text-xs font-medium">
                                    Only {product.stock} left
                                  </span>
                                </div>
                              )}
                            </div>
                          </Link>

                          <div className="p-4">
                            <p className="text-xs font-medium text-neutral-400 uppercase tracking-wide mb-1">
                              {product.category?.name || 'Uncategorized'}
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
                            </div>

                            <button
                              onClick={() => addToCart(product.id)}
                              disabled={product.stock === 0}
                              className="w-full bg-neutral-900 text-white py-2.5 rounded-xl font-medium hover:bg-lime-600 disabled:bg-neutral-200 disabled:text-neutral-500 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center gap-2"
                            >
                              <ShoppingCart size={16} />
                              {product.stock === 0 ? 'Sold Out' : 'Add to Cart'}
                            </button>
                          </div>
                        </div>
                      </StaggerItem>
                    ))}
                  </div>
                </StaggerContainer>
              </>
            )}
          </div>
        </PageTransition>
      </div>
      <Footer />
    </>
  );
}