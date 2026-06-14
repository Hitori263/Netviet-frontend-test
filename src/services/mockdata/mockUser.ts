import { User } from '@/model/user';

const initialUser: User = {
  username: 'usnav_03',
  displayName: 'Vũ Văn Sử',
  avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
  followersCount: 15400,
  followingCount: 148,
  likesReceivedCount: 120000,
  bio: 'Developer & Creator 💻 | Đam mê xây dựng ứng dụng Web chất lượng cao ✨ | Build with Next.js & TypeScript.',
};

const globalForUser = global as unknown as {
  currentUserDatabase: User;
};

export const mockCurrentUser = globalForUser.currentUserDatabase || initialUser;

if (process.env.NODE_ENV !== 'production') {
  globalForUser.currentUserDatabase = mockCurrentUser;
}
