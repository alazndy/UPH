'use client';

import { useState } from 'react';
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useInventoryStore } from '@/stores/inventory-store';
import { Product } from '@/types/inventory';


// Mock Projects
const PROJECTS = [
    { id: 'p1', name: 'Robot Arm Prototype' },
    { id: 'p2', name: 'Home Automation System' },
    { id: 'p3', name: 'Drone Build V2' },
];

interface AssignProjectDialogProps {
  product: Product;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AssignProjectDialog({ product, open, onOpenChange }: AssignProjectDialogProps) {
  const { assignToProject } = useInventoryStore();
  const [selectedProjectId, setSelectedProjectId] = useState<string>('');
  const [quantity, setQuantity] = useState<number>(1);

  const handleAssign = () => {
      const project = PROJECTS.find(p => p.id === selectedProjectId);
      if (!project) return;

      if (quantity > product.stock) {
          // Check stock limit
           // Using simple alert if toast not configured yet, assuming toast exists based on file analysis
           alert("Insufficient stock!"); 
           return;
      }

      assignToProject(product.id, project.id, project.name, quantity, 'Current User');
      onOpenChange(false);
      
      // Reset
      setSelectedProjectId('');
      setQuantity(1);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Assign to Project</DialogTitle>
          <DialogDescription>
            Allocate <strong>{product.name}</strong> to a project.
            <br />
            Available Stock: {product.stock}
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="project" className="text-right">
              Project
            </Label>
            <div className="col-span-3">
                <Select value={selectedProjectId} onValueChange={setSelectedProjectId}>
                    <SelectTrigger>
                        <SelectValue placeholder="Select project" />
                    </SelectTrigger>
                    <SelectContent>
                        {PROJECTS.map(p => (
                            <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="quantity" className="text-right">
              Quantity
            </Label>
            <Input
              id="quantity"
              type="number"
              min={1}
              max={product.stock}
              value={quantity}
              onChange={(e) => setQuantity(parseInt(e.target.value) || 0)}
              className="col-span-3"
            />
          </div>
        </div>
        <DialogFooter>
          <Button type="submit" onClick={handleAssign} disabled={!selectedProjectId || quantity <= 0}>Assign</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
