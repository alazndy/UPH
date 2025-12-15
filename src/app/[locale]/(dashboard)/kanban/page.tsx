'use client';

import { KanbanBoard } from '@/components/kanban';
import { Button } from '@/components/ui/button';
import { Plus, Filter, SlidersHorizontal } from 'lucide-react';
import { useState } from 'react';
import { AddTaskDialog } from '@/components/kanban/add-task-dialog';
import { useTranslations } from 'next-intl';

export default function KanbanPage() {
  const t = useTranslations('Kanban');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);

  return (
    <div className="flex-1 flex flex-col h-[calc(100vh-140px)]">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{t('title')}</h1>
          <p className="text-muted-foreground text-sm">
            {t('subtitle')}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="gap-2">
            <Filter className="h-4 w-4" />
            {t('filter')}
          </Button>
          <Button variant="outline" size="sm" className="gap-2">
            <SlidersHorizontal className="h-4 w-4" />
            {t('view')}
          </Button>
          <Button 
            size="sm" 
            className="gap-2 bg-purple-600 hover:bg-purple-700"
            onClick={() => setIsAddDialogOpen(true)}
          >
            <Plus className="h-4 w-4" />
            {t('addTask')}
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
