'use client';

import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { GripVertical, Calendar, MoreHorizontal, Trash2 } from 'lucide-react';
import { KanbanTask, useKanbanStore } from '@/stores/kanban-store';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';

interface KanbanCardProps {
  task: KanbanTask;
}

const priorityColors = {
  low: 'bg-slate-500/20 text-slate-400 border-slate-500/30',
  medium: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  high: 'bg-red-500/20 text-red-400 border-red-500/30',
};

export function KanbanCard({ task }: KanbanCardProps) {
  const { deleteTask } = useKanbanStore();
  
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: task.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <Card
      ref={setNodeRef}
      style={style}
      className={cn(
        'bg-zinc-900/50 border-zinc-800 hover:border-zinc-700 transition-all cursor-grab active:cursor-grabbing',
        isDragging && 'opacity-50 shadow-2xl ring-2 ring-purple-500/50'
      )}
    >
      <CardHeader className="p-3 pb-2 flex flex-row items-start justify-between space-y-0">
        <div className="flex items-center gap-2">
          <button
            {...attributes}
            {...listeners}
            className="text-zinc-500 hover:text-zinc-300 cursor-grab active:cursor-grabbing"
          >
            <GripVertical className="h-4 w-4" />
          </button>
          <h4 className="text-sm font-medium text-zinc-100 leading-tight">
            {task.title}
          </h4>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-6 w-6 text-zinc-500 hover:text-zinc-300">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="bg-zinc-900 border-zinc-800">
            <DropdownMenuItem 
              onClick={() => deleteTask(task.id)}
              className="text-red-400 focus:text-red-300"
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </CardHeader>
      <CardContent className="p-3 pt-0">
        {task.description && (
          <p className="text-xs text-zinc-500 mb-3 line-clamp-2">
            {task.description}
          </p>
        )}
        <div className="flex items-center justify-between">
          <Badge 
            variant="outline" 
            className={cn('text-[10px] px-1.5 py-0', priorityColors[task.priority])}
          >
            {task.priority}
          </Badge>
          {task.dueDate && (
            <div className="flex items-center gap-1 text-xs text-zinc-500">
              <Calendar className="h-3 w-3" />
              {task.dueDate.toLocaleDateString()}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
