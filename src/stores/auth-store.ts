import { create } from 'zustand';
import { User as AppUser } from '@/types';
import { 
  signInWithEmailAndPassword, 
  signOut as firebaseSignOut, 
  onAuthStateChanged,
  User as FirebaseUser
} from 'firebase/auth';
import { auth } from '@/lib/firebase';

interface AuthState {
  user: AppUser | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  
  login: (email: string, pass: string) => Promise<void>;
  logout: () => Promise<void>;
  initializeAuth: () => () => void; // Returns unsubscribe
}

const mapFirebaseUser = (firebaseUser: FirebaseUser): AppUser => ({
  uid: firebaseUser.uid,
  email: firebaseUser.email || '',
  displayName: firebaseUser.displayName || 'User',
  photoURL: firebaseUser.photoURL || '',
  settings: {
     theme: 'system',
     notifications: true
  }
});

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  isLoading: true, // Start loading to check auth state

  login: async (email, pass) => {
    set({ isLoading: true });
    try {
      await signInWithEmailAndPassword(auth, email, pass);
      // State updated by onAuthStateChanged
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  logout: async () => {
    try {
      await firebaseSignOut(auth);
      set({ user: null, isAuthenticated: false });
    } catch (error) {
      console.error('Logout failed:', error);
    }
  },

  initializeAuth: () => {
     set({ isLoading: true });
     const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
        if (firebaseUser) {
           set({ 
               user: mapFirebaseUser(firebaseUser), 
               isAuthenticated: true, 
               isLoading: false 
           });
        } else {
           set({ 
               user: null, 
               isAuthenticated: false, 
               isLoading: false 
           });
        }
     });
     return unsubscribe;
  }
}));
