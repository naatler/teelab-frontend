'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import axios from '@/app/lib/axios';
import Navbar from '@/app/components/Navbar';
import { useAuthStore } from '@/app/store/useAuthStore';
import toast from 'react-hot-toast';

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

      toast.success('Product updated!');
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
          <div className="text-xl">Loading...</div>
        </div>
      </>
    );
  }

  if (loading) return null;

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-neutral-50 flex justify-center items-center py-8">
        <div className="bg-white p-8 rounded-lg shadow w-full max-w-lg">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold text-neutral-700">Edit Product</h1>
            <Link href="/admin/products" className="text-lime-600 hover:underline">
              Back
            </Link>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">Name</label>
              <input
                type="text"
                required
                className="w-full border p-2 rounded text-neutral-700"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">Price</label>
                <input
                  type="number"
                  required
                  className="w-full border p-2 rounded text-neutral-700"
                  value={form.price}
                  onChange={(e) => setForm({ ...form, price: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">Stock</label>
                <input
                  type="number"
                  required
                  className="w-full border p-2 rounded text-neutral-700"
                  value={form.stock}
                  onChange={(e) => setForm({ ...form, stock: e.target.value })}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">Image</label>
              
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
                        setForm({ ...form, image_url: "" });
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
                        <p className="text-sm">Click to upload new image</p>
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

            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">Category</label>
              <select
                required
                className="w-full border p-2 rounded text-neutral-700"
                value={form.category_id}
                onChange={(e) => setForm({ ...form, category_id: e.target.value })}
              >
                <option value="">Select Category</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">Description</label>
              <textarea
                className="w-full border p-2 rounded text-neutral-700"
                rows={3}
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
              />
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="is_active"
                checked={form.is_active}
                onChange={(e) => setForm({ ...form, is_active: e.target.checked })}
                className="w-4 h-4"
              />
              <label htmlFor="is_active" className="text-sm text-neutral-700">
                Active (show on website)
              </label>
            </div>

            <button
              type="submit"
              disabled={saving || uploading}
              className="w-full bg-lime-600 text-white py-2 rounded hover:bg-lime-700 disabled:bg-neutral-400 transition"
            >
              {uploading ? 'Uploading...' : saving ? 'Saving...' : 'Save Changes'}
            </button>
          </form>
        </div>
      </div>
    </>
  );
}