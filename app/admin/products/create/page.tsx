'use client';

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import axios from "@/app/lib/axios";
import Navbar from "@/app/components/Navbar";
import { useAuthStore } from "@/app/store/useAuthStore";
import toast from "react-hot-toast";

interface Category {
  id: string;
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

  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>("");
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(false);

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

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
      setForm({ ...form, image_url: "" });
    }
  };

  const handleImageUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, image_url: e.target.value });
    setImageFile(null);
    setImagePreview("");
  };

  const uploadImage = async (): Promise<string | null> => {
    if (!imageFile) return form.image_url || null;

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", imageFile);

      const { data } = await axios.post("/upload/image", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      return data.url;
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to upload image");
      return null;
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.name || !form.price || !form.stock || !form.category_id) {
      toast.error("Please fill all required fields");
      return;
    }

    setLoading(true);

    try {
      const imageUrl = await uploadImage();

      if (!imageUrl && imageFile) {
        setLoading(false);
        return;
      }

      await axios.post("/products", {
        name: form.name,
        slug: form.name.toLowerCase().replace(/\s+/g, "-"),
        price: Number(form.price),
        stock: Number(form.stock),
        category_id: form.category_id,
        description: form.description || null,
        image_url: imageUrl || null,
      });

      toast.success("Product created!");
      router.push("/admin/products");
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to create product");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-neutral-50 flex justify-center items-center py-8">
        <div className="bg-white p-8 rounded-lg shadow w-full max-w-lg">
          <h1 className="text-2xl font-bold text-neutral-700 mb-6">Add Product</h1>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* NAME */}
            <input
              type="text"
              placeholder="Product Name *"
              required
              className="w-full border p-2 rounded text-neutral-700"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />

            {/* PRICE & STOCK */}
            <div className="grid grid-cols-2 gap-4">
              <input
                type="number"
                placeholder="Price *"
                required
                className="w-full border p-2 rounded text-neutral-700"
                value={form.price}
                onChange={(e) => setForm({ ...form, price: e.target.value })}
              />
              <input
                type="number"
                placeholder="Stock *"
                required
                className="w-full border p-2 rounded text-neutral-700"
                value={form.stock}
                onChange={(e) => setForm({ ...form, stock: e.target.value })}
              />
            </div>

            {/* IMAGE UPLOAD */}
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                Product Image
              </label>
              
              <div className="border-2 border-dashed border-neutral-300 rounded-lg p-4">
                {imagePreview ? (
                  <div className="relative">
                    <img
                      src={imagePreview}
                      alt="Preview"
                      className="w-full h-48 object-contain rounded"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        setImageFile(null);
                        setImagePreview("");
                      }}
                      className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                    >
                      ✕
                    </button>
                  </div>
                ) : (
                  <div className="text-center">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="hidden"
                      id="image-upload"
                    />
                    <label
                      htmlFor="image-upload"
                      className="cursor-pointer text-neutral-500 hover:text-neutral-700"
                    >
                      <div className="py-4">
                        <p className="text-sm">Click to upload image</p>
                        <p className="text-xs text-neutral-400">PNG, JPG, GIF (max 5MB)</p>
                      </div>
                    </label>
                  </div>
                )}
              </div>

              <div className="mt-2 text-center text-sm text-neutral-500">or</div>

              <input
                type="text"
                placeholder="Image URL"
                className="w-full border p-2 rounded text-neutral-700 mt-2"
                value={form.image_url}
                onChange={handleImageUrlChange}
              />
            </div>

            {/* CATEGORY */}
            <select
              required
              className="w-full border p-2 rounded text-neutral-700"
              value={form.category_id}
              onChange={(e) => setForm({ ...form, category_id: e.target.value })}
            >
              <option value="">Select Category *</option>
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
              onChange={(e) => setForm({ ...form, description: e.target.value })}
            />

            {/* SUBMIT */}
            <button
              type="submit"
              disabled={loading || uploading}
              className="w-full bg-lime-600 text-white py-2 rounded hover:bg-lime-700 disabled:bg-neutral-400 transition"
            >
              {uploading ? "Uploading..." : loading ? "Creating..." : "Create Product"}
            </button>
          </form>
        </div>
      </div>
    </>
  );
}