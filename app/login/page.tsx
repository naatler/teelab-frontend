'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuthStore } from '@/app/store/useAuthStore';
import toast from 'react-hot-toast';
import axios from '@/app/lib/axios';

export default function LoginPage() {
  const router = useRouter();
  const setAuth = useAuthStore((state) => state.setAuth);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data } = await axios.post('/auth/login', formData);
      setAuth(data.user, data.access_token);
      toast.success('Login successful!');
      router.push('/landingpage');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative flex items-center justify-center px-3 sm:px-6">
      <div className="absolute inset-0 overflow-hidden">
        <img
          src="/images/auth-page/hero.png"
          alt="Background"
          className="w-full h-full object-cover scale-110 sm:scale-100"
        />
        <div className="absolute inset-0 bg-black/50 sm:bg-black/40"></div>
      </div>

      <div className="relative z-10 w-full max-w-xs sm:max-w-md px-5 sm:px-10 py-6 sm:py-12 bg-white/90 backdrop-blur-md rounded-xl sm:rounded-2xl shadow-lg">
        <div className="mb-5 sm:mb-8 text-center">
          <h2 className="text-xl sm:text-3xl font-medium text-neutral-700">
            Sign in
          </h2>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
          <div>
            <label className="block mb-1.5 text-xs sm:text-sm text-neutral-600">
              Email
            </label>
            <input
              type="email"
              required
              value={formData.email}
              onChange={(e) =>
                setFormData({ ...formData, email: e.target.value })
              }
              placeholder="Enter your email"
              className="w-full rounded-full text-neutral-700 border border-gray-300 px-4 py-2 sm:py-3 focus:outline-none focus:ring-2 focus:ring-green-400 text-sm sm:text-base"
            />
          </div>

          <div>
            <label className="block mb-1.5 text-xs sm:text-sm text-neutral-600">
              Password
            </label>
            <input
              type="password"
              required
              value={formData.password}
              onChange={(e) =>
                setFormData({ ...formData, password: e.target.value })
              }
              placeholder="Enter your password"
              className="w-full rounded-full text-neutral-700 border border-gray-300 px-4 py-2 sm:py-3 focus:outline-none focus:ring-2 focus:ring-green-400 text-sm sm:text-base"
            />
            <div className="text-right mt-1">
              <a
                href="#"
                className="text-[11px] sm:text-sm text-gray-500 hover:text-green-500"
              >
                Forgot password?
              </a>
            </div>
          </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-green-400 hover:bg-green-500 text-white py-2 sm:py-3 rounded-full text-sm sm:text-lg font-medium transition disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                {loading ? 'Loading...' : 'Sign in'}
              </button>
            </form>
    
            <p className="text-[11px] sm:text-sm text-center text-gray-600 mt-4 sm:mt-6">
              Don't have an account?{' '}
              <Link href="/register" className="text-green-500 hover:underline">
                Sign up
              </Link>
            </p>
          </div>
        </div>

  );
}