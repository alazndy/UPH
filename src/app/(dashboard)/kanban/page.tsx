'use client';

import { KanbanBoard } from '@/components/kanban';
import { Button } from '@/components/ui/button';
import { Plus, Filter, SlidersHorizontal } from 'lucide-react';
import { useState } from 'react';
import { AddTaskDialog } from '@/components/kanban/add-task-dialog';

export default function KanbanPage() {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);

  return (
    <div className="flex-1 flex flex-col h-[calc(100vh-120px)]">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Kanban Board</h1>
          <p className="text-muted-foreground text-sm">
            Drag and drop tasks to manage your workflow
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="gap-2">
            <Filter className="h-4 w-4" />
            Filter
          </Button>
          <Button variant="outline" size="sm" className="gap-2">
            <SlidersHorizontal className="h-4 w-4" />
            View
          </Button>
          <Button 
            size="sm" 
            className="gap-2 bg-purple-600 hover:bg-purple-700"
            onClick={() => setIsAddDialogOpen(true)}
          >
            <Plus className="h-4 w-4" />
            Add Task
          </Button>
        </div>
      </div>

      {/* Kanban Board */}
      <div className="flex-1 overflow-hidden">
        <KanbanBoard />
      </div>

      <AddTaskDialog 
        open={isAddDialogOpen} 
        onOpenChange={setIsAddDialogOpen}
      />
    </div>
  );
}
