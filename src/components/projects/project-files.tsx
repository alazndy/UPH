'use client';

import { useState } from 'react';
import { Project, ProjectFile } from '@/types/project';
import { useProjectStore } from '@/stores/project-store';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Trash2, Upload, FileText, Image as ImageIcon, File, Download } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';

interface ProjectFilesProps {
    project: Project;
}

export function ProjectFiles({ project }: ProjectFilesProps) {
    const { addFile, deleteFile } = useProjectStore();
    const [isUploading, setIsUploading] = useState(false);

    const handleMockUpload = async () => {
        setIsUploading(true);
        // Simulate upload delay
        await new Promise(resolve => setTimeout(resolve, 1000));

        const fileTypes = ['PDF', 'Image', 'Document'];
        const randomType = fileTypes[Math.floor(Math.random() * fileTypes.length)];
        
        const newFile = {
            name: `Project_Document_${Date.now().toString().slice(-4)}.${randomType === 'Image' ? 'png' : 'pdf'}`,
            url: '#', // Mock URL
            type: randomType,
            uploadedAt: new Date().toISOString()
        };

        await addFile(project.id, newFile);
        setIsUploading(false);
    };

    const getFileIcon = (type: string) => {
        switch (type) {
            case 'PDF': return <FileText className="h-8 w-8 text-red-500" />;
            case 'Image': return <ImageIcon className="h-8 w-8 text-blue-500" />;
            default: return <File className="h-8 w-8 text-gray-500" />;
        }
    };

    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
                <div className="space-y-1">
                    <CardTitle>Files & Documents</CardTitle>
                    <CardDescription>
                        Manage project contracts, blueprints, and reports.
                    </CardDescription>
                </div>
                <Button onClick={handleMockUpload} disabled={isUploading}>
                    {isUploading ? 'Uploading...' : (
                        <>
                            <Upload className="h-4 w-4 mr-2" /> Upload File
                        </>
                    )}
                </Button>
            </CardHeader>
            <CardContent>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                     {(project.files || []).length === 0 ? (
                        <div className="col-span-full text-center py-10 text-muted-foreground border border-dashed rounded-md">
                            No files uploaded yet.
                        </div>
                    ) : (
                        (project.files || []).map(file => (
                            <div key={file.id} className="flex items-start gap-3 p-3 border rounded-lg hover:shadow-sm transition-shadow">
                                <div className="mt-1">{getFileIcon(file.type)}</div>
                                <div className="flex-1 overflow-hidden">
                                    <p className="font-medium text-sm truncate" title={file.name}>{file.name}</p>
                                    <p className="text-xs text-muted-foreground">
                                        {new Date(file.uploadedAt).toLocaleDateString()}
                                    </p>
                                </div>
                                <div className="flex flex-col gap-1">
                                    <Button variant="ghost" size="icon" className="h-6 w-6" title="Download (Mock)">
                                        <Download className="h-3 w-3" />
                                    </Button>
                                    <Button 
                                        variant="ghost" 
                                        size="icon" 
                                        className="h-6 w-6 text-destructive hover:text-destructive"
                                        onClick={() => deleteFile(project.id, file.id)}
                                        title="Delete"
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
    );
}
