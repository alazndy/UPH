import { FixedSizeList as List } from 'react-window';
import AutoSizer from 'react-virtualized-auto-sizer';

// ... (other imports remain same)

// Memoized Task Item (Keep this as is, but make sure style is passed for virtualization)
const TaskItem = memo(({ 
    task, 
    projectId, 
    onToggle, 
    onDelete,
    style 
}: { 
    task: ProjectTask, 
    projectId: string, 
    onToggle: (pid: string, tid: string, completed: boolean) => void, 
    onDelete: (pid: string, tid: string) => void,
    style?: React.CSSProperties
}) => {
    return (
        <div 
            style={style}
            className={`flex items-center justify-between p-3 border rounded-md transition-all hover:bg-muted/50 ${task.completed ? 'bg-muted/20' : 'bg-card'}`}
        >
             {/* Content same as before */}
            <div className="flex items-center gap-3 overflow-hidden">
                <Checkbox 
                    checked={task.completed} 
                    onCheckedChange={() => onToggle(projectId, task.id, task.completed)}
                />
                <span className={`truncate ${task.completed ? 'line-through text-muted-foreground' : 'font-medium'}`}>
                    {task.title}
                </span>
            </div>
            <Button 
                variant="ghost" 
                size="icon" 
                className="h-8 w-8 text-muted-foreground hover:text-destructive"
                onClick={() => onDelete(projectId, task.id)}
            >
                <Trash2 className="h-4 w-4" />
            </Button>
        </div>
    );
});

TaskItem.displayName = 'TaskItem';

export function ProjectTasks({ project }: ProjectTasksProps) {
    const { addTask, toggleTask, deleteTask, getProjectTasks, fetchProjectTasks } = useProjectStore();
    const [newTaskTitle, setNewTaskTitle] = useState('');

    useEffect(() => {
        fetchProjectTasks(project.id);
    }, [project.id, fetchProjectTasks]);

    const tasks = getProjectTasks(project.id);

    // ... (Handlers handleAddTask, handleToggle, handleDelete same as before)
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

    const handleToggle = useCallback((pid: string, tid: string, completed: boolean) => {
        toggleTask(pid, tid, completed);
    }, [toggleTask]);

    const handleDelete = useCallback((pid: string, tid: string) => {
        deleteTask(pid, tid);
    }, [deleteTask]);

    const sortedTasks = [...tasks].sort((a, b) => {
        if (a.completed === b.completed) return 0;
        return a.completed ? 1 : -1;
    });

    const Row = ({ index, style }: { index: number, style: React.CSSProperties }) => (
        <div style={{ ...style, paddingBottom: '8px' }}>
            <TaskItem 
                task={sortedTasks[index]} 
                projectId={project.id} 
                onToggle={handleToggle} 
                onDelete={handleDelete} 
            />
        </div>
    );

    return (
        <Card className="h-[500px] flex flex-col">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
                <div className="space-y-1">
                    <CardTitle>Project Tasks</CardTitle>
                    <CardDescription>
                        {tasks.filter(t => t.completed).length || 0} of {tasks.length || 0} tasks completed
                    </CardDescription>
                </div>
            </CardHeader>
            <CardContent className="space-y-4 flex-1 flex flex-col min-h-0">
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

                <div className="flex-1 mt-4 min-h-0">
                    {sortedTasks.length === 0 ? (
                        <div className="text-center py-8 text-muted-foreground border border-dashed rounded-md">
                            No tasks yet. Add one to get started!
                        </div>
                    ) : (
                        <AutoSizer>
                            {({ height, width }) => (
                                <List
                                    height={height}
                                    itemCount={sortedTasks.length}
                                    itemSize={60} // Adjusted for padding
                                    width={width}
                                >
                                    {Row}
                                </List>
                            )}
                        </AutoSizer>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}
