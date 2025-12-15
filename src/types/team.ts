import { UserRole } from "./index";

export interface TeamMember {
  userId: string;
  email: string;
  displayName: string;
  photoURL?: string;
  role: UserRole;
  joinedAt: Date;
}

export interface Team {
  id: string;
  name: string;
  description?: string;
  createdBy: string; // UserId
  createdAt: Date;
  updatedAt: Date;
  members: TeamMember[];
  avatarUrl?: string;
}
