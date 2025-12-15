// Google Drive Service
// Note: Requires Google OAuth token with drive.file scope

export interface DriveFile {
  id: string;
  name: string;
  mimeType: string;
  size?: string;
  modifiedTime?: string;
  webViewLink?: string;
  iconLink?: string;
  parents?: string[];
}

export interface DriveListResponse {
  files: DriveFile[];
  nextPageToken?: string;
}

const DRIVE_API_BASE = 'https://www.googleapis.com/drive/v3';

export class DriveService {
  private token: string;

  constructor(accessToken: string) {
    this.token = accessToken;
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const response = await fetch(`${DRIVE_API_BASE}${endpoint}`, {
      ...options,
      headers: {
        ...options.headers,
        'Authorization': `Bearer ${this.token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Drive API error: ${response.statusText}`);
    }

    return response.json();
  }

  async listFiles(folderId?: string, pageSize = 20): Promise<DriveListResponse> {
    let query = "trashed = false";
    if (folderId) {
      query += ` and '${folderId}' in parents`;
    }

    const params = new URLSearchParams({
      q: query,
      pageSize: pageSize.toString(),
      fields: 'files(id,name,mimeType,size,modifiedTime,webViewLink,iconLink,parents),nextPageToken',
      orderBy: 'folder,name',
    });

    return this.request<DriveListResponse>(`/files?${params}`);
  }

  async getFile(fileId: string): Promise<DriveFile> {
    const params = new URLSearchParams({
      fields: 'id,name,mimeType,size,modifiedTime,webViewLink,iconLink,parents',
    });

    return this.request<DriveFile>(`/files/${fileId}?${params}`);
  }

  async createFolder(name: string, parentId?: string): Promise<DriveFile> {
    const metadata: Record<string, unknown> = {
      name,
      mimeType: 'application/vnd.google-apps.folder',
    };

    if (parentId) {
      metadata.parents = [parentId];
    }

    return this.request<DriveFile>('/files', {
      method: 'POST',
      body: JSON.stringify(metadata),
    });
  }

  async uploadFile(file: File, parentId?: string): Promise<DriveFile> {
    const metadata: Record<string, unknown> = {
      name: file.name,
    };

    if (parentId) {
      metadata.parents = [parentId];
    }

    // For simple upload (files < 5MB)
    const formData = new FormData();
    formData.append('metadata', new Blob([JSON.stringify(metadata)], { type: 'application/json' }));
    formData.append('file', file);

    const response = await fetch(
      'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id,name,mimeType,size,modifiedTime,webViewLink,iconLink',
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.token}`,
        },
        body: formData,
      }
    );

    if (!response.ok) {
      throw new Error(`Upload failed: ${response.statusText}`);
    }

    return response.json();
  }

  async deleteFile(fileId: string): Promise<void> {
    await fetch(`${DRIVE_API_BASE}/files/${fileId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${this.token}`,
      },
    });
  }
}

// Helper to check if item is a folder
export function isFolder(file: DriveFile): boolean {
  return file.mimeType === 'application/vnd.google-apps.folder';
}

// Get file icon based on mime type
export function getFileIcon(mimeType: string): string {
  if (mimeType.includes('folder')) return '📁';
  if (mimeType.includes('image')) return '🖼️';
  if (mimeType.includes('video')) return '🎬';
  if (mimeType.includes('audio')) return '🎵';
  if (mimeType.includes('pdf')) return '📄';
  if (mimeType.includes('spreadsheet') || mimeType.includes('excel')) return '📊';
  if (mimeType.includes('document') || mimeType.includes('word')) return '📝';
  if (mimeType.includes('presentation') || mimeType.includes('powerpoint')) return '📽️';
  if (mimeType.includes('zip') || mimeType.includes('archive')) return '📦';
  return '📄';
}
