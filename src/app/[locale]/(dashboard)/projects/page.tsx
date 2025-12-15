'use client';

import { useProjectStore } from '@/stores/project-store';
import { useEffect, useState } from 'react';
import { 
   Card, 
   CardContent, 
   CardDescription, 
   CardFooter, 
   CardHeader, 
   CardTitle 
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Search, Calendar, DollarSign, User } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { CreateProjectDialog } from '@/components/projects/create-project-dialog';
import { EditProjectDialog } from '@/components/projects/edit-project-dialog';
import { Project } from '@/types/project';
import { 
   MoreVertical, 
   Pencil, 
   Trash2, 
   ExternalLink 
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
import Link from 'next/link';

import { useTranslations } from 'next-intl';

export default function ProjectsPage() {
   const { projects, fetchProjects, deleteProject, isLoading } = useProjectStore();
   const [searchTerm, setSearchTerm] = useState('');
   
   const [editDialogOpen, setEditDialogOpen] = useState(false);
   const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
   const [selectedProject, setSelectedProject] = useState<Project | null>(null);
   const t = useTranslations('Projects');

   const handleEditClick = (project: Project) => {
       setSelectedProject(project);
       setEditDialogOpen(true);
   };

   const handleDeleteClick = (project: Project) => {
       setSelectedProject(project);
       setDeleteDialogOpen(true);
   };

   const confirmDelete = async () => {
       if (selectedProject) {
           await deleteProject(selectedProject.id);
           setDeleteDialogOpen(false);
           setSelectedProject(null);
       }
   };

   useEffect(() => {
      fetchProjects();
   }, [fetchProjects]);

   const filteredProjects = projects.filter(project => 
      project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      project.description.toLowerCase().includes(searchTerm.toLowerCase())
   );

   const getStatusColor = (status: string) => {
      switch(status) {
          case 'Active': return 'bg-green-100 text-green-800 hover:bg-green-100';
          case 'Planning': return 'bg-blue-100 text-blue-800 hover:bg-blue-100';
          case 'On Hold': return 'bg-amber-100 text-amber-800 hover:bg-amber-100';
          case 'Completed': return 'bg-slate-100 text-slate-800 hover:bg-slate-100';
          default: return 'bg-secondary text-secondary-foreground';
      }
   };

   return (
      <div className="flex-1 space-y-4">
         <div className="flex items-center justify-between">
            <h2 className="text-3xl font-bold tracking-tight">{t('title')}</h2>
            <CreateProjectDialog />
         </div>
         
         <div className="flex items-center space-x-2">
             <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input 
                   placeholder={t('filterPlaceholder')} 
                   className="pl-8"
                   value={searchTerm}
                   onChange={(e) => setSearchTerm(e.target.value)}
                />
             </div>
         </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
             {isLoading && projects.length === 0 ? (
                  <div className="col-span-full text-center py-10">{t('loading')}</div>
             ) : filteredProjects.map((project) => (
                <Card key={project.id} className="group hover:bg-accent/50 hover:shadow-lg transition-all duration-300 border-l-4 border-l-indigo-500 h-full flex flex-col">
                   <CardHeader>
                      <div className="flex justify-between items-start">
                         <div className="space-y-1 min-w-0 flex-1">
                            <CardTitle className="text-xl group-hover:text-indigo-600 transition-colors truncate pr-2">{project.name}</CardTitle>
                            <CardDescription className="line-clamp-2 min-h-[40px] wrap-break-word">
                               {project.description}
                            </CardDescription>
                         </div>
                         <Badge variant="outline" className={`uppercase text-[10px] font-bold shadow-sm ${getStatusColor(project.status)}`}>
                            {project.status}
                         </Badge>
                      </div>
                   </CardHeader>
                   <CardContent className="space-y-5 flex-1">
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm font-medium">
                            <span className="text-muted-foreground">{t('progress')}</span>
                            <span>{project.completionPercentage}%</span>
                        </div>
                        <Progress value={project.completionPercentage} className="h-2" />
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4 text-sm pt-2">
                         <div className="flex items-center gap-2 p-2 rounded-lg bg-background/50 border border-border/50" title={t('budget')}>
                            <div className="p-1 rounded bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
                                <DollarSign className="h-3.5 w-3.5" />
                            </div>
                            <span className="font-medium">${project.budget.toLocaleString()}</span>
                         </div>
                         <div className="flex items-center gap-2 p-2 rounded-lg bg-background/50 border border-border/50" title={t('manager')}>
                             <div className="p-1 rounded bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400">
                                <User className="h-3.5 w-3.5" />
                             </div>
                            <span className="font-medium truncate">{project.manager}</span>
                         </div>
                          <div className="flex items-center gap-2 col-span-2 p-2 rounded-lg bg-background/50 border border-border/50" title={t('deadline')}>
                             <div className="p-1 rounded bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400">
                                <Calendar className="h-3.5 w-3.5" />
                             </div>
                            <span className="font-medium">{project.deadline ? t('due', {date: project.deadline}) : t('noDeadline')}</span>
                         </div>
                      </div>
                   </CardContent>
                   <CardFooter className="border-t px-6 py-4 bg-muted/20 flex justify-between items-center mt-auto">
                      <Button variant="ghost" className="justify-start pl-0 hover:text-indigo-600 hover:bg-transparent p-0 h-auto font-medium" asChild>
                         <Link href={`/projects/${project.id}`} className="flex items-center gap-1">
                             {t('viewDashboard')} <ExternalLink className="h-3 w-3" />
                         </Link>
                      </Button>
                      
                      <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                              <Button variant="ghost" className="h-8 w-8 p-0 hover:bg-background">
                                  <MoreVertical className="h-4 w-4" />
                              </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                              <DropdownMenuLabel>{t('actions')}</DropdownMenuLabel>
                              <DropdownMenuItem asChild>
                                  <Link href={`/projects/${project.id}`}>
                                      <ExternalLink className="mr-2 h-4 w-4" /> {t('openDetails')}
                                  </Link>
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleEditClick(project)}>
                                  <Pencil className="mr-2 h-4 w-4" /> {t('editProject')}
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem className="text-red-600" onClick={() => handleDeleteClick(project)}>
                                  <Trash2 className="mr-2 h-4 w-4" /> {t('delete')}
                              </DropdownMenuItem>
                          </DropdownMenuContent>
                      </DropdownMenu>
                   </CardFooter>
                </Card>
             ))}
          </div>

         {selectedProject && (
             <>
                <EditProjectDialog 
                    project={selectedProject} 
                    open={editDialogOpen} 
                    onOpenChange={setEditDialogOpen} 
                />
                
                <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                        <AlertDialogTitle>{t('deleteConfirmationTitle')}</AlertDialogTitle>
                        <AlertDialogDescription>
                           {t.rich('deleteConfirmationDesc', {
                              name: selectedProject.name,
                              bold: (chunks) => <span className="font-semibold text-foreground">{chunks}</span>
                           })}
                        </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                        <AlertDialogCancel>{t('cancel')}</AlertDialogCancel>
                        <AlertDialogAction onClick={confirmDelete} className="bg-red-600 hover:bg-red-700">{t('confirmDelete')}</AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
             </>
         )}
      </div>
   );
}
