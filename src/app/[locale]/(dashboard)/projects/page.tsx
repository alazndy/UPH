'use client';

import { useProjectStore } from '@/stores/project-store';
import { useEffect, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Search, 
  Calendar, 
  ExternalLink, 
  Pencil, 
  Trash2, 
  Star, 
  Plus, 
  Filter, 
  LayoutGrid, 
  List, 
  ChevronRight,
  MoreHorizontal,
  User,
  Target,
  Folder,
  Clock,
  Play,
  Pause,
  CheckCircle2
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { CreateProjectDialog } from '@/components/projects/create-project-dialog';
import { EditProjectDialog } from '@/components/projects/edit-project-dialog';
import { Project } from '@/types/project';
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslations } from 'next-intl';

export default function ProjectsPage() {
   const { projects, fetchProjects, deleteProject, updateProject, isLoading } = useProjectStore();
   const [searchTerm, setSearchTerm] = useState('');
   const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
   
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

   const filteredProjects = projects
      .filter(project => 
         project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
         project.description.toLowerCase().includes(searchTerm.toLowerCase())
      )
      .sort((a, b) => {
          if (a.isFavorite && !b.isFavorite) return -1;
          if (!a.isFavorite && b.isFavorite) return 1;
          return a.name.localeCompare(b.name);
      });

    const toggleFavorite = async (e: React.MouseEvent, project: Project) => {
        e.preventDefault();
        e.stopPropagation();
        await updateProject(project.id, { isFavorite: !project.isFavorite });
    };

   return (
    <div className="flex-1 flex flex-col min-h-full">
      {/* Background Ambient Glows - Added to match reference */}
      <div className="fixed top-[-20%] left-[-10%] w-[500px] h-[500px] bg-primary/10 rounded-full blur-[120px] pointer-events-none z-0"></div>
      <div className="fixed bottom-[-10%] right-[-10%] w-[600px] h-[600px] bg-blue-600/5 rounded-full blur-[120px] pointer-events-none z-0"></div>

      <div className="relative z-10 space-y-8">
        {/* Header Section */}
        <header className="space-y-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-[#a69db9]">
              <Folder className="h-3 w-3" />
              <span>Workspace</span>
              <ChevronRight className="h-3 w-3" />
              <span className="text-white">{t('title')}</span>
            </div>
            <div className="flex justify-between items-end">
              <h1 className="text-4xl font-black text-white tracking-tight">
                {t('title')}
              </h1>
            </div>
          </div>

          {/* Toolbar */}
          <div className="flex flex-col md:flex-row justify-between gap-4 items-center">
            {/* Search */}
            <div className="relative w-full md:w-96 group">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Search className="h-4 w-4 text-[#a69db9] group-focus-within:text-primary transition-colors" />
              </div>
              <Input 
                className="w-full pl-11 pr-4 py-6 bg-white/5 border-white/10 rounded-full text-sm text-white placeholder-[#a69db9] focus:bg-white/10 focus:border-primary/50 focus:ring-primary/50 transition-all"
                placeholder={t('filterPlaceholder')}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            {/* Actions */}
            <div className="flex items-center gap-3 w-full md:w-auto justify-end">
              <div className="flex bg-white/5 rounded-full p-1 border border-white/10">
                <Button
                  variant="ghost"
                  size="icon"
                  className={cn(
                    "h-9 w-9 rounded-full transition-all",
                    viewMode === 'grid' ? "bg-white/10 text-white shadow-sm" : "text-[#a69db9] hover:text-white"
                  )}
                  onClick={() => setViewMode('grid')}
                >
                  <LayoutGrid className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className={cn(
                    "h-9 w-9 rounded-full transition-all",
                    viewMode === 'list' ? "bg-white/10 text-white shadow-sm" : "text-[#a69db9] hover:text-white"
                  )}
                  onClick={() => setViewMode('list')}
                >
                  <List className="h-4 w-4" />
                </Button>
              </div>
              <div className="h-6 w-px bg-white/10 mx-1 hidden md:block"></div>
              <Button 
                variant="ghost"
                className="flex items-center gap-2 px-5 py-5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-full text-xs font-bold uppercase tracking-widest transition-all group h-auto"
              >
                <Filter className="h-4 w-4 text-[#a69db9] group-hover:text-white" />
                <span>{t('filter')}</span>
              </Button>
              <CreateProjectDialog />
            </div>
          </div>
        </header>

        {/* Projects Grid/List */}
        <AnimatePresence mode="popLayout">
          {viewMode === 'grid' ? (
            <motion.div 
              layout
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="grid gap-6 grid-cols-[repeat(auto-fill,minmax(350px,1fr))] w-full"
            >
              {isLoading && projects.length === 0 ? (
                <div className="col-span-full py-20 flex flex-col items-center justify-center space-y-4 glass-card">
                  <div className="h-12 w-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
                  <p className="text-[#a69db9] font-medium animate-pulse">{t('loading')}</p>
                </div>
              ) : (
                <>
                  {filteredProjects.map((project) => (
                    <motion.article 
                      key={project.id}
                      layout
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      whileHover={{ y: -5 }}
                      className="glass-card p-6 flex flex-col h-full group relative overflow-hidden"
                    >
                      {/* Gradient Ambient Background */}
                      <div 
                        className="absolute inset-0 bg-linear-to-br from-primary/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" 
                      />

                      {/* Card Header */}
                      <div className="flex justify-between items-start mb-5 relative z-10">
                        <Badge className={cn(
                          "rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-widest border-none backdrop-blur-md flex items-center gap-2",
                          project.status === 'Active' ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" :
                          project.status === 'Planning' ? "bg-blue-500/10 text-blue-400 border border-blue-500/20" :
                          project.status === 'On Hold' ? "bg-orange-500/10 text-orange-400 border border-orange-500/20" :
                          "bg-zinc-800/50 text-zinc-400"
                        )}>
                          {project.status === 'Planning' && <Clock className="h-3 w-3" />}
                          {project.status === 'Active' && <Play className="h-3 w-3 fill-current" />}
                          {project.status === 'On Hold' && <Pause className="h-3 w-3" />}
                          {project.status === 'Completed' && <CheckCircle2 className="h-3 w-3 text-emerald-400" />}
                          <span>{project.status}</span>
                        </Badge>
                        
                        <div className="flex items-center gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            className={cn(
                              "h-8 w-8 rounded-full transition-all",
                              project.isFavorite ? "text-yellow-500" : "text-[#a69db9] opacity-40 group-hover:opacity-100 hover:bg-white/10"
                            )}
                            onClick={(e) => toggleFavorite(e, project)}
                          >
                            <Star className={cn("h-4 w-4", project.isFavorite && "fill-current")} />
                          </Button>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full text-[#a69db9] hover:text-white hover:bg-white/10">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="glass-card bg-[#1a1821] border-white/10 text-white min-w-[140px]">
                              <DropdownMenuItem onClick={() => handleEditClick(project)} className="focus:bg-white/5 cursor-pointer gap-2">
                                <Pencil className="h-3.5 w-3.5" />
                                {t('edit')}
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleDeleteClick(project)} className="focus:bg-red-500/10 text-red-400 cursor-pointer gap-2">
                                <Trash2 className="h-3.5 w-3.5" />
                                {t('delete')}
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </div>

                      {/* Project Logo & Info */}
                      <Link href={`/projects/${project.id}`} className="flex-1 flex flex-col gap-4 relative z-10 group/content">
                        <div className="flex items-center gap-4">
                           {project.logoUrl ? (
                             <div className="h-12 w-12 rounded-2xl overflow-hidden border border-white/10 bg-black/20 shrink-0">
                               <img src={project.logoUrl} alt={project.name} className="h-full w-full object-cover" />
                             </div>
                           ) : (
                             <div 
                               className="h-12 w-12 rounded-2xl border border-white/10 flex items-center justify-center shrink-0"
                               style={{ backgroundColor: `${project.color || '#3b82f6'}22` }}
                             >
                               <div className="h-6 w-6 rounded-lg" style={{ backgroundColor: project.color || '#3b82f6' }} />
                             </div>
                           )}
                           <div className="min-w-0">
                             <h3 className="text-xl font-bold text-white group-hover/content:text-primary transition-colors leading-tight truncate">
                               {project.name}
                             </h3>
                             <div className="flex items-center gap-1.5 mt-0.5">
                               <User className="h-3 w-3 text-[#a69db9]" />
                               <p className="text-[9px] text-[#a69db9] font-black uppercase tracking-widest">{project.manager}</p>
                             </div>
                           </div>
                        </div>
                        <p className="text-sm text-[#a69db9] leading-relaxed line-clamp-2 min-h-[40px]">
                          {project.description}
                        </p>
                      </Link>

                      {/* Progress Bar */}
                      <div className="mt-6 mb-5 relative z-10">
                        <div className="flex justify-between items-end text-[10px] font-black uppercase tracking-widest mb-2">
                           <div className="flex items-center gap-1.5 text-[#a69db9]">
                             <Target className="h-3.5 w-3.5" />
                             <span>{t('progress')}</span>
                           </div>
                          <span className="text-white">{project.completionPercentage}%</span>
                        </div>
                        <div className="w-full bg-[#2e2839] rounded-full h-1.5 overflow-hidden">
                          <motion.div 
                            initial={{ width: 0 }}
                            animate={{ width: `${project.completionPercentage}%` }}
                            className="h-full rounded-full transition-all duration-1000"
                            style={{ 
                              backgroundColor: project.color || '#3b82f6',
                              boxShadow: `0 0 10px ${project.color || '#3b82f6'}88`
                            }}
                          />
                        </div>
                      </div>

                      {/* Card Footer */}
                      <div className="flex justify-between items-center mt-auto pt-5 border-t border-white/5 relative z-10">
                        <div className="flex -space-x-2">
                           {[1, 2, 3].map((i) => (
                             <div key={i} className="h-8 w-8 rounded-full border-2 border-[#131118] bg-[#2e2839] flex items-center justify-center text-[10px] font-bold text-white">
                               U{i}
                             </div>
                           ))}
                           <div className="h-8 w-8 rounded-full border-2 border-[#131118] bg-primary/20 text-primary flex items-center justify-center text-[10px] font-bold">
                             +2
                           </div>
                        </div>
                        <div className="flex items-center gap-1.5 text-[10px] font-bold text-[#a69db9] bg-white/5 px-3 py-1.5 rounded-full border border-white/5">
                          <Calendar className="h-3.5 w-3.5" />
                          <span>{project.deadline ? project.deadline : 'NO DATE'}</span>
                        </div>
                      </div>
                    </motion.article>
                  ))}

                  {/* Add New Project Placeholder */}
                  <CreateProjectDialog 
                    trigger={
                      <motion.button 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="border-2 border-dashed border-white/10 rounded-4xl p-8 flex flex-col items-center justify-center min-h-[280px] text-[#a69db9] hover:text-white hover:border-primary/50 hover:bg-white/5 transition-all group relative overflow-hidden"
                      >
                        <div className="size-16 rounded-full bg-[#2e2839] flex items-center justify-center mb-5 group-hover:scale-110 group-hover:bg-primary transition-all duration-300 shadow-xl">
                          <Plus className="h-8 w-8 transition-colors text-white" />
                        </div>
                        <span className="font-bold text-lg">{t('addNewProject')}</span>
                        <span className="text-[10px] font-medium mt-2 text-center opacity-60 uppercase tracking-widest leading-loose">
                          Create a new workspace<br/>for your team
                        </span>
                      </motion.button>
                    }
                  />
                </>
              )}
            </motion.div>
          ) : (
            <motion.div
              layout
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="glass-card overflow-hidden"
            >
              {/* List View implementation */}
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="border-b border-white/5 text-[10px] font-black uppercase tracking-widest text-[#a69db9]">
                      <th className="px-8 py-6">{t('name')}</th>
                      <th className="px-6 py-6 font-medium text-center">
                        <div className="flex items-center justify-center gap-2">
                          <Clock className="h-4 w-4" />
                        </div>
                      </th>
                      <th className="px-6 py-6 font-medium">
                        <div className="flex items-center gap-2">
                          <Target className="h-4 w-4" />
                        </div>
                      </th>
                       <th className="px-6 py-6 font-medium text-center">
                        <Star className="h-4 w-4 mx-auto text-[#a69db9]" />
                      </th>
                      <th className="px-8 py-6 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredProjects.map((project) => (
                      <tr key={project.id} className="border-b border-white/5 hover:bg-white/5 transition-all group">
                        <td className="px-8 py-5">
                          <div className="flex items-center gap-4">
                             <div className="h-10 w-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center shrink-0 overflow-hidden">
                               {project.logoUrl ? (
                                 <img src={project.logoUrl} alt={project.name} className="h-full w-full object-cover" />
                               ) : (
                                 <div className="h-5 w-5 rounded-md shadow-sm" style={{ backgroundColor: project.color || '#3b82f6' }} />
                               )}
                             </div>
                             <div className="min-w-0">
                               <p className="text-sm font-bold text-white group-hover:text-primary transition-colors truncate">{project.name}</p>
                               <p className="text-[10px] text-[#a69db9] font-black uppercase tracking-widest mt-0.5">{project.manager}</p>
                             </div>
                          </div>
                        </td>
                        <td className="px-6 py-5">
                          <div className="flex justify-center">
                            <Badge className={cn(
                              "rounded-full px-3 py-1 text-[9px] font-bold uppercase tracking-widest border-none flex items-center gap-1.5",
                              project.status === 'Active' ? "bg-emerald-500/10 text-emerald-400" :
                              project.status === 'Planning' ? "bg-blue-500/10 text-blue-400" :
                              project.status === 'On Hold' ? "bg-orange-500/10 text-orange-400" :
                              "bg-zinc-800/50 text-zinc-400"
                            )}>
                              {project.status === 'Planning' && <Clock className="h-3 w-3" />}
                              {project.status === 'Active' && <Play className="h-3 w-3 fill-current" />}
                              {project.status === 'On Hold' && <Pause className="h-3 w-3" />}
                              {project.status === 'Completed' && <CheckCircle2 className="h-3 w-3" />}
                              <span>{project.status}</span>
                            </Badge>
                          </div>
                        </td>
                        <td className="px-6 py-5">
                           <div className="flex items-center gap-3 w-40">
                             <div className="flex-1 h-1.5 bg-[#2e2839] rounded-full overflow-hidden">
                               <div 
                                 className="h-full rounded-full" 
                                 style={{ 
                                   width: `${project.completionPercentage}%`,
                                   backgroundColor: project.color || '#3b82f6'
                                 }} 
                               />
                             </div>
                             <span className="text-[10px] text-white font-bold w-8">{project.completionPercentage}%</span>
                           </div>
                        </td>
                        <td className="px-6 py-5">
                          <div className="flex justify-center">
                            <Button
                              variant="ghost"
                              size="icon"
                              className={cn(
                                "h-8 w-8 rounded-full transition-all",
                                project.isFavorite ? "text-yellow-500" : "text-[#a69db9] opacity-40 group-hover:opacity-100 hover:bg-white/10"
                              )}
                              onClick={(e) => toggleFavorite(e, project)}
                            >
                              <Star className={cn("h-4 w-4", project.isFavorite && "fill-current")} />
                            </Button>
                          </div>
                        </td>
                        <td className="px-8 py-5 text-right">
                          <div className="flex items-center justify-end gap-1">
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              onClick={() => handleEditClick(project)} 
                              className="h-9 w-9 text-[#a69db9] hover:text-white rounded-full hover:bg-white/10"
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Link href={`/projects/${project.id}`}>
                              <Button 
                                variant="ghost" 
                                size="icon" 
                                className="h-9 w-9 text-[#a69db9] hover:text-primary rounded-full hover:bg-white/10"
                              >
                                <ExternalLink className="h-4 w-4" />
                              </Button>
                            </Link>
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              onClick={() => handleDeleteClick(project)} 
                              className="h-9 w-9 text-[#a69db9] hover:text-red-400 rounded-full hover:bg-red-500/10"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>


      {selectedProject && (
        <>
          <EditProjectDialog 
            project={selectedProject} 
            open={editDialogOpen} 
            onOpenChange={setEditDialogOpen} 
          />
          
          <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
            <AlertDialogContent className="glass-card bg-[#0d0b11] border-white/10 rounded-4xl">
              <AlertDialogHeader>
                <AlertDialogTitle className="text-2xl font-black text-white">{t('deleteConfirmationTitle')}</AlertDialogTitle>
                <AlertDialogDescription className="text-[#a69db9] text-sm">
                   {t.rich('deleteConfirmationDesc', {
                      name: selectedProject.name,
                      bold: (chunks) => <span className="font-bold text-white underline underline-offset-4 decoration-red-500/50">{chunks}</span>
                   })}
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter className="mt-6">
                <AlertDialogCancel className="bg-white/5 border-white/10 text-white hover:bg-white/10 rounded-full px-6">{t('cancel')}</AlertDialogCancel>
                <AlertDialogAction onClick={confirmDelete} className="bg-red-600 hover:bg-red-700 text-white border-none rounded-full px-6 shadow-lg shadow-red-600/20">{t('confirmDelete')}</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </>
      )}
    </div>
   );
}
