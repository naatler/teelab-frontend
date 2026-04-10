"use client";

import Link from "next/link";
import { useAuthStore } from "@/app/store/useAuthStore";
import { useCartStore } from "@/app/store/useCartStore";
import { useRouter } from "next/navigation";
import { useState, useEffect, useRef } from "react";
import { Menu, X } from "lucide-react";
import axios from "@/app/lib/axios";

export default function Navbar() {
  const { user, logout } = useAuthStore();
  const items = useCartStore((state) => state.items);
  const setItems = useCartStore((state) => state.setItems);
  const [openMenu, setOpenMenu] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [mounted, setMounted] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    if (user) {
      fetchCart();
    }
  }, [user, mounted]);

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
      setItems(data?.items || []);
    } catch (error: any) {
      if (error.response?.status === 401 || error.response?.status === 403) {
        console.warn('Cart requires login');
        setItems([]);
      } else {
        console.error('Failed to fetch cart:', error.message);
        setItems([]);
      }
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

  const cartCount = items.reduce((sum, item) => sum + item.quantity, 0);

  const closeMobileMenu = () => setOpenMenu(false);

  return (
    <nav 
      className={`sticky top-0 z-50 transition-all duration-300 ${
        scrolled ? 'bg-neutral-900/95 backdrop-blur-md shadow-lg' : 'bg-transparent'
      }`}
    >
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-20">
          <h1 className="text-3xl font-medium text-lime-300">
            Tee<span className="text-neutral-100">lab</span>
          </h1>

          {/* Desktop Menu */}
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

          {/* Mobile Menu Button */}
          <button 
            className="md:hidden text-white p-2"
            onClick={() => setOpenMenu(!openMenu)}
          >
            {openMenu ? <X size={24} /> : <Menu size={24} />}
          </button>

          <div className="hidden md:flex items-center gap-4">
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

      {/* Mobile Menu */}
      {openMenu && (
        <div className="md:hidden bg-neutral-900/95 backdrop-blur-md absolute top-20 left-0 w-full shadow-lg border-t border-neutral-800">
          <div className="flex flex-col p-4 gap-4">
            <Link 
              href="/landingpage" 
              className="text-neutral-200 py-3 px-4 hover:bg-white/10 rounded-lg transition"
              onClick={closeMobileMenu}
            >
              Home
            </Link>
            <button 
              onClick={() => {
                scrollToStory();
                closeMobileMenu();
              }}
              className="text-neutral-200 py-3 px-4 hover:bg-white/10 rounded-lg transition text-left"
            >
              Our Story
            </button>
            <Link 
              href="/products" 
              className="text-neutral-200 py-3 px-4 hover:bg-white/10 rounded-lg transition"
              onClick={closeMobileMenu}
            >
              Shop Now
            </Link>
            
            <div className="border-t border-neutral-700 pt-4">
              {user && (
                <Link
                  href="/cart"
                  className="text-neutral-200 py-3 px-4 hover:bg-white/10 rounded-lg transition flex items-center justify-between"
                  onClick={closeMobileMenu}
                >
                  Cart
                  {cartCount > 0 && (
                    <span className="bg-lime-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
                      {cartCount > 9 ? '9+' : cartCount}
                    </span>
                  )}
                </Link>
              )}

              {user ? (
                <div className="flex flex-col gap-2 mt-2">
                  <div className="px-4 py-3">
                    <p className="text-white font-medium">{user.name}</p>
                    <p className="text-neutral-400 text-sm">{user.email}</p>
                  </div>
                  
                  {user.role === 'admin' ? (
                    <>
                      <Link href="/admin/products" className="text-neutral-300 py-2.5 px-4 hover:bg-white/10 rounded-lg transition" onClick={closeMobileMenu}>
                        Admin Products
                      </Link>
                      <Link href="/admin/orders" className="text-neutral-300 py-2.5 px-4 hover:bg-white/10 rounded-lg transition" onClick={closeMobileMenu}>
                        Admin Orders
                      </Link>
                    </>
                  ) : (
                    <>
                      <Link href="/orders" className="text-neutral-300 py-2.5 px-4 hover:bg-white/10 rounded-lg transition" onClick={closeMobileMenu}>
                        My Orders
                      </Link>
                      <Link href="/profile/addresses" className="text-neutral-300 py-2.5 px-4 hover:bg-white/10 rounded-lg transition" onClick={closeMobileMenu}>
                        My Addresses
                      </Link>
                    </>
                  )}

                  <button 
                    onClick={() => {
                      handleLogout();
                      closeMobileMenu();
                    }}
                    className="text-red-400 py-2.5 px-4 hover:bg-red-500/10 rounded-lg transition text-left mt-2"
                  >
                    Sign Out
                  </button>
                </div>
              ) : (
                <Link
                  href="/login"
                  className="text-neutral-200 py-3 px-4 hover:bg-white/10 rounded-lg transition mt-2"
                  onClick={closeMobileMenu}
                >
                  Login
                </Link>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}