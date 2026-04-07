'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/app/store/useAuthStore';
import toast from 'react-hot-toast';

export default function AdminRoute({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { user, isAdmin } = useAuthStore();

  useEffect(() => {
    if (!user) {
      toast.error('Please login first');
      router.push('/login');
    } else if (!isAdmin()) {
      toast.error('Access denied. Admin only.');
      router.push('/');
    }
  }, [user, router]);

  if (!user || !isAdmin()) {
    return null;
  }

  return <>{children}</>;
}