'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Heart, MessageSquare, Share2, Volume2, VolumeX, Play, Pause, Music, Plus } from 'lucide-react';
import { VideoData } from '@/model/video';
import { likeVideo } from '@/services/video/likeVideo';
import CommentsPanel from '../CommentsPanel/CommentsPanel';
import ShareTooltip from '../ShareTooltip/ShareTooltip';

interface VideoCardProps {
  video: VideoData;
  isActive: boolean;
  isMuted: boolean;
  toggleMute: () => void;
  onShowToast: (message: string) => void;
  onVideoUpdate?: (videoId: string, updates: Partial<VideoData>) => void;
}

interface FloatingHeart {
  id: number;
  x: number;
  y: number;
}

export default function VideoCard({ video, isActive, isMuted, toggleMute, onShowToast, onVideoUpdate }: VideoCardProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [isFollowed, setIsFollowed] = useState(false);
  const [descExpanded, setDescExpanded] = useState(false);
  const [descOverflow, setDescOverflow] = useState(false);
  const descRef = useRef<HTMLParagraphElement>(null);

  // Check if description text overflows 3 lines
  useEffect(() => {
    if (descRef.current) {
      const timer = setTimeout(() => {
        if (descRef.current) {
          setDescOverflow(descRef.current.scrollHeight > descRef.current.clientHeight);
        }
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [video.description]);

  // Overlays
  const [commentsOpen, setCommentsOpen] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);

  // Floating heart arrays on double-tap
  const [hearts, setHearts] = useState<FloatingHeart[]>([]);

  const videoRef = useRef<HTMLVideoElement>(null);
  const lastTap = useRef<number>(0);
  // Load liked state from localStorage on mount
  useEffect(() => {
    const likedVideos = JSON.parse(localStorage.getItem('likedVideos') || '[]');
    setIsLiked(likedVideos.includes(video.id));
  }, [video.id]);

  // Load follow state from localStorage on mount
  useEffect(() => {
    const followedAuthors = JSON.parse(localStorage.getItem('followedAuthors') || '[]');
    setIsFollowed(followedAuthors.includes(video.authorName));
  }, [video.authorName]);

  // Handle active video (viewport entry/exit)
  useEffect(() => {
    if (!videoRef.current) return;

    if (isActive) {
      const playPromise = videoRef.current.play();
      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            setIsPlaying(true);
          })
          .catch((error) => {
            console.log("Autoplay prevented:", error);
            setIsPlaying(false);
          });
      }
    } else {
      videoRef.current.pause();
      videoRef.current.currentTime = 0;
      setIsPlaying(false);
      // Close open states if user scrolls away
      setCommentsOpen(false);
      setShareOpen(false);
    }
  }, [isActive]);

  // Synchronize mute state
  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.muted = isMuted;
    }
  }, [isMuted]);

  // Trigger play/pause manually
  const handleVideoClick = () => {
    if (!videoRef.current) return;

    if (isPlaying) {
      videoRef.current.pause();
      setIsPlaying(false);
    } else {
      const playPromise = videoRef.current.play();
      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            setIsPlaying(true);
          })
          .catch((err) => {
            console.error("Manual play failed:", err);
          });
      }
    }
  };

  // Detect double tap for Heart Spawn
  const handleTap = (e: React.MouseEvent<HTMLVideoElement>) => {
    const now = Date.now();
    const DOUBLE_PRESS_DELAY = 300;
    if (now - lastTap.current < DOUBLE_PRESS_DELAY) {
      // Double tap detected
      handleDoubleTap(e);
    } else {
      // Single tap
      handleVideoClick();
    }
    lastTap.current = now;
  };

  const handleDoubleTap = async (e: React.MouseEvent) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const newHeart = {
      id: Date.now() + Math.random(),
      x,
      y,
    };

    setHearts((prev) => [...prev, newHeart]);

    if (!isLiked) {
      setIsLiked(true);
      const likedVideos = JSON.parse(localStorage.getItem('likedVideos') || '[]');
      if (!likedVideos.includes(video.id)) {
        likedVideos.push(video.id);
        localStorage.setItem('likedVideos', JSON.stringify(likedVideos));
      }

      try {
        const res = await likeVideo(video.id, true);
        if (onVideoUpdate) {
          onVideoUpdate(video.id, { likesCount: res.likesCount });
        }
      } catch (err) {
        console.error("Failed to double tap like:", err);
        setIsLiked(false);
        const likedVideosRollback = JSON.parse(localStorage.getItem('likedVideos') || '[]');
        const index = likedVideosRollback.indexOf(video.id);
        if (index > -1) {
          likedVideosRollback.splice(index, 1);
          localStorage.setItem('likedVideos', JSON.stringify(likedVideosRollback));
        }
      }
    }
  };

  // Clean up floating hearts after animation completes
  const removeHeart = (heartId: number) => {
    setHearts((prev) => prev.filter((h) => h.id !== heartId));
  };

  const handleCommentCountChange = (newCount: number) => {
    onShowToast('Đã đăng bình luận! 💬');
    if (onVideoUpdate) {
      onVideoUpdate(video.id, { commentsCount: newCount });
    }
  };

  const handleLikeClick = async () => {
    const nextLikedState = !isLiked;
    setIsLiked(nextLikedState);

    const likedVideos = JSON.parse(localStorage.getItem('likedVideos') || '[]');
    if (nextLikedState) {
      if (!likedVideos.includes(video.id)) {
        likedVideos.push(video.id);
      }
    } else {
      const index = likedVideos.indexOf(video.id);
      if (index > -1) {
        likedVideos.splice(index, 1);
      }
    }
    localStorage.setItem('likedVideos', JSON.stringify(likedVideos));

    try {
      const res = await likeVideo(video.id, nextLikedState);
      if (onVideoUpdate) {
        onVideoUpdate(video.id, { likesCount: res.likesCount });
      }
    } catch (err) {
      console.error("Failed to toggle like:", err);
      // Rollback
      setIsLiked(!nextLikedState);
      const likedVideosRollback = JSON.parse(localStorage.getItem('likedVideos') || '[]');
      if (!nextLikedState) {
        if (!likedVideosRollback.includes(video.id)) likedVideosRollback.push(video.id);
      } else {
        const index = likedVideosRollback.indexOf(video.id);
        if (index > -1) likedVideosRollback.splice(index, 1);
      }
      localStorage.setItem('likedVideos', JSON.stringify(likedVideosRollback));
      onShowToast('Không thể thực hiện tương tác.');
    }
  };

  const formatCount = (count: number) => {
    if (count >= 10000) {
      return (count / 1000).toFixed(1).replace('.0', '') + 'K';
    }
    return count.toLocaleString('vi-VN');
  };

  return (
    <div className="w-full h-screen snap-start snap-always flex justify-center items-center bg-black relative">
      <div className="relative w-full h-full md:max-w-[56.25vh] bg-[#050505] overflow-hidden shadow-[0_0_100px_rgba(0,0,0,0.8)] flex justify-center items-center">
        {/* HTML5 Video element */}
        <video
          ref={videoRef}
          src={video.videoUrl}
          className="w-full h-full object-cover cursor-pointer"
          loop
          playsInline
          muted={isMuted}
          onClick={handleTap}
        />

        {/* Ambient Top & Bottom Shadow Gradients */}
        <div className="absolute inset-x-0 top-0 h-[120px] bg-gradient-to-b from-black/60 to-transparent z-[5] pointer-events-none" />
        <div className="absolute inset-x-0 bottom-0 h-[220px] bg-gradient-to-t from-black/85 to-transparent z-[5] pointer-events-none" />

        {/* Sound toggle overlay */}
        <button
          className="absolute top-6 right-5 z-10 w-[42px] h-[42px] rounded-full flex items-center justify-center text-white bg-black/50 backdrop-blur-md border border-white/10 transition-all duration-200 hover:bg-black/70 hover:scale-105"
          onClick={toggleMute}
          aria-label="Toggle Mute"
        >
          {isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
        </button>

        {/* Center persistent Play indicator when paused */}
        {!isPlaying && isActive && (
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none z-[15] text-white bg-black/50 rounded-full w-[70px] h-[70px] flex items-center justify-center backdrop-blur-md border border-white/10 shadow-[0_10px_25px_rgba(0,0,0,0.4)] animate-play-btn">
            <Play size={32} fill="white" className="text-white ml-1" />
          </div>
        )}

        {/* Double tap floating hearts layer */}
        {hearts.map((heart) => (
          <svg
            key={heart.id}
            className="double-tap-heart"
            style={{ left: heart.x, top: heart.y }}
            viewBox="0 0 24 24"
            fill="currentColor"
            width="60"
            height="60"
            onAnimationEnd={() => removeHeart(heart.id)}
          >
            <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
          </svg>
        ))}

        {/* Sidebar interactive buttons */}
        <div className="absolute right-4 bottom-[120px] max-md:bottom-[140px] flex flex-col items-center gap-5 z-10">
          {/* Profile photo */}
          <div className="relative mb-2">
            <img src={video.authorAvatar} alt={video.authorName} className="w-[50px] h-[50px] rounded-full border-2 border-white object-cover shadow-[0_4px_10px_rgba(0,0,0,0.3)]" />
            <button
              className={`absolute -bottom-1 left-1/2 -translate-x-1/2 bg-accent text-white w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold shadow-[0_2px_5px_rgba(255,59,92,0.4)] transition-all duration-200 hover:scale-110 ${isFollowed ? 'opacity-0 scale-0 pointer-events-none' : ''
                }`}
              onClick={() => {
                setIsFollowed(true);
                const followedAuthors = JSON.parse(localStorage.getItem('followedAuthors') || '[]');
                if (!followedAuthors.includes(video.authorName)) {
                  followedAuthors.push(video.authorName);
                  localStorage.setItem('followedAuthors', JSON.stringify(followedAuthors));
                }
                onShowToast(`Đã theo dõi @${video.authorName}! 🌟`);
              }}
            >
              <Plus size={12} />
            </button>
          </div>

          {/* Heart Button */}
          <div className="flex flex-col items-center gap-1.5 relative">
            <button
              className={`w-12 h-12 rounded-full bg-black/40 backdrop-blur-md border border-white/10 flex items-center justify-center transition-all duration-200 hover:bg-black/60 hover:scale-110 ${isLiked ? 'text-accent bg-accent/15 border-accent/30 shadow-[0_0_8px_rgba(255,59,92,0.3)]' : 'text-white'
                }`}
              onClick={handleLikeClick}
            >
              <Heart size={24} fill={isLiked ? 'currentColor' : 'none'} />
            </button>
            <span className="text-[12px] font-semibold text-white/90 drop-shadow-[0_1px_3px_rgba(0,0,0,0.8)]">
              {formatCount(video.likesCount)}
            </span>
          </div>

          {/* Comments Button */}
          <div className="flex flex-col items-center gap-1.5 relative">
            <button
              className="w-12 h-12 rounded-full bg-black/40 backdrop-blur-md border border-white/10 flex items-center justify-center text-white transition-all duration-200 hover:bg-black/60 hover:scale-110"
              onClick={() => setCommentsOpen(true)}
            >
              <MessageSquare size={24} />
            </button>
            <span className="text-[12px] font-semibold text-white/90 drop-shadow-[0_1px_3px_rgba(0,0,0,0.8)]">{formatCount(video.commentsCount)}</span>
          </div>

          {/* Share Button */}
          <div className="flex flex-col items-center gap-1.5 relative">
            <button
              className="w-12 h-12 rounded-full bg-black/40 backdrop-blur-md border border-white/10 flex items-center justify-center text-white transition-all duration-200 hover:bg-black/60 hover:scale-110"
              onClick={() => setShareOpen(!shareOpen)}
            >
              <Share2 size={24} />
            </button>
            <span className="text-[12px] font-semibold text-white/90 drop-shadow-[0_1px_3px_rgba(0,0,0,0.8)]">{formatCount(video.sharesCount)}</span>

            {/* Share Dropdown Overlay */}
            <ShareTooltip
              isOpen={shareOpen}
              onClose={() => setShareOpen(false)}
              videoId={video.id}
              onShowToast={onShowToast}
            />
          </div>
        </div>

        {/* Metadata info at the bottom */}
        <div className="absolute left-4 bottom-6 max-md:bottom-[80px] right-20 z-10 flex flex-col gap-2 text-white drop-shadow-[0_1px_3px_rgba(0,0,0,0.8)]">
          <div className="text-base font-bold tracking-wide">@{video.authorName}</div>
          <p
            ref={descRef}
            className={`text-[13.5px] leading-relaxed text-white/85 transition-all duration-300 ${descExpanded ? 'line-clamp-none overflow-visible' : 'line-clamp-3 overflow-hidden'
              }`}
          >
            {video.description}
          </p>
          {descOverflow && (
            <button className="self-start text-[12px] font-bold text-white/60 -mt-0.5" onClick={() => setDescExpanded(!descExpanded)}>
              {descExpanded ? 'Ẩn bớt' : 'Xem thêm'}
            </button>
          )}

          {/* Scrolling song marquee */}
          <div className="flex items-center gap-2 text-[12.5px] text-white/75 mt-1 w-fit">
            <Music size={14} className="animate-record" />
            <div className="w-[150px] overflow-hidden whitespace-nowrap">
              <span className="animate-marquee">{video.songName}</span>
            </div>
          </div>
        </div>

        {/* Floating vinyl record spinning */}
        <div className="absolute right-4 bottom-6 max-md:bottom-[80px] z-10">
          <div className="w-11 h-11 rounded-full bg-gradient-to-r from-zinc-800 to-zinc-900 border-[8px] border-zinc-700 shadow-[0_4px_10px_rgba(0,0,0,0.5)] flex items-center justify-center relative">
            <img src={video.authorAvatar} alt="Record album cover" className="w-4 h-4 rounded-full object-cover animate-record" />
            {isPlaying && (
              <>
                <Music size={12} className="absolute bottom-3 right-3 text-white opacity-0 pointer-events-none music-note-1" />
                <Music size={12} className="absolute bottom-3 right-3 text-white opacity-0 pointer-events-none music-note-2" />
              </>
            )}
          </div>
        </div>
      </div>

      {/* Slide drawer for comments */}
      <CommentsPanel
        isOpen={commentsOpen}
        onClose={() => setCommentsOpen(false)}
        videoId={video.id}
        onCommentCountChange={handleCommentCountChange}
      />
    </div>
  );
}
