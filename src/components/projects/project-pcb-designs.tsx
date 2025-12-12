'use client';

import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Cpu, Upload, CircuitBoard } from 'lucide-react';
import { Project } from '@/types/project';

interface ProjectPCBDesignsProps {
    project: Project;
}

export function ProjectPCBDesigns({ project }: ProjectPCBDesignsProps) {
    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
                <div className="space-y-1">
                    <CardTitle className="flex items-center gap-2">
                        <CircuitBoard className="h-5 w-5 text-emerald-500" />
                        PCB Tasarımları
                    </CardTitle>
                    <CardDescription>
                        Altium, KiCad veya Eagle dosyalarınızı yönetin
                    </CardDescription>
                </div>
                <Button variant="outline" disabled>
                    <Upload className="h-4 w-4 mr-2" /> PCB Yükle
                </Button>
            </CardHeader>
            <CardContent>
                <div className="flex flex-col items-center justify-center py-12 text-muted-foreground border border-dashed rounded-lg bg-muted/30">
                    <Cpu className="h-12 w-12 mb-4 opacity-30" />
                    <p className="text-sm font-medium">Henüz PCB tasarımı yüklenmemiş</p>
                    <p className="text-xs mt-1">Bu özellik yakında eklenecektir.</p>
                </div>
            </CardContent>
        </Card>
    );
}
