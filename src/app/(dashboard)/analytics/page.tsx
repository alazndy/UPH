'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Download, FileSpreadsheet } from 'lucide-react';
import { ProjectProgressChart, BudgetChart, InventoryTrendChart } from '@/components/analytics';
import { useProjectStore } from '@/stores/project-store';
import { useInventoryStore } from '@/stores/inventory-store';
import { exportToExcel, exportToCSV } from '@/lib/export-utils';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export default function AnalyticsPage() {
  const { projects, fetchProjects } = useProjectStore();
  const { products, fetchInventory } = useInventoryStore();

  useEffect(() => {
    fetchProjects();
    fetchInventory();
  }, [fetchProjects, fetchInventory]);

  const handleExportProjects = (format: 'excel' | 'csv') => {
    const data = projects.map(p => ({
      Name: p.name,
      Status: p.status,
      Budget: p.budget,
      Spent: p.spent,
      Progress: `${p.completionPercentage}%`,
      Tags: p.tags.join(', '),
    }));
    
    if (format === 'excel') {
      exportToExcel(data, 'projects-report');
    } else {
      exportToCSV(data, 'projects-report');
    }
  };

  const handleExportInventory = (format: 'excel' | 'csv') => {
    const data = products.map(p => ({
      Name: p.name,
      SKU: p.sku || '',
      Stock: p.stock,
      'Min Stock': p.minStock || 5,
      Price: p.price || 0,
      Value: (p.stock * (p.price || 0)),
      Category: p.category || '',
    }));
    
    if (format === 'excel') {
      exportToExcel(data, 'inventory-report');
    } else {
      exportToCSV(data, 'inventory-report');
    }
  };

  return (
    <div className="flex-1 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Analytics & Reports</h1>
          <p className="text-muted-foreground text-sm">
            Insights and data visualization for your projects and inventory
          </p>
        </div>
        <div className="flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="gap-2">
                <FileSpreadsheet className="h-4 w-4" />
                Export Projects
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={() => handleExportProjects('excel')}>
                <Download className="mr-2 h-4 w-4" />
                Export as Excel
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleExportProjects('csv')}>
                <Download className="mr-2 h-4 w-4" />
                Export as CSV
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="gap-2">
                <FileSpreadsheet className="h-4 w-4" />
                Export Inventory
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={() => handleExportInventory('excel')}>
                <Download className="mr-2 h-4 w-4" />
                Export as Excel
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleExportInventory('csv')}>
                <Download className="mr-2 h-4 w-4" />
                Export as CSV
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <ProjectProgressChart />
        <BudgetChart />
        <InventoryTrendChart />
      </div>

      {/* Summary Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <div className="bg-zinc-900/50 border border-zinc-800 rounded-lg p-4">
          <div className="text-sm text-zinc-500">Total Projects</div>
          <div className="text-2xl font-bold">{projects.length}</div>
        </div>
        <div className="bg-zinc-900/50 border border-zinc-800 rounded-lg p-4">
          <div className="text-sm text-zinc-500">Active Projects</div>
          <div className="text-2xl font-bold text-green-400">
            {projects.filter(p => p.status === 'active').length}
          </div>
        </div>
        <div className="bg-zinc-900/50 border border-zinc-800 rounded-lg p-4">
          <div className="text-sm text-zinc-500">Total Inventory Items</div>
          <div className="text-2xl font-bold">{products.length}</div>
        </div>
        <div className="bg-zinc-900/50 border border-zinc-800 rounded-lg p-4">
          <div className="text-sm text-zinc-500">Low Stock Alerts</div>
          <div className="text-2xl font-bold text-red-400">
            {products.filter(p => p.stock <= (p.minStock || 5)).length}
          </div>
        </div>
      </div>
    </div>
  );
}
