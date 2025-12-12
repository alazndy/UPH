import { create } from 'zustand';
import { User } from '@/types';

interface AuthState {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  
  login: () => Promise<void>;
  logout: () => Promise<void>;
}

const mockUser: User = {
  uid: 'user1',
  email: 'demo@uph.com',
  displayName: 'Demo User',
  photoURL: '',
  settings: {
    theme: 'system',
    notifications: true
  }
};

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  isLoading: false,

  login: async () => {
    set({ isLoading: true });
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      set({ user: mockUser, isAuthenticated: true });
    } finally {
      set({ isLoading: false });
    }
  },

  logout: async () => {
    set({ user: null, isAuthenticated: false });
  }
}));
