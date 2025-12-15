'use client';

import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { KanbanColumn as KanbanColumnType } from '@/stores/kanban-store';
import { KanbanCard } from './kanban-card';
import { cn } from '@/lib/utils';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface KanbanColumnProps {
  column: KanbanColumnType;
  onAddTask?: () => void;
}

const columnColors: Record<string, string> = {
  'backlog': 'border-t-slate-500',
  'todo': 'border-t-blue-500',
  'in-progress': 'border-t-yellow-500',
  'review': 'border-t-purple-500',
  'done': 'border-t-green-500',
};

export function KanbanColumn({ column, onAddTask }: KanbanColumnProps) {
  const { setNodeRef, isOver } = useDroppable({
    id: column.id,
  });

  return (
    <div
      ref={setNodeRef}
      className={cn(
        'flex flex-col min-w-[280px] w-[280px] bg-zinc-900/30 rounded-xl border border-zinc-800 border-t-2',
        columnColors[column.id] || 'border-t-zinc-500',
        isOver && 'bg-zinc-800/50 border-purple-500/50'
      )}
    >
      {/* Column Header */}
      <div className="p-3 border-b border-zinc-800">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h3 className="font-semibold text-sm text-zinc-100">{column.title}</h3>
            <span className="text-xs bg-zinc-800 text-zinc-400 px-2 py-0.5 rounded-full">
              {column.tasks.length}
            </span>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6 text-zinc-500 hover:text-zinc-300"
            onClick={onAddTask}
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Tasks */}
      <div className="flex-1 p-2 space-y-2 overflow-y-auto min-h-[200px] max-h-[calc(100vh-300px)]">
        <SortableContext
          items={column.tasks.map(t => t.id)}
          strategy={verticalListSortingStrategy}
        >
          {column.tasks.map(task => (
            <KanbanCard key={task.id} task={task} />
          ))}
        </SortableContext>
        
        {column.tasks.length === 0 && (
          <div className="flex items-center justify-center h-20 text-zinc-600 text-sm">
            No tasks
          </div>
        )}
      </div>
    </div>
  );
}
