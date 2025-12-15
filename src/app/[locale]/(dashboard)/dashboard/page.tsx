'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Activity, 
  DollarSign, 
  Package, 
  AlertTriangle,
  CheckCircle2,
  FolderKanban,
} from 'lucide-react';
import { useProjectStore } from '@/stores/project-store';
import { useInventoryStore } from '@/stores/inventory-store';
import { useActivityStore } from '@/stores/activity-store';
import { useEffect } from 'react';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
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
  const activeProjects = projects.filter(p => p.status === 'Active');
  const lowStockItems = products.filter(p => p.stock <= (p.minStock || 5)); 
  const totalBudget = projects.reduce((acc, curr) => acc + curr.budget, 0);
  const totalSpent = projects.reduce((acc, curr) => acc + curr.spent, 0);
  const inventoryValue = products.reduce((acc, curr) => acc + (curr.stock * (curr.price || 0)), 0);

  return (
    <div className="flex-1 space-y-4">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">{t('title')}</h2>
      </div>
      
      {/* Quick Actions */}
      <div className="flex items-center gap-4 mb-6">
        <CreateProjectDialog />
        {/* We can add more quick actions here like Add Inventory */}
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
        <Link href="/projects" className="group">
            <Card className="hover:bg-accent/50 transition-colors cursor-pointer h-full border-l-4 border-l-blue-500 shadow-sm hover:shadow-md">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground group-hover:text-primary transition-colors">{t('activeProjects')}</CardTitle>
                <Activity className="h-4 w-4 text-muted-foreground group-hover:text-blue-500 transition-colors" />
            </CardHeader>
            <CardContent>
                <div className="text-3xl font-bold">{activeProjects.length}</div>
                <p className="text-xs text-muted-foreground mt-1">
                {projects.length} {t('totalProjects')}
                </p>
            </CardContent>
            </Card>
        </Link>
        
        <Card className="h-full border-l-4 border-l-green-500 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">{t('budgetUsage')}</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">${totalSpent.toLocaleString()}</div>
             <Progress value={(totalSpent / totalBudget) * 100 || 0} className="mt-3 h-2" />
            <p className="text-xs text-muted-foreground mt-2">
              {t('allocated')}: ${totalBudget.toLocaleString()}
            </p>
          </CardContent>
        </Card>
        
        <Link href="/inventory" className="group">
            <Card className="hover:bg-accent/50 transition-colors cursor-pointer h-full border-l-4 border-l-orange-500 shadow-sm hover:shadow-md">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground group-hover:text-primary transition-colors">{t('lowStockAlerts')}</CardTitle>
                <AlertTriangle className={`h-4 w-4 ${lowStockItems.length > 0 ? 'text-orange-500' : 'text-muted-foreground'} transition-colors`} />
            </CardHeader>
            <CardContent>
                <div className={`text-3xl font-bold ${lowStockItems.length > 0 ? 'text-orange-600' : ''}`}>{lowStockItems.length}</div>
                <p className="text-xs text-muted-foreground mt-1">
                {t('belowThreshold')}
                </p>
            </CardContent>
            </Card>
        </Link>
        
        <Card className="h-full border-l-4 border-l-purple-500 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">{t('inventoryValue')}</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">${inventoryValue.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {t('stockAssetValue')}
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-12">
        {/* Recent Projects */}
        <Card className="col-span-12 lg:col-span-8 h-full shadow-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
                <FolderKanban className="h-5 w-5 text-blue-500" />
                {t('recentProjects')}
            </CardTitle>
          </CardHeader>
          <CardContent>
             <div className="space-y-6">
                {projects.slice(0, 5).map(project => (
                   <div key={project.id} className="flex items-center p-3 rounded-lg hover:bg-muted/50 transition-colors border border-transparent hover:border-border/50">
                      <Avatar className="h-10 w-10 border-2 border-background shadow-sm">
                         <AvatarFallback className="bg-gradient-to-br from-blue-500 to-indigo-600 text-white font-semibold">
                            {project.name.charAt(0)}
                         </AvatarFallback>
                      </Avatar>
                      <div className="ml-4 space-y-1 flex-1">
                         <p className="text-sm font-semibold leading-none">{project.name}</p>
                         <p className="text-sm text-muted-foreground line-clamp-1">{project.description}</p>
                      </div>
                      <div className="ml-auto font-medium">
                         <Badge variant={project.status === 'Active' ? 'default' : 'secondary'} className="capitalize shadow-sm">
                            {project.status}
                         </Badge>
                      </div>
                   </div>
                ))}
                {projects.length === 0 && <div className="text-center text-muted-foreground py-10">{t('noProjects')}</div>}
             </div>
          </CardContent>
        </Card>
        
        {/* Recent Activity Feed */}
        <Card className="col-span-12 lg:col-span-4 h-full shadow-md flex flex-col">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5 text-green-500" />
                {t('latestActivity')}
            </CardTitle>
          </CardHeader>
          <CardContent className="flex-1 overflow-hidden">
            <div className="space-y-6 pr-2 max-h-[500px] overflow-y-auto custom-scrollbar">
               {activities.length === 0 ? (
                  <div className="text-center text-muted-foreground py-8">{t('noActivity')}</div>
               ) : (
                  activities.slice(0, 10).map((activity) => (
                    <div key={activity.id} className="flex gap-4 items-start group">
                       <div className={`mt-0.5 relative`}>
                          <div className={`rounded-full p-2 ring-1 ring-offset-2 ${
                             activity.type.includes('PROJECT') ? 'bg-blue-50 text-blue-600 ring-blue-100 dark:bg-blue-950 dark:text-blue-400 dark:ring-blue-900' :
                             activity.type.includes('INVENTORY') ? 'bg-orange-50 text-orange-600 ring-orange-100 dark:bg-orange-950 dark:text-orange-400 dark:ring-orange-900' :
                             'bg-gray-50 text-gray-600 ring-gray-100 dark:bg-gray-800 dark:text-gray-400 dark:ring-gray-700'
                          }`}>
                            {activity.type.includes('PROJECT') ? <FolderKanban className="h-3.5 w-3.5" /> : 
                             activity.type.includes('INVENTORY') ? <Package className="h-3.5 w-3.5" /> :
                             <CheckCircle2 className="h-3.5 w-3.5" />}
                          </div>
                          <div className="absolute top-8 left-1/2 -translate-x-1/2 w-0.5 h-full bg-border -z-10 last:hidden" />
                       </div>
                       <div className="space-y-1 pb-4 border-b border-border/40 last:border-0 w-full">
                          <p className="text-sm font-medium leading-none group-hover:text-primary transition-colors">{activity.title}</p>
                          <p className="text-xs text-muted-foreground line-clamp-2">
                             {activity.description}
                          </p> 
                          <p className="text-[10px] text-muted-foreground/60 flex items-center gap-1 pt-1" suppressHydrationWarning>
                             <span className="font-semibold text-foreground/70">{activity.userName}</span> • {activity.timestamp.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                          </p>
                       </div>
                    </div>
                  ))
               )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

