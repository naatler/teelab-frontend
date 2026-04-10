'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/app/store/useAuthStore';
import toast from 'react-hot-toast';

export default function AdminRoute({ children }: { children: React.ReactNode }) {
<<<<<<< HEAD
  const router = useRouter();   
=======
  const router = useRouter();
>>>>>>> 687640a364110c573b580e6a98b33ac2f5ffabb8
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