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
import { Folder, Search, Calendar, DollarSign, User } from 'lucide-react';
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

export default function ProjectsPage() {
   const { projects, fetchProjects, deleteProject, isLoading } = useProjectStore();
   const [searchTerm, setSearchTerm] = useState('');
   
   const [editDialogOpen, setEditDialogOpen] = useState(false);
   const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
   const [selectedProject, setSelectedProject] = useState<Project | null>(null);

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
            <h2 className="text-3xl font-bold tracking-tight">Projects</h2>
            <CreateProjectDialog />
         </div>
         
         <div className="flex items-center space-x-2">
             <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input 
                   placeholder="Filter projects..." 
                   className="pl-8"
                   value={searchTerm}
                   onChange={(e) => setSearchTerm(e.target.value)}
                />
             </div>
         </div>

         <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {isLoading && projects.length === 0 ? (
                 <div className="col-span-full text-center py-10">Loading projects...</div>
            ) : filteredProjects.map((project) => (
               <Card key={project.id} className="group hover:shadow-lg transition-all duration-200 border-l-4 border-l-transparent hover:border-l-indigo-500">
                  <CardHeader>
                     <div className="flex justify-between items-start">
                        <div className="space-y-1">
                           <CardTitle className="text-xl group-hover:text-indigo-700 transition-colors">{project.name}</CardTitle>
                           <CardDescription className="line-clamp-2 min-h-[40px]">
                              {project.description}
                           </CardDescription>
                        </div>
                        <Badge variant="outline" className={`uppercase text-[10px] font-bold ${getStatusColor(project.status)}`}>
                           {project.status}
                        </Badge>
                     </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                     <div className="flex items-center justify-between text-sm text-muted-foreground">
                        <span>Completion</span>
                        <span>{project.completionPercentage}%</span>
                     </div>
                     <Progress value={project.completionPercentage} className="h-2" />
                     
                     <div className="grid grid-cols-2 gap-2 text-sm text-muted-foreground pt-2">
                        <div className="flex items-center" title="Budget">
                           <DollarSign className="mr-1.5 h-3.5 w-3.5 text-green-600" />
                           <span>${project.budget.toLocaleString()}</span>
                        </div>
                        <div className="flex items-center" title="Manager">
                           <User className="mr-1.5 h-3.5 w-3.5 text-indigo-600" />
                           <span>{project.manager}</span>
                        </div>
                         <div className="flex items-center col-span-2" title="Deadline">
                           <Calendar className="mr-1.5 h-3.5 w-3.5 text-rose-500" />
                           <span>Due: {project.deadline || 'No deadline'}</span>
                        </div>
                     </div>
                  </CardContent>
                  <CardFooter className="border-t px-6 py-4 bg-slate-50/50 flex justify-between items-center">
                     <Button variant="ghost" className="justify-start pl-0 hover:text-indigo-600 hover:bg-transparent" asChild>
                        <Link href={`/projects/${project.id}`}>
                            View Dashboard &rarr;
                        </Link>
                     </Button>
                     
                     <DropdownMenu>
                         <DropdownMenuTrigger asChild>
                             <Button variant="ghost" className="h-8 w-8 p-0">
                                 <MoreVertical className="h-4 w-4" />
                             </Button>
                         </DropdownMenuTrigger>
                         <DropdownMenuContent align="end">
                             <DropdownMenuLabel>Actions</DropdownMenuLabel>
                             <DropdownMenuItem asChild>
                                 <Link href={`/projects/${project.id}`}>
                                     <ExternalLink className="mr-2 h-4 w-4" /> Open Details
                                 </Link>
                             </DropdownMenuItem>
                             <DropdownMenuItem onClick={() => handleEditClick(project)}>
                                 <Pencil className="mr-2 h-4 w-4" /> Edit Project
                             </DropdownMenuItem>
                             <DropdownMenuSeparator />
                             <DropdownMenuItem className="text-red-600" onClick={() => handleDeleteClick(project)}>
                                 <Trash2 className="mr-2 h-4 w-4" /> Delete
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
                        <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This action cannot be undone. This will permanently delete the project 
                            <span className="font-semibold text-foreground"> {selectedProject.name} </span>
                            and all associated data.
                        </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={confirmDelete} className="bg-red-600 hover:bg-red-700">Delete Project</AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
             </>
         )}
      </div>
   );
}
