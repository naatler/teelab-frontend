'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuthStore } from '@/app/store/useAuthStore';
import toast from 'react-hot-toast';
import axios from '@/app/lib/axios';
import { Mail, Lock, Eye, EyeOff, Loader2 } from 'lucide-react';

interface FormErrors {
  email?: string;
  password?: string;
}

export default function LoginPage() {
  const router = useRouter();
  const setAuth = useAuthStore((state) => state.setAuth);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  const validate = (): boolean => {
    const newErrors: FormErrors = {};
    
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email';
    }
    
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validate()) {
      return;
    }
    
    setLoading(true);

    try {
      const { data } = await axios.post('/auth/login', formData);
      setAuth(data.user, data.access_token);
      toast.success('Welcome back!');
      router.push('/landingpage');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field: string, value: string) => {
    setFormData({ ...formData, [field]: value });
    if (errors[field as keyof FormErrors]) {
      setErrors({ ...errors, [field]: undefined });
    }
  };

  return (
    <div className="min-h-screen flex">
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
        <img
          src="/images/auth-page/hero.png"
          alt="Background"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/50 to-transparent"></div>
        <div className="relative z-10 flex flex-col justify-center items-center w-full p-12 text-white">
          <h1 className="text-5xl font-bold text-lime-300 mb-6">Tee<span className='text-neutral-100'>lab</span></h1>
          <p className="text-xl text-white/80 text-center max-w-md">
            Discover amazing products and elevate your shopping experience
          </p>
        </div>
      </div>

      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-neutral-50">
        <div className="w-full max-w-md">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold text-neutral-900 mb-2">Welcome back</h2>
            <p className="text-neutral-500">Sign in to continue your journey</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-neutral-700">Email</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Mail className="w-5 h-5 text-neutral-400" />
                </div>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleChange('email', e.target.value)}
                  placeholder="name@example.com"
                  className={`w-full pl-12 pr-4 py-3.5 bg-white border rounded-xl text-neutral-700 placeholder-neutral-400 focus:outline-none focus:ring-2 transition-all ${
                    errors.email 
                      ? 'border-red-500 focus:ring-red-100' 
                      : 'border-neutral-200 focus:ring-lime-100 focus:border-lime-500'
                  }`}
                />
              </div>
              {errors.email && (
                <p className="text-red-500 text-sm">{errors.email}</p>
              )}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-neutral-700">Password</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Lock className="w-5 h-5 text-neutral-400" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={(e) => handleChange('password', e.target.value)}
                  placeholder="••••••••"
                  className={`w-full pl-12 pr-12 py-3.5 bg-white border rounded-xl text-neutral-700 placeholder-neutral-400 focus:outline-none focus:ring-2 transition-all ${
                    errors.password 
                      ? 'border-red-500 focus:ring-red-100' 
                      : 'border-neutral-200 focus:ring-lime-100 focus:border-lime-500'
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-4 flex items-center"
                >
                  {showPassword ? (
                    <EyeOff className="w-5 h-5 text-neutral-400 hover:text-neutral-600" />
                  ) : (
                    <Eye className="w-5 h-5 text-neutral-400 hover:text-neutral-600" />
                  )}
                </button>
              </div>
              {errors.password && (
                <p className="text-red-500 text-sm">{errors.password}</p>
              )}
            </div>

            <div className="flex items-center justify-between">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  className="w-4 h-4 text-lime-600 rounded border-neutral-300 focus:ring-lime-500"
                />
                <span className="ml-2 text-sm text-neutral-600">Remember me</span>
              </label>
              <a href="#" className="text-sm text-lime-600 hover:text-lime-700 font-medium">
                Forgot password?
              </a>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-lime-600 hover:bg-lime-700 text-white py-3.5 px-6 rounded-xl font-semibold transition-all hover:shadow-lg hover:shadow-lime-500/25 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Signing in...
                </>
              ) : (
                'Sign in'
              )}
            </button>
          </form>

          <p className="text-center mt-8 text-neutral-600">
            Don't have an account?{' '}
            <Link href="/register" className="text-lime-600 hover:text-lime-700 font-semibold">
              Create one
            </Link>
          </p>
        </div>
      </div>
    </div>
);
}
