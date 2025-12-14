'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Activity, 
  DollarSign, 
  Package, 
  AlertTriangle,
  CheckCircle2,
} from 'lucide-react';
import { useProjectStore } from '@/stores/project-store';
import { useInventoryStore } from '@/stores/inventory-store';
import { useActivityStore } from '@/stores/activity-store';
import { useEffect } from 'react';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';

export default function DashboardPage() {
  const { projects, fetchProjects } = useProjectStore();
  const { products, fetchInventory } = useInventoryStore();
  const { activities } = useActivityStore();

  useEffect(() => {
    fetchProjects();
    fetchInventory();
  }, [fetchProjects, fetchInventory]);

  // Metrics
  const activeProjects = projects.filter(p => p.status === 'Active');
  const lowStockItems = products.filter(p => p.stock <= (p.minStock || 5)); // Default minStock 5 if undefined
  const totalBudget = projects.reduce((acc, curr) => acc + curr.budget, 0);
  const totalSpent = projects.reduce((acc, curr) => acc + curr.spent, 0);
  const inventoryValue = products.reduce((acc, curr) => acc + (curr.stock * (curr.price || 0)), 0);

  return (
    <div className="flex-1 space-y-4">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
      </div>
      
      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Projects</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeProjects.length}</div>
            <p className="text-xs text-muted-foreground">
              {projects.length} total projects
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Budget Usage</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalSpent.toLocaleString()}</div>
             <Progress value={(totalSpent / totalBudget) * 100 || 0} className="mt-2 h-1.5" />
            <p className="text-xs text-muted-foreground mt-2">
              of ${totalBudget.toLocaleString()} allocated
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Low Stock Alerts</CardTitle>
            <AlertTriangle className={`h-4 w-4 ${lowStockItems.length > 0 ? 'text-red-500' : 'text-muted-foreground'}`} />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${lowStockItems.length > 0 ? 'text-red-600' : ''}`}>{lowStockItems.length}</div>
            <p className="text-xs text-muted-foreground">
              Items below threshold
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Inventory Asset Value</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${inventoryValue.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              Total stock value
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        {/* Recent Projects */}
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Recent Projects</CardTitle>
          </CardHeader>
          <CardContent>
             <div className="space-y-8">
                {projects.slice(0, 5).map(project => (
                   <div key={project.id} className="flex items-center">
                      <Avatar className="h-9 w-9">
                         <AvatarFallback className="bg-primary/10 text-primary">
                            {project.name.charAt(0)}
                         </AvatarFallback>
                      </Avatar>
                      <div className="ml-4 space-y-1">
                         <p className="text-sm font-medium leading-none">{project.name}</p>
                         <p className="text-sm text-muted-foreground">{project.description}</p>
                      </div>
                      <div className="ml-auto font-medium">
                         <Badge variant={project.status === 'Active' ? 'default' : 'secondary'}>
                            {project.status}
                         </Badge>
                      </div>
                   </div>
                ))}
                {projects.length === 0 && <div className="text-center text-muted-foreground">No projects found.</div>}
             </div>
          </CardContent>
        </Card>
        
        {/* Recent Activity Feed */}
        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-8 max-h-[400px] overflow-y-auto pr-2">
               {activities.length === 0 ? (
                  <div className="text-center text-muted-foreground py-8">No recent activity.</div>
               ) : (
                  activities.slice(0, 10).map((activity) => (
                    <div key={activity.id} className="flex items-start animate-fade-in-up">
                       <div className={`mr-4 mt-1 rounded-full p-2 ${
                          activity.type.includes('PROJECT') ? 'bg-blue-500/10 text-blue-500' :
                          activity.type.includes('INVENTORY') ? 'bg-green-500/10 text-green-500' :
                          'bg-primary/10 text-primary'
                       }`}>
                          {activity.type.includes('PROJECT') ? <Activity className="h-4 w-4" /> : 
                           activity.type.includes('INVENTORY') ? <Package className="h-4 w-4" /> :
                           <CheckCircle2 className="h-4 w-4" />}
                       </div>
                       <div className="space-y-1">
                          <p className="text-sm font-medium leading-none">{activity.title}</p>
                          <p className="text-xs text-muted-foreground">
                             {activity.description}
                          </p> 
                          <p className="text-[10px] text-muted-foreground/60">
                             {activity.userName} • {activity.timestamp.toLocaleTimeString()}
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

