'use client';

import { useState, useEffect } from 'react';
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
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useProjectStore } from '@/stores/project-store';
import { Project, ProjectPriority, ProjectStatus } from '@/types/project';
import { Loader2 } from 'lucide-react';

interface EditProjectDialogProps {
    project: Project;
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function EditProjectDialog({ project, open, onOpenChange }: EditProjectDialogProps) {
  const { updateProject } = useProjectStore();
  const [loading, setLoading] = useState(false);
  
  const [formData, setFormData] = useState<Partial<Project>>({});

  useEffect(() => {
    if (project) {
        setFormData({
            name: project.name,
            description: project.description,
            scope: project.scope || '',
            status: project.status,
            priority: project.priority,
            startDate: project.startDate,
            deadline: project.deadline,
            budget: project.budget,
            manager: project.manager,
            tags: project.tags
        });
    }
  }, [project, open]);

  const handleSubmit = async () => {
      setLoading(true);
      try {
        await updateProject(project.id, formData);
        onOpenChange(false);
      } catch (error) {
          console.error("Error updating project:", error);
      } finally {
          setLoading(false);
      }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[525px]">
        <DialogHeader>
          <DialogTitle>Edit Project</DialogTitle>
          <DialogDescription>
            Update the project details below.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="edit-name" className="text-right">
              Name
            </Label>
            <Input
              id="edit-name"
              value={formData.name || ''}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="edit-description" className="text-right">
              Description
            </Label>
             <Input 
              id="edit-description"
              value={formData.description || ''}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-start gap-4">
            <Label htmlFor="edit-scope" className="text-right pt-2">
              Kapsam
            </Label>
             <Textarea 
              id="edit-scope"
              placeholder="Proje kapsamı ve amacını yazın..."
              value={formData.scope || ''}
              onChange={(e) => setFormData({...formData, scope: e.target.value})}
              className="col-span-3 min-h-[80px]"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
             <Label htmlFor="edit-status" className="text-right">Status</Label>
             <div className="col-span-3">
                <Select 
                    value={formData.status} 
                    onValueChange={(v) => setFormData({...formData, status: v as ProjectStatus})}
                >
                    <SelectTrigger>
                        <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="Planning">Planning</SelectItem>
                        <SelectItem value="Active">Active</SelectItem>
                        <SelectItem value="On Hold">On Hold</SelectItem>
                        <SelectItem value="Completed">Completed</SelectItem>
                    </SelectContent>
                </Select>
             </div>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="edit-deadline" className="text-right">
              Deadline
            </Label>
            <Input
              id="edit-deadline"
              type="date"
              value={formData.deadline || ''}
              onChange={(e) => setFormData({...formData, deadline: e.target.value})}
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="edit-budget" className="text-right">
              Budget ($)
            </Label>
            <Input
              id="edit-budget"
              type="number"
              value={formData.budget}
              onChange={(e) => setFormData({...formData, budget: parseInt(e.target.value) || 0})}
              className="col-span-3"
            />
          </div>
        </div>
        <DialogFooter>
          <Button type="submit" onClick={handleSubmit} disabled={loading || !formData.name}>
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Save Changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
