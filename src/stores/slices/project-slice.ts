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
        let projects = querySnapshot.docs.map(doc => ({ 
            id: doc.id, 
            ...doc.data() 
        })) as Project[];

        // Filter based on Team Group Membership
        // We need to access the Auth Store state. 
        // Using dynamic import or direct access if possible. 
        // For simplicity in this architecture, we'll try to get state from the window/module if accessible 
        // or just accept that for now we are fetching all but filtering in memory.
        
        try {
            // Get Current User and Groups from Auth Store
            const { useAuthStore } = await import('../auth-store');
            const { user, teamGroups } = useAuthStore.getState();

            if (user && user.role !== 'admin') {
                // If not admin, filter projects
                // 1. My personal projects (userId == myId)
                // 2. Projects belonging to groups I am a member of
                
                const myGroupIds = teamGroups
                    .filter(g => g.memberIds.includes(user.uid))
                    .map(g => g.id);

                projects = projects.filter(p => {
                    const isMyProject = p.userId === user.uid;
                    const isGroupProject = p.teamGroupId ? myGroupIds.includes(p.teamGroupId) : false;
                    // If no teamGroupId is set, assume it's visible to all (or just creator? Let's say public for now for backward compat)
                    // OR strict mode: validation required.
                    // Let's go with: Created by me OR in my group.
                    return isMyProject || isGroupProject;
                });
            }
        } catch (e) {
            console.warn("Could not access Auth Store for filtering, showing all projects", e);
        }

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
