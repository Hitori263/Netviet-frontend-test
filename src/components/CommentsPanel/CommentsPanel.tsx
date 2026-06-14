'use client';

import React, { useState, useRef, useEffect } from 'react';
import { X, Send, Heart } from 'lucide-react';
import { Comment } from '@/model/video';
import { User } from '@/model/user';
import { getComments } from '@/services/comment/getComments';
import { createComment } from '@/services/comment/createComment';
import { likeComment } from '@/services/comment/likeComment';
import { deleteComment } from '@/services/comment/deleteComment';
import { editComment } from '@/services/comment/editComment';
import { getCurrentUser } from '@/services/user/getCurrentUser';

interface CommentsPanelProps {
  isOpen: boolean;
  onClose: () => void;
  videoId: string;
  onCommentCountChange: (count: number) => void;
}

export default function CommentsPanel({ isOpen, onClose, videoId, onCommentCountChange }: CommentsPanelProps) {
  const [inputText, setInputText] = useState('');
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(false);
  const [likedComments, setLikedComments] = useState<Record<string, boolean>>({});
  const [editingCommentId, setEditingCommentId] = useState<string | null>(null);
  const [editingText, setEditingText] = useState('');
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const listRef = useRef<HTMLDivElement>(null);

  // Load current user profile on mount
  useEffect(() => {
    getCurrentUser()
      .then((user) => setCurrentUser(user))
      .catch((err) => console.error("Failed to load user:", err));
  }, []);

  // Load liked comments from localStorage when panel opens
  useEffect(() => {
    if (isOpen) {
      const liked = JSON.parse(localStorage.getItem('likedComments') || '{}');
      setLikedComments(liked);
    }
  }, [isOpen]);

  // Fetch comments via API when the panel is opened
  useEffect(() => {
    if (isOpen && videoId) {
      setLoading(true);
      getComments(videoId)
        .then((data) => {
          setComments(data);
          setLoading(false);
        })
        .catch((err) => {
          console.error("Failed to fetch comments:", err);
          setLoading(false);
        });
    }
  }, [isOpen, videoId]);

  // Auto-scroll to bottom when comments count increases
  useEffect(() => {
    if (isOpen && listRef.current) {
      setTimeout(() => {
        listRef.current?.scrollTo({
          top: listRef.current.scrollHeight,
          behavior: 'smooth',
        });
      }, 100);
    }
  }, [comments.length, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    try {
      // Call createComment API which mutates the in-memory mock data
      const newComment = await createComment(videoId, inputText.trim());
      const updatedComments = [...comments, newComment];
      
      setComments(updatedComments);
      onCommentCountChange(updatedComments.length); // Update parent comment count state
      setInputText('');
    } catch (err) {
      console.error("Failed to post comment:", err);
    }
  };

  const toggleLikeComment = async (commentId: string) => {
    const isCurrentlyLiked = likedComments[commentId] || false;
    const nextLikedState = !isCurrentlyLiked;
    
    // Save to localStorage
    const updatedLikedComments = {
      ...likedComments,
      [commentId]: nextLikedState,
    };
    setLikedComments(updatedLikedComments);
    localStorage.setItem('likedComments', JSON.stringify(updatedLikedComments));

    try {
      const res = await likeComment(commentId, nextLikedState);
      // Update comment's like count locally in comments state
      setComments((prev) =>
        prev.map((c) => (c.id === commentId ? { ...c, likes: res.likes } : c))
      );
    } catch (err) {
      console.error("Failed to like comment:", err);
      // Revert if API fails
      const revertedLikedComments = {
        ...likedComments,
        [commentId]: isCurrentlyLiked,
      };
      setLikedComments(revertedLikedComments);
      localStorage.setItem('likedComments', JSON.stringify(revertedLikedComments));
    }
  };

  const handleStartEdit = (comment: Comment) => {
    setEditingCommentId(comment.id);
    setEditingText(comment.text);
  };

  const handleCancelEdit = () => {
    setEditingCommentId(null);
    setEditingText('');
  };

  const handleSaveEdit = async (e: React.FormEvent, commentId: string) => {
    e.preventDefault();
    if (!editingText.trim()) return;

    try {
      const updated = await editComment(videoId, commentId, editingText.trim());
      setComments((prev) =>
        prev.map((c) => (c.id === commentId ? { ...c, text: updated.text } : c))
      );
      setEditingCommentId(null);
      setEditingText('');
    } catch (err) {
      console.error("Failed to edit comment:", err);
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    try {
      const res = await deleteComment(videoId, commentId);
      const updatedComments = comments.filter((c) => c.id !== commentId);
      setComments(updatedComments);
      onCommentCountChange(res.commentsCount);
    } catch (err) {
      console.error("Failed to delete comment:", err);
    }
  };

  return (
    <>
      {/* Background Dim Backdrop */}
      <div
        className={`fixed inset-0 bg-black/50 backdrop-blur-[4px] z-[200] transition-opacity duration-300 ${
          isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
        onClick={onClose}
      />

      {/* Main Slide-in Panel - Bottom Sheet on Mobile (75% height), Right Sidebar on Desktop */}
      <div
        className={`fixed z-[201] flex flex-col bg-[#16161b]/95 backdrop-blur-[25px] transition-transform duration-300 shadow-[0_-10px_30px_rgba(0,0,0,0.5)] bottom-0 left-0 right-0 w-full h-[75vh] rounded-t-[24px] border-none md:top-0 md:right-0 md:left-auto md:w-[400px] md:max-w-[85vw] md:h-screen md:rounded-t-none md:border-l md:border-glass-border md:shadow-[-10px_0_30px_rgba(0,0,0,0.5)] ${
          isOpen
            ? 'translate-y-0 md:translate-x-0'
            : 'translate-y-full md:translate-x-full md:translate-y-0'
        }`}
      >
        <div className="flex items-center justify-between p-5 border-b border-glass-border flex-shrink-0">
          <span className="text-base font-bold">Bình luận ({comments.length})</span>
          <button className="text-white/60 p-1 rounded-full transition-all duration-200 hover:bg-white/8 hover:text-white" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        {/* Scrollable list */}
        <div ref={listRef} className="flex-1 overflow-y-auto p-5 flex flex-col gap-5">
          {loading ? (
            <div className="flex flex-col items-center justify-center h-full gap-2">
              <div className="w-8 h-8 rounded-full border-2 border-t-accent border-r-transparent border-b-transparent border-l-transparent animate-spin"></div>
              <span className="text-xs text-white/40">Đang tải bình luận...</span>
            </div>
          ) : comments.length === 0 ? (
            <div className="flex items-center justify-center h-full text-xs text-white/40">
              Chưa có bình luận nào. Hãy là người đầu tiên!
            </div>
          ) : (
            comments.map((comment) => {
              const isLiked = likedComments[comment.id] || false;
              return (
                <div key={comment.id} className="flex gap-3 items-start animate-fade-in">
                  <img src={comment.userAvatar} alt={comment.userName} className="w-9 h-9 rounded-full object-cover" />
                  <div className="flex-1 flex flex-col gap-1">
                    <div className="flex items-center gap-2">
                      <span className="text-[13px] font-bold text-white/90">{comment.userName}</span>
                      <span className="text-[11px] text-white/40">{comment.timestamp}</span>
                    </div>
                  {editingCommentId === comment.id ? (
                    <form onSubmit={(e) => handleSaveEdit(e, comment.id)} className="flex items-center gap-2 mt-1 w-full">
                      <input
                        type="text"
                        value={editingText}
                        onChange={(e) => setEditingText(e.target.value)}
                        className="flex-1 text-sm bg-white/5 border border-glass-border rounded-lg px-2.5 py-1 outline-none text-white focus:border-accent"
                        autoFocus
                      />
                      <button type="submit" className="text-xs text-accent font-bold px-2 py-1 hover:scale-105 transition-transform">
                        Lưu
                      </button>
                      <button type="button" onClick={handleCancelEdit} className="text-xs text-white/40 px-2 py-1 hover:text-white/70">
                        Hủy
                      </button>
                    </form>
                  ) : (
                    <p className="text-sm text-white/85 leading-normal break-words">{comment.text}</p>
                  )}
                  <div className="flex items-center gap-4 mt-1">
                    <button
                      className={`flex items-center gap-1 text-xs transition-colors duration-150 ${
                        isLiked ? 'text-accent' : 'text-white/40 hover:text-white/70'
                      }`}
                      onClick={() => toggleLikeComment(comment.id)}
                    >
                      <Heart size={12} fill={isLiked ? 'currentColor' : 'none'} />
                      <span>{comment.likes}</span>
                    </button>
                    <button className="flex items-center gap-1 text-xs text-white/40 hover:text-white/70 transition-colors duration-150">
                      Trả lời
                    </button>
                    {currentUser && comment.userName === currentUser.username && (
                      <>
                        <button
                          className="flex items-center gap-1 text-xs text-white/40 hover:text-white/70 transition-colors duration-150"
                          onClick={() => handleStartEdit(comment)}
                        >
                          Sửa
                        </button>
                        <button
                          className="flex items-center gap-1 text-xs text-[#ff3b5c]/70 hover:text-[#ff3b5c] transition-colors duration-150"
                          onClick={() => handleDeleteComment(comment.id)}
                        >
                          Xóa
                        </button>
                      </>
                    )}
                  </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Form to submit new comment */}
        <form onSubmit={handleSubmit} className="p-5 border-t border-glass-border flex gap-3 items-center bg-[#101014]/98 pb-[calc(20px+env(safe-area-inset-bottom))]">
          <div className="flex-1 bg-white/5 border border-glass-border rounded-3xl px-4 py-2 flex items-center">
            <input
              type="text"
              className="flex-1 text-sm bg-transparent border-none outline-none placeholder-white/30 text-white"
              placeholder="Thêm bình luận..."
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
            />
          </div>
          <button
            type="submit"
            disabled={!inputText.trim() || loading}
            className="text-accent p-1 transition-all duration-150 disabled:text-white/20 disabled:cursor-not-allowed enabled:hover:scale-110"
          >
            <Send size={18} />
          </button>
        </form>
      </div>
    </>
  );
}
