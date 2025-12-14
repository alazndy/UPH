'use client';

import { useState, useRef } from 'react';
import { Project, WeaveDesign } from '@/types/project';
import { useProjectStore } from '@/stores/project-store';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Trash2, Upload, Eye, Download, Cable, Layers, Box, X } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface ProjectDesignsProps {
    project: Project;
}

import { WeaveCanvasViewer } from '../weave-viewer/WeaveCanvasViewer';

import { Loader2 } from 'lucide-react';
import { useEffect } from 'react';

// Visual viewer for .tsproj files
function WeaveDesignViewer({ design, onClose }: { design: WeaveDesign; onClose: () => void }) {
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [showComponents, setShowComponents] = useState(false);

    useEffect(() => {
        const loadData = async () => {
            try {
                setLoading(true);
                // 1. Try local data first
                if (design.projectData) {
                    setData(JSON.parse(design.projectData));
                    return;
                }

                // 2. Fetch from URL via Proxy (to bypass CORS)
                if (design.fileUrl) {
                    const proxyUrl = `/api/proxy-weave?url=${encodeURIComponent(design.fileUrl)}`;
                    const res = await fetch(proxyUrl);
                    if (!res.ok) throw new Error('Failed to fetch design file');
                    const json = await res.json();
                    setData(json);
                    return;
                }

                setError('Tasarım verisi bulunamadı');
            } catch (err) {
                console.error("Failed to load design:", err);
                setError('Tasarım yüklenirken hata oluştu');
            } finally {
                setLoading(false);
            }
        };

        loadData();
    }, [design]);
    
    // Extract component list
    const componentList = data ? (() => {
        const counts: Record<string, number> = {};
        const pages = data.pages || [];
        pages.forEach((p: any) => {
            (p.instances || []).forEach((inst: any) => {
                const name = inst.template?.name || 'Unknown Component';
                counts[name] = (counts[name] || 0) + 1;
            });
        });
        return Object.entries(counts).sort((a, b) => b[1] - a[1]); // Sort by count desc
    })() : [];

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
                <Loader2 className="h-8 w-8 mb-4 animate-spin text-primary" />
                <p>Tasarım yükleniyor...</p>
            </div>
        );
    }
    
    if (error || !data) {
        return (
            <div className="flex flex-col items-center justify-center h-full text-muted-foreground p-8 text-center">
                <Cable className="h-12 w-12 mb-4 opacity-50" />
                <p className="font-medium text-lg mb-2">Tasarım Görüntülenemedi</p>
                <p className="text-sm opacity-80">{error || 'Veri eksik'}</p>
            </div>
        );
    }

    return (
        <div className="flex flex-col h-full relative">
            {/* Metadata Bar */}
            <div className="flex items-center justify-between p-2 bg-muted/30 border-b text-xs shrink-0 bg-background/50 backdrop-blur-sm absolute top-0 left-0 right-0 z-20">
                 <div className="flex gap-4 items-center">
                     <div>
                        <span className="text-muted-foreground mr-1">Tarih:</span>
                        <span className="font-medium">{data.metadata?.date || '-'}</span>
                     </div>
                     <div>
                        <span className="text-muted-foreground mr-1">Rev:</span>
                        <span className="font-medium">{data.metadata?.revision || '-'}</span>
                     </div>
                     <div className="h-4 w-px bg-border mx-2" />
                     <Button 
                        variant={showComponents ? "secondary" : "ghost"} 
                        size="sm" 
                        className="h-6 text-xs gap-2"
                        onClick={() => setShowComponents(!showComponents)}
                     >
                        <Box className="h-3 w-3" />
                        Bileşenler ({componentList.reduce((a,b) => a + b[1], 0)})
                     </Button>
                 </div>
                 <div>
                    <span className="text-muted-foreground mr-1">Hazırlayan:</span>
                    <span className="font-medium">{data.metadata?.preparedBy || '-'}</span>
                 </div>
            </div>
            
            {/* Content Area */}
            <div className="flex-1 min-h-0 relative flex pt-10">
                {/* Canvas */}
                <div className="flex-1 bg-zinc-950 relative overflow-hidden">
                    <WeaveCanvasViewer projectData={data} className="w-full h-full" />
                </div>

                {/* Component Sidebar */}
                {showComponents && (
                    <div className="w-64 border-l bg-background overflow-y-auto shrink-0 animate-in slide-in-from-right duration-200">
                        <div className="p-3 font-semibold border-b text-sm sticky top-0 bg-background/95 backdrop-blur z-10">
                            Bileşen Listesi
                        </div>
                        <div className="p-2 space-y-1">
                            {componentList.map(([name, count]) => (
                                <div key={name} className="flex items-center justify-between text-sm p-2 rounded hover:bg-muted/50">
                                    <span className="truncate mr-2" title={name}>{name}</span>
                                    <span className="bg-muted text-muted-foreground px-1.5 py-0.5 rounded text-xs font-medium">x{count}</span>
                                </div>
                            ))}
                            {componentList.length === 0 && (
                                <div className="text-center py-8 text-muted-foreground text-xs">
                                    Bileşen bulunamadı
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

export function ProjectDesigns({ project }: ProjectDesignsProps) {
    const { addWeaveDesign, deleteWeaveDesign } = useProjectStore();
    const [isUploading, setIsUploading] = useState(false);
    const [selectedDesign, setSelectedDesign] = useState<WeaveDesign | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setIsUploading(true);
        
        try {
            const content = await file.text();
            const projectData = JSON.parse(content);
            
            // Extract metadata from .tsproj
            const pages = projectData.pages || [];
            const pageCount = pages.length;
            const componentCount = pages.reduce((acc: number, p: any) => acc + (p.instances?.length || 0), 0);

            const newDesign: Omit<WeaveDesign, 'id'> = {
                name: file.name.replace('.tsproj', ''),
                fileUrl: '#', // Will be replaced with Firebase Storage URL in production
                uploadedAt: new Date().toISOString(),
                pageCount,
                componentCount,
                projectData: content
            };

            await addWeaveDesign(project.id, newDesign);
        } catch (error) {
            console.error('Error uploading design:', error);
            alert('Tasarım dosyası okunamadı. Geçerli bir .tsproj dosyası yükleyin.');
        } finally {
            setIsUploading(false);
            if (fileInputRef.current) fileInputRef.current.value = '';
        }
    };

    const designs = project.weaveDesigns || [];

    return (
        <>
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
                    <div className="space-y-1">
                        <CardTitle className="flex items-center gap-2">
                            <Cable className="h-5 w-5 text-primary" />
                            Weave Tasarımları
                        </CardTitle>
                        <CardDescription>
                            Weave Final'dan dışa aktarılan sistem şemaları
                        </CardDescription>
                    </div>
                    <div>
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept=".tsproj,.json"
                            onChange={handleFileUpload}
                            className="hidden"
                        />
                        <Button onClick={() => fileInputRef.current?.click()} disabled={isUploading}>
                            {isUploading ? 'Yükleniyor...' : (
                                <>
                                    <Upload className="h-4 w-4 mr-2" /> Tasarım Yükle
                                </>
                            )}
                        </Button>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                        {designs.length === 0 ? (
                            <div className="col-span-full flex flex-col items-center justify-center py-12 text-muted-foreground border border-dashed rounded-lg">
                                <Cable className="h-12 w-12 mb-4 opacity-30" />
                                <p className="text-sm font-medium">Henüz tasarım yüklenmemiş</p>
                                <p className="text-xs mt-1">Weave Final'dan .tsproj dosyası yükleyin</p>
                            </div>
                        ) : (
                            designs.map(design => (
                                <div key={design.id} className="flex flex-col p-4 border rounded-lg hover:shadow-sm transition-shadow bg-gradient-to-br from-background to-muted/30">
                                    <div className="flex flex-col mb-3">
                                        {design.thumbnailUrl ? (
                                            <div className="w-full aspect-video bg-zinc-900 rounded-md mb-3 overflow-hidden border border-border/50 relative group-hover:border-primary/50 transition-colors">
                                                <img 
                                                    src={design.thumbnailUrl} 
                                                    alt={design.name} 
                                                    className="w-full h-full object-contain"
                                                />
                                            </div>
                                        ) : (
                                            <div className="w-full aspect-video bg-zinc-100 dark:bg-zinc-800 rounded-md mb-3 flex items-center justify-center">
                                                <Cable className="h-10 w-10 text-muted-foreground/50" />
                                            </div>
                                        )}
                                        
                                        <div className="flex items-start justify-between gap-2">
                                            <div className="flex-1 overflow-hidden">
                                                <p className="font-medium text-sm truncate" title={design.name}>{design.name}</p>
                                                <p className="text-xs text-muted-foreground">
                                                    {new Date(design.uploadedAt).toLocaleDateString('tr-TR')}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                    
                                    <div className="flex items-center gap-4 text-xs text-muted-foreground mb-3">
                                        <span className="flex items-center gap-1">
                                            <Layers className="h-3 w-3" /> {design.pageCount} sayfa
                                        </span>
                                        <span className="flex items-center gap-1">
                                            <Box className="h-3 w-3" /> {design.componentCount} bileşen
                                        </span>
                                    </div>

                                    <div className="flex gap-2 mt-auto">
                                        <Button 
                                            variant="outline" 
                                            size="sm" 
                                            className="flex-1"
                                            onClick={() => setSelectedDesign(design)}
                                        >
                                            <Eye className="h-3 w-3 mr-1" /> Görüntüle
                                        </Button>
                                        <Button 
                                            variant="ghost" 
                                            size="sm"
                                            className="text-destructive hover:text-destructive"
                                            onClick={() => deleteWeaveDesign(project.id, design.id)}
                                        >
                                            <Trash2 className="h-3 w-3" />
                                        </Button>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </CardContent>
            </Card>

            {/* Viewer Dialog */}
            <Dialog open={!!selectedDesign} onOpenChange={() => setSelectedDesign(null)}>
                <DialogContent 
                    className="p-0 gap-0 overflow-hidden flex flex-col"
                    style={{
                        width: '90vw',
                        height: '85vh',
                        maxWidth: '1600px', 
                        maxHeight: '1000px'
                    }}
                >
                    <DialogHeader className="p-4 border-b shrink-0 bg-background z-10">
                        <DialogTitle className="flex items-center gap-2">
                            <Cable className="h-5 w-5" />
                            {selectedDesign?.name}
                        </DialogTitle>
                    </DialogHeader>
                    {selectedDesign && (
                        <div className="flex-1 min-h-0 relative w-full h-full"> 
                            <WeaveDesignViewer design={selectedDesign} onClose={() => setSelectedDesign(null)} />
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </>
    );
}
