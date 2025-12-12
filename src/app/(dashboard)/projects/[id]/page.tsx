'use client';

import { useParams, useRouter } from 'next/navigation';
import { useProjectStore } from '@/stores/project-store';
import { useInventoryStore } from '@/stores/inventory-store';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { 
    Calendar, 
    DollarSign, 
    User, 
    Box, 
    ArrowLeft,
    Share2,
    Settings,
    LayoutDashboard,
    Pencil,
    Trash2,
    Github,
    Package,
    FileText,
    ExternalLink
} from 'lucide-react';
import Link from 'next/link';
import { 
    Table, 
    TableBody, 
    TableCell, 
    TableHead, 
    TableHeader, 
    TableRow 
} from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { EditProjectDialog } from '@/components/projects/edit-project-dialog';
import { ProjectTasks } from '@/components/projects/project-tasks';
import { ProjectFiles } from '@/components/projects/project-files';
import { ProjectDesigns } from '@/components/projects/project-designs';
import { AddInventoryDialog } from '@/components/projects/add-inventory-dialog';
import { ProjectPCBDesigns } from '@/components/projects/project-pcb-designs';
import { Project3DModels } from '@/components/projects/project-3d-models';
import { KanbanBoard } from '@/components/projects/kanban-board';
import { ConnectGitHubDialog } from '@/components/projects/connect-github-dialog';
import { AIAssistant } from '@/components/ai/ai-assistant';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useState, useEffect, useMemo } from 'react';

export default function ProjectDetailPage() {
    const params = useParams();
    const router = useRouter();
    const id = params.id as string;
    
    const { getProject, deleteProject, updateTaskStatus } = useProjectStore();
    const project = getProject(id);
    
    const { projectUsages, returnFromProject } = useInventoryStore();
    const projectInventory = useMemo(() => 
        projectUsages.filter(u => u.projectId === id && u.status === 'Active'),
        [projectUsages, id]
    );

    const [editDialogOpen, setEditDialogOpen] = useState(false);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [githubDialogOpen, setGithubDialogOpen] = useState(false);
    const [inventoryDialogOpen, setInventoryDialogOpen] = useState(false);

    const handleDelete = async () => {
        if (project) {
            await deleteProject(project.id);
            router.push('/projects');
        }
    };

    const handleReturn = async (usageId: string, quantity: number, productName: string) => {
        if (confirm(`${quantity} adet ${productName} stoğa iade edilsin mi?`)) {
            await returnFromProject(usageId, quantity);
        }
    };

    if (!project) {
        return (
            <div className="flex flex-col items-center justify-center h-full space-y-4">
                <h2 className="text-2xl font-bold">Project Not Found</h2>
                <Button asChild variant="secondary">
                    <Link href="/projects"><ArrowLeft className="mr-2 h-4 w-4"/> Back to Projects</Link>
                </Button>
            </div>
        );
    }

    return (
        <div className="flex-1 space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                     <div className="flex items-center gap-2 mb-2">
                        <Link href="/projects" className="text-muted-foreground hover:text-foreground">
                            <ArrowLeft className="h-4 w-4" />
                        </Link>
                        <Badge variant="outline" className="text-xs uppercase">{project.status}</Badge>
                        {project.priority === 'High' && <Badge variant="destructive" className="text-xs">High Priority</Badge>}
                    </div>
                    <h1 className="text-3xl font-bold tracking-tight">{project.name}</h1>
                    <p className="text-muted-foreground mt-1 max-w-2xl">{project.description}</p>
                </div>
                <div className="flex space-x-2">
                    <Button variant="outline" onClick={() => setGithubDialogOpen(true)}>
                        <Github className="mr-2 h-4 w-4" /> GitHub
                    </Button>
                    <Button variant="outline" onClick={() => setEditDialogOpen(true)}>
                        <Pencil className="mr-2 h-4 w-4" /> Edit
                    </Button>
                    <Button variant="destructive" onClick={() => setDeleteDialogOpen(true)}>
                        <Trash2 className="mr-2 h-4 w-4" /> Delete
                    </Button>
                </div>
            </div>

            {/* Content Tabs */}
            <Tabs defaultValue="overview" className="space-y-4">
                <TabsList>
                    <TabsTrigger value="overview">Overview</TabsTrigger>
                    <TabsTrigger value="tasks">Tasks</TabsTrigger>
                    <TabsTrigger value="board">Board View</TabsTrigger>
                    <TabsTrigger value="designs">Weave</TabsTrigger>
                    <TabsTrigger value="pcb">PCB</TabsTrigger>
                    <TabsTrigger value="3d">3D</TabsTrigger>
                    <TabsTrigger value="files">Files & Documents</TabsTrigger>
                </TabsList>

                <TabsContent value="overview" className="space-y-4">
                    {/* Metrics Grid */}
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Budget Usage</CardTitle>
                                <DollarSign className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">${project.spent.toLocaleString()} / ${project.budget.toLocaleString()}</div>
                                <Progress value={(project.spent / project.budget) * 100} className="mt-2 h-1.5" />
                                <p className="text-xs text-muted-foreground mt-2">
                                    {((project.spent / project.budget) * 100).toFixed(1)}% of budget used
                                </p>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Timeline</CardTitle>
                                <Calendar className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-lg font-bold">{project.deadline || 'No deadline'}</div>
                                <p className="text-xs text-muted-foreground mt-1">Start: {project.startDate}</p>
                                <div className="mt-2 text-xs flex items-center gap-1 font-medium text-green-600">
                                     On Track
                                </div>
                            </CardContent>
                        </Card>
                        <Card>
                             <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Allocated Items</CardTitle>
                                <Box className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{projectInventory.length}</div>
                                <p className="text-xs text-muted-foreground mt-1">Components assigned via Inventory</p>
                            </CardContent>
                        </Card>
                         <Card>
                             <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Completion</CardTitle>
                                <LayoutDashboard className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{project.completionPercentage}%</div>
                                <Progress value={project.completionPercentage} className="mt-2 h-1.5" />
                            </CardContent>
                        </Card>
                    </div>

                    {/* Scope Section */}
                    {project.scope && (
                        <Card>
                            <CardHeader className="pb-2">
                                <CardTitle className="text-sm font-medium flex items-center gap-2">
                                    <FileText className="h-4 w-4 text-muted-foreground" />
                                    Proje Kapsamı
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-sm whitespace-pre-wrap">{project.scope}</p>
                            </CardContent>
                        </Card>
                    )}

                    {/* Inventory Table */}
                    <Card className="col-span-full">
                        <CardHeader className="flex flex-row items-center justify-between">
                            <div>
                                <CardTitle>Kullanılan Malzemeler</CardTitle>
                                <CardDescription>
                                    Bu projeye atanan ürün ve ekipmanlar
                                </CardDescription>
                            </div>
                            <Button onClick={() => setInventoryDialogOpen(true)}>
                                <Package className="mr-2 h-4 w-4" /> Ürün Ekle
                            </Button>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Product Name</TableHead>
                                        <TableHead>Assigned Quantity</TableHead>
                                        <TableHead>Assigned Date</TableHead>
                                        <TableHead>Assigned By</TableHead>
                                        <TableHead className="text-right">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {projectInventory.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={5} className="text-center py-6 text-muted-foreground">
                                                No items assigned yet. Go to Inventory to assign items.
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        projectInventory.map((item) => (
                                            <TableRow key={item.id}>
                                                <TableCell className="font-medium">
                                                    <a 
                                                        href={`/inventory?search=${encodeURIComponent(item.productName)}`}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="hover:underline flex items-center gap-1 text-primary"
                                                    >
                                                        {item.productName}
                                                        <ExternalLink className="h-3 w-3" />
                                                    </a>
                                                </TableCell>
                                                <TableCell>
                                                    <Badge variant="secondary" className="font-mono text-xs">
                                                        {item.quantity} adet
                                                    </Badge>
                                                </TableCell>
                                                <TableCell>{new Date(item.assignedDate).toLocaleDateString('tr-TR')}</TableCell>
                                                <TableCell>{item.assignedBy}</TableCell>
                                                <TableCell className="text-right">
                                                    <Button 
                                                        variant="ghost" 
                                                        size="sm" 
                                                        className="text-red-500 hover:text-red-700 hover:bg-red-50"
                                                        onClick={() => handleReturn(item.id, item.quantity, item.productName)}
                                                    >
                                                        İade Et
                                                    </Button>
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    )}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="tasks">
                    <ProjectTasks project={project} />
                </TabsContent>

                <TabsContent value="board" className="space-y-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <h3 className="text-lg font-semibold">Kanban Board</h3>
                            <p className="text-sm text-muted-foreground">Drag and drop tasks between columns</p>
                        </div>
                    </div>
                    <KanbanBoard 
                        tasks={project.tasks || []} 
                        onTaskStatusChange={(taskId, status) => updateTaskStatus(project.id, taskId, status)}
                    />
                </TabsContent>

                <TabsContent value="designs">
                     <ProjectDesigns project={project} />
                </TabsContent>

                <TabsContent value="pcb">
                     <ProjectPCBDesigns project={project} />
                </TabsContent>

                <TabsContent value="3d">
                     <Project3DModels project={project} />
                </TabsContent>

                <TabsContent value="files">
                     <ProjectFiles project={project} />
                </TabsContent>
            </Tabs>

            {/* Dialogs */}
            <EditProjectDialog 
                project={project} 
                open={editDialogOpen} 
                onOpenChange={setEditDialogOpen} 
            />

            <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                    <AlertDialogTitle>Delete this project?</AlertDialogTitle>
                    <AlertDialogDescription>
                        This will permanently delete <span className="font-semibold">{project.name}</span> and remove all tracking data.
                        Inventory items assigned to this project will NOT be deleted, but their assignment history may be lost or archived.
                    </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700">Delete Project</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            <ConnectGitHubDialog 
                projectId={project.id}
                projectName={project.name}
                open={githubDialogOpen}
                onOpenChange={setGithubDialogOpen}
            />

            <AddInventoryDialog 
                projectId={project.id}
                projectName={project.name}
                open={inventoryDialogOpen}
                onOpenChange={setInventoryDialogOpen}
            />

            <AIAssistant 
                projectId={project.id}
                projectName={project.name}
                projectDescription={project.description}
            />
        </div>
    );
}
