export type ProjectStatus = 'Planning' | 'Active' | 'On Hold' | 'Completed';
export type ProjectPriority = 'Low' | 'Medium' | 'High';

export type TaskStatus = 'todo' | 'in-progress' | 'review' | 'done';

export interface ProjectTask {
    id: string;
    title: string;
    completed: boolean;
    status: TaskStatus;
    dueDate?: string;
}

export interface ProjectFile {
    id: string;
    name: string;
    url: string;
    type: string;
    uploadedAt: string;
}

// Weave Final Design Reference
export interface WeaveDesign {
    id: string;
    name: string;
    fileUrl: string;           // Firebase Storage URL or local file reference
    thumbnailUrl?: string;      // Preview image
    uploadedAt: string;
    pageCount: number;
    componentCount: number;     // Number of product instances in design
    projectData?: string;       // JSON stringified .tsproj content for viewer
}

// PCB Design Reference (Gerber, Altium, etc.)
export interface PCBDesign {
    id: string;
    name: string;
    fileUrl: string;
    uploadedAt: string;
    type: 'gerber' | 'altium' | 'eagle' | 'kicad' | 'other';
    fileSize?: string;
}

// 3D Model Reference (GLB, OBJ, STEP, etc.)
export interface ThreeDModel {
    id: string;
    name: string;
    fileUrl: string;
    previewUrl?: string; // Snapshot
    uploadedAt: string;
    format: 'glb' | 'gltf' | 'obj' | 'step' | 'f3d' | 'other';
    size?: string;
}

export interface Project {
    id: string;
    name: string;
    description: string;
    scope?: string; // Proje kapsamı / amacı
    status: ProjectStatus;
    priority: ProjectPriority;
    startDate: string;
    deadline?: string;
    budget: number;
    spent: number;
    manager: string;
    completionPercentage: number;
    tags: string[];
    // tasks removed -> subcollection
    files: ProjectFile[];
    // Weave Final Designs
    weaveDesigns?: WeaveDesign[];
    // PCB Designs
    pcbDesigns?: PCBDesign[];
    // 3D Models
    threeDModels?: ThreeDModel[];
    // GitHub Integration
    githubRepo?: string;
    githubSyncEnabled?: boolean;
    lastGithubSync?: string;
}
