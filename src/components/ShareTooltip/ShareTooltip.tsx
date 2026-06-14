'use client';

import React, { useEffect, useRef } from 'react';
import { Link2, Code } from 'lucide-react';

interface ShareTooltipProps {
  isOpen: boolean;
  onClose: () => void;
  videoId: string;
  onShowToast: (message: string) => void;
}

// Custom inline SVG icons for social media to avoid library mismatch
const FacebookIcon = ({ size = 16, className = '' }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
  </svg>
);

const TwitterIcon = ({ size = 16, className = '' }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z" />
  </svg>
);

export default function ShareTooltip({ isOpen, onClose, videoId, onShowToast }: ShareTooltipProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        onClose();
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleCopyLink = async () => {
    try {
      const shareUrl = `${window.location.origin}/?videoId=${videoId}`;
      await navigator.clipboard.writeText(shareUrl);
      onShowToast('Đã sao chép liên kết vào bộ nhớ tạm! 📋');
    } catch {
      onShowToast('Không thể sao chép liên kết.');
    }
    onClose();
  };

  const handleShareClick = (platform: string) => {
    onShowToast(`Đang chia sẻ lên ${platform}... 🚀`);
    onClose();
  };

  return (
    <div
      ref={containerRef}
      className="absolute bottom-0 right-[55px] w-[200px] rounded-2xl p-2 flex flex-col gap-1 bg-[#16161b]/95 backdrop-blur-[20px] border border-glass-border shadow-[0_10px_25px_rgba(0,0,0,0.5)] z-50 animate-fade-in"
    >
      <button className="flex items-center gap-3 p-2.5 text-xs font-semibold text-white/85 rounded-lg w-full transition-all duration-150 hover:bg-white/8 hover:text-white group" onClick={handleCopyLink}>
        <Link2 size={16} className="text-white/50 group-hover:text-accent transition-colors duration-150" />
        <span>Sao chép liên kết</span>
      </button>

      <button className="flex items-center gap-3 p-2.5 text-xs font-semibold text-white/85 rounded-lg w-full transition-all duration-150 hover:bg-white/8 hover:text-white group" onClick={() => handleShareClick('Facebook')}>
        <FacebookIcon size={16} className="text-white/50 group-hover:text-accent transition-colors duration-150" />
        <span>Facebook</span>
      </button>

      <button className="flex items-center gap-3 p-2.5 text-xs font-semibold text-white/85 rounded-lg w-full transition-all duration-150 hover:bg-white/8 hover:text-white group" onClick={() => handleShareClick('Twitter')}>
        <TwitterIcon size={16} className="text-white/50 group-hover:text-accent transition-colors duration-150" />
        <span>Twitter / X</span>
      </button>

      <button className="flex items-center gap-3 p-2.5 text-xs font-semibold text-white/85 rounded-lg w-full transition-all duration-150 hover:bg-white/8 hover:text-white group" onClick={() => handleShareClick('Mã nhúng')}>
        <Code size={16} className="text-white/50 group-hover:text-accent transition-colors duration-150" />
        <span>Nhúng video</span>
      </button>
    </div>
  );
}
