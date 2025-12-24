import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { MarketplaceModule, InstalledModule } from '@/types/marketplace';
import { FEATURE_TO_MODULE_MAP } from '@/types/marketplace';

interface MarketplaceState {
  availableModules: MarketplaceModule[];
  installedModules: InstalledModule[];
  loading: boolean;
}

interface MarketplaceActions {
  installModule: (moduleId: string) => Promise<void>;
  uninstallModule: (moduleId: string) => Promise<void>;
  checkAccess: (featureKey: string) => boolean;
  isModuleInstalled: (moduleId: string) => boolean;
  getModule: (moduleId: string) => MarketplaceModule | undefined;
}

// Extended Mock Database with Full Ecosystem
const MOCK_MODULES: MarketplaceModule[] = [
  // --- UPH INTERNAL ---
  {
    id: 'flux-core',
    name: 'Flux Core',
    description: 'Essential IoT device monitoring and connectivity.',
    icon: 'Activity',
    category: 'Engineering',
    type: 'app',
    price: 0,
    features: ['flux_core'],
    version: '2.1.0'
  },
  {
    id: 'flux-analytics',
    name: 'Flux Analytics Pro',
    description: 'Advanced charts, historical data, and energy predictions.',
    icon: 'LineChart',
    category: 'Engineering',
    type: 'addon',
    parentId: 'flux-core',
    price: 49,
    isPopular: true,
    features: ['flux_charts'],
    version: '1.0.0'
  },
  {
    id: 'forge-core',
    name: 'Forge Core',
    description: 'Manufacturing job tracking and assignment.',
    icon: 'Hammer',
    category: 'Operations',
    type: 'app',
    price: 0,
    features: ['forge_core'],
    version: '1.5.0'
  },
  {
    id: 'forge-3d',
    name: 'Forge 3D Vision',
    description: 'Interactive 3D schematics for assembly technicians.',
    icon: 'Box',
    category: 'Operations',
    type: 'addon',
    parentId: 'forge-core',
    price: 79,
    isNew: true,
    features: ['forge_3d'],
    version: '0.9.beta'
  },

  // --- EXTERNAL ECOSYSTEM ---
  
  // ENV-I (Construction & Project Management)
  {
    id: 'envi-core',
    name: 'ENV-I OS',
    description: 'Next-gen construction project management and site tracking.',
    icon: 'Building',
    category: 'Operations',
    type: 'app',
    price: 199,
    features: ['envi_access'],
    version: '3.0.0'
  },
  {
    id: 'envi-evm',
    name: 'EVM Master',
    description: 'Earned Value Management advanced metrics for ENV-I.',
    icon: 'BarChart',
    category: 'Finance',
    type: 'addon',
    parentId: 'envi-core',
    price: 59,
    features: ['envi_evm_pro'],
    version: '1.1.0'
  },

  // WEAVE (Supply Chain)
  {
    id: 'weave-core',
    name: 'Weave Nexus',
    description: 'Collaborative supply chain mapping and node management.',
    icon: 'Network',
    category: 'Productivity',
    type: 'app',
    price: 29,
    features: ['weave_access'],
    version: '2.0.1'
  },
  {
    id: 'weave-risk',
    name: 'Supplier Risk AI',
    description: 'Real-time geopolitical risk analysis for Weave nodes.',
    icon: 'ShieldAlert',
    category: 'Productivity',
    type: 'addon',
    parentId: 'weave-core',
    price: 89,
    features: ['weave_risk_ai'],
    version: '1.0.0'
  },

  // RENDERCI (Visualization)
  {
    id: 'renderci-core',
    name: 'Renderci Studio',
    description: 'Distributed render farm management and job queuing.',
    icon: 'MonitorPlay',
    category: 'Operations',
    type: 'app',
    price: 49,
    features: ['renderci_access'],
    version: '1.2.0'
  },
  {
    id: 'renderci-kluster',
    name: 'Kluster GPU Access',
    description: 'Unlock access to high-performance remote GPU clusters.',
    icon: 'Cpu',
    category: 'Engineering',
    type: 'addon',
    parentId: 'renderci-core',
    price: 149,
    features: ['renderci_gpu'],
    version: '1.0.0'
  },

  // T-SA (Audit)
  {
    id: 'tsa-core',
    name: 'T-SA Audit',
    description: 'Technical safety audits and compliance checklists.',
    icon: 'ClipboardCheck',
    category: 'HR',
    type: 'app',
    price: 19,
    features: ['tsa_access'],
    version: '1.0.5'
  },

  // --- INTEGRATIONS (CROSS-APP) ---
  {
    id: 'smart-link',
    name: 'Smart Link: Flux x Forge',
    description: 'Auto-create maintenance jobs in Forge when Flux detects faults.',
    icon: 'Link',
    category: 'Integration',
    type: 'integration',
    price: 199,
    features: ['flux_forge_sync'],
    version: '1.0.0'
  },
  {
    id: 'eco-sync',
    name: 'EcoSync: ENV-I x Weave',
    description: 'Sync construction material requirements directly to supply chain map.',
    icon: 'RefreshCw',
    category: 'Integration',
    type: 'integration',
    price: 129,
    features: ['envi_weave_sync'],
    version: '1.0.0'
  }
];

export const useMarketplaceStore = create<MarketplaceState & MarketplaceActions>()(
  persist(
    (set, get) => ({
      availableModules: MOCK_MODULES,
      installedModules: [], 
      loading: false,

      getModule: (moduleId) => get().availableModules.find(m => m.id === moduleId),

      installModule: async (moduleId) => {
        set({ loading: true });
        await new Promise(resolve => setTimeout(resolve, 500));
        
        const newInstall: InstalledModule = {
          moduleId,
          installedAt: new Date().toISOString(),
          status: 'active',
          autoRenew: true
        };

        set(state => ({
          installedModules: [...state.installedModules, newInstall],
          loading: false
        }));
      },

      uninstallModule: async (moduleId) => {
         set({ loading: true });
         await new Promise(resolve => setTimeout(resolve, 300));
         set(state => ({
            installedModules: state.installedModules.filter(m => m.moduleId !== moduleId),
            loading: false
         }));
      },

      isModuleInstalled: (moduleId) => {
        return get().installedModules.some(m => m.moduleId === moduleId && m.status === 'active');
      },

      checkAccess: (featureKey) => {
        const { installedModules } = get();
        const requiredModuleId = FEATURE_TO_MODULE_MAP[featureKey];
        if (!requiredModuleId) return true; 
        return installedModules.some(m => m.moduleId === requiredModuleId && m.status === 'active');
      }
    }),
    {
      name: 'uph-marketplace-v3', // Bump version to clear old state and load new mock data
    }
  )
);
