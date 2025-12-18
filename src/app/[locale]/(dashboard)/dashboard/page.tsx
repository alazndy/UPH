'use client';

import { useEffect } from 'react';
import {
  Activity,
  DollarSign,
  Package,
  AlertTriangle,
  CheckCircle2,
  FolderKanban,
  Star,
} from 'lucide-react';
import { useProjectStore } from '@/stores/project-store';
import { useInventoryStore } from '@/stores/inventory-store';
import { useActivityStore } from '@/stores/activity-store';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import { CreateProjectDialog } from '@/components/projects/create-project-dialog';
import { useTranslations } from 'next-intl';

export default function DashboardPage() {
  const { projects, fetchProjects } = useProjectStore();
  const { products, fetchInventory } = useInventoryStore();
  const { activities } = useActivityStore();
  const t = useTranslations('Dashboard');

  useEffect(() => {
    fetchProjects();
    fetchInventory();
  }, [fetchProjects, fetchInventory]);

  // Metrics
  const sortedProjects = [...projects].sort((a, b) => {
    if (a.isFavorite && !b.isFavorite) return -1;
    if (!a.isFavorite && b.isFavorite) return 1;
    return 0; // Keep original order (recent first) for equal favorite status
  });
  const activeProjects = projects.filter(p => p.status === 'Active');
  const lowStockItems = products.filter(p => p.stock <= (p.minStock || 5)); 
  const totalBudget = projects.reduce((acc, curr) => acc + curr.budget, 0);
  const totalSpent = projects.reduce((acc, curr) => acc + curr.spent, 0);
  const inventoryValue = products.reduce((acc, curr) => acc + (curr.stock * (curr.price || 0)), 0);

  return (
    <div className="flex-1 space-y-8 p-0 text-foreground">
      <div className="flex flex-col space-y-2">
        <h2 className="text-3xl font-bold tracking-tight bg-linear-to-r from-foreground to-foreground/60 bg-clip-text text-transparent">
          {t('title')}
        </h2>
        <p className="text-muted-foreground text-sm">Welcome back. Here&apos;s what&apos;s happening in your workspace.</p>
      </div>
      
      {/* Quick Actions */}
      <div className="flex items-center gap-4">
        <CreateProjectDialog />
      </div>

      {/* Stats Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {/* Active Projects */}
        <Link href="/projects" className="group">
          <div className="glass-panel relative overflow-hidden rounded-3xl p-6 transition-all duration-300 hover:scale-[1.02] hover:border-primary">
            {/* Background Glow */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 blur-[50px] -mr-16 -mt-16 group-hover:bg-primary/20 transition-all opacity-50 dark:opacity-100" />
            
            <div className="flex items-center justify-between mb-4">
              <div className="p-2.5 rounded-xl bg-primary/10 text-primary group-hover:scale-110 transition-transform">
                <Activity className="h-5 w-5" />
              </div>
              <Badge variant="outline" className="bg-primary/5 text-primary border-primary/20 text-[10px] uppercase tracking-wider">
                Live
              </Badge>
            </div>
            
            <div className="space-y-1">
              <h3 className="text-sm font-medium text-muted-foreground">{t('activeProjects')}</h3>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-bold text-foreground dark:text-white tracking-tight">{activeProjects.length}</span>
                <span className="text-xs text-green-600 dark:text-green-400 font-medium">+2 this week</span>
              </div>
            </div>
            
            <div className="mt-4 pt-4 border-t border-border/50">
               <p className="text-[10px] text-muted-foreground uppercase tracking-widest">Total Workflow: {projects.length}</p>
            </div>
          </div>
        </Link>
        
        {/* Budget Usage */}
        <div className="glass-panel relative overflow-hidden rounded-3xl p-6 transition-all duration-300 hover:scale-[1.02] group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-green-500/10 blur-[50px] -mr-16 -mt-16 opacity-50 dark:opacity-100" />
          
          <div className="flex items-center justify-between mb-4">
            <div className="p-2.5 rounded-xl bg-green-500/10 text-green-600 dark:text-green-500">
              <DollarSign className="h-5 w-5" />
            </div>
            <div className="text-[10px] font-bold text-green-600 dark:text-green-400 uppercase tracking-wider">
              Optimal
            </div>
          </div>
          
          <div className="space-y-1">
            <h3 className="text-sm font-medium text-muted-foreground">{t('budgetUsage')}</h3>
            <div className="text-3xl font-bold text-foreground dark:text-white tracking-tight">${totalSpent.toLocaleString()}</div>
          </div>

          <div className="mt-4 space-y-2">
            <div className="flex justify-between text-[10px] uppercase tracking-widest text-muted-foreground">
              <span>Progress</span>
              <span>{Math.round((totalSpent / totalBudget) * 100 || 0)}%</span>
            </div>
            <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-green-500 to-emerald-400 rounded-full shadow-[0_0_8px_rgba(16,185,129,0.5)]" 
                style={{ width: `${(totalSpent / totalBudget) * 100}%` }}
              />
            </div>
          </div>
        </div>
        
        {/* Low Stock Items */}
        <Link href="/inventory" className="group">
          <div className="glass-panel relative overflow-hidden rounded-3xl p-6 transition-all duration-300 hover:scale-[1.02] hover:border-orange-500">
            <div className="absolute top-0 right-0 w-32 h-32 bg-orange-500/10 blur-[50px] -mr-16 -mt-16 opacity-50 dark:opacity-100" />
            
            <div className="flex items-center justify-between mb-4">
              <div className={cn("p-2.5 rounded-xl transition-colors", lowStockItems.length > 0 ? "bg-orange-500/20 text-orange-500" : "bg-white/5 text-muted-foreground")}>
                <AlertTriangle className="h-5 w-5" />
              </div>
              {lowStockItems.length > 0 && (
                <Badge className="bg-orange-500/20 text-orange-400 border-none animate-pulse">
                  Critical
                </Badge>
              )}
            </div>
            
            <div className="space-y-1">
              <h3 className="text-sm font-medium text-muted-foreground">{t('lowStockAlerts')}</h3>
              <div className="text-3xl font-bold text-foreground dark:text-white tracking-tight">{lowStockItems.length}</div>
            </div>
            
            <p className="mt-4 text-[10px] text-muted-foreground uppercase tracking-widest">
              {t('belowThreshold')}
            </p>
          </div>
        </Link>
        
        {/* Inventory Value */}
        <div className="glass-panel relative overflow-hidden rounded-3xl p-6 transition-all duration-300 hover:scale-[1.02] group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/10 blur-[50px] -mr-16 -mt-16 opacity-50 dark:opacity-100" />
          
          <div className="flex items-center justify-between mb-4">
            <div className="p-2.5 rounded-xl bg-purple-500/10 text-purple-400">
              <Package className="h-5 w-5" />
            </div>
          </div>
          
          <div className="space-y-1">
            <h3 className="text-sm font-medium text-muted-foreground">{t('inventoryValue')}</h3>
            <div className="text-3xl font-bold text-foreground dark:text-white tracking-tight">${inventoryValue.toLocaleString()}</div>
          </div>
          
          <p className="mt-4 text-[10px] text-muted-foreground uppercase tracking-widest">
            {t('stockAssetValue')}
          </p>
        </div>
      </div>

      <div className="grid gap-8 md:grid-cols-1 lg:grid-cols-12">
        {/* Recent Projects Table */}
        <div className="glass-panel rounded-4xl col-span-12 lg:col-span-8 p-8 border-border/50">
          <div className="flex items-center justify-between mb-8">
            <div className="space-y-1">
              <h3 className="text-xl font-bold text-foreground dark:text-white">{t('recentProjects')}</h3>
              <p className="text-xs text-muted-foreground">Manage your latest project workflows</p>
            </div>
            <Link href="/projects">
              <Button variant="ghost" size="sm" className="text-primary hover:text-primary hover:bg-primary/10 rounded-xl">View all</Button>
            </Link>
          </div>
          
          <div className="space-y-1">
            {sortedProjects.slice(0, 5).map(project => (
              <div key={project.id} className="group flex items-center p-4 rounded-2xl hover:bg-white/[0.03] transition-all duration-300 border border-transparent hover:border-white/5">
                <div className="relative h-12 w-12 rounded-xl overflow-hidden bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center border border-white/5">
                  <span className="text-lg font-bold text-primary">{project.name.charAt(0)}</span>
                </div>
                <div className="ml-4 space-y-1 flex-1">
                      <div className="flex items-center gap-2">
                        <div className="font-bold text-foreground dark:text-white group-hover:text-primary transition-colors text-sm">{project.name}</div>
                        {project.isFavorite && <Star className="h-3 w-3 text-yellow-500 fill-current" />}
                      </div>
                  <p className="text-xs text-muted-foreground line-clamp-1">{project.description}</p>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <Badge className={cn(
                    "rounded-lg px-2 py-0.5 text-[10px] uppercase tracking-widest border-none",
                    project.status === 'Active' ? "bg-green-500/20 text-green-400" : "bg-zinc-800 text-zinc-400"
                  )}>
                    {project.status}
                  </Badge>
                  <div className="w-24 h-1 bg-white/5 rounded-full overflow-hidden">
                    <div className="h-full bg-primary/60" style={{ width: '65%' }} />
                  </div>
                </div>
              </div>
            ))}
            {projects.length === 0 && (
              <div className="flex flex-col items-center justify-center py-12 text-muted-foreground space-y-3">
                <div className="p-4 rounded-full bg-white/5">
                    <FolderKanban className="h-8 w-8 opacity-20" />
                </div>
                <p className="text-sm">{t('noProjects')}</p>
              </div>
            )}
          </div>
        </div>
        
        {/* Recent Activity Feed */}
        <div className="glass-panel rounded-[2rem] col-span-12 lg:col-span-4 p-8 border-white/5">
           <div className="flex items-center justify-between mb-8">
            <h3 className="text-xl font-bold text-white">{t('latestActivity')}</h3>
            <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                <Activity className="h-4 w-4 text-primary" />
            </div>
          </div>
          
          <div className="relative space-y-6">
             {activities.length === 0 ? (
                <div className="text-center text-muted-foreground py-8 text-sm">{t('noActivity')}</div>
             ) : (
                <>
                  <div className="absolute left-[19px] top-2 bottom-2 w-[2px] bg-gradient-to-b from-primary/50 via-primary/5 to-transparent" />
                  <div className="space-y-8">
                    {activities.slice(0, 6).map((activity) => (
                      <div key={activity.id} className="flex gap-4 items-start relative group">
                        <div className={cn(
                          "z-10 rounded-full p-2 ring-4 ring-zinc-950 transition-all group-hover:scale-110",
                          activity.type.includes('PROJECT') ? "bg-primary text-white" :
                          activity.type.includes('INVENTORY') ? "bg-orange-500 text-white" :
                          "bg-zinc-800 text-zinc-400"
                        )}>
                          {activity.type.includes('PROJECT') ? <FolderKanban className="h-3.5 w-3.5" /> : 
                           activity.type.includes('INVENTORY') ? <Package className="h-3.5 w-3.5" /> :
                           <CheckCircle2 className="h-3.5 w-3.5" />}
                        </div>
                        <div className="flex-1 min-w-0 space-y-1">
                          <p className="text-sm font-semibold text-white leading-snug group-hover:text-primary transition-colors">{activity.title}</p>
                          <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                             {activity.description}
                          </p> 
                          <div className="flex items-center gap-2 pt-1">
                             <div className="h-4 w-4 rounded-full bg-zinc-800 text-[8px] flex items-center justify-center font-bold text-zinc-400">
                                {activity.userName.charAt(0)}
                             </div>
                             <p className="text-[10px] text-muted-foreground/60" suppressHydrationWarning>
                                <span className="text-zinc-400">{activity.userName}</span> • {activity.timestamp.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                             </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </>
             )}
          </div>
        </div>
      </div>
    </div>
  );
}
