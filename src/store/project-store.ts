import { create } from 'zustand';
import { Project, ProjectType, ProjectStatus } from '@/types';
import { mockProjects } from '@/lib/api/mock-data';

interface ProjectState {
  projects: Project[];
  isLoading: boolean;
  
  // Actions
  fetchProjects: () => Promise<void>;
  addProject: (project: Omit<Project, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  updateProject: (id: string, data: Partial<Project>) => Promise<void>;
  deleteProject: (id: string) => Promise<void>;
  getProjectById: (id: string) => Project | undefined;
}

export const useProjectStore = create<ProjectState>((set, get) => ({
  projects: [],
  isLoading: false,

  fetchProjects: async () => {
    set({ isLoading: true });
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 800));
      set({ projects: mockProjects });
    } catch (error) {
      console.error('Failed to fetch projects:', error);
    } finally {
      set({ isLoading: false });
    }
  },

  addProject: async (newProjectData) => {
    set({ isLoading: true });
    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      const newProject: Project = {
        ...newProjectData,
        id: Math.random().toString(36).substr(2, 9),
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      set(state => ({ projects: [...state.projects, newProject] }));
    } finally {
      set({ isLoading: false });
    }
  },

  updateProject: async (id, data) => {
     set(state => ({
      projects: state.projects.map(p => 
        p.id === id ? { ...p, ...data, updatedAt: new Date() } : p
      )
    }));
  },

  deleteProject: async (id) => {
    set(state => ({
      projects: state.projects.filter(p => p.id !== id)
    }));
  },
  
  getProjectById: (id) => {
    return get().projects.find(p => p.id === id);
  }
}));
