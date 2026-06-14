'use client';

import React, { useState, useEffect, useRef } from 'react';
import { VideoData } from '@/model/video';
import VideoCard from '../VideoCard/VideoCard';

interface VideoFeedProps {
  videos: VideoData[];
  loading: boolean;
  onVideoUpdate: (videoId: string, updates: Partial<VideoData>) => void;
  initialVideoId?: string | null;
  onClearInitialVideoId?: () => void;
}

export default function VideoFeed({ videos, loading, onVideoUpdate, initialVideoId, onClearInitialVideoId }: VideoFeedProps) {
  const [activeId, setActiveId] = useState<string | null>(initialVideoId || null);
  const [isMuted, setIsMuted] = useState(true);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isReady, setIsReady] = useState(!initialVideoId);
  const feedRef = useRef<HTMLDivElement>(null);

  // Set initial active video ID when videos change
  useEffect(() => {
    if (videos.length > 0 && !activeId) {
      setActiveId(initialVideoId || videos[0].id);
    }
  }, [videos, activeId, initialVideoId]);

  // Handle scrolling to initialVideoId instantly when tab transitions
  useEffect(() => {
    if (initialVideoId && feedRef.current) {
      const container = feedRef.current;

      const timer = setTimeout(() => {
        const targetCard = container.querySelector(`[data-video-id="${initialVideoId}"]`);
        if (targetCard) {
          // Temporarily disable smooth scroll to jump instantly
          container.style.scrollBehavior = 'auto';
          targetCard.scrollIntoView({ block: 'start' });
          setActiveId(initialVideoId);

          // Restore smooth scroll in the next frame
          requestAnimationFrame(() => {
            container.style.scrollBehavior = 'smooth';
          });
        }
        setIsReady(true);
        if (onClearInitialVideoId) {
          onClearInitialVideoId();
        }
      }, 60); // 60ms delay ensures React finishes paint and DOM positions are computed

      return () => clearTimeout(timer);
    } else {
      setIsReady(true);
    }
  }, [initialVideoId, videos]);

  // Setup Intersection Observer to monitor viewport entry
  useEffect(() => {
    if (loading) return;

    const container = feedRef.current;
    if (!container) return;

    const observerOptions = {
      root: container, // scroll parent
      rootMargin: '0px',
      threshold: 0.6, // Fire when 60% of the element is visible
    };

    const observer = new IntersectionObserver((entries) => {
      if (!isReady) return; // Ignore intersection changes while scrolling to the initial video!
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const videoId = entry.target.getAttribute('data-video-id');
          if (videoId) {
            setActiveId(videoId);
          }
        }
      });
    }, observerOptions);

    // Observe all video cards
    const cards = container.querySelectorAll('[data-video-id]');
    cards.forEach((card) => observer.observe(card));

    return () => {
      cards.forEach((card) => observer.unobserve(card));
    };
  }, [loading, isReady]);

  const toggleMute = () => {
    setIsMuted((prev) => !prev);
  };

  const showToast = (message: string) => {
    setToastMessage(message);
  };

  // Clear toast message automatically
  useEffect(() => {
    if (toastMessage) {
      const timer = setTimeout(() => {
        setToastMessage(null);
      }, 2500);
      return () => clearTimeout(timer);
    }
  }, [toastMessage]);

  if (loading) {
    return (
      <div className="w-full h-screen flex flex-col justify-center items-center bg-background text-white gap-4">
        {/* Glow neon spinner */}
        <div className="relative w-12 h-12">
          <div className="absolute inset-0 rounded-full border-4 border-t-accent border-r-transparent border-b-transparent border-l-transparent animate-spin z-10"></div>
          <div className="absolute inset-0 rounded-full border-4 border-white/10"></div>
        </div>
        <span className="text-sm font-semibold tracking-wider text-white/50 animate-pulse">Đang tải video...</span>
      </div>
    );
  }

  return (
    <div
      ref={feedRef}
      className={`h-screen overflow-y-scroll snap-y snap-mandatory scroll-smooth relative bg-black w-full transition-opacity duration-200 ${isReady ? 'opacity-100' : 'opacity-0'
        }`}
    >
      {videos.map((video) => (
        <div key={video.id} data-video-id={video.id}>
          <VideoCard
            video={video}
            isActive={video.id === activeId}
            isMuted={isMuted}
            toggleMute={toggleMute}
            onShowToast={showToast}
            onVideoUpdate={onVideoUpdate}
          />
        </div>
      ))}

      {/* Floating Toast Alert Banner */}
      {toastMessage && (
        <div className="fixed top-8 left-1/2 -translate-x-1/2 -translate-y-5 px-6 py-3 rounded-[30px] text-sm font-bold text-white bg-[#16161b]/85 backdrop-blur-[20px] border border-white/15 shadow-[0_10px_30px_rgba(0,0,0,0.6)] z-[9999] flex items-center gap-2.5 pointer-events-none animate-toast-in">
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
}
