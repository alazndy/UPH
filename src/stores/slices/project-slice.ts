import { StateCreator } from 'zustand';
import { Project } from '@/types/project';
import { db } from '@/lib/firebase';
import { collection, getDocs, addDoc, doc, updateDoc, deleteDoc } from 'firebase/firestore';

export interface ProjectSlice {
  projects: Project[];
  isLoading: boolean;
  error: string | null;
  
  fetchProjects: () => Promise<void>;
  addProject: (project: Omit<Project, 'id' | 'spent' | 'completionPercentage' | 'tasks' | 'files'>) => Promise<void>;
  updateProject: (id: string, project: Partial<Project>) => Promise<void>;
  deleteProject: (id: string) => Promise<void>;
  getProject: (id: string) => Project | undefined;
}

export const createProjectSlice: StateCreator<ProjectSlice> = (set, get) => ({
  projects: [],
  isLoading: false,
  error: null,

  fetchProjects: async () => {
    set({ isLoading: true });
    try {
        const querySnapshot = await getDocs(collection(db, 'projects'));
        const projects = querySnapshot.docs.map(doc => ({ 
            id: doc.id, 
            ...doc.data() 
        })) as Project[];
        set({ projects });
    } catch (error: any) {
        console.error("Error fetching projects:", error);
    } finally {
        set({ isLoading: false });
    }
  },

  addProject: async (projectData) => {
    set({ isLoading: true, error: null });
    try {
        const projectsCollection = collection(db, 'projects');
        const newProjectData = { 
            ...projectData, 
            spent: 0, 
            completionPercentage: 0,
            files: []
        };
        const docRef = await addDoc(projectsCollection, newProjectData);
        const newProject = { ...newProjectData, id: docRef.id } as Project;
        
        // Log Activity - Dynamic import or separate store call
        // Note: Circular dependency risk if importing activity-store directly if it uses project-store. 
        // Ideally activity logging should be decoupled or used via hook/component.
        // For now adhering to previous pattern but being cautious.
        
        try {
            const { useActivityStore } = await import('../activity-store');
            useActivityStore.getState().addActivity({
                type: 'PROJECT_CREATED',
                title: 'New Project Created',
                description: `Project "${projectData.name}" created.`,
                metadata: { projectId: docRef.id }
            });
        } catch (e) {
            console.warn("Activity logging failed", e);
        }

        set(state => ({ 
            projects: [...state.projects, newProject], 
            isLoading: false 
        }));
    } catch (error: any) {
        console.error("Error adding project:", error);
        set({ error: error.message || "Failed to add project", isLoading: false });
    }
  },

  updateProject: async (id, projectUpdate) => {
    set({ isLoading: true, error: null });
    try {
         const docRef = doc(db, 'projects', id);
         await updateDoc(docRef, projectUpdate);
         set(state => ({
            projects: state.projects.map(p => p.id === id ? { ...p, ...projectUpdate } : p),
            isLoading: false
         }));
    } catch (error: any) {
         console.error("Error updating project:", error);
         set({ error: error.message || "Failed to update project", isLoading: false });
    }
  },

  deleteProject: async (id) => {
    set({ isLoading: true, error: null });
    try {
        await deleteDoc(doc(db, 'projects', id));
        set(state => ({
            projects: state.projects.filter(p => p.id !== id),
            isLoading: false
        }));
    } catch (error: any) {
        console.error("Error deleting project:", error);
        set({ error: error.message || "Failed to delete project", isLoading: false });
    }
  },

  getProject: (id) => get().projects.find((p) => p.id === id),
});
