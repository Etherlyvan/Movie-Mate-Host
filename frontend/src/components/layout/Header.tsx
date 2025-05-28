"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { Search, Film, Bell, User } from "lucide-react";
import { useAuthStore } from "@/stores/authStore";

export const Header: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  const { user, isAuthenticated, logout } = useAuthStore();

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/movies/search?q=${encodeURIComponent(searchQuery)}`);
      setSearchQuery("");
      setIsMenuOpen(false);
    }
  };

  const isActivePath = (path: string) => pathname === path;

  const navItems = [
    { href: "/", label: "Home" },
    { href: "/movies", label: "Movies" },
    { href: "/movies/trending", label: "Trending" },
    { href: "/movies/search", label: "Search" },
  ];

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          isScrolled
            ? "bg-gray-900/95 backdrop-blur-md shadow-lg border-b border-gray-800"
            : "bg-transparent"
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16 lg:h-20">
            {/* Logo Section */}
            <div className="flex items-center space-x-8">
              <Link href="/" className="flex items-center space-x-3 group">
                <div className="relative">
                  <Film className="h-8 w-8 lg:h-10 lg:w-10 text-red-600 group-hover:text-red-500 transition-colors" />
                  <div className="absolute -inset-1 bg-red-600/20 rounded-full opacity-0 group-hover:opacity-100 transition-opacity blur-sm" />
                </div>
                <span className="text-xl lg:text-2xl font-black text-white group-hover:text-red-400 transition-colors">
                  Movie<span className="text-red-600">Mate</span>
                </span>
              </Link>

              {/* Desktop Navigation */}
              <nav className="hidden lg:flex items-center space-x-1">
                {navItems.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`relative px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
                      isActivePath(item.href)
                        ? "text-white bg-white/10"
                        : "text-gray-300 hover:text-white hover:bg-white/5"
                    }`}
                  >
                    {item.label}
                    {isActivePath(item.href) && (
                      <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-red-600 rounded-full" />
                    )}
                  </Link>
                ))}
              </nav>
            </div>

            {/* Search & User Section */}
            <div className="flex items-center space-x-4">
              {/* Desktop Search */}
              <div className="hidden md:block">
                <form onSubmit={handleSearch} className="relative group">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4 group-focus-within:text-white transition-colors" />
                    <input
                      type="text"
                      placeholder="Search movies, shows..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-64 lg:w-80 pl-10 pr-4 py-2.5 bg-gray-800/50 border border-gray-700/50 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-600/50 focus:border-red-600/50 focus:bg-gray-800/80 transition-all duration-200"
                    />
                  </div>
                </form>
              </div>
              {/* Notifications */}
              <button
                className="hidden md:flex relative p-2 text-gray-400 hover:text-white transition-colors rounded-lg hover:bg-white/5"
                title="Notifications"
                aria-label="Notifications"
              >
                <Bell className="h-5 w-5" />
                <div className="absolute top-1 right-1 w-2 h-2 bg-red-600 rounded-full" />
              </button>
              {/* User Menu */}
              
              {/* Sign In Button */}
              {isAuthenticated ? (
                <div className="relative">
                  <button
                    onClick={() => setShowUserMenu(!showUserMenu)}
                    className="flex items-center space-x-2 text-gray-300 hover:text-white transition-colors"
                  >
                    <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                      {user?.profile?.avatar ? (
                        <img
                          src={user.profile.avatar}
                          alt={user.username}
                          className="w-full h-full rounded-full"
                        />
                      ) : (
                        <User className="h-4 w-4 text-white" />
                      )}
                    </div>
                    <span className="text-sm">{user?.username}</span>
                  </button>

                  {showUserMenu && (
                    <div className="absolute right-0 top-12 w-48 bg-gray-900/95 backdrop-blur-md rounded-lg shadow-2xl border border-gray-800 py-2">
                      <Link
                        href="/profile"
                        className="block px-4 py-2 text-gray-300 hover:text-white hover:bg-white/5 transition-colors"
                      >
                        Profile
                      </Link>
                      <Link
                        href="/watchlist"
                        className="block px-4 py-2 text-gray-300 hover:text-white hover:bg-white/5 transition-colors"
                      >
                        My Watchlist
                      </Link>
                      <Link
                        href="/settings"
                        className="block px-4 py-2 text-gray-300 hover:text-white hover:bg-white/5 transition-colors"
                      >
                        Settings
                      </Link>
                      <hr className="my-2 border-gray-800" />
                      <button
                        onClick={logout}
                        className="block w-full text-left px-4 py-2 text-gray-300 hover:text-white hover:bg-white/5 transition-colors"
                      >
                        Sign Out
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <Link
                  href="/login"
                  className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold py-2 px-6 rounded-lg transition-all duration-200 transform hover:scale-105"
                >
                  Sign In
                </Link>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Backdrop for mobile menu */}
      {isMenuOpen && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setIsMenuOpen(false)}
        />
      )}
    </>
  );
};
