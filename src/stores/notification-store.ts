import { create } from 'zustand';

export type NotificationType = 'info' | 'warning' | 'success' | 'error';

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  read: boolean;
  createdAt: Date;
  link?: string;
}

interface NotificationState {
  notifications: Notification[];
  unreadCount: number;
  
  addNotification: (notification: Omit<Notification, 'id' | 'read' | 'createdAt'>) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  removeNotification: (id: string) => void;
  clearAll: () => void;
}

// Mock initial notifications
const initialNotifications: Notification[] = [
  {
    id: '1',
    type: 'warning',
    title: 'Low Stock Alert',
    message: '3 items are below minimum stock level',
    read: false,
    createdAt: new Date(Date.now() - 1000 * 60 * 30), // 30 min ago
    link: '/inventory',
  },
  {
    id: '2',
    type: 'info',
    title: 'Project Update',
    message: 'Kanban Board feature has been added',
    read: false,
    createdAt: new Date(Date.now() - 1000 * 60 * 60), // 1 hour ago
    link: '/kanban',
  },
  {
    id: '3',
    type: 'success',
    title: 'Analytics Ready',
    message: 'New analytics dashboard is now available',
    read: true,
    createdAt: new Date(Date.now() - 1000 * 60 * 120), // 2 hours ago
    link: '/analytics',
  },
];

export const useNotificationStore = create<NotificationState>((set) => ({
  notifications: initialNotifications,
  unreadCount: initialNotifications.filter(n => !n.read).length,

  addNotification: (notification) => {
    const newNotification: Notification = {
      ...notification,
      id: Math.random().toString(36).substring(7),
      read: false,
      createdAt: new Date(),
    };
    
    set(state => ({
      notifications: [newNotification, ...state.notifications],
      unreadCount: state.unreadCount + 1,
    }));
  },

  markAsRead: (id) => {
    set(state => {
      const notification = state.notifications.find(n => n.id === id);
      if (!notification || notification.read) return state;
      
      return {
        notifications: state.notifications.map(n =>
          n.id === id ? { ...n, read: true } : n
        ),
        unreadCount: Math.max(0, state.unreadCount - 1),
      };
    });
  },

  markAllAsRead: () => {
    set(state => ({
      notifications: state.notifications.map(n => ({ ...n, read: true })),
      unreadCount: 0,
    }));
  },

  removeNotification: (id) => {
    set(state => {
      const notification = state.notifications.find(n => n.id === id);
      const wasUnread = notification && !notification.read;
      
      return {
        notifications: state.notifications.filter(n => n.id !== id),
        unreadCount: wasUnread ? state.unreadCount - 1 : state.unreadCount,
      };
    });
  },

  clearAll: () => {
    set({ notifications: [], unreadCount: 0 });
  },
}));
