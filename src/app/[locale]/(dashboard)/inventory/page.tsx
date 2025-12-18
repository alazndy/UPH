'use client';

import { useEffect, useState } from 'react';
import { 
    Table, 
    TableBody, 
    TableCell, 
    TableHead, 
    TableHeader, 
    TableRow 
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { 
    Search, 
    Filter, 
    AlertTriangle, 
    MoreHorizontal, 
    ArrowRightLeft,
    Eye
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useInventoryStore } from '@/stores/inventory-store';
import { AssignProjectDialog } from '@/components/inventory/assign-project-dialog';
import { ProductUsageView } from '@/components/inventory/product-usage-view';
import { AddProductDialog } from '@/components/inventory/add-product-dialog';
import { EditProductDialog } from '@/components/inventory/edit-product-dialog';
import { Product } from '@/types/inventory';
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

import { useTranslations } from 'next-intl';

export default function InventoryPage() {
  const t = useTranslations('Inventory');
  const { products, fetchInventory, isLoading } = useInventoryStore();
  
  // ... (keep state) ...
  const [searchTerm, setSearchTerm] = useState('');
  
  // Dialog States
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [assignDialogOpen, setAssignDialogOpen] = useState(false);
  const [usageViewOpen, setUsageViewOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [showLowStockOnly, setShowLowStockOnly] = useState(false);
  
  const { deleteProduct } = useInventoryStore();

  useEffect(() => {
    fetchInventory();
  }, [fetchInventory]);

  const filteredProducts = products.filter(product => {
      const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            product.category.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesLowStock = showLowStockOnly ? product.stock <= (product.minStock || 3) : true;
      
      return matchesSearch && matchesLowStock;
  });

  const handleAssignClick = (product: Product) => {
      setSelectedProduct(product);
      setAssignDialogOpen(true);
  };

  const handleViewUsageClick = (product: Product) => {
      setSelectedProduct(product);
      setUsageViewOpen(true);
  };

  const handleEditClick = (product: Product) => {
      setSelectedProduct(product);
      setEditDialogOpen(true);
  };
  
  const handleDeleteClick = (product: Product) => {
      setSelectedProduct(product);
      setDeleteDialogOpen(true);
  }

  const confirmDelete = async () => {
      if (selectedProduct) {
          await deleteProduct(selectedProduct.id);
          setDeleteDialogOpen(false);
          setSelectedProduct(null);
      }
  }

  return (
    <div className="flex-1 space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <h2 className="text-3xl font-bold tracking-tight bg-linear-to-r from-foreground to-foreground/60 bg-clip-text text-transparent">
            {t('title')}
          </h2>
          <p className="text-muted-foreground text-sm">{t('subtitle')}</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="ghost" className="text-muted-foreground hover:text-white hover:bg-white/5 rounded-xl border border-white/10 uppercase text-[10px] font-bold tracking-widest px-4">
            {t('import')}
          </Button>
          <AddProductDialog />
        </div>
      </div>
      
      <div className="flex items-center gap-4">
         <div className="relative flex-1 max-w-md group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
            <Input 
                placeholder={t('searchPlaceholder')}
                className="pl-10 h-11 bg-muted/30 dark:bg-white/5 border-border/50 dark:border-white/10 focus:border-primary/50 focus:ring-1 focus:ring-primary/50 rounded-xl transition-all" 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
            />
         </div>
         <Button 
            variant="outline"
            onClick={() => setShowLowStockOnly(!showLowStockOnly)}
            className={cn(
              "h-11 px-6 rounded-xl border-border/50 dark:border-white/10 transition-all",
              showLowStockOnly 
                ? "bg-amber-500/10 border-amber-500/50 text-amber-600 dark:text-amber-500" 
                : "bg-muted/30 dark:bg-white/5 text-muted-foreground hover:bg-muted/50 dark:hover:bg-white/10"
            )}
         >
             <Filter className="mr-2 h-4 w-4" /> 
             {showLowStockOnly ? t('showingLowStock') : t('filterLowStock')}
         </Button>
      </div>

      <div className="glass-panel rounded-4xl overflow-hidden border-border/50">
          <div className="p-8 border-b border-border/50 bg-muted/20 dark:bg-white/2 flex items-center justify-between">
            <h3 className="text-xl font-bold text-foreground dark:text-white tracking-tight">{t('stockItems')}</h3>
            <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest">Database Live</span>
            </div>
          </div>
          
          <div className="overflow-x-auto">
            <Table>
               <TableHeader className="bg-muted/10 dark:bg-white/1">
                  <TableRow className="hover:bg-transparent border-border/50 shadow-sm">
                     <TableHead className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60 h-14 pl-8">{t('table.name')}</TableHead>
                     <TableHead className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60 h-14">{t('table.category')}</TableHead>
                     <TableHead className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60 h-14">{t('table.stock')}</TableHead>
                     <TableHead className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60 h-14">{t('table.inProjects')}</TableHead>
                     <TableHead className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60 h-14 text-right pr-8">{t('table.unitPrice')}</TableHead>
                     <TableHead className="w-[80px] pr-8"></TableHead>
                  </TableRow>
               </TableHeader>
               <TableBody>
                  {isLoading ? (
                      <TableRow className="hover:bg-transparent">
                          <TableCell colSpan={6} className="text-center py-20">
                             <div className="flex flex-col items-center gap-3">
                                <div className="h-10 w-10 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
                                <span className="text-muted-foreground text-sm animate-pulse">{t('loading')}</span>
                             </div>
                          </TableCell>
                      </TableRow>
                  ) : filteredProducts.length === 0 ? (
                    <TableRow className="hover:bg-transparent">
                          <TableCell colSpan={6} className="text-center py-20 text-muted-foreground italic text-sm">{t('noItems')}</TableCell>
                      </TableRow>
                  ) : (
                    filteredProducts.map((item) => (
                        <TableRow key={item.id} className="group hover:bg-muted/30 dark:hover:bg-white/2 border-border/50 transition-colors">
                            <TableCell className="pl-8 py-5">
                                <div className="font-bold text-foreground dark:text-white group-hover:text-primary transition-colors">{item.name}</div>
                                <div className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider mt-0.5">{item.manufacturer}</div>
                            </TableCell>
                            <TableCell>
                               <span className="text-xs text-muted-foreground font-semibold px-2 py-1 rounded-lg bg-muted/50 dark:bg-white/5 border border-border/50">
                                  {item.category}
                               </span>
                            </TableCell>
                            <TableCell>
                                <div className="flex items-center gap-2">
                                    {item.stock <= (item.minStock || 3) ? (
                                        <div className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-orange-500/10 text-orange-400 border border-orange-500/20 text-[10px] font-bold">
                                           <AlertTriangle className="h-3 w-3" />
                                           {item.stock} LOW
                                        </div>
                                    ) : (
                                        <div className="px-2 py-1 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] font-bold">
                                           {item.stock} IN STOCK
                                        </div>
                                    )}
                                </div>
                            </TableCell>
                            <TableCell>
                                {item.totalAllocated && item.totalAllocated > 0 ? (
                                    <button 
                                        onClick={() => handleViewUsageClick(item)}
                                        className="flex items-center gap-2 group/alloc"
                                    >
                                        <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center text-[10px] font-bold text-primary group-hover/alloc:bg-primary group-hover/alloc:text-white transition-all">
                                           {item.totalAllocated}
                                        </div>
                                        <span className="text-[10px] font-bold text-muted-foreground group-hover/alloc:text-white transition-colors uppercase tracking-widest">{t('assigned')}</span>
                                    </button>
                                ) : (
                                    <span className="text-muted-foreground text-[10px] font-bold uppercase tracking-widest opacity-20">No Usage</span>
                                )}
                            </TableCell>
                            <TableCell className="text-right font-bold text-foreground/80">₺{(item.price || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</TableCell>
                            <TableCell className="pr-8">
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button variant="ghost" className="h-8 w-8 p-0 rounded-xl hover:bg-white/5 text-muted-foreground hover:text-white">
                                            <MoreHorizontal className="h-4 w-4" />
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end" className="bg-zinc-950 border-white/10 rounded-2xl w-48">
                                        <DropdownMenuLabel className="text-[10px] text-muted-foreground uppercase tracking-widest pt-3">{t('actions.label')}</DropdownMenuLabel>
                                        <DropdownMenuItem className="rounded-xl mt-1 focus:bg-primary/20 focus:text-white" onClick={() => navigator.clipboard.writeText(item.id)}>
                                            {t('actions.copyId')}
                                        </DropdownMenuItem>
                                        <DropdownMenuSeparator className="bg-white/5" />
                                        <DropdownMenuItem className="rounded-xl focus:bg-primary/20 focus:text-white" onClick={() => handleAssignClick(item)}>
                                            <ArrowRightLeft className="mr-2 h-4 w-4" /> {t('actions.assignProject')}
                                        </DropdownMenuItem>
                                        <DropdownMenuItem className="rounded-xl focus:bg-primary/20 focus:text-white" onClick={() => handleViewUsageClick(item)}>
                                            <Eye className="mr-2 h-4 w-4" /> {t('actions.viewUsage')}
                                        </DropdownMenuItem>
                                        <DropdownMenuSeparator className="bg-white/5" />
                                        <DropdownMenuItem className="rounded-xl focus:bg-primary/20 focus:text-white font-bold" onClick={() => handleEditClick(item)}>{t('actions.edit')}</DropdownMenuItem>
                                        <DropdownMenuItem className="rounded-xl focus:bg-red-500/20 text-red-400 focus:text-red-400 font-bold" onClick={() => handleDeleteClick(item)}>{t('actions.delete')}</DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </TableCell>
                        </TableRow>
                    ))
                  )}
               </TableBody>
            </Table>
          </div>
      </div>

      {/* Dialogs */}
      {selectedProduct && (
        <>
            <AssignProjectDialog 
                product={selectedProduct} 
                open={assignDialogOpen} 
                onOpenChange={setAssignDialogOpen} 
            />
            <ProductUsageView 
                product={selectedProduct} 
                open={usageViewOpen} 
                onOpenChange={setUsageViewOpen} 
            />
            <EditProductDialog 
                product={selectedProduct} 
                open={editDialogOpen} 
                onOpenChange={setEditDialogOpen} 
            />
            
            <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                <AlertDialogContent className="bg-zinc-950 border-white/10 rounded-3xl">
                    <AlertDialogHeader>
                    <AlertDialogTitle className="text-white">{t('deleteDialog.title')}</AlertDialogTitle>
                    <AlertDialogDescription className="text-muted-foreground">
                         {t.rich('deleteDialog.description', {
                             name: selectedProduct?.name,
                             span: (chunks) => <span className="font-semibold text-white">{chunks}</span>
                         })}
                    </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                    <AlertDialogCancel className="bg-transparent border-white/10 text-white hover:bg-white/5 rounded-xl">{t('deleteDialog.cancel')}</AlertDialogCancel>
                    <AlertDialogAction onClick={confirmDelete} className="bg-red-600 hover:bg-red-700 text-white rounded-xl border-none">{t('deleteDialog.confirm')}</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
      )}
    </div>
  );
}
