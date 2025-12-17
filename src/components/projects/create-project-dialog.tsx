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
  DialogTrigger,
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
import { useProjectStore } from '@/stores/project-store';
import { useAuthStore } from '@/stores/auth-store';
import { Plus } from 'lucide-react';
import { ProjectPriority, ProjectStatus } from '@/types/project';

// We might need to install Textarea if missing. Using Input as fallback for now if simple.
// Actually standard shadcn has textarea.

export function CreateProjectDialog() {
  const { addProject } = useProjectStore();
  const [open, setOpen] = useState(false);
  
  const [formData, setFormData] = useState({
      name: '',
      description: '',
      status: 'Planning' as ProjectStatus,
      priority: 'Medium' as ProjectPriority,
      startDate: new Date().toISOString().split('T')[0],
      deadline: '',
      budget: 0,
      manager: 'Turhan', // Default
    tags: [] as string[],
      teamGroupId: undefined as string | undefined
  });

  const { teamGroups } = useAuthStore();

  const handleSubmit = () => {
      addProject(formData);
      setOpen(false);
      // Reset form
      setFormData({
        name: '',
        description: '',
        status: 'Planning',
        priority: 'Medium',
        startDate: new Date().toISOString().split('T')[0],
        deadline: '',
        budget: 0,
        manager: 'Turhan',
        budget: 0,
        manager: 'Turhan',
        tags: [] as string[],
        teamGroupId: undefined
      });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-gradient-to-r from-indigo-500 to-purple-600">
            <Plus className="mr-2 h-4 w-4" /> New Project
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[525px]">
        <DialogHeader>
          <DialogTitle>Create New Project</DialogTitle>
          <DialogDescription>
            Enter the details for your new project. Click save when you&apos;re done.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="name" className="text-right">
              Name
            </Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              className="col-span-3"
              placeholder="Project X"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="description" className="text-right">
              Description
            </Label>
             <Input // Using Input for simplicity if textarea missing, technically works
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              className="col-span-3"
              placeholder="Brief summary..."
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
             <Label htmlFor="status" className="text-right">Status</Label>
             <div className="col-span-3">
                 <Select 
                    onValueChange={(template) => {
                        if (template === 'Standard') {
                            setFormData(prev => ({...prev, description: 'Standard project setup', tags: ['general']}));
                        } else if (template === 'R&D') {
                            setFormData(prev => ({...prev, description: 'Research and Development project for new product innovation.', tags: ['r&d', 'innovation']}));
                        } else if (template === 'Maintenance') {
                            setFormData(prev => ({...prev, description: 'Scheduled maintenance and repair work.', tags: ['maintenance', 'support']}));
                        }
                    }}
                 >
                    <SelectTrigger className="mb-2">
                        <SelectValue placeholder="Select Template (Optional)" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="Standard">Standard</SelectItem>
                        <SelectItem value="R&D">R&D</SelectItem>
                        <SelectItem value="Maintenance">Maintenance</SelectItem>
                    </SelectContent>
                 </Select>

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
            <Label htmlFor="team" className="text-right">Project Team</Label>
            <div className="col-span-3">
                 <Select 
                    value={formData.teamGroupId || "personal"} 
                    onValueChange={(v) => setFormData({...formData, teamGroupId: v === "personal" ? undefined : v})}
                >
                    <SelectTrigger>
                        <SelectValue placeholder="Select Team" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="personal">Personal (Only Me)</SelectItem>
                        {teamGroups.map(group => (
                            <SelectItem key={group.id} value={group.id}>{group.name}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground mt-1">
                    {formData.teamGroupId 
                        ? "Visible to members of " + teamGroups.find(g => g.id === formData.teamGroupId)?.name
                        : "Visible only to you."}
                </p>
            </div>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="deadline" className="text-right">
              Deadline
            </Label>
            <Input
              id="deadline"
              type="date"
              value={formData.deadline}
              onChange={(e) => setFormData({...formData, deadline: e.target.value})}
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="budget" className="text-right">
              Budget ($)
            </Label>
            <Input
              id="budget"
              type="number"
              value={formData.budget}
              onChange={(e) => setFormData({...formData, budget: parseInt(e.target.value) || 0})}
              className="col-span-3"
            />
          </div>
        </div>
        <DialogFooter>
          <Button type="submit" onClick={handleSubmit} disabled={!formData.name}>Create Project</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
