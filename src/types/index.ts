export type ProjectType = 'software' | 'physical' | 'work' | 'personal';
export type ProjectStatus = 'planning' | 'active' | 'on-hold' | 'completed';
export type TaskStatus = 'todo' | 'in-progress' | 'review' | 'done';
export type Priority = 'low' | 'medium' | 'high' | 'critical';

export interface GithubRepo {
  id: number;
  url: string;
  name: string;
  owner: string;
  lastCommit?: string;
  openIssuesCount?: number;
}

export interface InventoryItem {
  id: string;
  itemId: string; // Reference to actual inventory item
  name: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

export interface Project {
  id: string;
  userId: string;
  name: string;
  description: string;
  type: ProjectType;
  status: ProjectStatus;
  
  // Finance
  budget: number;
  spent: number;
  
  // Timeline
  startDate: Date;
  deadline?: Date;
  
  // Progress
  progress: number; // 0-100
  
  // Integrations
  githubRepo?: GithubRepo;
  driveFolderId?: string;
  
  // Metadata
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface Task {
  id: string;
  projectId: string;
  title: string;
  description?: string;
  status: TaskStatus;
  priority: Priority;
  
  // GitHub Integration
  isGithubIssue: boolean;
  githubIssueId?: number;
  githubIssueUrl?: string;
  
  assignedTo?: string[];
  dueDate?: Date;
  
  subtasks: { id: string; title: string; done: boolean }[];
  
  createdAt: Date;
  updatedAt: Date;
}

export interface User {
  uid: string;
  email: string;
  displayName: string;
  photoURL?: string;
  settings: {
    theme: 'light' | 'dark' | 'system';
    notifications: boolean;
  };
}
