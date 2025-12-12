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

export default function InventoryPage() {
  const { products, fetchInventory, isLoading } = useInventoryStore();
  const [searchTerm, setSearchTerm] = useState('');
  
  // Dialog States
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [assignDialogOpen, setAssignDialogOpen] = useState(false);
  const [usageViewOpen, setUsageViewOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [showLowStockOnly, setShowLowStockOnly] = useState(false);
  
  const { deleteProduct } = useInventoryStore(); // Use destructuring to get action

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
          <h2 className="text-3xl font-bold tracking-tight">Inventory</h2>
          <p className="text-muted-foreground">
            Manage your stock, equipment, and consumables.
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline">Import</Button>
          <AddProductDialog />
        </div>
      </div>
      
      <div className="flex items-center space-x-2">
         <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input 
                placeholder="Search components..." 
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
             {showLowStockOnly ? "Showing Low Stock" : "Filter Low Stock"}
         </Button>
      </div>

      <Card>
         <CardHeader>
            <CardTitle>Stock Items</CardTitle>
         </CardHeader>
         <CardContent>
            <Table>
               <TableHeader>
                  <TableRow>
                     <TableHead>Name</TableHead>
                     <TableHead>Category</TableHead>
                     <TableHead>Stock (Available)</TableHead>
                     <TableHead>In Projects</TableHead>
                     <TableHead className="text-right">Unit Price</TableHead>
                     <TableHead className="w-[50px]"></TableHead>
                  </TableRow>
               </TableHeader>
               <TableBody>
                  {isLoading ? (
                      <TableRow>
                          <TableCell colSpan={6} className="text-center py-10">Loading inventory...</TableCell>
                      </TableRow>
                  ) : filteredProducts.length === 0 ? (
                    <TableRow>
                          <TableCell colSpan={6} className="text-center py-10 text-muted-foreground">No items found.</TableCell>
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
                                            {item.totalAllocated} Assigned
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
                                            <span className="sr-only">Open menu</span>
                                            <MoreHorizontal className="h-4 w-4" />
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end">
                                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                        <DropdownMenuItem onClick={() => navigator.clipboard.writeText(item.id)}>
                                            Copy ID
                                        </DropdownMenuItem>
                                        <DropdownMenuSeparator />
                                        <DropdownMenuItem onClick={() => handleAssignClick(item)}>
                                            <ArrowRightLeft className="mr-2 h-4 w-4" /> Assign to Project
                                        </DropdownMenuItem>
                                        <DropdownMenuItem onClick={() => handleViewUsageClick(item)}>
                                            <Eye className="mr-2 h-4 w-4" /> View Usage
                                        </DropdownMenuItem>
                                        <DropdownMenuSeparator />
                                        <DropdownMenuItem onClick={() => handleEditClick(item)}>Edit Details</DropdownMenuItem>
                                        <DropdownMenuItem className="text-red-600" onClick={() => handleDeleteClick(item)}>Delete Item</DropdownMenuItem>
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
                    <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                    <AlertDialogDescription>
                        This action cannot be undone. This will permanently delete 
                        <span className="font-semibold text-foreground"> {selectedProduct?.name} </span>
                        from your inventory.
                    </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={confirmDelete} className="bg-red-600 hover:bg-red-700">Delete</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
      )}
    </div>
  );
}
