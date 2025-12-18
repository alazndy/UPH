'use client';

import { useParams, useRouter } from 'next/navigation';
import { useAuthStore } from "@/stores/auth-store";
import { useProjectStore } from '@/stores/project-store';
import { useInventoryStore } from '@/stores/inventory-store';
import { useSettingsStore } from '@/stores/settings-store';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { 
    Calendar, 
    DollarSign, 
    Calendar, 
    DollarSign, 
    Box, 
    ArrowLeft,
    LayoutDashboard,
    Pencil,
    Trash2,
    Github,
    Package,
    FileText,
    Loader2,
    Check,
    AlertTriangle,
    ArrowRightLeft,
    RefreshCw
} from 'lucide-react';
import { BOMService, BOMItem } from "@/services/bom-service";
import Link from 'next/link';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
import dynamic from 'next/dynamic';
import { Skeleton } from '@/components/ui/skeleton';

// -- Lazy Loaded Components for Performance --
const ProjectTasks = dynamic(() => import('@/components/projects/project-tasks').then(mod => mod.ProjectTasks), {
  loading: () => <div className="space-y-2"><Skeleton className="h-10 w-full" /><Skeleton className="h-20 w-full" /></div>
});
const ProjectFiles = dynamic(() => import('@/components/projects/project-files').then(mod => mod.ProjectFiles), {
    loading: () => <Skeleton className="h-[300px] w-full" />
});
const ProjectDesigns = dynamic(() => import('@/components/projects/project-designs').then(mod => mod.ProjectDesigns), {
    loading: () => <Skeleton className="h-[400px] w-full" />
});
const ProjectPCBDesigns = dynamic(() => import('@/components/projects/project-pcb-designs').then(mod => mod.ProjectPCBDesigns), {
    loading: () => <Skeleton className="h-[500px] w-full" />
});
const Project3DModels = dynamic(() => import('@/components/projects/project-3d-models').then(mod => mod.Project3DModels), {
    loading: () => <Skeleton className="h-[600px] w-full" />
});
const KanbanBoard = dynamic(() => import('@/components/projects/kanban-board').then(mod => mod.KanbanBoard), {
    loading: () => <div className="flex gap-4"><Skeleton className="h-[500px] w-64" /><Skeleton className="h-[500px] w-64" /><Skeleton className="h-[500px] w-64" /></div>
});
const ProjectGantt = dynamic(() => import('@/components/projects/project-gantt').then(mod => mod.ProjectGantt), {
    loading: () => <Skeleton className="h-[500px] w-full" />
});
const ProjectFinancials = dynamic(() => import('@/components/projects/project-financials').then(mod => mod.ProjectFinancials), {
    loading: () => <div className="grid gap-4 md:grid-cols-2"><Skeleton className="h-[300px]" /><Skeleton className="h-[300px]" /></div>
});
const DriveBrowser = dynamic(() => import('@/components/projects/drive-browser').then(mod => mod.DriveBrowser), {
    loading: () => <Skeleton className="h-[400px] w-full" />
});

// Dialogs are also lazy loaded as they are not needed on initial render
const ConnectGitHubDialog = dynamic(() => import('@/components/projects/connect-github-dialog').then(mod => mod.ConnectGitHubDialog));
const AddInventoryDialog = dynamic(() => import('@/components/projects/add-inventory-dialog').then(mod => mod.AddInventoryDialog));
const AIAssistant = dynamic(() => import('@/components/ai/ai-assistant').then(mod => mod.AIAssistant), { ssr: false });
const EditProjectDialog = dynamic(() => import('@/components/projects/edit-project-dialog').then(mod => mod.EditProjectDialog));
import { GitHubStats } from '@/components/projects/github-stats';
import { MarkdownViewer } from '@/components/ui/markdown-viewer';

export default function ProjectDetailPage() {
    const params = useParams();
    const router = useRouter();
    const id = params.id as string;
    
    // Destructure isLoading and fetchProjects as well
    const { getProject, deleteProject, fetchProjectTasks, fetchProjects, isLoading, syncGitHubIssues, syncProjectReadme } = useProjectStore();
    const project = getProject(id);
    
    const { projectUsages, fetchInventory } = useInventoryStore();
    const projectInventory = useMemo(() => 
        projectUsages.filter(u => u.projectId === id && u.status === 'Active'),
        [projectUsages, id]
    );

    const [editDialogOpen, setEditDialogOpen] = useState(false);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [githubDialogOpen, setGithubDialogOpen] = useState(false);
    const [inventoryDialogOpen, setInventoryDialogOpen] = useState(false);
    
    // BOM Integration State
    const [bomItems, setBomItems] = useState<BOMItem[]>([]);
    const [selectedDesignId, setSelectedDesignId] = useState<string>("");
    const [bomProcessing, setBomProcessing] = useState(false);
    const { products } = useInventoryStore(); // Needed for matching
    const { system } = useSettingsStore();

    const weaveEnabled = system.integrations?.weave ?? true;
    const envEnabled = system.integrations?.envInventory ?? true;

    useEffect(() => {
        if (id) {
            // Ensure data is loaded on refresh
            fetchProjects();
            fetchInventory();
            fetchProjectTasks(id);
        }
    }, [id, fetchProjects, fetchProjectTasks, fetchInventory]);

    const handleScanBOM = async () => {
         const design = project?.weaveDesigns?.find(d => d.id === selectedDesignId);
         if (design) {
            // Simulate processing
            setBomProcessing(true);
            setTimeout(() => {
                const items = BOMService.parseWeaveDesign(design, envEnabled ? products : []);
                setBomItems(items);
                setBomProcessing(false);
            }, 500);
        }
    };

    const handleDeductStock = async () => {
        if (!project) return;
        if (!confirm(`Are you sure you want to deduct ${bomItems.length} types of items from inventory?`)) return;

        setBomProcessing(true);
        try {
            const { assignToProject } = useInventoryStore.getState();
            const user = useAuthStore.getState().user;

            for (const item of bomItems) {
                if (item.status === 'matched' && item.matchedInventoryId) {
                    await assignToProject(
                        item.matchedInventoryId, 
                        project.id, 
                        project.name, 
                        item.quantity, 
                        user?.displayName || 'Admin',
                        'product'
                    );
                }
            }
            alert("Stock deducted successfully. Activity logged.");
            setBomItems([]);
        } catch (e) {
            console.error(e);
            alert("Failed to deduct stock. Check console.");
        } finally {
            setBomProcessing(false);
        }
    };

    const handleDelete = async () => {
        if (project) {
            await deleteProject(project.id);
            router.push('/projects');
        }
    };


    // Show loader while fetching
    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center h-[calc(100vh-100px)] space-y-4">
               <Loader2 className="h-8 w-8 animate-spin text-primary" />
               <p className="text-muted-foreground animate-pulse">Proje verileri yükleniyor...</p>
            </div>
        );
    }

    if (!project) {
        return (
            <div className="flex flex-col items-center justify-center h-[calc(100vh-100px)] space-y-4">
                <AlertTriangle className="h-12 w-12 text-yellow-500" />
                <h2 className="text-2xl font-bold">Proje Bulunamadı</h2>
                <p className="text-muted-foreground">Aradığınız proje mevcut değil veya silinmiş olabilir.</p>
                <Button asChild variant="secondary">
                    <Link href="/projects"><ArrowLeft className="mr-2 h-4 w-4"/> Projelere Dön</Link>
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

            {/* Main Tabs */}
            <Tabs defaultValue="overview" className="space-y-6">
                <TabsList className="grid w-full grid-cols-4 lg:w-[600px]">
                    <TabsTrigger value="overview">Proje Özeti</TabsTrigger>
                    <TabsTrigger value="management">Yönetim</TabsTrigger>
                    <TabsTrigger value="engineering">Mühendislik</TabsTrigger>
                    <TabsTrigger value="files">Dosyalar</TabsTrigger>
                </TabsList>

                <TabsContent value="overview" className="space-y-6">
                    {/* Refined Metrics Grid */}
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium text-muted-foreground">Bütçe Durumu</CardTitle>
                                <DollarSign className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-xl font-bold">${project.spent.toLocaleString()}</div>
                                <p className="text-xs text-muted-foreground mb-2">/ ${project.budget.toLocaleString()}</p>
                                <Progress value={(project.spent / project.budget) * 100} className="h-2" />
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium text-muted-foreground">Zaman Çizelgesi</CardTitle>
                                <Calendar className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-xl font-bold">{project.deadline ? new Date(project.deadline).toLocaleDateString('tr-TR') : 'Belirsiz'}</div>
                                <p className="text-xs text-muted-foreground mt-1">Bitiş Tarihi</p>
                            </CardContent>
                        </Card>
                         <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium text-muted-foreground">Envanter</CardTitle>
                                <Box className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-xl font-bold">{projectInventory.length}</div>
                                <p className="text-xs text-muted-foreground mt-1">Atanan Kalem</p>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium text-muted-foreground">Tamamlanma</CardTitle>
                                <LayoutDashboard className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-xl font-bold">{project.completionPercentage}%</div>
                                <Progress value={project.completionPercentage} className="mt-2 h-2" />
                            </CardContent>
                        </Card>
                    </div>

                    {/* GitHub Stats Integration */}
                    {system.integrations.github && (
                        <div className="animate-fade-in-up">
                            <GitHubStats repoUrl="https://github.com/example/repo" />
                        </div>
                    )}

                    {/* Scope & Description */}
                    <div className="grid gap-6 md:grid-cols-3">
                         <Card className="md:col-span-2">
                            <CardHeader className="flex flex-row items-center justify-between space-y-0">
                                <CardTitle className="text-base font-semibold flex items-center gap-2">
                                    <FileText className="h-4 w-4 text-primary" />
                                    Proje Kapsamı
                                </CardTitle>
                                {project.githubRepo && (
                                    <Button 
                                        variant="ghost" 
                                        size="sm" 
                                        className="h-8 text-xs gap-2"
                                        onClick={() => syncProjectReadme(project.id)}
                                    >
                                        <RefreshCw className="h-3 w-3" />
                                        README&apos;den Eşitle
                                    </Button>
                                )}
                            </CardHeader>
                            <CardContent>
                                <MarkdownViewer 
                                    content={project.readmeContent || project.scope || project.description || ""} 
                                    className="min-h-[100px]"
                                />
                            </CardContent>
                        </Card>

                        {/* Quick Stats or Team (Placeholder for future) */}
                        <Card>
                             <CardHeader>
                                <CardTitle className="text-base font-semibold">Hızlı İşlemler</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-2">
                                <Button variant="outline" className="w-full justify-start" onClick={() => setGithubDialogOpen(true)}>
                                    <Github className="mr-2 h-4 w-4" /> GitHub Bağla
                                </Button>
                                {envEnabled && (
                                    <Button variant="outline" className="w-full justify-start" onClick={() => setInventoryDialogOpen(true)}>
                                        <Package className="mr-2 h-4 w-4" /> Malzeme Ekle
                                    </Button>
                                )}
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>

                <TabsContent value="management" className="space-y-4">
                     <Tabs defaultValue="tasks" className="w-full">
                        <TabsList className="grid w-full grid-cols-4 lg:w-[400px]">
                            <TabsTrigger value="tasks">Liste</TabsTrigger>
                            <TabsTrigger value="board">Pano</TabsTrigger>
                            <TabsTrigger value="timeline">Zaman</TabsTrigger>
                            <TabsTrigger value="finance">Finans</TabsTrigger>
                        </TabsList>
                        
                        <div className="mt-4">
                            <TabsContent value="tasks">
                                <div className="flex items-center justify-between mb-4">
                                    <div className="flex items-center gap-2">
                                        <h2 className="text-lg font-semibold tracking-tight">Proje Görevleri</h2>
                                        <Button variant="outline" size="sm" onClick={() => {
                                            // Mock Cross-App Communication
                                            const eventId = crypto.randomUUID();
                                            console.log(`[UPH -> ENV-I] Event: CHECK_STOCK, ID: ${eventId}`);
                                            alert("ENV-I ile iletişim kuruluyor...\nStok Durumu: YETERLİ (Mock)");
                                        }}>
                                            ENV-I Stok Kontrolü (Mock)
                                        </Button>
                                    </div>
                                    {system.integrations.github && (
                                        <Button 
                                            variant="outline" 
                                            size="sm" 
                                            onClick={() => syncGitHubIssues(id)}
                                            className="gap-2"
                                        >
                                            <RefreshCw className="h-4 w-4" />
                                            GitHub&apos;dan Eşitle
                                        </Button>
                                    )}
                                </div>
                                <ProjectTasks project={project} />
                            </TabsContent>
                            <TabsContent value="board">
                                <div className="flex items-center justify-between mb-4">
                                    <div>
                                        <h3 className="text-lg font-semibold">Kanban Panosu</h3>
                                        <p className="text-sm text-muted-foreground">Görevleri sürükleyip bırakarak yönetin</p>
                                    </div>
                                </div>
                                <KanbanBoard projectId={project.id} />
                            </TabsContent>
                            <TabsContent value="timeline">
                                <ProjectGantt project={project} />
                            </TabsContent>
                             <TabsContent value="finance">
                                <ProjectFinancials 
                                    project={project} 
                                    projectInventory={projectInventory} 
                                    allProducts={products} 
                                />
                            </TabsContent>
                        </div>
                     </Tabs>
                </TabsContent>

                <TabsContent value="engineering" className="space-y-4">
                    <Tabs defaultValue="designs" className="w-full">
                        <TabsList className="grid w-full grid-cols-4 lg:w-[400px]">
                            {weaveEnabled && <TabsTrigger value="designs">Weave</TabsTrigger>}
                            <TabsTrigger value="pcb">PCB</TabsTrigger>
                            <TabsTrigger value="3d">3D</TabsTrigger>
                            {weaveEnabled && <TabsTrigger value="bom">BOM</TabsTrigger>}
                        </TabsList>

                        <div className="mt-4">
                             {weaveEnabled && (
                                <>
                                    <TabsContent value="designs">
                                        <ProjectDesigns project={project} />
                                    </TabsContent>
                                    <TabsContent value="bom">
                                        <Card>
                                            <CardHeader>
                                                <CardTitle>Otomatik BOM Çıkarıcı</CardTitle>
                                                <CardDescription>
                                                    Weave tasarımlarından malzeme listesi çıkarın ve stoktan düşürün.
                                                </CardDescription>
                                            </CardHeader>
                                            <CardContent className="space-y-6">
                                                {/* Selection Controls */}
                                                <div className="flex items-end gap-4 border-b pb-6">
                                                    <div className="grid gap-2 flex-1">
                                                        <Label>Tasarım Seçin</Label>
                                                        <Select value={selectedDesignId} onValueChange={setSelectedDesignId}>
                                                            <SelectTrigger>
                                                                <SelectValue placeholder="Weave Dosyası Seçin..." />
                                                            </SelectTrigger>
                                                            <SelectContent>
                                                                {project.weaveDesigns?.map(d => (
                                                                    <SelectItem key={d.id} value={d.id}>{d.name} (v1.0)</SelectItem>
                                                                ))}
                                                                {(!project.weaveDesigns || project.weaveDesigns.length === 0) && (
                                                                    <SelectItem value="none" disabled>Tasarım dosyası yok</SelectItem>
                                                                )}
                                                            </SelectContent>
                                                        </Select>
                                                    </div>
                                                    <Button onClick={handleScanBOM} disabled={!selectedDesignId || bomProcessing}>
                                                        {bomProcessing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <ArrowRightLeft className="mr-2 h-4 w-4" />}
                                                        Tara & Eşleştir
                                                    </Button>
                                                </div>
        
                                                {/* Results Table */}
                                                {bomItems.length > 0 && (
                                                    <div className="rounded-md border animate-fade-in-up">
                                                        <div className="p-4 bg-muted/50 border-b flex justify-between items-center">
                                                            <span className="font-semibold text-sm">
                                                                Bulunan: {bomItems.length} parça ({bomItems.filter(i => i.status === 'matched').length} eşleşti)
                                                            </span>
                                                            <Button size="sm" onClick={handleDeductStock} disabled={bomProcessing}>
                                                                Stoktan Düş
                                                            </Button>
                                                        </div>
                                                        <div className="max-h-[400px] overflow-y-auto">
                                                            <table className="w-full text-sm">
                                                                <thead className="text-left bg-muted/20 sticky top-0 backdrop-blur-sm">
                                                                    <tr>
                                                                        <th className="p-3 font-medium">Durum</th>
                                                                        <th className="p-3 font-medium">Parça Adı</th>
                                                                        <th className="p-3 font-medium text-right">Adet</th>
                                                                        <th className="p-3 font-medium">Eşleşen Stok</th>
                                                                    </tr>
                                                                </thead>
                                                                <tbody>
                                                                    {bomItems.map((item, i) => (
                                                                        <tr key={i} className="border-t hover:bg-muted/10 transition-colors">
                                                                            <td className="p-3">
                                                                                {item.status === 'matched' ? (
                                                                                    <Badge variant="outline" className="bg-green-500/10 text-green-500 border-green-500/20">
                                                                                        <Check className="w-3 h-3 mr-1" /> Hazır
                                                                                    </Badge>
                                                                                ) : (
                                                                                    <Badge variant="outline" className="bg-yellow-500/10 text-yellow-500 border-yellow-500/20">
                                                                                        <AlertTriangle className="w-3 h-3 mr-1" /> Bilinmiyor
                                                                                    </Badge>
                                                                                )}
                                                                            </td>
                                                                            <td className="p-3 font-medium">{item.name}</td>
                                                                            <td className="p-3 text-right">{item.quantity}</td>
                                                                            <td className="p-3 text-muted-foreground">
                                                                                {item.matchedInventoryId ? (
                                                                                    <span className="flex items-center gap-2">
                                                                                        <Package className="w-3 h-3" />
                                                                                        {products.find(p => p.id === item.matchedInventoryId)?.name}
                                                                                    </span>
                                                                                ) : (
                                                                                    "Eşleşme yok"
                                                                                )}
                                                                            </td>
                                                                        </tr>
                                                                    ))}
                                                                </tbody>
                                                            </table>
                                                        </div>
                                                    </div>
                                                )}
                                            </CardContent>
                                        </Card>
                                    </TabsContent>
                                </>
                             )}
                            <TabsContent value="pcb">
                                <ProjectPCBDesigns project={project} />
                            </TabsContent>

                            <TabsContent value="3d">
                                <Project3DModels project={project} />
                            </TabsContent>
                        </div>
                    </Tabs>
                </TabsContent>

                <TabsContent value="files" className="space-y-6">
                     <div className="grid gap-6 md:grid-cols-2">
                        <ProjectFiles project={project} />
                        <DriveBrowser project={project} />
                     </div>
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
                    <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                    <AlertDialogDescription>
                        This action cannot be undone. This will permanently delete your project
                        and remove your data from our servers.
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
