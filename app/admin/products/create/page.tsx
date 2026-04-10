'use client';

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import axios from "@/app/lib/axios";
import Navbar from "@/app/components/Navbar";
import { useAuthStore } from "@/app/store/useAuthStore";
import toast from "react-hot-toast";
import { FiUpload, FiX, FiBox, FiDollarSign, FiLayers, FiType, FiImage } from "react-icons/fi";

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
  const [isDragging, setIsDragging] = useState(false);

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

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith("image/")) {
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

      await axios.post("/admin/products", {
        name: form.name,
        slug: form.name.toLowerCase().replace(/\s+/g, "-"),
        price: Number(form.price),
        stock: Number(form.stock),
        category_id: form.category_id,
        description: form.description || null,
        image_url: imageUrl || null,
      });

      toast.success("Product created successfully!");
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
      <div className="min-h-screen bg-neutral-50 py-8">
        <div className="container mx-auto px-4 max-w-4xl">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <Link 
                href="/admin/products" 
                className="text-neutral-500 hover:text-lime-600 text-sm mb-2 inline-flex items-center gap-1"
              >
                ← Back to products
              </Link>
              <h1 className="text-3xl font-bold text-neutral-800">Add New Product</h1>
              <p className="text-neutral-500 mt-1">Fill in the details to create a new product</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-white rounded-2xl shadow-sm border border-neutral-200 p-6">
                <h2 className="text-lg font-semibold text-neutral-800 mb-5 flex items-center gap-2">
                  <FiType className="text-lime-600" /> Basic Information
                </h2>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-2">
                      Product Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Enter product name"
                      className="w-full px-4 py-3 rounded-xl border border-neutral-200 text-neutral-700 focus:ring-2 focus:ring-lime-500 focus:border-lime-500 outline-none transition"
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-neutral-700 mb-2">
                        Price <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400">Rp</span>
                        <input
                          type="number"
                          required
                          placeholder="0"
                          className="w-full pl-10 pr-4 py-3 rounded-xl border border-neutral-200 text-neutral-700 focus:ring-2 focus:ring-lime-500 focus:border-lime-500 outline-none transition"
                          value={form.price}
                          onChange={(e) => setForm({ ...form, price: e.target.value })}
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-neutral-700 mb-2">
                        Stock <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="number"
                        required
                        placeholder="0"
                        className="w-full px-4 py-3 rounded-xl border border-neutral-200 text-neutral-700 focus:ring-2 focus:ring-lime-500 focus:border-lime-500 outline-none transition"
                        value={form.stock}
                        onChange={(e) => setForm({ ...form, stock: e.target.value })}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-2">
                      Category <span className="text-red-500">*</span>
                    </label>
                    <select
                      required
                      className="w-full px-4 py-3 rounded-xl border border-neutral-200 text-neutral-700 focus:ring-2 focus:ring-lime-500 focus:border-lime-500 outline-none transition bg-white"
                      value={form.category_id}
                      onChange={(e) => setForm({ ...form, category_id: e.target.value })}
                    >
                      <option value="">Select a category</option>
                      {categories.map((cat) => (
                        <option key={cat.id} value={cat.id}>
                          {cat.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-2">
                      Description
                    </label>
                    <textarea
                      placeholder="Enter product description..."
                      className="w-full px-4 py-3 rounded-xl border border-neutral-200 text-neutral-700 focus:ring-2 focus:ring-lime-500 focus:border-lime-500 outline-none transition resize-none"
                      rows={4}
                      value={form.description}
                      onChange={(e) => setForm({ ...form, description: e.target.value })}
                    />
                  </div>
                </div>
              </div>

              {/* Image Upload Card */}
              <div className="bg-white rounded-2xl shadow-sm border border-neutral-200 p-6">
                <h2 className="text-lg font-semibold text-neutral-800 mb-5 flex items-center gap-2">
                  <FiImage className="text-lime-600" /> Product Image
                </h2>
                
                <div 
                  className={`relative border-2 border-dashed rounded-xl p-8 text-center transition-colors ${
                    isDragging 
                      ? "border-lime-500 bg-lime-50" 
                      : "border-neutral-300 hover:border-neutral-400"
                  }`}
                  onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                  onDragLeave={() => setIsDragging(false)}
                  onDrop={handleDrop}
                >
                  {imagePreview ? (
                    <div className="relative">
                      <img
                        src={imagePreview}
                        alt="Preview"
                        className="max-h-64 mx-auto rounded-lg object-contain"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          setImageFile(null);
                          setImagePreview("");
                        }}
                        className="absolute top-2 right-2 bg-neutral-800 text-white rounded-full p-2 hover:bg-neutral-700 transition"
                      >
                        <FiX size={16} />
                      </button>
                    </div>
                  ) : (
                    <div className="py-6">
                      <div className="w-16 h-16 bg-lime-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <FiUpload className="text-lime-600 text-2xl" />
                      </div>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageChange}
                        className="hidden"
                        id="image-upload"
                      />
                      <label
                        htmlFor="image-upload"
                        className="cursor-pointer"
                      >
                        <p className="text-neutral-700 font-medium">Click to upload</p>
                        <p className="text-neutral-400 text-sm mt-1">or drag and drop</p>
                      </label>
                      <p className="text-neutral-400 text-xs mt-3">PNG, JPG, GIF up to 5MB</p>
                    </div>
                  )}
                </div>

                <div className="mt-4">
                  <p className="text-sm text-neutral-500 text-center mb-2">— or —</p>
                  <input
                    type="text"
                    placeholder="Paste image URL here..."
                    className="w-full px-4 py-3 rounded-xl border border-neutral-200 text-neutral-700 focus:ring-2 focus:ring-lime-500 focus:border-lime-500 outline-none transition"
                    value={form.image_url}
                    onChange={handleImageUrlChange}
                  />
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Submit Card */}
              <div className="bg-white rounded-2xl shadow-sm border border-neutral-200 p-6 sticky top-8">
                <h3 className="font-semibold text-neutral-800 mb-4">Ready to publish?</h3>
                <p className="text-neutral-500 text-sm mb-6">
                  Make sure all required fields are filled before publishing.
                </p>
                
                <button
                  type="submit"
                  disabled={loading || uploading}
                  className="w-full bg-lime-600 text-white py-4 rounded-xl font-semibold hover:bg-lime-700 disabled:bg-neutral-300 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center gap-2"
                >
                  {uploading ? (
                    <>
                      <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                      Uploading...
                    </>
                  ) : loading ? (
                    <>
                      <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                      Creating...
                    </>
                  ) : (
                    <>
                      <FiBox />
                      Create Product
                    </>
                  )}
                </button>

                <Link
                  href="/admin/products"
                  className="block text-center text-neutral-500 hover:text-neutral-700 text-sm mt-4"
                >
                  Cancel
                </Link>
              </div>

              {/* Tips Card */}
              <div className="bg-lime-50 rounded-2xl border border-lime-200 p-6">
                <h3 className="font-semibold text-lime-800 mb-3">Tips</h3>
                <ul className="text-sm text-lime-700 space-y-2">
                  <li>• Use high-quality images for better visibility</li>
                  <li>• Set competitive prices to attract customers</li>
                  <li>• Write clear descriptions with key features</li>
                  <li>• Keep stock updated to avoid overselling</li>
                </ul>
              </div>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}