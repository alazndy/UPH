'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useGitHubStore, parseGitHubUrl } from '@/stores/github-store';
import { useProjectStore } from '@/stores/project-store';
import { fetchReadme } from '@/lib/github';
import { Github, Loader2, BookOpen, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';

interface ImportProjectDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ImportProjectDialog({ open, onOpenChange }: ImportProjectDialogProps) {
  const [repoUrl, setRepoUrl] = useState('');
  const [isImporting, setIsImporting] = useState(false);
  const [importError, setImportError] = useState<string | null>(null);
  
  const { connectRepo, error: storeError, clearRepo } = useGitHubStore();
  const { addProject } = useProjectStore();
  const router = useRouter();

  const handleImport = async () => {
    setIsImporting(true);
    setImportError(null);

    try {
        // 1. Connect to Repo to get details
        const repoInfo = await connectRepo(repoUrl);
        
        if (!repoInfo) {
            setImportError("Repository bulunamadı veya erişilemiyor.");
            setIsImporting(false);
            return;
        }

        const parsed = parseGitHubUrl(repoUrl);
        let readmeContent = "";

        // 2. Fetch README if available
        if (parsed) {
            const readme = await fetchReadme(parsed.owner, parsed.repo);
            if (readme) {
                readmeContent = readme;
            }
        }

        // 3. Create Project
        const newProject = await addProject({
            name: repoInfo.name,
            description: repoInfo.description || readmeContent.slice(0, 150) + "..." || "GitHub'dan import edildi.",
            status: 'Planning',
            priority: 'Medium',
            startDate: new Date().toISOString(),
            deadline: undefined,
            budget: 0,
            spent: 0,
            completionPercentage: 0,
            tags: [repoInfo.language || 'GitHub'],
            members: [],
            githubRepo: repoInfo.full_name,
            githubSyncEnabled: true,
            lastGithubSync: new Date().toISOString(),
            scope: readmeContent // Save entire README as scope/details
        });

        toast.success(`Proj başarıyla oluşturuldu: ${newProject.name}`);
        handleClose();
        router.push(`/projects/${newProject.id}`);

    } catch (e: any) {
        setImportError(e.message || "Import işlemi sırasında bir hata oluştu.");
    } finally {
        setIsImporting(false);
    }
  };

  const handleClose = () => {
    setRepoUrl('');
    setImportError(null);
    clearRepo();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Github className="h-5 w-5" />
            Import from GitHub
          </DialogTitle>
          <DialogDescription>
            Create a new project from an existing GitHub repository.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="import-url">Repository URL</Label>
            <Input
              id="import-url"
              placeholder="https://github.com/owner/repo"
              value={repoUrl}
              onChange={(e) => setRepoUrl(e.target.value)}
            />
            {storeError && (
               <p className="text-sm text-red-500 flex items-center gap-1">
                 <AlertCircle className="h-3 w-3" /> {storeError}
               </p>
            )}
             {importError && (
               <p className="text-sm text-red-500 flex items-center gap-1">
                 <AlertCircle className="h-3 w-3" /> {importError}
               </p>
            )}
          </div>
          <div className="bg-muted/50 p-3 rounded-md text-sm text-muted-foreground flex gap-2">
            <BookOpen className="h-4 w-4 mt-0.5 shrink-0" />
            <p>
                Sistem otomatik olarak Proje Adı, Açıklama ve <strong>README</strong> dosyasını çekecektir.
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose}>Cancel</Button>
          <Button onClick={handleImport} disabled={!repoUrl || isImporting}>
            {isImporting ? (
              <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Importing...</>
            ) : (
              <>Import Project</>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
