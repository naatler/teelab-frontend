'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import axios from '@/app/lib/axios';
import Navbar from '@/app/components/Navbar';
import { useAuthStore } from '@/app/store/useAuthStore';
import toast from 'react-hot-toast';
import Swal from 'sweetalert2';
import { FiPlus, FiEdit, FiTrash2, FiShoppingBag } from 'react-icons/fi';
import PageTransition, { StaggerContainer, StaggerItem, FadeIn } from '@/app/components/PageTransition';

interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  products_count: number;
  created_at: string;
}

interface FormErrors {
  name?: string;
  slug?: string;
}

export default function AdminCategoriesPage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [formData, setFormData] = useState({ name: '', slug: '', description: '' });
  const [errors, setErrors] = useState<FormErrors>({});
  const [saving, setSaving] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    if (!user || user.role !== 'admin') {
      router.push('/');
      return;
    }
    fetchCategories();
  }, [user, mounted]);

  const validate = (): boolean => {
    const newErrors: FormErrors = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    } else if (formData.name.trim().length < 2) {
      newErrors.name = 'Name must be at least 2 characters';
    }
    
    if (!formData.slug.trim()) {
      newErrors.slug = 'Slug is required';
    } else if (!/^[a-z0-9-]+$/.test(formData.slug)) {
      newErrors.slug = 'Slug can only contain lowercase letters, numbers, and hyphens';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const fetchCategories = async () => {
    try {
      const { data } = await axios.get('/categories');
      setCategories(data);
    } catch (error) {
      toast.error('Failed to fetch categories');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validate()) {
      return;
    }
    
    setSaving(true);

    try {
      if (editingCategory) {
        await axios.patch(`/admin/categories/${editingCategory.id}`, formData);
        toast.success('Category updated successfully');
      } else {
        await axios.post('/admin/categories', formData);
        toast.success('Category created successfully');
      }
      setShowModal(false);
      setEditingCategory(null);
      setFormData({ name: '', slug: '', description: '' });
      setErrors({});
      fetchCategories();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to save category');
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (category: Category) => {
    setEditingCategory(category);
    setFormData({
      name: category.name,
      slug: category.slug,
      description: category.description || '',
    });
    setShowModal(true);
  };

  const handleDelete = async (id: string) => {
    const result = await Swal.fire({
      title: 'Delete Category?',
      html: 'Are you sure you want to delete this category? This may affect products in this category.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#dc2626',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Yes, delete it',
      cancelButtonText: 'Cancel',
      width: '400px',
    });

    if (!result.isConfirmed) return;

    try {
      await axios.delete(`/admin/categories/${id}`);
      
      await Swal.fire({
        title: 'Deleted!',
        text: 'Category has been deleted.',
        icon: 'success',
        timer: 2000,
        showConfirmButton: false,
        width: '350px',
      });
      
      fetchCategories();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to delete category');
    }
  };

  const generateSlug = (name: string) => {
    return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
  };

  const handleNameChange = (name: string) => {
    setFormData({ ...formData, name, slug: generateSlug(name) });
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen bg-neutral-50 flex items-center justify-center">
          <div className="text-xl">Loading...</div>
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <PageTransition>
        <div className="min-h-screen bg-neutral-50 py-8">
          <div className="container mx-auto px-4 max-w-6xl">
            <FadeIn>
              <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold text-neutral-800">Categories Management</h1>
                <button
                  onClick={() => {
                    setEditingCategory(null);
                    setFormData({ name: '', slug: '', description: '' });
                    setShowModal(true);
                  }}
                  className="flex items-center gap-2 bg-lime-600 text-white px-4 py-2 rounded-lg hover:bg-lime-700 transition"
                >
                  <FiPlus /> Add Category
                </button>
              </div>
            </FadeIn>

            {categories.length === 0 ? (
              <FadeIn delay={0.1}>
                <div className="bg-white rounded-lg shadow p-12 text-center">
                  <div className="w-16 h-16 bg-neutral-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <FiShoppingBag className="text-neutral-400 text-2xl" />
                  </div>
                  <h2 className="text-2xl font-semibold mb-2 text-neutral-700">No categories yet</h2>
                  <p className="text-neutral-500 mb-6">Create your first category to organize products</p>
                </div>
              </FadeIn>
            ) : (
              <StaggerContainer>
                <div className="bg-white rounded-lg shadow overflow-hidden">
                  <table className="w-full">
                    <thead className="bg-neutral-100">
                      <tr>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-neutral-600">Name</th>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-neutral-600">Slug</th>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-neutral-600">Products</th>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-neutral-600">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {categories.map((category) => (
                        <StaggerItem key={category.id}>
                          <tr className="border-t hover:bg-neutral-50">
                            <td className="px-4 py-3">
                              <span className="font-medium text-neutral-800">{category.name}</span>
                            </td>
                            <td className="px-4 py-3">
                              <span className="text-neutral-500 text-sm">{category.slug}</span>
                            </td>
                            <td className="px-4 py-3">
                              <span className="bg-neutral-100 text-neutral-700 px-2 py-1 rounded-full text-sm">
                                {category.products_count} products
                              </span>
                            </td>
                            <td className="px-4 py-3">
                              <div className="flex items-center gap-2">
                                <button
                                  onClick={() => handleEdit(category)}
                                  className="p-2 text-blue-600 hover:bg-blue-50 rounded transition"
                                  title="Edit"
                                >
                                  <FiEdit size={18} />
                                </button>
                                <button
                                  onClick={() => handleDelete(category.id)}
                                  className="p-2 text-red-600 hover:bg-red-50 rounded transition"
                                  title="Delete"
                                >
                                  <FiTrash2 size={18} />
                                </button>
                              </div>
                            </td>
                          </tr>
                        </StaggerItem>
                      ))}
                    </tbody>
                  </table>
                </div>
              </StaggerContainer>
            )}
          </div>
        </div>
      </PageTransition>

      {showModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h2 className="text-xl font-bold mb-4 text-neutral-700">
              {editingCategory ? 'Edit Category' : 'Add New Category'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm text-neutral-600 mb-1">Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => {
                    handleNameChange(e.target.value);
                    if (errors.name) setErrors({ ...errors, name: undefined });
                  }}
                  className={`w-full px-4 py-2 border rounded-lg text-neutral-700 focus:outline-none focus:ring-2 ${
                    errors.name 
                      ? 'border-red-500 focus:ring-red-400' 
                      : 'border-neutral-300 focus:ring-lime-500'
                  }`}
                  placeholder="Category name"
                />
                {errors.name && (
                  <p className="text-red-500 text-xs mt-1">{errors.name}</p>
                )}
              </div>
              <div>
                <label className="block text-sm text-neutral-600 mb-1">Slug</label>
                <input
                  type="text"
                  value={formData.slug}
                  onChange={(e) => {
                    setFormData({ ...formData, slug: e.target.value });
                    if (errors.slug) setErrors({ ...errors, slug: undefined });
                  }}
                  className={`w-full px-4 py-2 border rounded-lg text-neutral-700 focus:outline-none focus:ring-2 ${
                    errors.slug 
                      ? 'border-red-500 focus:ring-red-400' 
                      : 'border-neutral-300 focus:ring-lime-500'
                  }`}
                  placeholder="category-slug"
                />
                {errors.slug && (
                  <p className="text-red-500 text-xs mt-1">{errors.slug}</p>
                )}
              </div>
              <div>
                <label className="block text-sm text-neutral-600 mb-1">Description (Optional)</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-lime-500"
                  rows={3}
                  placeholder="Category description"
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 px-4 py-2 border border-neutral-300 rounded-lg text-neutral-600 hover:bg-neutral-50 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 px-4 py-2 bg-lime-600 text-white rounded-lg hover:bg-lime-700 disabled:bg-neutral-400 transition"
                >
                  {saving ? 'Saving...' : editingCategory ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}