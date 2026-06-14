export interface Comment {
  id: string;
  userName: string;
  userAvatar: string;
  text: string;
  timestamp: string;
  likes: number;
}

export interface VideoData {
  id: string;
  videoUrl: string;
  authorName: string;
  authorAvatar: string;
  description: string;
  likesCount: number;
  commentsCount: number;
  sharesCount: number;
  playsCount: number;
  songName: string;
  comments: Comment[];
}
