import { create } from 'zustand';
import { 
  ResourceCapacity, 
  DailyCapacityPoint, 
  ResourceHeatmapData,
  ResourceLoad 
} from '@/types/resource';
import { addDays, format, isWithinInterval, parseISO, isSameDay } from 'date-fns';

interface CapacityState {
  resources: ResourceCapacity[];
  isLoading: boolean;
  
  // Actions
  fetchResources: () => Promise<void>;
  calculateHeatmapData: (startDate: Date, days: number) => ResourceHeatmapData[];
  addAssignment: (userId: string, assignment: ResourceLoad) => void;
  getBottlenecks: (startDate: Date, days: number) => any[];
  getReplacementSuggestions: (date: string, requiredHours: number) => ResourceCapacity[];
}

// Mock Data
const mockResources: ResourceCapacity[] = [
  {
    userId: 'user-1',
    displayName: 'Ahmet Yılmaz',
    role: 'engineer',
    standardDailyHours: 8,
    weeklyWorkingDays: [1, 2, 3, 4, 5],
    exceptions: [],
    currentAssignments: [
      {
        projectId: 'proj-1',
        projectName: 'T-HUB Transformation',
        hoursPerDay: 4,
        startDate: format(new Date(), 'yyyy-MM-dd'),
        endDate: format(addDays(new Date(), 20), 'yyyy-MM-dd'),
        utilizationPercentage: 50
      },
      {
        projectId: 'proj-2',
        projectName: 'Smart Factory IoT',
        hoursPerDay: 2,
        startDate: format(addDays(new Date(), -5), 'yyyy-MM-dd'),
        endDate: format(addDays(new Date(), 10), 'yyyy-MM-dd'),
        utilizationPercentage: 25
      }
    ]
  },
  {
    userId: 'user-2',
    displayName: 'Ayşe Kaya',
    role: 'designer',
    standardDailyHours: 8,
    weeklyWorkingDays: [1, 2, 3, 4, 5],
    exceptions: [
        { date: format(addDays(new Date(), 2), 'yyyy-MM-dd'), availableHours: 0, reason: 'İzin' }
    ],
    currentAssignments: [
      {
        projectId: 'proj-1',
        projectName: 'T-HUB Transformation',
        hoursPerDay: 6,
        startDate: format(new Date(), 'yyyy-MM-dd'),
        endDate: format(addDays(new Date(), 30), 'yyyy-MM-dd'),
        utilizationPercentage: 75
      }
    ]
  }
];

export const useResourceStore = create<CapacityState>((set, get) => ({
  resources: mockResources,
  isLoading: false,

  fetchResources: async () => {
    set({ isLoading: true });
    await new Promise(resolve => setTimeout(resolve, 500));
    set({ isLoading: false });
  },

  calculateHeatmapData: (startDate: Date, days: number) => {
    const { resources } = get();
    const heatmap: ResourceHeatmapData[] = [];

    resources.forEach(resource => {
      const dailyData: DailyCapacityPoint[] = [];

      for (let i = 0; i < days; i++) {
        const currentDate = addDays(startDate, i);
        const dateStr = format(currentDate, 'yyyy-MM-dd');
        
        // 1. Durum: Tatil günü mü?
        const dayOfWeek = currentDate.getDay();
        const isWorkingDay = resource.weeklyWorkingDays.includes(dayOfWeek);
        
        // 2. Durum: İstisna (İzin vb.) var mı?
        const exception = resource.exceptions.find(e => e.date === dateStr);
        
        const baseCapacity = isWorkingDay ? resource.standardDailyHours : 0;
        const actualCapacity = exception ? exception.availableHours : baseCapacity;

        // 3. Durum: Atanmış işlerin toplamı
        let allocatedHours = 0;
        const dayAssignments: Array<{projectName: string, load: number}> = [];

        resource.currentAssignments.forEach(assignment => {
          const start = parseISO(assignment.startDate);
          const end = parseISO(assignment.endDate);

          if (isWithinInterval(currentDate, { start, end })) {
            allocatedHours += assignment.hoursPerDay;
            dayAssignments.push({
              projectName: assignment.projectName,
              load: assignment.hoursPerDay
            });
          }
        });

        const availableHours = Math.max(0, actualCapacity - allocatedHours);
        const utilization = actualCapacity > 0 ? (allocatedHours / actualCapacity) * 100 : 0;

        dailyData.push({
          date: dateStr,
          totalCapacity: actualCapacity,
          allocatedHours,
          availableHours,
          utilization,
          assignments: dayAssignments
        });
      }

      heatmap.push({
        userId: resource.userId,
        displayName: resource.displayName,
        dailyData
      });
    });

    return heatmap;
  },

  addAssignment: (userId, assignment) => {
    set(state => ({
      resources: state.resources.map(r => 
        r.userId === userId 
          ? { ...r, currentAssignments: [...r.currentAssignments, assignment] }
          : r
      )
    }));
  },

  getBottlenecks: (startDate, days) => {
    const heatmap = get().calculateHeatmapData(startDate, days);
    const bottlenecks: any[] = [];

    heatmap.forEach(h => {
      const overloads = h.dailyData.filter(d => d.utilization > 100);
      if (overloads.length > 0) {
        bottlenecks.push({
          userId: h.userId,
          displayName: h.displayName,
          daysOverloaded: overloads.length,
          dates: overloads.map(o => o.date)
        });
      }
    });

    return bottlenecks;
  },

  getReplacementSuggestions: (date, requiredHours) => {
    const { resources } = get();
    // Calculate heatmap for just that date
    return resources.filter(resource => {
      const heatmap = get().calculateHeatmapData(parseISO(date), 1);
      const dayData = heatmap.find(h => h.userId === resource.userId)?.dailyData[0];
      return dayData && dayData.availableHours >= requiredHours;
    });
  }
}));
