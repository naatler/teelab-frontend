  "use client";

  import { useState, useEffect } from "react";
  import { useRouter } from "next/navigation";
  import axios from "@/app/lib/axios";
  import Navbar from "@/app/components/Navbar";
  import { useAuthStore } from "@/app/store/useAuthStore";
  import toast from "react-hot-toast";

  interface Category {
    id: number;
    name: string;
  }

  export default function CreateProductPage() {
    const router = useRouter();
    const { user } = useAuthStore();

    const [categories, setCategories] = useState<Category[]>([]);

    const [form, setForm] = useState({
      name: "",
      price: "",
      stock: "",
      description: "",
      image_url: "",
      category_id: "",
    });

    const [loading, setLoading] = useState(false);

    // 🔐 Protect admin
    useEffect(() => {
      if (!user) {
        router.push("/landingpage");
        return;
      }

      if (user.role !== "admin") {
        toast.error("Access denied");
        router.push("/");
      }
    }, [user]);

    // 📦 Fetch categories
    useEffect(() => {
      const fetchCategories = async () => {
        try {
          const { data } = await axios.get("/categories");
          setCategories(data);
        } catch {
          toast.error("Failed to load categories");
        }
      };

      fetchCategories();
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      setLoading(true);
      
      const catId = form.category_id;
      
      if (!catId) {
        toast.error("Please select a valid category");
        setLoading(false);
        return;
      }

      try {
        const payload = {
          name: form.name,
          slug: form.name.toLowerCase().replace(/\s+/g, '-'),
          price: Number(form.price),
          stock: Number(form.stock),
          category_id: String(catId),
        };
        
        const response = await axios.post("/products", payload);

        toast.success("Product created!");
        router.push("/admin/products");
      } catch (error: any) {
        console.log(error.response?.data);
        toast.error(error.response?.data?.message || "Failed to create product");
      } finally {
        setLoading(false);
      }
    };

    return (
      <>
        <Navbar />
        <div className="min-h-screen bg-gray-50 flex justify-center items-center">
          <div className="bg-white p-8 rounded-lg shadow w-full max-w-lg">
            <h1 className="text-2xl font-bold mb-6 text-neutral-700">
              Create Product
            </h1>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* NAME */}
              <input
                type="text"
                placeholder="Product Name"
                required
                className="w-full border p-2 rounded text-neutral-700"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />

              {/* PRICE */}
              <input
                type="number"
                placeholder="Price"
                required
                className="w-full border p-2 rounded text-neutral-700"
                value={form.price}
                onChange={(e) => setForm({ ...form, price: e.target.value })}
              />

              {/* STOCK */}
              <input
                type="number"
                placeholder="Stock" 
                required
                className="w-full border p-2 rounded text-neutral-700"
                value={form.stock}
                onChange={(e) => setForm({ ...form, stock: e.target.value })}
              />

              {/* IMAGE */}
              <input
                type="text"
                placeholder="Image URL"
                className="w-full border p-2 rounded text-neutral-700"
                value={form.image_url}
                onChange={(e) => setForm({ ...form, image_url: e.target.value })}
              />

              {/* CATEGORY */}
              <select
                required
                className="w-full border p-2 rounded text-neutral-700"
                value={form.category_id}
                onChange={(e) =>
                  setForm({ ...form, category_id: e.target.value })
                }
              >
                <option value="">Select Category</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>

              {/* DESCRIPTION */}
              <textarea
                placeholder="Description"
                className="w-full border p-2 rounded text-neutral-700"
                rows={3}
                value={form.description}
                onChange={(e) =>
                  setForm({ ...form, description: e.target.value })
                }
              />

              {/* SUBMIT */}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-green-600 text-white py-2 rounded"
              >
                {loading ? "Creating..." : "Create Product"}
              </button>
            </form>
          </div>
        </div>
      </>
    );
  }
