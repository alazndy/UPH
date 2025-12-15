import { create } from 'zustand';

export type TaskStatus = 'backlog' | 'todo' | 'in-progress' | 'review' | 'done';

export interface KanbanTask {
  id: string;
  title: string;
  description?: string;
  status: TaskStatus;
  priority: 'low' | 'medium' | 'high';
  assignee?: string;
  dueDate?: Date;
  projectId: string;
  order: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface KanbanColumn {
  id: TaskStatus;
  title: string;
  tasks: KanbanTask[];
}

interface KanbanState {
  columns: KanbanColumn[];
  isLoading: boolean;
  
  // Actions
  moveTask: (taskId: string, fromStatus: TaskStatus, toStatus: TaskStatus, newOrder: number) => void;
  addTask: (task: Omit<KanbanTask, 'id' | 'createdAt' | 'updatedAt' | 'order'>) => void;
  updateTask: (taskId: string, updates: Partial<KanbanTask>) => void;
  deleteTask: (taskId: string) => void;
  reorderTasks: (status: TaskStatus, startIndex: number, endIndex: number) => void;
}

const defaultColumns: KanbanColumn[] = [
  { id: 'backlog', title: 'Backlog', tasks: [] },
  { id: 'todo', title: 'To Do', tasks: [] },
  { id: 'in-progress', title: 'In Progress', tasks: [] },
  { id: 'review', title: 'Review', tasks: [] },
  { id: 'done', title: 'Done', tasks: [] },
];

// Mock tasks for demo
const mockTasks: KanbanTask[] = [
  {
    id: '1',
    title: 'Design system setup',
    description: 'Create base components and tokens',
    status: 'done',
    priority: 'high',
    projectId: 'demo',
    order: 0,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: '2',
    title: 'Implement authentication',
    description: 'Add Google/GitHub OAuth',
    status: 'done',
    priority: 'high',
    projectId: 'demo',
    order: 1,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: '3',
    title: 'Create Kanban board',
    description: 'Drag and drop task management',
    status: 'in-progress',
    priority: 'high',
    projectId: 'demo',
    order: 0,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: '4',
    title: 'Add analytics dashboard',
    status: 'todo',
    priority: 'medium',
    projectId: 'demo',
    order: 0,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: '5',
    title: 'Integrate Google Drive',
    status: 'backlog',
    priority: 'low',
    projectId: 'demo',
    order: 0,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

const initializeColumns = (): KanbanColumn[] => {
  return defaultColumns.map(col => ({
    ...col,
    tasks: mockTasks.filter(t => t.status === col.id).sort((a, b) => a.order - b.order)
  }));
};

export const useKanbanStore = create<KanbanState>((set) => ({
  columns: initializeColumns(),
  isLoading: false,

  moveTask: (taskId, fromStatus, toStatus, newOrder) => {
    set(state => {
      const newColumns = [...state.columns];
      
      // Find source column and task
      const sourceCol = newColumns.find(c => c.id === fromStatus);
      const destCol = newColumns.find(c => c.id === toStatus);
      
      if (!sourceCol || !destCol) return state;
      
      const taskIndex = sourceCol.tasks.findIndex(t => t.id === taskId);
      if (taskIndex === -1) return state;
      
      // Remove from source
      const [task] = sourceCol.tasks.splice(taskIndex, 1);
      
      // Update task status and order
      task.status = toStatus;
      task.order = newOrder;
      task.updatedAt = new Date();
      
      // Insert at new position
      destCol.tasks.splice(newOrder, 0, task);
      
      // Update orders in destination column
      destCol.tasks.forEach((t, i) => { t.order = i; });
      
      return { columns: newColumns };
    });
  },

  addTask: (taskData) => {
    const newTask: KanbanTask = {
      ...taskData,
      id: Math.random().toString(36).substring(7),
      order: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    
    set(state => {
      const newColumns = state.columns.map(col => {
        if (col.id === taskData.status) {
          // Add to beginning, shift others
          const newTasks = [newTask, ...col.tasks.map(t => ({ ...t, order: t.order + 1 }))];
          return { ...col, tasks: newTasks };
        }
        return col;
      });
      return { columns: newColumns };
    });
  },

  updateTask: (taskId, updates) => {
    set(state => ({
      columns: state.columns.map(col => ({
        ...col,
        tasks: col.tasks.map(t => 
          t.id === taskId ? { ...t, ...updates, updatedAt: new Date() } : t
        )
      }))
    }));
  },

  deleteTask: (taskId) => {
    set(state => ({
      columns: state.columns.map(col => ({
        ...col,
        tasks: col.tasks.filter(t => t.id !== taskId)
      }))
    }));
  },

  reorderTasks: (status, startIndex, endIndex) => {
    set(state => {
      const newColumns = state.columns.map(col => {
        if (col.id !== status) return col;
        
        const newTasks = [...col.tasks];
        const [removed] = newTasks.splice(startIndex, 1);
        newTasks.splice(endIndex, 0, removed);
        
        // Update orders
        newTasks.forEach((t, i) => { t.order = i; });
        
        return { ...col, tasks: newTasks };
      });
      return { columns: newColumns };
    });
  },
}));
