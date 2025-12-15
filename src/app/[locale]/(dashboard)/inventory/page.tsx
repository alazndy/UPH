'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
   Table, 
   TableBody, 
   TableCell, 
   TableHead, 
   TableHeader, 
   TableRow 
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
    Package, 
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
  const tCommon = useTranslations('Common');
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
    <div className="flex-1 space-y-4">
      <div className="flex items-center justify-between space-y-2">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">{t('title')}</h2>
          <p className="text-muted-foreground">
            {t('subtitle')}
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline">{t('import')}</Button>
          <AddProductDialog />
        </div>
      </div>
      
      <div className="flex items-center space-x-2">
         <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input 
                placeholder={t('searchPlaceholder')}
                className="pl-8" 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
            />
         </div>
         <Button 
            variant={showLowStockOnly ? "secondary" : "outline"}
            onClick={() => setShowLowStockOnly(!showLowStockOnly)}
            className={showLowStockOnly ? "bg-amber-100 text-amber-900 hover:bg-amber-200" : ""}
         >
             <Filter className="mr-2 h-4 w-4" /> 
             {showLowStockOnly ? t('showingLowStock') : t('filterLowStock')}
         </Button>
      </div>

      <Card>
         <CardHeader>
            <CardTitle>{t('stockItems')}</CardTitle>
         </CardHeader>
         <CardContent>
            <Table>
               <TableHeader>
                  <TableRow>
                     <TableHead>{t('table.name')}</TableHead>
                     <TableHead>{t('table.category')}</TableHead>
                     <TableHead>{t('table.stock')}</TableHead>
                     <TableHead>{t('table.inProjects')}</TableHead>
                     <TableHead className="text-right">{t('table.unitPrice')}</TableHead>
                     <TableHead className="w-[50px]"></TableHead>
                  </TableRow>
               </TableHeader>
               <TableBody>
                  {isLoading ? (
                      <TableRow>
                          <TableCell colSpan={6} className="text-center py-10">{t('loading')}</TableCell>
                      </TableRow>
                  ) : filteredProducts.length === 0 ? (
                    <TableRow>
                          <TableCell colSpan={6} className="text-center py-10 text-muted-foreground">{t('noItems')}</TableCell>
                      </TableRow>
                  ) : (
                    filteredProducts.map((item) => (
                        <TableRow key={item.id}>
                            <TableCell className="font-medium">
                                {item.name}
                                <div className="text-xs text-muted-foreground">{item.manufacturer}</div>
                            </TableCell>
                            <TableCell>{item.category}</TableCell>
                            <TableCell>
                                <div className="flex items-center gap-2">
                                    {item.stock <= (item.minStock || 3) && (
                                        <AlertTriangle className="h-4 w-4 text-amber-500" />
                                    )}
                                    <Badge variant={item.stock <= 3 ? 'destructive' : 'secondary'}>
                                        {item.stock}
                                    </Badge>
                                </div>
                            </TableCell>
                            <TableCell>
                                {item.totalAllocated && item.totalAllocated > 0 ? (
                                    <Button 
                                        variant="ghost" 
                                        className="h-auto p-0 hover:bg-transparent"
                                        onClick={() => handleViewUsageClick(item)}
                                    >
                                        <Badge variant="outline" className="border-blue-200 text-blue-700 bg-blue-50 hover:bg-blue-100 cursor-pointer">
                                            {item.totalAllocated} {t('assigned')}
                                        </Badge>
                                    </Button>
                                ) : (
                                    <span className="text-muted-foreground text-sm">-</span>
                                )}
                            </TableCell>
                            <TableCell className="text-right">₺{(item.price || 0).toFixed(2)}</TableCell>
                            <TableCell>
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button variant="ghost" className="h-8 w-8 p-0">
                                            <span className="sr-only">{t('actions.label')}</span>
                                            <MoreHorizontal className="h-4 w-4" />
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end">
                                        <DropdownMenuLabel>{t('actions.label')}</DropdownMenuLabel>
                                        <DropdownMenuItem onClick={() => navigator.clipboard.writeText(item.id)}>
                                            {t('actions.copyId')}
                                        </DropdownMenuItem>
                                        <DropdownMenuSeparator />
                                        <DropdownMenuItem onClick={() => handleAssignClick(item)}>
                                            <ArrowRightLeft className="mr-2 h-4 w-4" /> {t('actions.assignProject')}
                                        </DropdownMenuItem>
                                        <DropdownMenuItem onClick={() => handleViewUsageClick(item)}>
                                            <Eye className="mr-2 h-4 w-4" /> {t('actions.viewUsage')}
                                        </DropdownMenuItem>
                                        <DropdownMenuSeparator />
                                        <DropdownMenuItem onClick={() => handleEditClick(item)}>{t('actions.edit')}</DropdownMenuItem>
                                        <DropdownMenuItem className="text-red-600" onClick={() => handleDeleteClick(item)}>{t('actions.delete')}</DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </TableCell>
                        </TableRow>
                    ))
                  )}
               </TableBody>
            </Table>
         </CardContent>
      </Card>

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
                <AlertDialogContent>
                    <AlertDialogHeader>
                    <AlertDialogTitle>{t('deleteDialog.title')}</AlertDialogTitle>
                    <AlertDialogDescription>
                         {t.rich('deleteDialog.description', {
                             name: selectedProduct?.name,
                             span: (chunks) => <span className="font-semibold text-foreground">{chunks}</span>
                         })}
                    </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                    <AlertDialogCancel>{t('deleteDialog.cancel')}</AlertDialogCancel>
                    <AlertDialogAction onClick={confirmDelete} className="bg-red-600 hover:bg-red-700">{t('deleteDialog.confirm')}</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
      )}
    </div>
  );
}
