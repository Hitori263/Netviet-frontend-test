'use client';

import React from 'react';
import { Home, Compass, User } from 'lucide-react';

interface BottomNavProps {
  currentTab: 'home' | 'explore' | 'profile';
  onChangeTab: (tab: 'home' | 'explore' | 'profile') => void;
}

export default function BottomNav({ currentTab, onChangeTab }: BottomNavProps) {
  return (
    <nav className="fixed bottom-0 left-0 right-0 h-16 flex justify-around items-center bg-[#09090b]/85 backdrop-blur-[20px] border-t border-glass-border z-[100] pb-[env(safe-area-inset-bottom)] md:hidden">
      <button
        onClick={() => onChangeTab('home')}
        className={`flex flex-col items-center justify-center gap-1 w-1/3 h-full text-[10px] font-medium transition-all duration-200 ${
          currentTab === 'home' ? 'text-accent' : 'text-white/60'
        }`}
      >
        <Home className="w-5.5 h-5.5 transition-transform duration-200 active:scale-110" />
        <span>Trang chủ</span>
      </button>

      <button
        onClick={() => onChangeTab('explore')}
        className={`flex flex-col items-center justify-center gap-1 w-1/3 h-full text-[10px] font-medium transition-all duration-200 ${
          currentTab === 'explore' ? 'text-accent' : 'text-white/60'
        }`}
      >
        <Compass className="w-5.5 h-5.5 transition-transform duration-200 active:scale-110" />
        <span>Khám phá</span>
      </button>

      <button
        onClick={() => onChangeTab('profile')}
        className={`flex flex-col items-center justify-center gap-1 w-1/3 h-full text-[10px] font-medium transition-all duration-200 ${
          currentTab === 'profile' ? 'text-accent' : 'text-white/60'
        }`}
      >
        <User className="w-5.5 h-5.5 transition-transform duration-200 active:scale-110" />
        <span>Hồ sơ</span>
      </button>
    </nav>
  );
}
