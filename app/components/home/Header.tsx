'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useAuth } from '@/lib/contexts/AuthContext';

export function Header() {
  const router = useRouter();
  const { user, logout, isAuthenticated, loading } = useAuth();
  const [showUserMenu, setShowUserMenu] = useState(false);

  const handleLogout = () => {
    logout();
    setShowUserMenu(false);
    router.push('/');
  };

  return (
    <div className="bg-white shadow-sm border-b sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        <Link href="/" className="text-2xl font-bold text-indigo-600 hover:text-indigo-700 transition">
          📚 Quizzy
        </Link>
        
        {/* User Menu */}
        <div className="flex items-center gap-3">
          {!loading && isAuthenticated && user ? (
            <div className="relative">
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-gray-100 transition"
              >
                <span className="text-2xl">👤</span>
                <span className="font-medium text-gray-700">{user.name}</span>
                <span className={`text-gray-500 transition ${showUserMenu ? 'rotate-180' : ''}`}>▼</span>
              </button>

              {showUserMenu && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-xl border border-gray-200 py-2 z-50">
                  <Link
                    href="/profile"
                    className="block px-4 py-2 hover:bg-gray-100 text-gray-700"
                    onClick={() => setShowUserMenu(false)}
                  >
                    👤 Hồ sơ
                  </Link>
                  <Link
                    href="/history"
                    className="block px-4 py-2 hover:bg-gray-100 text-gray-700"
                    onClick={() => setShowUserMenu(false)}
                  >
                    📝 Lịch sử làm bài
                  </Link>
                  <Link
                    href="/bookmarks"
                    className="block px-4 py-2 hover:bg-gray-100 text-gray-700"
                    onClick={() => setShowUserMenu(false)}
                  >
                    ⭐ Bài thi đã lưu
                  </Link>
                  <Link
                    href="/watchlist"
                    className="block px-4 py-2 hover:bg-gray-100 text-gray-700"
                    onClick={() => setShowUserMenu(false)}
                  >
                    👁 Đang theo dõi
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="w-full text-left px-4 py-2 hover:bg-gray-100 text-gray-700 border-t"
                  >
                    🚪 Đăng xuất
                  </button>
                </div>
              )}
            </div>
          ) : !loading ? (
            <>
              <button
                onClick={() => router.push('/auth/login')}
                className="px-6 py-2 bg-white text-indigo-600 border-2 border-indigo-600 rounded-lg hover:bg-indigo-50 transition font-medium"
              >
                Đăng nhập
              </button>
              <button
                onClick={() => router.push('/auth/register')}
                className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition font-medium"
              >
                Đăng ký
              </button>
            </>
          ) : (
            <div className="w-24 h-10 bg-gray-200 rounded-lg animate-pulse"></div>
          )}
        </div>
      </div>
    </div>
  );
}
