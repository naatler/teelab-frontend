"use client";

import Link from "next/link";
import { useAuthStore } from "@/app/store/useAuthStore";
import { useCartStore } from "@/app/store/useCartStore";
import { useRouter } from "next/navigation";
import { FiUser } from "react-icons/fi";
import { BsHandbag } from "react-icons/bs";
import { useState } from "react";

export default function Navbar() {
  const { user, logout } = useAuthStore();
  const { items } = useCartStore();
  const [openMenu, setOpenMenu] = useState(false);
  const router = useRouter();

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  const scrollToStory = () => {
    const section = document.getElementById("our-story");
    section?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <nav className="sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-20">
          <div>
            <img
              src="/images/logo.png"
              alt="TeeLab Logo"
              className="h-6 w-auto object-contain"
            />
          </div>
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

            <Link href="/products" className="text-neutral-200 relative group">
              Shop Now
              <span className="absolute left-0 -bottom-1 w-0 h-[2px] bg-white transition-all duration-300 group-hover:w-full"></span>
            </Link>
          </div>
          <div className="flex items-center gap-4">
            {user && (
              <Link
                href="/cart"
                className="relative p-2 hover:bg-white/10 rounded-xl transition duration-300"
              >
                <BsHandbag size={24} color="rgb(229, 231, 235)" />
                {items.length > 0 && (
                  <span className="absolute -top-1 -right-1 bg-lime-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
                    {items.length}
                  </span>
                )}
              </Link>
            )}
            <div className="relative">
              <div
                className="flex items-center gap-3 hover:bg-white/10 rounded-xl transition duration-300 p-2 cursor-pointer"
                onClick={() => {
                  if (!user) router.push("/login");
                  else setOpenMenu(!openMenu);
                }}
              >
                <FiUser size={24} color="rgb(229, 231, 235)" />

                <div className="flex flex-col text-neutral-200">
                  <span className="text-sm font-medium max-w-xs truncate">
                    {user?.name || 'Guest'}
                  </span>
                  <span className="text-xs text-neutral-100">{user?.role || 'Login'}</span>
                </div>
              </div>

              {openMenu && user && (
                <div className="absolute right-0 mt-2 w-40 bg-neutral-900 border border-neutral-800 rounded-lg shadow-lg text-neutral-200">
                  {user.role === 'admin' && (
                    <>
                      <Link
                        href="/admin/products"
                        className="block px-4 py-2 text-sm hover:bg-neutral-800"
                        onClick={() => setOpenMenu(false)}
                      >
                        Products
                      </Link>
                      <Link
                        href="/admin/orders"
                        className="block px-4 py-2 text-sm hover:bg-neutral-800"
                        onClick={() => setOpenMenu(false)}
                      >
                        Orders
                      </Link>
                      <Link
                        href="/admin/categories"
                        className="block px-4 py-2 text-sm hover:bg-neutral-800"
                        onClick={() => setOpenMenu(false)}
                      >
                        Categories
                      </Link>
                    </>
                  )}
                  <Link
                    href="/profile/addresses"
                    className="block px-4 py-2 text-sm hover:bg-neutral-800"
                    onClick={() => setOpenMenu(false)}
                  >
                    My Addresses
                  </Link>
                  <Link
                    href="/orders"
                    className="block px-4 py-2 text-sm hover:bg-neutral-800"
                    onClick={() => setOpenMenu(false)}
                  >
                    My Orders
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="w-full text-left px-4 py-2 text-sm hover:bg-neutral-800 rounded-b-lg"
                  >
                    Logout
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}