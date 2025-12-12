'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { generateProjectTasks, summarizeIssues, USE_MOCK } from '@/lib/gemini';
import { useProjectStore } from '@/stores/project-store';
import { useGitHubStore } from '@/stores/github-store';
import { Sparkles, Loader2, CheckCircle2, Wand2, FileText, Info } from 'lucide-react';
import { toast } from 'sonner';

interface AIAssistantProps {
  projectId: string;
  projectName: string;
  projectDescription: string;
}

export function AIAssistant({ projectId, projectName, projectDescription }: AIAssistantProps) {
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<'menu' | 'plan' | 'summarize'>('menu');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<string[] | string | null>(null);
  
  const { addTask } = useProjectStore();
  const { issues } = useGitHubStore();

  const handlePlanProject = async () => {
    setMode('plan');
    setIsLoading(true);
    setResult(null);
    
    try {
      const tasks = await generateProjectTasks(projectName, projectDescription);
      setResult(tasks);
    } catch (error) {
      toast.error('Failed to generate tasks');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSummarizeIssues = async () => {
    setMode('summarize');
    setIsLoading(true);
    setResult(null);
    
    try {
      const issueData = issues.map(i => ({ title: i.title, body: i.body }));
      const summary = await summarizeIssues(issueData);
      setResult(summary);
    } catch (error) {
      toast.error('Failed to summarize issues');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddTasks = async () => {
    if (!Array.isArray(result)) return;
    
    setIsLoading(true);
    try {
      for (const taskTitle of result) {
        await addTask(projectId, {
          title: taskTitle,
          completed: false,
          status: 'todo'
        });
      }
      toast.success(`Added ${result.length} tasks to project`);
      setOpen(false);
      setMode('menu');
      setResult(null);
    } catch (error) {
      toast.error('Failed to add tasks');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setOpen(false);
    setMode('menu');
    setResult(null);
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => {
      if (!isOpen) handleClose();
      else setOpen(true);
    }}>
      <DialogTrigger asChild>
        <Button 
          className="fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-lg bg-gradient-to-r from-violet-500 to-purple-600 hover:from-violet-600 hover:to-purple-700"
          size="icon"
        >
          <Sparkles className="h-6 w-6" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-violet-500" />
            AI Assistant
            {USE_MOCK && <Badge variant="secondary" className="text-xs">Demo Mode</Badge>}
          </DialogTitle>
          <DialogDescription>
            AI-powered tools to help manage your project
          </DialogDescription>
        </DialogHeader>

        {mode === 'menu' && (
          <div className="grid gap-3 py-4">
            <Card 
              className="cursor-pointer hover:bg-muted/50 transition-colors"
              onClick={handlePlanProject}
            >
              <CardContent className="flex items-center gap-4 p-4">
                <div className="p-2 rounded-lg bg-violet-500/10 text-violet-500">
                  <Wand2 className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="font-medium">Plan This Project</h4>
                  <p className="text-sm text-muted-foreground">Auto-generate tasks from project name</p>
                </div>
              </CardContent>
            </Card>
            
            <Card 
              className={`cursor-pointer transition-colors ${issues.length === 0 ? 'opacity-50 cursor-not-allowed' : 'hover:bg-muted/50'}`}
              onClick={issues.length > 0 ? handleSummarizeIssues : undefined}
            >
              <CardContent className="flex items-center gap-4 p-4">
                <div className="p-2 rounded-lg bg-blue-500/10 text-blue-500">
                  <FileText className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="font-medium">Summarize Issues</h4>
                  <p className="text-sm text-muted-foreground">
                    {issues.length > 0 
                      ? `Summarize ${issues.length} GitHub issues`
                      : 'Connect GitHub first to use this feature'}
                  </p>
                </div>
              </CardContent>
            </Card>

            {USE_MOCK && (
              <div className="flex items-start gap-2 p-3 bg-amber-500/10 rounded-lg text-sm">
                <Info className="h-4 w-4 text-amber-500 mt-0.5 shrink-0" />
                <p className="text-muted-foreground">
                  Running in demo mode. Add <code className="text-xs bg-muted px-1 py-0.5 rounded">NEXT_PUBLIC_GEMINI_API_KEY</code> for full AI features.
                </p>
              </div>
            )}
          </div>
        )}

        {mode === 'plan' && (
          <div className="py-4 space-y-4">
            <h4 className="font-medium">Generated Tasks for "{projectName}"</h4>
            
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-violet-500" />
              </div>
            ) : Array.isArray(result) ? (
              <>
                <div className="max-h-[300px] overflow-y-auto space-y-2">
                  {result.map((task, idx) => (
                    <div key={idx} className="flex items-center gap-2 p-2 border rounded text-sm">
                      <CheckCircle2 className="h-4 w-4 text-green-500 shrink-0" />
                      <span>{task}</span>
                    </div>
                  ))}
                </div>
                <div className="flex gap-2 pt-2">
                  <Button variant="outline" onClick={() => setMode('menu')} className="flex-1">
                    Back
                  </Button>
                  <Button onClick={handleAddTasks} disabled={isLoading} className="flex-1">
                    {isLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                    Add {result.length} Tasks
                  </Button>
                </div>
              </>
            ) : null}
          </div>
        )}

        {mode === 'summarize' && (
          <div className="py-4 space-y-4">
            <h4 className="font-medium">Issue Summary</h4>
            
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
              </div>
            ) : typeof result === 'string' ? (
              <>
                <div className="prose prose-sm dark:prose-invert max-h-[300px] overflow-y-auto p-4 bg-muted/50 rounded-lg">
                  <div dangerouslySetInnerHTML={{ __html: result.replace(/\n/g, '<br/>') }} />
                </div>
                <Button variant="outline" onClick={() => setMode('menu')} className="w-full">
                  Back
                </Button>
              </>
            ) : null}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
