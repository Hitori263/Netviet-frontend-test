import { User } from '@/model/user';

export const getCurrentUser = async (): Promise<User> => {
  const response = await fetch('/api/user');
  if (!response.ok) {
    throw new Error('Failed to fetch current user');
  }
  return response.json();
};
