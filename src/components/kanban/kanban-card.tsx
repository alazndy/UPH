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
  const t = useTranslations('Kanban');
  const tCommon = useTranslations('Common');
  // ... (keep hooks)


  // ...

  return (
    <Card
      // ... props
    >
      <CardHeader className="p-3 pb-2 flex flex-row items-start justify-between space-y-0">
        {/* ... */}
        <DropdownMenu>
          {/* ... */}
          <DropdownMenuContent align="end" className="bg-zinc-900 border-zinc-800">
            <DropdownMenuItem 
              onClick={() => deleteTask(task.id)}
              className="text-red-400 focus:text-red-300"
            >
              <Trash2 className="mr-2 h-4 w-4" />
              {tCommon('actions.delete') || 'Delete'}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </CardHeader>
      <CardContent className="p-3 pt-0">
        {/* ... */}
        <div className="flex items-center justify-between">
          <Badge 
            variant="outline" 
            className={cn('text-[10px] px-1.5 py-0', priorityColors[task.priority])}
          >
            {t(`priorities.${task.priority}`)}
          </Badge>
          {/* ... */}
        </div>
      </CardContent>
    </Card>
  );
}
