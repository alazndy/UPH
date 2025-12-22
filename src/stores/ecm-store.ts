import { create } from 'zustand';
import { ECR, ECO, ECRStatus, ECOStatus } from '@/types/engineering';
import { db } from '@/lib/firebase';
import { 
  collection, 
  getDocs, 
  addDoc, 
  updateDoc, 
  doc, 
  query, 
  where, 
  Timestamp 
} from 'firebase/firestore';

interface ECMState {
  ecrs: ECR[];
  ecos: ECO[];
  isLoading: boolean;
  
  // Selectors
  getProjectECRs: (projectId: string) => ECR[];
  getProjectECOs: (projectId: string) => ECO[];
  
  // Actions
  fetchECMData: () => Promise<void>;
  addECR: (ecr: Omit<ECR, 'id' | 'createdAt' | 'updatedAt' | 'identifier'>) => Promise<void>;
  updateECRStatus: (id: string, status: ECRStatus) => Promise<void>;
  addECO: (eco: Omit<ECO, 'id' | 'createdAt' | 'updatedAt' | 'identifier' | 'approvalStatus'>) => Promise<void>;
  updateECOStatus: (id: string, status: ECOStatus) => Promise<void>;
  approveECO: (id: string) => Promise<void>;
}

// Initial Mock Data
const mockECRs: ECR[] = [
  {
    id: 'ecr-1',
    projectId: 'proj-1', // Linked to first project
    identifier: 'ECR-2025-001',
    title: 'Ana İşlemci Isınma Sorunu',
    description: 'Yük altında işlemci sıcaklığı 90 dereceyi geçiyor. Soğutucu bloğun revize edilmesi gerekiyor.',
    status: 'under_review',
    priority: 'high',
    requestorId: 'user-1',
    departmentId: 'dept-eng-mechanical',
    createdAt: new Date('2025-12-10'),
    updatedAt: new Date('2025-12-15'),
    impactAnalysis: {
      technicalFesibility: 'Yeni soğutucu blok tasarımı mevcut şasiye uyumlu.',
      financialImpact: 5000,
      inventoryImpact: 'Mevcut 200 adet eski soğutucu hurdaya ayrılacak.'
    }
  }
];

const mockECOs: ECO[] = [
  {
    id: 'eco-1',
    projectId: 'proj-1', // Linked to first project
    identifier: 'ECO-2025-001',
    ecrId: 'ecr-1',
    title: 'Soğutucu Blok Revizyonu V2',
    status: 'open',
    priority: 'high',
    approvalStatus: 'requested',
    requestorId: 'user-1',
    responsibleDept: 'Mekanik Tasarım',
    mrpActive: true,
    revisedItems: [
      {
        id: 'ri-1',
        itemId: 'prod-heatsink-01',
        itemName: 'Alüminyum Soğutucu Blok',
        currentRevision: 'A',
        newRevision: 'B',
        effectivityType: 'date',
        effectiveDate: new Date('2026-01-01'),
        disposition: 'scrap',
        wipUpdate: true
      }
    ],
    createdAt: new Date('2025-12-16'),
    updatedAt: new Date('2025-12-16')
  }
];

export const useECMStore = create<ECMState>((set, get) => ({
  ecrs: mockECRs,
  ecos: mockECOs,
  isLoading: false,

  // Selectors
  getProjectECRs: (projectId: string) => get().ecrs.filter(e => e.projectId === projectId),
  getProjectECOs: (projectId: string) => get().ecos.filter(e => e.projectId === projectId),

  fetchECMData: async () => {
    // In production, this would fetch from Firestore
    // For now, we use mock data
    set({ isLoading: true });
    // Simulated delay
    await new Promise(resolve => setTimeout(resolve, 800));
    set({ isLoading: false });
  },

  addECR: async (ecrData) => {
    set({ isLoading: true });
    const identifier = `ECR-2025-${(get().ecrs.length + 1).toString().padStart(3, '0')}`;
    const newECR: ECR = {
      ...ecrData,
      id: Math.random().toString(36).substr(2, 9),
      identifier,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    set(state => ({ ecrs: [newECR, ...state.ecrs], isLoading: false }));

    // Log Activity
    const { useActivityStore } = await import('./activity-store');
    useActivityStore.getState().addActivity({
      type: 'ENGINEERING_CHANGE',
      title: 'Yeni ECR Oluşturuldu',
      description: `${identifier}: ${ecrData.title}`,
      metadata: { ecrId: newECR.id }
    });
  },

  updateECRStatus: async (id, status) => {
    set(state => ({
      ecrs: state.ecrs.map(e => e.id === id ? { ...e, status, updatedAt: new Date() } : e)
    }));
  },

  addECO: async (ecoData) => {
    set({ isLoading: true });
    const identifier = `ECO-2025-${(get().ecos.length + 1).toString().padStart(3, '0')}`;
    const newECO: ECO = {
      ...ecoData,
      id: Math.random().toString(36).substr(2, 9),
      identifier,
      approvalStatus: 'not_submitted',
      createdAt: new Date(),
      updatedAt: new Date()
    };

    set(state => ({ ecos: [newECO, ...state.ecos], isLoading: false }));
  },

  updateECOStatus: async (id, status) => {
    set(state => ({
      ecos: state.ecos.map(e => e.id === id ? { ...e, status, updatedAt: new Date() } : e)
    }));
  },

  approveECO: async (id) => {
    set(state => ({
      ecos: state.ecos.map(e => e.id === id ? { ...e, approvalStatus: 'approved', updatedAt: new Date() } : e)
    }));
  }
}));
