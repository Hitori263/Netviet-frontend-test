import { VideoData } from '@/model/video';

const initialVideos: VideoData[] = [
  {
    id: "video-1",
    videoUrl: "https://www.w3schools.com/html/mov_bbb.mp4",
    authorName: "bunny_adventures",
    authorAvatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80",
    description: "Big Buck Bunny animated film trailer. Classic, cute and always fun! 🐰 This is a super long description to test the text-clamping feature and the 'more' button on mobile devices. This description is written very long to ensure it exceeds the default 3-line limit, verifying that the dynamic collapse and expand logic function perfectly. Thank you for watching and supporting this lovely chubby bunny! #animation #cartoon #classic #retro #nature #fun #bigbunny #test #longdescription",
    likesCount: 1420,
    commentsCount: 3,
    sharesCount: 324,
    playsCount: 85200,
    songName: "Big Buck Bunny Original Soundtrack - Theme Instrumental",
    comments: [
      {
        id: "c-1-1",
        userName: "cartoon_lover",
        userAvatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80",
        text: "This brings back so many memories! Love the big bunny!",
        timestamp: "2h ago",
        likes: 24,
      },
      {
        id: "c-1-2",
        userName: "retro_fanatic",
        userAvatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&auto=format&fit=crop&q=80",
        text: "The rendering on this was state-of-the-art back then. Classic!",
        timestamp: "5h ago",
        likes: 12,
      },
      {
        id: "c-1-3",
        userName: "animator_guy",
        userAvatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&auto=format&fit=crop&q=80",
        text: "Created with Blender! That project is a massive milestone for open source animation.",
        timestamp: "1d ago",
        likes: 45,
      }
    ],
  },
  {
    id: "video-2",
    videoUrl: "https://interactive-examples.mdn.mozilla.net/media/cc0-videos/friday.mp4",
    authorName: "nature_wanderer",
    authorAvatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80",
    description: "Happy Friday everyone! Quick cinematic snippet of a beautiful, peaceful beach at sunset. 🌅🌊 #fridayfeeling #sunset #beach #nature #relax #vibe",
    likesCount: 3890,
    commentsCount: 2,
    sharesCount: 512,
    playsCount: 245000,
    songName: "Chill Beats - Relaxing Lo-Fi Sunset Horizon (Slowed)",
    comments: [
      {
        id: "c-2-1",
        userName: "beach_bum_99",
        userAvatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80",
        text: "I literally want to pack my bags and go there right now.",
        timestamp: "30m ago",
        likes: 8,
      },
      {
        id: "c-2-2",
        userName: "wanderlust",
        userAvatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&auto=format&fit=crop&q=80",
        text: "Where is this filmed? Looks like Greece or Italy!",
        timestamp: "1h ago",
        likes: 19,
      }
    ],
  },
  {
    id: "video-3",
    videoUrl: "https://media.w3.org/2010/05/sintel/trailer.mp4",
    authorName: "cgi_showcase",
    authorAvatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&auto=format&fit=crop&q=80",
    description: "Sintel - The breathtaking fantasy open-movie project. Witness the journey of search and hope! 🐉⚔️ #fantasy #dragon #sintel #cgi #blender #epic #art",
    likesCount: 5210,
    commentsCount: 2,
    sharesCount: 890,
    playsCount: 450000,
    songName: "Sintel Theme Song - Emotional Orchestral Symphonic",
    comments: [
      {
        id: "c-3-1",
        userName: "dragon_rider",
        userAvatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&auto=format&fit=crop&q=80",
        text: "This story actually made me cry the first time I watched the full short film.",
        timestamp: "4h ago",
        likes: 56,
      },
      {
        id: "c-3-2",
        userName: "movie_critic",
        userAvatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80",
        text: "Stunning art direction and gorgeous color palettes.",
        timestamp: "6h ago",
        likes: 34,
      }
    ],
  },
];

const globalForMock = global as unknown as {
  mockVideosDatabase: VideoData[];
};

export const mockVideos = globalForMock.mockVideosDatabase || initialVideos;

// Ensure playsCount and static text fields like description are updated from initialVideos to global database
mockVideos.forEach((video) => {
  const init = initialVideos.find((v) => v.id === video.id);
  if (init) {
    video.description = init.description;
    video.songName = init.songName;
    if (video.playsCount === undefined) {
      video.playsCount = init.playsCount;
    }
  }
});

if (process.env.NODE_ENV !== 'production') {
  globalForMock.mockVideosDatabase = mockVideos;
}
