'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import axios from '@/app/lib/axios';
import Navbar from '@/app/components/Navbar';
import { useAuthStore } from '@/app/store/useAuthStore';
import toast from 'react-hot-toast';
import { FiUpload, FiX, FiBox, FiType, FiImage, FiLayers } from 'react-icons/fi';

interface Category {
  id: string;
  name: string;
}

export default function EditProductPage() {
  const { id } = useParams();
  const router = useRouter();
  const { user } = useAuthStore();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [isDragging, setIsDragging] = useState(false);

  const [form, setForm] = useState({
    name: '',
    price: '',
    stock: '',
    description: '',
    image_url: '',
    category_id: '' as string | number,
    is_active: true,
  });

  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>("");
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (!user) {
      router.push('/login');
      return;
    }
    if (user.role !== 'admin') {
      router.push('/');
      return;
    }
    fetchData();
  }, [user]);

  const fetchData = async () => {
    try {
      const [productRes, categoriesRes] = await Promise.all([
        axios.get(`/products/${id}`),
        axios.get('/categories'),
      ]);
      
      const product = productRes.data;
      setCategories(categoriesRes.data);
      
      setForm({
        name: product.name || '',
        price: product.price || '',
        stock: product.stock || '',
        description: product.description || '',
        image_url: product.image_url || '',
        category_id: product.category_id || '',
        is_active: product.is_active ?? true,
      });

      if (product.image_url) {
        setImagePreview(product.image_url);
      }
    } catch (error) {
      toast.error('Failed to load product');
      router.push('/admin/products');
    } finally {
      setLoading(false);
      setInitialLoading(false);
    }
  };

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
    setSaving(true);

    try {
      const imageUrl = await uploadImage();

      await axios.patch(`/products/${id}`, {
        name: form.name,
        slug: form.name.toLowerCase().replace(/\s+/g, '-'),
        price: Number(form.price),
        stock: Number(form.stock),
        category_id: form.category_id,
        description: form.description || null,
        image_url: imageUrl || null,
        is_active: form.is_active,
      });

      toast.success('Product updated successfully!');
      router.push('/admin/products');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to update product');
    } finally {
      setSaving(false);
    }
  };

  if (initialLoading) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen bg-neutral-50 flex items-center justify-center">
          <div className="flex items-center gap-3">
            <svg className="animate-spin h-6 w-6 text-lime-600" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            <span className="text-neutral-600">Loading...</span>
          </div>
        </div>
      </>
    );
  }

  if (loading) return null;

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
              <h1 className="text-3xl font-bold text-neutral-800">Edit Product</h1>
              <p className="text-neutral-500 mt-1">Update product details below</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Form */}
            <div className="lg:col-span-2 space-y-6">
              {/* Basic Info Card */}
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
                          setForm({ ...form, image_url: "" });
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
                        <p className="text-neutral-700 font-medium">Click to upload new image</p>
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
              {/* Status Card */}
              <div className="bg-white rounded-2xl shadow-sm border border-neutral-200 p-6">
                <h3 className="font-semibold text-neutral-800 mb-4">Product Status</h3>
                
                <label className="flex items-center gap-3 cursor-pointer">
                  <div className="relative">
                    <input
                      type="checkbox"
                      checked={form.is_active}
                      onChange={(e) => setForm({ ...form, is_active: e.target.checked })}
                      className="sr-only"
                    />
                    <div className={`w-12 h-6 rounded-full transition-colors ${form.is_active ? 'bg-lime-500' : 'bg-neutral-300'}`}>
                      <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${form.is_active ? 'translate-x-7' : 'translate-x-1'}`} />
                    </div>
                  </div>
                  <span className="text-neutral-700 font-medium">
                    {form.is_active ? 'Active - Show on website' : 'Inactive - Hide from website'}
                  </span>
                </label>
              </div>

              {/* Submit Card */}
              <div className="bg-white rounded-2xl shadow-sm border border-neutral-200 p-6 sticky top-8">
                <h3 className="font-semibold text-neutral-800 mb-4">Save Changes</h3>
                <p className="text-neutral-500 text-sm mb-6">
                  Make sure all information is correct before saving.
                </p>
                
                <button
                  type="submit"
                  disabled={saving || uploading}
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
                  ) : saving ? (
                    <>
                      <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                      Saving...
                    </>
                  ) : (
                    <>
                      <FiBox />
                      Save Changes
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
            </div>
          </form>
        </div>
      </div>
    </>
  );
}