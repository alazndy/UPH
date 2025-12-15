import { StateCreator } from 'zustand';
import { Project, ProjectFile, WeaveDesign, PCBDesign, ThreeDModel } from '@/types/project';
import { db } from '@/lib/firebase';
import { doc, updateDoc } from 'firebase/firestore';
import { ProjectSlice } from './project-slice';

// Combined slice for Files, Weave, PCB, and 3D Models
export interface AssetSlice {
  // File Actions
  addFile: (projectId: string, file: Omit<ProjectFile, 'id'>) => Promise<void>;
  deleteFile: (projectId: string, fileId: string) => Promise<void>;
  
  // Weave Design methods
  addWeaveDesign: (projectId: string, design: Omit<WeaveDesign, 'id'>) => Promise<void>;
  deleteWeaveDesign: (projectId: string, designId: string) => Promise<void>;
  
  // PCB Design methods
  addPCBDesign: (projectId: string, design: Omit<PCBDesign, 'id'>) => Promise<void>;
  deletePCBDesign: (projectId: string, designId: string) => Promise<void>;

  // 3D Model methods
  addThreeDModel: (projectId: string, model: Omit<ThreeDModel, 'id'>) => Promise<void>;
  deleteThreeDModel: (projectId: string, modelId: string) => Promise<void>;
}

export const createAssetSlice: StateCreator<AssetSlice & ProjectSlice, [], [], AssetSlice> = (set, get) => ({
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
      }
  },

  deleteFile: async (projectId, fileId) => {
      const project = get().projects.find(p => p.id === projectId);
      if (!project) return;

      const updatedFiles = (project.files || []).filter(f => f.id !== fileId);
      
      try {
          await updateDoc(doc(db, 'projects', projectId), { files: updatedFiles });
          set(state => ({
              projects: state.projects.map(p => p.id === projectId ? { ...p, files: updatedFiles } : p)
          }));
      } catch (error: any) {
           console.error("Error deleting file:", error);
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
      }
  },

  addPCBDesign: async (projectId, design) => {
      const project = get().projects.find(p => p.id === projectId);
      if (!project) return;

      const newDesign = { ...design, id: Date.now().toString() } as PCBDesign;
      const updatedDesigns = [...(project.pcbDesigns || []), newDesign];
      
      try {
          await updateDoc(doc(db, 'projects', projectId), { pcbDesigns: updatedDesigns });
          set(state => ({
              projects: state.projects.map(p => p.id === projectId ? { ...p, pcbDesigns: updatedDesigns } : p)
          }));
      } catch (error: any) {
           console.error("Error adding PCB design:", error);
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
      }
  },

  addThreeDModel: async (projectId, model) => {
      const project = get().projects.find(p => p.id === projectId);
      if (!project) return;

      const newModel = { ...model, id: Date.now().toString() } as ThreeDModel;
      const updatedModels = [...(project.threeDModels || []), newModel];
      
      try {
          await updateDoc(doc(db, 'projects', projectId), { threeDModels: updatedModels });
          set(state => ({
              projects: state.projects.map(p => p.id === projectId ? { ...p, threeDModels: updatedModels } : p)
          }));
      } catch (error: any) {
           console.error("Error adding 3D model:", error);
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
      }
  }
});
