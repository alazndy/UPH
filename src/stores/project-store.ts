import { create } from 'zustand';
import { Project, ProjectTask, ProjectFile, WeaveDesign } from '@/types/project';
import { db } from '@/lib/firebase';
import { 
  collection, 
  getDocs, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc 
} from 'firebase/firestore';

interface ProjectState {
  projects: Project[];
  isLoading: boolean;
  error: string | null;
  
  // Actions
  fetchProjects: () => Promise<void>;
  addProject: (project: Omit<Project, 'id' | 'spent' | 'completionPercentage' | 'tasks' | 'files'>) => Promise<void>;
  updateProject: (id: string, project: Partial<Project>) => Promise<void>;
  deleteProject: (id: string) => Promise<void>;
  addTask: (projectId: string, task: Omit<ProjectTask, 'id'>) => Promise<void>;
  toggleTask: (projectId: string, taskId: string) => Promise<void>;
  updateTaskStatus: (projectId: string, taskId: string, status: import('@/types/project').TaskStatus) => Promise<void>;
  deleteTask: (projectId: string, taskId: string) => Promise<void>;
  addFile: (projectId: string, file: Omit<ProjectFile, 'id'>) => Promise<void>;
  deleteFile: (projectId: string, fileId: string) => Promise<void>;
  // Weave Design methods
  addWeaveDesign: (projectId: string, design: Omit<WeaveDesign, 'id'>) => Promise<void>;
  deleteWeaveDesign: (projectId: string, designId: string) => Promise<void>;
  
  // PCB Design methods
  addPCBDesign: (projectId: string, design: Omit<import('@/types/project').PCBDesign, 'id'>) => Promise<void>;
  deletePCBDesign: (projectId: string, designId: string) => Promise<void>;

  // 3D Model methods
  addThreeDModel: (projectId: string, model: Omit<import('@/types/project').ThreeDModel, 'id'>) => Promise<void>;
  deleteThreeDModel: (projectId: string, modelId: string) => Promise<void>;

  getProject: (id: string) => Project | undefined;
}

export const useProjectStore = create<ProjectState>((set, get) => ({
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
    } catch (error) {
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
            tasks: [],
            files: []
        };
        const docRef = await addDoc(projectsCollection, newProjectData);
        const newProject = { ...newProjectData, id: docRef.id } as Project;
        
        // Log Activity
        const { useActivityStore } = await import('./activity-store');
        useActivityStore.getState().addActivity({
            type: 'PROJECT_CREATED',
            title: 'New Project Created',
            description: `Project "${projectData.name}" created.`,
            metadata: { projectId: docRef.id }
        });

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

  addTask: async (projectId, task) => {
      const project = get().projects.find(p => p.id === projectId);
      if (!project) return;
      
      const newTask: ProjectTask = { ...task, id: Date.now().toString() }; 
      const updatedTasks = [...(project.tasks || []), newTask];
      
      try {
          await updateDoc(doc(db, 'projects', projectId), { tasks: updatedTasks });
          set(state => ({
              projects: state.projects.map(p => p.id === projectId ? { ...p, tasks: updatedTasks } : p)
          }));
      } catch (error: any) {
           console.error("Error adding task:", error);
           set({ error: error.message || "Failed to add task" });
      }
  },

  toggleTask: async (projectId, taskId) => {
      const project = get().projects.find(p => p.id === projectId);
      if (!project) return;

      const updatedTasks = (project.tasks || []).map(t => 
           t.id === taskId ? { ...t, completed: !t.completed } : t
      );
      
      try {
          await updateDoc(doc(db, 'projects', projectId), { tasks: updatedTasks });
          set(state => ({
              projects: state.projects.map(p => p.id === projectId ? { ...p, tasks: updatedTasks } : p)
          }));
      } catch (error: any) {
          console.error("Error toggling task:", error);
          set({ error: error.message || "Failed to toggle task" });
      }
  },

  updateTaskStatus: async (projectId, taskId, status) => {
      const project = get().projects.find(p => p.id === projectId);
      if (!project) return;

      const updatedTasks = (project.tasks || []).map(t => 
           t.id === taskId ? { ...t, status, completed: status === 'done' } : t
      );
      
      try {
          await updateDoc(doc(db, 'projects', projectId), { tasks: updatedTasks });
          set(state => ({
              projects: state.projects.map(p => p.id === projectId ? { ...p, tasks: updatedTasks } : p)
          }));
      } catch (error: any) {
          console.error("Error updating task status:", error);
          set({ error: error.message || "Failed to update task status" });
      }
  },

  deleteTask: async (projectId, taskId) => {
      const project = get().projects.find(p => p.id === projectId);
      if (!project) return;
      
      const updatedTasks = (project.tasks || []).filter(t => t.id !== taskId);
      
      try {
           await updateDoc(doc(db, 'projects', projectId), { tasks: updatedTasks });
           set(state => ({
              projects: state.projects.map(p => p.id === projectId ? { ...p, tasks: updatedTasks } : p)
          }));
      } catch (error: any) {
          console.error("Error deleting task:", error);
          set({ error: error.message || "Failed to delete task" });
      }
  },

  addFile: async (projectId, file) => {
      const project = get().projects.find(p => p.id === projectId);
      if (!project) return;

      const newFile: ProjectFile = { ...file, id: Date.now().toString() }; 
      const updatedFiles = [...(project.files || []), newFile];
      
      try {
          await updateDoc(doc(db, 'projects', projectId), { files: updatedFiles });
           set(state => ({
              projects: state.projects.map(p => p.id === projectId ? { ...p, files: updatedFiles } : p)
          }));
      } catch (error: any) {
           console.error("Error adding file:", error);
           set({ error: error.message || "Failed to add file" });
      }
  },

  deleteFile: async (projectId, fileId) => {
      const project = get().projects.find(p => p.id === projectId);
      if (!project) {
        console.warn(`Project with ID ${projectId} not found.`);
        return;
      }

      const updatedFiles = (project.files || []).filter(f => f.id !== fileId);
      
      try {
          await updateDoc(doc(db, 'projects', projectId), { files: updatedFiles });
          set(state => ({
              projects: state.projects.map(p => p.id === projectId ? { ...p, files: updatedFiles } : p)
          }));
      } catch (error: any) {
           console.error("Error deleting file:", error);
           set({ error: error.message || "Failed to delete file" });
      }
  },

  addWeaveDesign: async (projectId, design) => {
      const project = get().projects.find(p => p.id === projectId);
      if (!project) return;

      const newDesign: WeaveDesign = { ...design, id: Date.now().toString() }; 
      const updatedDesigns = [...(project.weaveDesigns || []), newDesign];
      
      try {
          await updateDoc(doc(db, 'projects', projectId), { weaveDesigns: updatedDesigns });
           set(state => ({
              projects: state.projects.map(p => p.id === projectId ? { ...p, weaveDesigns: updatedDesigns } : p)
          }));
      } catch (error: any) {
           console.error("Error adding Weave design:", error);
           set({ error: error.message || "Failed to add Weave design" });
      }
  },

  deleteWeaveDesign: async (projectId, designId) => {
      const project = get().projects.find(p => p.id === projectId);
      if (!project) return;

      const updatedDesigns = (project.weaveDesigns || []).filter(d => d.id !== designId);
      
      try {
          await updateDoc(doc(db, 'projects', projectId), { weaveDesigns: updatedDesigns });
          set(state => ({
              projects: state.projects.map(p => p.id === projectId ? { ...p, weaveDesigns: updatedDesigns } : p)
          }));
      } catch (error: any) {
           console.error("Error deleting Weave design:", error);
           set({ error: error.message || "Failed to delete Weave design" });
      }
  },

  addPCBDesign: async (projectId, design) => {
      const project = get().projects.find(p => p.id === projectId);
      if (!project) return;

      const newDesign = { ...design, id: Date.now().toString() } as import('@/types/project').PCBDesign;
      const updatedDesigns = [...(project.pcbDesigns || []), newDesign];
      
      try {
          await updateDoc(doc(db, 'projects', projectId), { pcbDesigns: updatedDesigns });
          set(state => ({
              projects: state.projects.map(p => p.id === projectId ? { ...p, pcbDesigns: updatedDesigns } : p)
          }));
      } catch (error: any) {
           console.error("Error adding PCB design:", error);
           set({ error: error.message || "Failed to add PCB design" });
      }
  },

  deletePCBDesign: async (projectId, designId) => {
      const project = get().projects.find(p => p.id === projectId);
      if (!project) return;

      const updatedDesigns = (project.pcbDesigns || []).filter(d => d.id !== designId);
      
      try {
          await updateDoc(doc(db, 'projects', projectId), { pcbDesigns: updatedDesigns });
          set(state => ({
              projects: state.projects.map(p => p.id === projectId ? { ...p, pcbDesigns: updatedDesigns } : p)
          }));
      } catch (error: any) {
           console.error("Error deleting PCB design:", error);
           set({ error: error.message || "Failed to delete PCB design" });
      }
  },

  addThreeDModel: async (projectId, model) => {
      const project = get().projects.find(p => p.id === projectId);
      if (!project) return;

      const newModel = { ...model, id: Date.now().toString() } as import('@/types/project').ThreeDModel;
      const updatedModels = [...(project.threeDModels || []), newModel];
      
      try {
          await updateDoc(doc(db, 'projects', projectId), { threeDModels: updatedModels });
          set(state => ({
              projects: state.projects.map(p => p.id === projectId ? { ...p, threeDModels: updatedModels } : p)
          }));
      } catch (error: any) {
           console.error("Error adding 3D model:", error);
           set({ error: error.message || "Failed to add 3D model" });
      }
  },

  deleteThreeDModel: async (projectId, modelId) => {
      const project = get().projects.find(p => p.id === projectId);
      if (!project) return;

      const updatedModels = (project.threeDModels || []).filter(m => m.id !== modelId);
      
      try {
          await updateDoc(doc(db, 'projects', projectId), { threeDModels: updatedModels });
          set(state => ({
              projects: state.projects.map(p => p.id === projectId ? { ...p, threeDModels: updatedModels } : p)
          }));
      } catch (error: any) {
           console.error("Error deleting 3D model:", error);
           set({ error: error.message || "Failed to delete 3D model" });
      }
  }
}));
