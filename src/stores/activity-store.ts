import { create } from 'zustand';
import { Activity, ActivityType } from '@/types/activity';
import { useAuthStore } from './auth-store';

interface ActivityState {
  activities: Activity[];
  isLoading: boolean;
  addActivity: (activity: Omit<Activity, 'id' | 'timestamp' | 'userId' | 'userName'>) => void;
  fetchActivities: () => Promise<void>;
}

// Mock initial data
const MOCK_ACTIVITIES: Activity[] = [
  {
    id: '1',
    type: 'SYSTEM',
    title: 'System Initialized',
    description: 'Activity logging module loaded successfully.',
    timestamp: new Date(),
    userId: 'system',
    userName: 'System'
  }
];

export const useActivityStore = create<ActivityState>((set, get) => ({
  activities: MOCK_ACTIVITIES,
  isLoading: false,

  addActivity: (input) => {
    const user = useAuthStore.getState().user;
    
    const newActivity: Activity = {
      id: Math.random().toString(36).substring(7),
      type: input.type,
      title: input.title,
      description: input.description,
      timestamp: new Date(), // Client-side timestamp for now
      userId: user?.uid || 'guest',
      userName: user?.displayName || 'Guest User',
      metadata: input.metadata
    };

    set((state) => ({
      activities: [newActivity, ...state.activities]
    }));
    
    // TODO: Persist to Firestore here
    // await addDoc(collection(db, 'activities'), newActivity);
  },

  fetchActivities: async () => {
    // In a real app, convert fetch logic here.
    // For now, we persist local state or just use mocks.
    set({ isLoading: false });
  }
}));
