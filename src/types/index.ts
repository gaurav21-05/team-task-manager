export type UserRole = "ADMIN" | "MEMBER";
export type TaskStatusType = "PENDING" | "IN_PROGRESS" | "COMPLETED";

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
}

export interface ProjectType {
  id: string;
  title: string;
  description: string | null;
  createdAt: string;
  updatedAt: string;
  createdById: string;
  createdBy?: { id: string; name: string; email: string };
  members?: ProjectMemberType[];
  tasks?: TaskType[];
  _count?: {
    members: number;
    tasks: number;
  };
}

export interface ProjectMemberType {
  id: string;
  userId: string;
  projectId: string;
  user?: { id: string; name: string; email: string; role: UserRole };
  createdAt: string;
}

export interface TaskType {
  id: string;
  title: string;
  description: string | null;
  dueDate: string | null;
  status: TaskStatusType;
  createdAt: string;
  updatedAt: string;
  assignedToId: string | null;
  assignedTo?: { id: string; name: string; email: string } | null;
  projectId: string;
  project?: { id: string; title: string };
  createdById: string;
  createdBy?: { id: string; name: string };
  isOverdue?: boolean;
}

export interface ActivityLogType {
  id: string;
  action: string;
  timestamp: string;
  userId: string;
  user?: { id: string; name: string };
  projectId: string | null;
  project?: { id: string; title: string } | null;
}

export interface DashboardStats {
  totalTasks: number;
  completedTasks: number;
  pendingTasks: number;
  inProgressTasks: number;
  overdueTasks: number;
  totalProjects: number;
  totalMembers: number;
  recentActivity: ActivityLogType[];
  tasksByStatus: { status: string; count: number }[];
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}
