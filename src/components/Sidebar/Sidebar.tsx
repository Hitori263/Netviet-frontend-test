'use client';

import React, { useState, useEffect } from 'react';
import { Home, Compass, User as UserIcon, Download } from 'lucide-react';
import { User } from '@/model/user';
import { getCurrentUser } from '@/services/user/getCurrentUser';

interface SidebarProps {
  currentTab: 'home' | 'explore' | 'profile';
  onChangeTab: (tab: 'home' | 'explore' | 'profile') => void;
}

export default function Sidebar({ currentTab, onChangeTab }: SidebarProps) {
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  useEffect(() => {
    getCurrentUser()
      .then((user) => setCurrentUser(user))
      .catch((err) => console.error("Failed to load user:", err));
  }, []);
  return (
    <aside className="fixed left-0 top-0 hidden md:flex flex-col justify-between w-[280px] h-screen p-6 border-r border-glass-border bg-gradient-to-b from-[#09090b]/95 to-[#16161b]/95 backdrop-blur-[20px] z-[100] transition-all duration-300">
      <div className="flex flex-col gap-10">
        {/* SVG logo with gradient */}
        <div className="flex items-center gap-3 text-2xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-accent to-accent-blue pl-2 select-none">
          <svg className="w-8 h-8 text-accent" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <linearGradient id="logoGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#ff3b5c" />
                <stop offset="100%" stopColor="#00f2fe" />
              </linearGradient>
            </defs>
            <path
              d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 14.5v-9l6 4.5-6 4.5z"
              fill="url(#logoGradient)"
            />
          </svg>
          <span>ShortVideo</span>
        </div>

        <nav className="flex flex-col gap-2">
          <button
            onClick={() => onChangeTab('home')}
            className={`group flex items-center gap-4 px-[18px] py-[14px] text-base font-semibold rounded-xl transition-all duration-200 hover:text-white hover:bg-white/5 hover:translate-x-1 ${currentTab === 'home' ? 'text-white bg-white/10 border border-glass-border' : 'text-white/70'
              }`}
          >
            <Home className={`w-5.5 h-5.5 transition-transform duration-200 group-hover:scale-110 ${currentTab === 'home' ? 'text-accent' : ''
              }`} />
            <span>Trang chủ</span>
          </button>

          <button
            onClick={() => onChangeTab('explore')}
            className={`group flex items-center gap-4 px-[18px] py-[14px] text-base font-semibold rounded-xl transition-all duration-200 hover:text-white hover:bg-white/5 hover:translate-x-1 ${currentTab === 'explore' ? 'text-white bg-white/10 border border-glass-border' : 'text-white/70'
              }`}
          >
            <Compass className={`w-5.5 h-5.5 transition-transform duration-200 group-hover:scale-110 ${currentTab === 'explore' ? 'text-accent' : ''
              }`} />
            <span>Khám phá</span>
          </button>

          <button
            onClick={() => onChangeTab('profile')}
            className={`group flex items-center gap-4 px-[18px] py-[14px] text-base font-semibold rounded-xl transition-all duration-200 hover:text-white hover:bg-white/5 hover:translate-x-1 ${currentTab === 'profile' ? 'text-white bg-white/10 border border-glass-border' : 'text-white/70'
              }`}
          >
            <UserIcon className={`w-5.5 h-5.5 transition-transform duration-200 group-hover:scale-110 ${currentTab === 'profile' ? 'text-accent' : ''
              }`} />
            <span>Hồ sơ</span>
          </button>
        </nav>
      </div>

      <div className="flex flex-col gap-4">
        {currentUser && (
          <div className="flex items-center gap-3 p-4 rounded-2xl bg-white/[0.03] border border-glass-border animate-fade-in">
            <img
              src={currentUser.avatar}
              alt="My Avatar"
              className="w-[42px] h-[42px] rounded-full object-cover border-2 border-accent"
            />
            <div className="flex flex-col overflow-hidden">
              <span className="text-sm font-semibold text-white truncate">{currentUser.displayName}</span>
              <span className="text-xs text-white/50 truncate">@{currentUser.username}</span>
            </div>
          </div>
        )}
        <button className="w-full flex items-center justify-center gap-2 py-3 text-sm font-bold bg-gradient-to-r from-accent to-[#ff527b] text-white rounded-xl shadow-[0_4px_15px_rgba(255,59,92,0.3)] hover:-translate-y-0.5 hover:shadow-[0_6px_20px_rgba(255,59,92,0.4)] transition-all duration-200">
          <Download size={16} />
          <span>Tải ứng dụng</span>
        </button>
      </div>
    </aside>
  );
}
