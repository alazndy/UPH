import { create } from 'zustand';
import { createProjectSlice, ProjectSlice } from './slices/project-slice';
import { createTaskSlice, TaskSlice } from './slices/task-slice';
import { createAssetSlice, AssetSlice } from './slices/asset-slice';

// Combined State Type
export type ProjectState = ProjectSlice & TaskSlice & AssetSlice;

export const useProjectStore = create<ProjectState>()((...a) => ({
  ...createProjectSlice(...a),
  ...createTaskSlice(...a),
  // @ts-ignore - AssetSlice depends on ProjectSlice state which is available in the combined store but type inference is tricky here w/o full generic chain
  ...createAssetSlice(...a),
}));
