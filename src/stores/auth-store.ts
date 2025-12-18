import { create } from 'zustand';
import { User as AppUser } from '@/types';
import { 
  signInWithEmailAndPassword, 
  signInWithPopup,
  GoogleAuthProvider,
  GithubAuthProvider,
  signOut as firebaseSignOut, 
  onAuthStateChanged,
  User as FirebaseUser
} from 'firebase/auth';
import { auth } from '@/lib/firebase';

interface AuthState {
  user: AppUser | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  googleAccessToken: string | null;
  
  login: (email: string, pass: string) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  loginWithGithub: () => Promise<void>;
  logout: () => Promise<void>;
  completeOnboarding: () => Promise<void>;

  // Team Management
  teamMembers: import('@/types').TeamMember[];
  inviteMember: (email: string, role: import('@/types').UserRole) => Promise<void>;
  updateMemberRole: (uid: string, role: import('@/types').UserRole) => Promise<void>;
  removeMember: (uid: string) => Promise<void>;

  // Group Management
  teamGroups: import('@/types').TeamGroup[];
  createGroup: (name: string, description?: string) => Promise<void>;
  deleteGroup: (groupId: string) => Promise<void>;
  addMemberToGroup: (groupId: string, memberId: string) => Promise<void>;
  removeMemberFromGroup: (groupId: string, memberId: string) => Promise<void>;
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

const googleProvider = new GoogleAuthProvider();
googleProvider.addScope('https://www.googleapis.com/auth/drive.file');
const githubProvider = new GithubAuthProvider();

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  isLoading: true, // Start loading to check auth state
  googleAccessToken: null,

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

  loginWithGoogle: async () => {
    set({ isLoading: true });
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const credential = GoogleAuthProvider.credentialFromResult(result);
      const token = credential?.accessToken;
      if (token) {
        set({ googleAccessToken: token });
      }
      // State updated by onAuthStateChanged
    } catch (error) {
      console.error('Google login failed:', error);
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  loginWithGithub: async () => {
    set({ isLoading: true });
    try {
      await signInWithPopup(auth, githubProvider);
      // State updated by onAuthStateChanged
    } catch (error) {
      console.error('Github login failed:', error);
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  logout: async () => {
    try {
      await firebaseSignOut(auth);
      set({ user: null, isAuthenticated: false, googleAccessToken: null });
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
  },

  completeOnboarding: async () => {
      // Mock implementation for onboarding completion
      await new Promise(resolve => setTimeout(resolve, 500));
      // In a real app, you would update the user profile in Firestore here
      console.log('Onboarding completed');
  },

  // Mock Team Implementation (Local State)
  teamMembers: [
      { uid: '1', email: 'ali@firma.com', displayName: 'Ali Yılmaz', role: 'admin', status: 'active', avatarUrl: '' },
      { uid: '2', email: 'ayse@firma.com', displayName: 'Ayşe Demir', role: 'manager', status: 'active', avatarUrl: '' },
  ],

  inviteMember: async (email, role) => {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const newMember: import('@/types').TeamMember = {
          uid: Date.now().toString(),
          email,
          displayName: email.split('@')[0], // Placeholder name
          role,
          status: 'pending',
          avatarUrl: ''
      };

      set(state => ({
          teamMembers: [...state.teamMembers, newMember]
      }));
  },

  updateMemberRole: async (uid, role) => {
      set(state => ({
          teamMembers: state.teamMembers.map(m => m.uid === uid ? { ...m, role } : m)
      }));
  },

  removeMember: async (uid) => {
      set((state) => ({
        teamMembers: state.teamMembers.filter((m) => m.uid !== uid),
      }));
    },
    
    // Cloud/Mock Group Logic
    teamGroups: [],
    createGroup: async (name, description) => {
        const newGroup: import('@/types').TeamGroup = {
            id: crypto.randomUUID(),
            name,
            description,
            memberIds: [],
            color: 'blue'
        };
        set((state) => ({ teamGroups: [...state.teamGroups, newGroup] }));
    },
    deleteGroup: async (groupId) => {
        set((state) => ({ teamGroups: state.teamGroups.filter(g => g.id !== groupId) }));
    },
    addMemberToGroup: async (groupId, memberId) => {
        set((state) => ({
            teamGroups: state.teamGroups.map(g => 
                g.id === groupId && !g.memberIds.includes(memberId) 
                ? { ...g, memberIds: [...g.memberIds, memberId] } 
                : g
            )
        }));
    },
    removeMemberFromGroup: async (groupId, memberId) => {
        set((state) => ({
             teamGroups: state.teamGroups.map(g => 
                g.id === groupId 
                ? { ...g, memberIds: g.memberIds.filter(id => id !== memberId) }
                : g
            )
        }));
    },

}));

