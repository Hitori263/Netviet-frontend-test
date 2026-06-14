'use client';

import React, { useState, useEffect } from 'react';
import Sidebar from '@/components/Sidebar/Sidebar';
import BottomNav from '@/components/BottomNav/BottomNav';
import VideoFeed from '@/components/VideoFeed/VideoFeed';
import { getVideos } from '@/services/video/getVideos';
import { VideoData } from '@/model/video';
import { User } from '@/model/user';
import { getCurrentUser } from '@/services/user/getCurrentUser';
import { Search, Heart, Play, ArrowLeft } from 'lucide-react';

export default function Home() {
  const [currentTab, setCurrentTab] = useState<'home' | 'explore' | 'profile'>('home');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTag, setActiveTag] = useState('Tất cả');
  const [videos, setVideos] = useState<VideoData[]>([]);
  const [loading, setLoading] = useState(true);
  const [initialVideoId, setInitialVideoId] = useState<string | null>(null);
  const [activeModalVideoId, setActiveModalVideoId] = useState<string | null>(null);
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  // Load current user profile on mount
  useEffect(() => {
    getCurrentUser()
      .then((user) => setCurrentUser(user))
      .catch((err) => console.error("Failed to load user:", err));
  }, []);

  // Load initial video from URL query parameter on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const queryVideoId = params.get('videoId');
      if (queryVideoId) {
        setInitialVideoId(queryVideoId);
      }
    }
  }, []);

  // Load videos from API on mount
  useEffect(() => {
    let active = true;
    getVideos()
      .then((data) => {
        if (active) {
          setVideos(data);
          setLoading(false);
        }
      })
      .catch((err) => {
        console.error("Failed to load videos:", err);
        if (active) {
          setLoading(false);
        }
      });
    return () => {
      active = false;
    };
  }, []);

  const handleVideoUpdate = (videoId: string, updates: Partial<VideoData>) => {
    setVideos((prev) =>
      prev.map((v) => (v.id === videoId ? { ...v, ...updates } : v))
    );
  };

  const tags = ['Tất cả', 'Xu hướng', 'Nghệ thuật', 'Thiên nhiên', 'Giải trí', 'Học tập'];

  // Handle switching tabs
  const handleTabChange = (tab: 'home' | 'explore' | 'profile') => {
    setActiveModalVideoId(null);
    setInitialVideoId(null);
    setCurrentTab(tab);
  };

  // Helper function to format likes/metrics
  const formatMetric = (count: number) => {
    if (count === undefined || count === null) {
      return '0';
    }
    if (count >= 10000) {
      return (count / 1000).toFixed(1).replace('.0', '') + 'K';
    }
    return count.toLocaleString('vi-VN');
  };

  // Render content based on active tab
  const renderContent = () => {
    switch (currentTab) {
      case 'home':
        return (
          <VideoFeed
            videos={videos}
            loading={loading}
            onVideoUpdate={handleVideoUpdate}
            initialVideoId={initialVideoId}
            onClearInitialVideoId={() => setInitialVideoId(null)}
          />
        );

      case 'explore':
        // Filter videos based on search
        const filteredVideos = videos.filter((v) => {
          const matchesSearch = v.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
            v.authorName.toLowerCase().includes(searchQuery.toLowerCase());
          return matchesSearch;
        });

        return (
          <div className="w-full h-full relative overflow-hidden">
            {activeModalVideoId && currentTab === 'explore' ? (
              <div className="absolute inset-0 bg-black z-[150] flex flex-col">
                <button
                  onClick={() => setActiveModalVideoId(null)}
                  className="absolute top-6 left-6 z-[1000] w-[42px] h-[42px] rounded-full flex items-center justify-center text-white bg-black/60 backdrop-blur-md border border-white/10 transition-all duration-200 hover:bg-black/80 hover:scale-105"
                  aria-label="Quay lại"
                >
                  <ArrowLeft size={22} />
                </button>
                <VideoFeed
                  videos={videos}
                  loading={loading}
                  onVideoUpdate={handleVideoUpdate}
                  initialVideoId={activeModalVideoId}
                  onClearInitialVideoId={() => { }}
                />
              </div>
            ) : null}

            <div className="w-full h-full overflow-y-auto p-10 max-md:p-6 pb-[120px] max-md:pb-[100px] bg-gradient-to-tr from-accent/5 via-transparent to-accent-blue/5 flex flex-col gap-8">
              <h1 className="text-3xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-white/70">
                Khám phá
              </h1>

              {/* Search Input */}
              <div className="w-full max-w-[500px] bg-white/5 border border-glass-border rounded-xl px-5 py-3.5 flex items-center gap-3 transition-colors duration-200 focus-within:border-accent flex-shrink-0">
                <Search size={20} className="text-white/40" />
                <input
                  type="text"
                  placeholder="Tìm kiếm nội dung hoặc tác giả..."
                  className="flex-1 text-sm bg-transparent border-none outline-none placeholder-white/30 text-white"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>

              {/* Simulated Tags */}
              <div className="flex gap-2.5 overflow-x-auto py-2 select-none flex-shrink-0">
                {tags.map((tag) => (
                  <button
                    key={tag}
                    className={`whitespace-nowrap px-4 py-2 rounded-full border text-xs font-semibold transition-all duration-200 ${activeTag === tag
                      ? 'bg-accent text-white border-accent'
                      : 'bg-white/5 border-glass-border text-white/80 hover:bg-white/8 hover:border-white/20'
                      }`}
                    onClick={() => setActiveTag(tag)}
                  >
                    {tag}
                  </button>
                ))}
              </div>

              {/* Grid of video thumbnails */}
              <div className="grid grid-cols-[repeat(auto-fill,minmax(200px,1fr))] gap-5 max-sm:grid-cols-2 max-sm:gap-3">
                {filteredVideos.map((video) => (
                  <div
                    key={video.id}
                    className="relative aspect-[9/16] rounded-2xl overflow-hidden bg-[#121214] border border-glass-border cursor-pointer transition-transform duration-300 hover:-translate-y-1 group"
                    onClick={() => {
                      setActiveModalVideoId(video.id);
                    }} // Play in overlay modal
                  >
                    <video
                      src={video.videoUrl}
                      className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity duration-200"
                      preload="metadata"
                      muted
                      playsInline
                    />
                    <div className="absolute inset-x-0 bottom-0 p-4 bg-gradient-to-t from-black/80 to-transparent flex items-center justify-between text-xs font-bold text-white">
                      <span className="flex items-center gap-1">
                        <Play size={12} fill="white" />
                        {formatMetric(video.playsCount)}
                      </span>
                      <span className="flex items-center gap-1">
                        <Heart size={12} fill="white" />
                        {formatMetric(video.likesCount)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );

      case 'profile':
        return (
          <div className="w-full h-full relative overflow-hidden">
            {activeModalVideoId && currentTab === 'profile' ? (
              <div className="absolute inset-0 bg-black z-[150] flex flex-col">
                <button
                  onClick={() => setActiveModalVideoId(null)}
                  className="absolute top-6 left-6 z-[1000] w-[42px] h-[42px] rounded-full flex items-center justify-center text-white bg-black/60 backdrop-blur-md border border-white/10 transition-all duration-200 hover:bg-black/80 hover:scale-105"
                  aria-label="Quay lại"
                >
                  <ArrowLeft size={22} />
                </button>
                <VideoFeed
                  videos={videos}
                  loading={loading}
                  onVideoUpdate={handleVideoUpdate}
                  initialVideoId={activeModalVideoId}
                  onClearInitialVideoId={() => { }}
                />
              </div>
            ) : null}

            <div className="w-full h-full overflow-y-auto p-10 max-md:p-6 pb-[120px] max-md:pb-[100px] bg-gradient-to-tr from-accent/5 via-transparent to-accent-blue/5 flex flex-col gap-8">
              {/* Profile Header */}
              {currentUser && (
                <div className="flex gap-8 items-center border-b border-glass-border pb-8 max-sm:flex-col max-sm:text-center max-sm:gap-5 animate-fade-in">
                  <img
                    src={currentUser.avatar}
                    alt="My Profile Avatar"
                    className="w-[110px] h-[110px] rounded-full object-cover border-3 border-accent shadow-[0_8px_25px_rgba(255,59,92,0.25)]"
                  />
                  <div className="flex flex-col gap-3 flex-1">
                    <div className="flex items-center gap-4 flex-wrap max-sm:justify-center">
                      <h2 className="text-2xl font-extrabold">{currentUser.username}</h2>
                      <button className="px-4 py-2 rounded-lg text-[13.5px] font-bold border border-glass-border bg-white/5 hover:bg-white/8 hover:border-white/20 transition-all duration-200">
                        Sửa hồ sơ
                      </button>
                    </div>
                    <div className="flex gap-6 text-[15px] max-sm:justify-center">
                      <div>
                        <span className="font-extrabold text-white">{formatMetric(currentUser.followingCount)}</span>
                        <span className="text-white/50 ml-1">Đang follow</span>
                      </div>
                      <div>
                        <span className="font-extrabold text-white">{formatMetric(currentUser.followersCount)}</span>
                        <span className="text-white/50 ml-1">Follower</span>
                      </div>
                      <div>
                        <span className="font-extrabold text-white">{formatMetric(currentUser.likesReceivedCount)}</span>
                        <span className="text-white/50 ml-1">Thích</span>
                      </div>
                    </div>
                    <p className="text-[14.5px] leading-relaxed text-white/80">
                      {currentUser.bio}
                    </p>
                  </div>
                </div>
              )}

              {/* Grid of my videos */}
              <div>
                <h3 className="mb-5 text-lg font-bold text-white">Video đã đăng</h3>
                <div className="grid grid-cols-[repeat(auto-fill,minmax(200px,1fr))] gap-5 max-sm:grid-cols-2 max-sm:gap-3">
                  {videos.slice(0, 3).map((video) => (
                    <div
                      key={video.id}
                      className="relative aspect-[9/16] rounded-2xl overflow-hidden bg-[#121214] border border-glass-border cursor-pointer transition-transform duration-300 hover:-translate-y-1 group"
                      onClick={() => {
                        setActiveModalVideoId(video.id);
                      }}
                    >
                      <video
                        src={video.videoUrl}
                        className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity duration-200"
                        preload="metadata"
                        muted
                        playsInline
                      />
                      <div className="absolute inset-x-0 bottom-0 p-4 bg-gradient-to-t from-black/80 to-transparent flex items-center justify-between text-xs font-bold text-white">
                        <span className="flex items-center gap-1">
                          <Play size={12} fill="white" />
                          {formatMetric(video.playsCount)}
                        </span>
                        <span className="flex items-center gap-1">
                          <Heart size={12} fill="white" />
                          {formatMetric(video.likesCount)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <main className="flex w-screen h-screen bg-background text-foreground overflow-hidden relative">
      {/* Sidebar - Visible on Desktop */}
      <Sidebar currentTab={currentTab} onChangeTab={handleTabChange} />

      {/* Main content viewport */}
      <div className="flex-1 h-screen relative overflow-hidden md:ml-[280px]">
        {renderContent()}
      </div>

      {/* BottomNav - Visible on Mobile */}
      <BottomNav currentTab={currentTab} onChangeTab={handleTabChange} />
    </main>
  );
}
