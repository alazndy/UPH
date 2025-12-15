'use client';

import { useState } from 'react';
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
  closestCorners,
} from '@dnd-kit/core';
import { useKanbanStore, KanbanTask, TaskStatus } from '@/stores/kanban-store';
import { KanbanColumn } from './kanban-column';
import { KanbanCard } from './kanban-card';
import { AddTaskDialog } from './add-task-dialog';

export function KanbanBoard() {
  const { columns, moveTask, reorderTasks } = useKanbanStore();
  const [activeTask, setActiveTask] = useState<KanbanTask | null>(null);
  const [addTaskColumn, setAddTaskColumn] = useState<TaskStatus | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    const task = columns
      .flatMap(c => c.tasks)
      .find(t => t.id === active.id);
    
    if (task) {
      setActiveTask(task);
    }
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    
    if (!over) {
      setActiveTask(null);
      return;
    }

    const activeId = active.id as string;
    const overId = over.id as string;

    // Find source task and column
    let sourceColumn: TaskStatus | null = null;
    let sourceTask: KanbanTask | null = null;
    
    for (const col of columns) {
      const task = col.tasks.find(t => t.id === activeId);
      if (task) {
        sourceColumn = col.id;
        sourceTask = task;
        break;
      }
    }

    if (!sourceColumn || !sourceTask) {
      setActiveTask(null);
      return;
    }

    // Check if dropped on a column
    const targetColumn = columns.find(c => c.id === overId);
    if (targetColumn) {
      // Dropped directly on column
      if (sourceColumn !== overId) {
        // Move Task: requires task object, new status, new order
        await moveTask(sourceTask, overId as TaskStatus, targetColumn.tasks.length);
      }
    } else {
      // Dropped on another task - find its column
      for (const col of columns) {
        const overTaskIndex = col.tasks.findIndex(t => t.id === overId);
        if (overTaskIndex !== -1) {
            // Since wait reorderTasks is not fully implemented in global store for simplicty (requires batch updates across projects which is complex)
            // We focus on Moving between columns or simple reorder if same column (local state update only maybe?)
            
            // For now, if same column, we might skip reorder persistence or implement it later.
            // If different column:
          if (col.id !== sourceColumn) {
             await moveTask(sourceTask, col.id, overTaskIndex);
          }
          break;
        }
      }
    }

    setActiveTask(null);
  };

  return (
    <div className="h-full">
      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <div className="flex gap-4 overflow-x-auto pb-4 h-full">
          {columns.map(column => (
            <KanbanColumn
              key={column.id}
              column={column}
              onAddTask={() => setAddTaskColumn(column.id)}
            />
          ))}
        </div>

        <DragOverlay>
          {activeTask && (
            <div className="rotate-3 scale-105">
              <KanbanCard task={activeTask} />
            </div>
          )}
        </DragOverlay>
      </DndContext>

      <AddTaskDialog
        open={addTaskColumn !== null}
        onOpenChange={(open: boolean) => !open && setAddTaskColumn(null)}
        defaultStatus={addTaskColumn || 'todo'}
      />
    </div>
  );
}
