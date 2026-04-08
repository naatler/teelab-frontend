"use client";

import Link from "next/link";
import { useAuthStore } from "@/app/store/useAuthStore";
import { useCartStore } from "@/app/store/useCartStore";
import { useRouter } from "next/navigation";
import { useState, useEffect, useRef } from "react";
import axios from "@/app/lib/axios";

export default function Navbar() {
  const { user, logout } = useAuthStore();
  const { totalItems, setItems } = useCartStore();
  const [openMenu, setOpenMenu] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    if (user) {
      fetchCart();
    }
  }, [user]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setOpenMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const fetchCart = async () => {
    try {
      const { data } = await axios.get('/cart');
      setItems(data.items || []);
    } catch (error) {
      console.error('Failed to fetch cart');
    }
  };

  const handleLogout = () => {
    logout();
    setOpenMenu(false);
    router.push("/login");
  };

  const scrollToStory = () => {
    const section = document.getElementById("our-story");
    section?.scrollIntoView({ behavior: "smooth" });
  };

  const cartCount = totalItems();

  return (
    <nav 
      className={`sticky top-0 z-50 transition-all duration-300 ${
        scrolled ? 'bg-neutral-900/95 backdrop-blur-md shadow-lg' : 'bg-transparent'
      }`}
    >
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-20">
          {/* Logo */}
          <Link href="/landingpage" className="flex-shrink-0">
            <img
              src="/images/logo.png"
              alt="TeeLab"
              className="h-6 w-auto object-contain"
            />
          </Link>

          {/* Navigation Links - Desktop */}
          <div className="hidden md:flex items-center w-full px-28">
            <Link 
              href="/landingpage" 
              className="text-neutral-200 relative group"
            >
              Home
              <span className="absolute left-0 -bottom-1 w-0 h-[2px] bg-white transition-all duration-300 group-hover:w-full"></span>
            </Link>

            <div className="mx-auto flex gap-16">
              <button 
                onClick={scrollToStory}
                className="text-neutral-200 relative group"
              >
                Our Story
                <span className="absolute left-0 -bottom-1 w-0 h-[2px] bg-white transition-all duration-300 group-hover:w-full"></span>
              </button>
            </div>

            <Link 
              href="/products" 
              className="text-neutral-200 relative group"
            >
              Shop Now
              <span className="absolute left-0 -bottom-1 w-0 h-[2px] bg-white transition-all duration-300 group-hover:w-full"></span>
            </Link>
          </div>

          {/* Right Side - Cart & User */}
          <div className="flex items-center gap-4">
            {user && (
              <Link
                href="/cart"
                className="relative p-2 hover:bg-white/10 rounded-xl transition duration-300"
              >
                <svg className="w-5 h-5 text-neutral-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
                {cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-lime-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
                    {cartCount > 9 ? '9+' : cartCount}
                  </span>
                )}
              </Link>
            )}

            {/* User Menu */}
            <div className="relative" ref={menuRef}>
              <button
                className="flex items-center gap-3 hover:bg-white/10 rounded-xl transition duration-300 p-2 cursor-pointer"
                onClick={() => {
                  if (!user) router.push("/login");
                  else setOpenMenu(!openMenu);
                }}
              >
                <div className="w-8 h-8 rounded-full bg-lime-600 flex items-center justify-center">
                  <span className="text-white text-sm font-medium">
                    {user?.name?.charAt(0).toUpperCase() || 'G'}
                  </span>
                </div>
                <div className="flex flex-col text-neutral-200">
                  <span className="text-sm font-medium max-w-xs truncate">
                    {user?.name?.split(' ')[0] || 'Guest'}
                  </span>
                </div>
                {user && (
                  <svg className={`w-4 h-4 text-neutral-400 transition-transform duration-200 ${openMenu ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                )}
              </button>

              {/* Dropdown Menu */}
              {openMenu && user && (
                <div className="absolute right-0 mt-2 w-56 bg-neutral-800/95 backdrop-blur-md rounded-xl shadow-xl border border-neutral-700/50 overflow-hidden">
                  <div className="px-4 py-3 border-b border-neutral-700">
                    <p className="text-sm font-medium text-white truncate">{user.name}</p>
                    <p className="text-xs text-neutral-400 truncate">{user.email}</p>
                  </div>
                  
                  <div className="py-1">
                    {user.role === 'admin' ? (
                      <>
                        <Link href="/admin/products" className="flex items-center gap-3 px-4 py-2.5 text-sm text-neutral-300 hover:bg-neutral-700/50 hover:text-white transition-colors" onClick={() => setOpenMenu(false)}>
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" /></svg>
                          Products
                        </Link>
                        <Link href="/admin/orders" className="flex items-center gap-3 px-4 py-2.5 text-sm text-neutral-300 hover:bg-neutral-700/50 hover:text-white transition-colors" onClick={() => setOpenMenu(false)}>
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>
                          Orders
                        </Link>
                        <Link href="/admin/categories" className="flex items-center gap-3 px-4 py-2.5 text-sm text-neutral-300 hover:bg-neutral-700/50 hover:text-white transition-colors" onClick={() => setOpenMenu(false)}>
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" /></svg>
                          Categories
                        </Link>
                      </>
                    ) : (
                      <>
                        <Link href="/profile/addresses" className="flex items-center gap-3 px-4 py-2.5 text-sm text-neutral-300 hover:bg-neutral-700/50 hover:text-white transition-colors" onClick={() => setOpenMenu(false)}>
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                          My Addresses
                        </Link>
                        <Link href="/orders" className="flex items-center gap-3 px-4 py-2.5 text-sm text-neutral-300 hover:bg-neutral-700/50 hover:text-white transition-colors" onClick={() => setOpenMenu(false)}>
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>
                          My Orders
                        </Link>
                      </>
                    )}
                  </div>
                  
                  <div className="border-t border-neutral-700 py-1">
                    <button 
                      onClick={handleLogout}
                      className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-400 hover:bg-red-500/10 transition-colors"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                      </svg>
                      Sign Out
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}