import { create } from 'zustand';
import { fetchRepoInfo, fetchIssues, GitHubRepo, GitHubIssue } from '@/lib/github';

interface GitHubState {
  isConnecting: boolean;
  error: string | null;
  repoInfo: GitHubRepo | null;
  issues: GitHubIssue[];
  
  connectRepo: (repoUrl: string) => Promise<GitHubRepo | null>;
  fetchRepoIssues: (owner: string, repo: string) => Promise<GitHubIssue[]>;
  clearRepo: () => void;
}

// Parse GitHub URL to get owner and repo
function parseGitHubUrl(url: string): { owner: string; repo: string } | null {
  // Handle formats: 
  // - https://github.com/owner/repo
  // - github.com/owner/repo
  // - owner/repo
  const patterns = [
    /github\.com\/([^\/]+)\/([^\/]+)/,
    /^([^\/]+)\/([^\/]+)$/
  ];
  
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) {
      return { owner: match[1], repo: match[2].replace('.git', '') };
    }
  }
  return null;
}

export const useGitHubStore = create<GitHubState>((set, get) => ({
  isConnecting: false,
  error: null,
  repoInfo: null,
  issues: [],

  connectRepo: async (repoUrl) => {
    set({ isConnecting: true, error: null });
    
    const parsed = parseGitHubUrl(repoUrl);
    if (!parsed) {
      set({ error: 'Invalid GitHub URL format', isConnecting: false });
      return null;
    }

    try {
      const repoInfo = await fetchRepoInfo(parsed.owner, parsed.repo);
      set({ repoInfo, isConnecting: false });
      return repoInfo;
    } catch (error: any) {
      set({ error: error.message || 'Failed to connect to repository', isConnecting: false });
      return null;
    }
  },

  fetchRepoIssues: async (owner, repo) => {
    try {
      const issues = await fetchIssues(owner, repo);
      set({ issues });
      return issues;
    } catch (error: any) {
      console.error('Error fetching issues:', error);
      return [];
    }
  },

  clearRepo: () => {
    set({ repoInfo: null, issues: [], error: null });
  }
}));

export { parseGitHubUrl };
