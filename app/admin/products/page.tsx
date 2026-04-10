'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import axios from '@/app/lib/axios';
import Navbar from '@/app/components/Navbar';
import { useAuthStore } from '@/app/store/useAuthStore';
import toast from 'react-hot-toast';
import Swal from 'sweetalert2';
import { FiEdit, FiTrash2, FiPlus, FiSearch, FiPackage, FiFilter } from 'react-icons/fi';
import PageTransition, { FadeIn } from '@/app/components/PageTransition';

interface Product {
  id: string;
  name: string;
  price: number;
  stock: number;
  image_url: string | null;
  is_active: boolean;
  category: {
    id: string;
    name: string;
  };
}

export default function AdminProductsPage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    
    if (!user) {
      router.push('/login');
      return;
    }
    if (user.role !== 'admin') {
      router.push('/');
      return;
    }
    fetchProducts();
  }, [user, mounted]);

  const fetchProducts = async () => {
    try {
      const { data } = await axios.get('/admin/products?all=true');
      setProducts(data);
    } catch (error) {
      toast.error('Failed to fetch products');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    const result = await Swal.fire({
      title: 'Delete Product?',
      html: `Are you sure you want to delete <strong>${name}</strong>?<br><br>This action cannot be undone.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#dc2626',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Yes, delete it',
      cancelButtonText: 'Cancel',
      width: '400px',
    });

    if (!result.isConfirmed) return;
    
    setDeleteId(id);
    try {
      await axios.delete(`/admin/products/${id}`);
      
      await Swal.fire({
        title: 'Deleted!',
        text: 'Product has been deleted.',
        icon: 'success',
        timer: 2000,
        showConfirmButton: false,
        width: '350px',
      });
      
      fetchProducts();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to delete product');
    } finally {
      setDeleteId(null);
    }
  };

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          product.category?.name?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = filterStatus === 'all' || 
                          (filterStatus === 'active' && product.is_active) ||
                          (filterStatus === 'inactive' && !product.is_active);
    return matchesSearch && matchesStatus;
  });

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen bg-neutral-50 flex items-center justify-center">
          <div className="flex items-center gap-3">
            <div className="w-6 h-6 border-2 border-lime-600 border-t-transparent rounded-full animate-spin"></div>
            <span className="text-neutral-600">Loading products...</span>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <PageTransition>
        <div className="min-h-screen bg-gradient-to-br from-neutral-50 to-neutral-100 py-8">
          <div className="container mx-auto px-4 max-w-7xl">
            <FadeIn>
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-8">
                <div>
                  <h1 className="text-3xl font-bold text-neutral-800">Products</h1>
                  <p className="text-neutral-500 mt-1">Manage your product inventory</p>
                </div>
                <Link
                  href="/admin/products/create"
                  className="inline-flex items-center gap-2 bg-lime-600 text-white px-5 py-2.5 rounded-xl font-medium hover:bg-lime-700 transition-all hover:shadow-lg hover:shadow-lime-500/25"
                >
                  <FiPlus className="w-5 h-5" />
                  Add Product
                </Link>
              </div>
            </FadeIn>

            <FadeIn delay={0.1}>
              <div className="bg-white rounded-2xl shadow-sm border border-neutral-200 p-4 mb-6">
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="relative flex-1">
                    <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400" />
                    <input
                      type="text"
                      placeholder="Search products..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-12 pr-4 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl text-neutral-700 focus:outline-none focus:ring-2 focus:ring-lime-100 focus:border-lime-500 transition-all"
                    />
                  </div>
                  <div className="relative">
                    <FiFilter className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400" />
                    <select
                      value={filterStatus}
                      onChange={(e) => setFilterStatus(e.target.value)}
                      className="pl-12 pr-10 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl text-neutral-700 focus:outline-none focus:ring-2 focus:ring-lime-100 focus:border-lime-500 transition-all appearance-none cursor-pointer"
                    >
                      <option value="all">All Status</option>
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                    </select>
                  </div>
                </div>
              </div>
            </FadeIn>

            {filteredProducts.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredProducts.map((product, index) => (
                  <FadeIn key={product.id} delay={0.05 * index}>
                    <div className="bg-white rounded-2xl shadow-sm border border-neutral-200 overflow-hidden hover:shadow-md transition-all group">
                      <div className="relative aspect-square bg-neutral-100">
                        {product.image_url ? (
                          <img
                            src={product.image_url}
                            alt={product.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <FiPackage className="w-16 h-16 text-neutral-300" />
                          </div>
                        )}
                        <div className="absolute top-3 right-3">
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                            product.is_active 
                              ? 'bg-lime-100 text-lime-700' 
                              : 'bg-neutral-100 text-neutral-600'
                          }`}>
                            {product.is_active ? 'Active' : 'Inactive'}
                          </span>
                        </div>
                      </div>
                      <div className="p-4">
                        <div className="mb-2">
                          <span className="text-xs text-neutral-500 bg-neutral-100 px-2 py-1 rounded-full">
                            {product.category?.name || 'Uncategorized'}
                          </span>
                        </div>
                        <h3 className="font-semibold text-neutral-800 mb-1 truncate group-hover:text-lime-600 transition-colors">
                          {product.name}
                        </h3>
                        <p className="text-xl font-bold text-lime-600 mb-3">
                          Rp {Number(product.price).toLocaleString('id-ID')}
                        </p>
                        <div className="flex items-center justify-between">
                          <span className={`text-sm font-medium ${
                            product.stock > 0 ? 'text-lime-600' : 'text-red-600'
                          }`}>
                            {product.stock > 0 ? `${product.stock} in stock` : 'Out of stock'}
                          </span>
                          <div className="flex gap-2">
                            <Link
                              href={`/admin/products/edit/${product.id}`}
                              className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                              title="Edit"
                            >
                              <FiEdit className="w-4 h-4" />
                            </Link>
                            <button
                              onClick={() => handleDelete(product.id, product.name)}
                              disabled={deleteId === product.id}
                              className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition disabled:opacity-50"
                              title="Delete"
                            >
                              {deleteId === product.id ? (
                                <div className="w-4 h-4 border-2 border-red-600 border-t-transparent rounded-full animate-spin"></div>
                              ) : (
                                <FiTrash2 className="w-4 h-4" />
                              )}
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </FadeIn>
                ))}
              </div>
            ) : (
              <FadeIn>
                <div className="bg-white rounded-2xl shadow-sm border border-neutral-200 p-12 text-center">
                  <div className="w-16 h-16 bg-neutral-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <FiPackage className="w-8 h-8 text-neutral-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-neutral-800 mb-2">No products found</h3>
                  <p className="text-neutral-500 mb-6">
                    {searchQuery || filterStatus !== 'all' 
                      ? 'Try adjusting your search or filter criteria' 
                      : 'Get started by adding your first product'}
                  </p>
                  {!searchQuery && filterStatus === 'all' && (
                    <Link
                      href="/admin/products/create"
                      className="inline-flex items-center gap-2 bg-lime-600 text-white px-5 py-2.5 rounded-xl font-medium hover:bg-lime-700 transition"
                    >
                      <FiPlus className="w-5 h-5" />
                      Add Product
                    </Link>
                  )}
                </div>
              </FadeIn>
            )}
          </div>
        </div>
      </PageTransition>
    </>
  );
}