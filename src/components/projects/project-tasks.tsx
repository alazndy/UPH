'use client';

import { useState } from 'react';
import { Project, ProjectTask } from '@/types/project';
import { useProjectStore } from '@/stores/project-store';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Trash2, Plus, Calendar as CalendarIcon } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface ProjectTasksProps {
    project: Project;
}

export function ProjectTasks({ project }: ProjectTasksProps) {
    const { addTask, toggleTask, deleteTask } = useProjectStore();
    const [newTaskTitle, setNewTaskTitle] = useState('');

    const handleAddTask = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newTaskTitle.trim()) return;

        await addTask(project.id, {
            title: newTaskTitle,
            completed: false,
            status: 'todo'
        });
        setNewTaskTitle('');
    };

    // Sort tasks: Incomplete first, then completed
    const sortedTasks = [...(project.tasks || [])].sort((a, b) => {
        if (a.completed === b.completed) return 0;
        return a.completed ? 1 : -1;
    });

    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
                <div className="space-y-1">
                    <CardTitle>Project Tasks</CardTitle>
                    <CardDescription>
                        {project.tasks?.filter(t => t.completed).length || 0} of {project.tasks?.length || 0} tasks completed
                    </CardDescription>
                </div>
            </CardHeader>
            <CardContent className="space-y-4">
                {/* Add Task Form */}
                <form onSubmit={handleAddTask} className="flex gap-2">
                    <Input 
                        placeholder="Add a new task..." 
                        value={newTaskTitle}
                        onChange={(e) => setNewTaskTitle(e.target.value)}
                        className="flex-1"
                    />
                    <Button type="submit" size="sm">
                        <Plus className="h-4 w-4 mr-1" /> Add
                    </Button>
                </form>

                {/* Task List */}
                <div className="space-y-2 mt-4">
                    {sortedTasks.length === 0 ? (
                        <div className="text-center py-8 text-muted-foreground border border-dashed rounded-md">
                            No tasks yet. Add one to get started!
                        </div>
                    ) : (
                        sortedTasks.map(task => (
                            <div 
                                key={task.id} 
                                className={`flex items-center justify-between p-3 border rounded-md transition-all hover:bg-muted/50 ${task.completed ? 'bg-muted/20' : 'bg-card'}`}
                            >
                                <div className="flex items-center gap-3 overflow-hidden">
                                    <Checkbox 
                                        checked={task.completed} 
                                        onCheckedChange={() => toggleTask(project.id, task.id)}
                                    />
                                    <span className={`truncate ${task.completed ? 'line-through text-muted-foreground' : 'font-medium'}`}>
                                        {task.title}
                                    </span>
                                </div>
                                <Button 
                                    variant="ghost" 
                                    size="icon" 
                                    className="h-8 w-8 text-muted-foreground hover:text-destructive"
                                    onClick={() => deleteTask(project.id, task.id)}
                                >
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            </div>
                        ))
                    )}
                </div>
            </CardContent>
        </Card>
    );
}
