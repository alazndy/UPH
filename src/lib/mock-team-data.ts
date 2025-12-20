// Mock initial team data for development
// TODO: Replace with Firebase Firestore queries in production

import { TeamMember, TeamGroup } from '@/types';

export const INITIAL_TEAM_MEMBERS: TeamMember[] = [
  { 
    uid: '1', 
    email: 'ali@firma.com', 
    displayName: 'Ali Yılmaz', 
    role: 'admin', 
    status: 'active', 
    avatarUrl: '' 
  },
  { 
    uid: '2', 
    email: 'ayse@firma.com', 
    displayName: 'Ayşe Demir', 
    role: 'manager', 
    status: 'active', 
    avatarUrl: '' 
  },
];

export const INITIAL_TEAM_GROUPS: TeamGroup[] = [];
