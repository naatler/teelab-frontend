"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import axios from "@/app/lib/axios";
import Navbar from "@/app/components/Navbar";
import toast from "react-hot-toast";
import { useAuthStore } from "@/app/store/useAuthStore";
import { useRouter } from "next/navigation";
import Cookies from "js-cookie";

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
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");

  useEffect(() => {
    fetchCategories();
    fetchProducts();
  }, [search, selectedCategory]);

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
      await axios.post("/cart/items", {
        product_id: productId,
        quantity: 1,
      });
      toast.success("Added to cart!");
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

      <div className="min-h-screen bg-neutral-50">
        <div className="container mx-auto px-4 py-1">
          
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

          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {products.map((product) => (
              <div
                key={product.id}
                className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition group"
              >
                <Link href={`/products/${product.id}`}>
                  <div className="relative h-70 bg-neutral-100 overflow-hidden">
                    {product.image_url ? (
                      <img
                        src={product.image_url}
                        alt={product.name}
                        className="w-full h-full object-cover group-hover:scale-110 transition duration-300"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-neutral-400 text-6xl">
                        📦
                      </div>
                    )}
                  </div>
                </Link>

                <div className="p-6">
                  <p className="text-xs text-neutral-500 mb-1">
                    {product.category.name}
                  </p>
                  <Link href={`/products/${product.id}`}>
                    <h3 className="font-semibold text-lg mb-2 truncate hover:text-lime-600 transition">
                      {product.name}
                    </h3>
                  </Link>
                  <p className="text-lime-600 font-bold text-xl mb-2">
                    Rp {Number(product.price).toLocaleString("id-ID")}
                  </p>
                  <p className="text-sm text-neutral-600 mb-4">
                    Stock: {product.stock}
                  </p>

                  <div className="flex gap-2">
                    <Link
                      href={`/products/${product.id}`}
                      className="flex-1 bg-neutral-200 text-center py-2 rounded-lg hover:bg-neutral-300 transition"
                    >
                      View
                    </Link>
                    <button
                      onClick={() => addToCart(product.id)}
                      disabled={product.stock === 0}
                      className="flex-1 bg-lime-600 text-white py-2 rounded-lg hover:bg-lime-700 disabled:bg-neutral-400 disabled:cursor-not-allowed transition"
                    >
                      {product.stock === 0 ? "Out of Stock" : "Add to Cart"}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {products.length === 0 && (
            <div className="text-center py-12">
              <p className="text-neutral-500 text-xl">No products found</p>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
