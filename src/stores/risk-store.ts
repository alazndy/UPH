import { create } from 'zustand';
import { RAIDEntry, EVMMetrics, ProjectRiskSummary, RAIDStatus } from '@/types/risk';

interface RiskState {
  raidEntries: RAIDEntry[];
  evmHistory: EVMMetrics[];
  isLoading: boolean;
  
  // Actions
  fetchRiskData: (projectId: string) => Promise<void>;
  addRAIDEntry: (entry: Omit<RAIDEntry, 'id' | 'createdAt' | 'updatedAt' | 'score'>) => void;
  updateRAIDStatus: (id: string, status: RAIDStatus) => void;
  calculateProjectSummary: (projectId: string) => ProjectRiskSummary;
}

// Mock Data
const mockRAIDEntries: RAIDEntry[] = [
  {
    id: 'r-1',
    projectId: 'proj-1',
    type: 'risk',
    title: 'Tedarik Zinciri Gecikmesi',
    description: 'Yarı iletken komponentlerin teslimatında 4 haftalık potansiyel gecikme.',
    status: 'analyzed',
    ownerId: 'user-1',
    impact: 4,
    probability: 3,
    score: 12,
    mitigationPlan: 'Alternatif tedarikçi arayışı.',
    createdAt: new Date('2025-12-01'),
    updatedAt: new Date('2025-12-05')
  },
  {
    id: 'i-1',
    projectId: 'proj-1',
    type: 'issue',
    title: 'Bütçe Aşımı',
    description: 'Yazılım lisans maliyetleri beklenenden %20 fazla çıktı.',
    status: 'mitigating',
    ownerId: 'user-2',
    createdAt: new Date('2025-12-10'),
    updatedAt: new Date('2025-12-12')
  }
];

const mockEVMMetrics: EVMMetrics[] = [
  {
    projectId: 'proj-1',
    date: '2025-12-15',
    PV: 100000,
    EV: 85000,
    AC: 95000,
    CV: -10000,
    SV: -15000,
    CPI: 0.89,
    SPI: 0.85,
    EAC: 112359,
    ETC: 17359
  }
];

export const useRiskStore = create<RiskState>((set, get) => ({
  raidEntries: mockRAIDEntries,
  evmHistory: mockEVMMetrics,
  isLoading: false,

  fetchRiskData: async (projectId) => {
    set({ isLoading: true });
    await new Promise(resolve => setTimeout(resolve, 500));
    set({ isLoading: false });
  },

  addRAIDEntry: (entryData) => {
    const score = entryData.impact && entryData.probability 
      ? entryData.impact * entryData.probability 
      : undefined;
      
    const newEntry: RAIDEntry = {
      ...entryData,
      id: Math.random().toString(36).substr(2, 9),
      score,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    set(state => ({ raidEntries: [newEntry, ...state.raidEntries] }));
  },

  updateRAIDStatus: (id, status) => {
    set(state => ({
      raidEntries: state.raidEntries.map(e => e.id === id ? { ...e, status, updatedAt: new Date() } : e)
    }));
  },

  calculateProjectSummary: (projectId) => {
    const entries = get().raidEntries.filter(e => e.projectId === projectId);
    const evm = get().evmHistory.find(h => h.projectId === projectId);

    return {
      projectId,
      highRisksCount: entries.filter(e => e.type === 'risk' && e.score && e.score >= 15).length,
      openIssuesCount: entries.filter(e => e.type === 'issue' && e.status !== 'closed' && e.status !== 'resolved').length,
      criticalDependenciesCount: entries.filter(e => e.type === 'dependency' && e.status !== 'resolved').length,
      currentCPI: evm?.CPI || 1,
      currentSPI: evm?.SPI || 1
    };
  }
}));
