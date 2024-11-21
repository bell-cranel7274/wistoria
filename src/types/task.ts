export enum TaskStatus {
  PENDING = 'PENDING',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED'
}

export enum TaskPriority {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH'
}

export interface Task {
  id: string;
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  category: string;
  dueDate: string;
  createdAt: string;
  updatedAt: string;
  progress: number;
}

export const defaultTask: Task = {
  id: '',
  title: '',
  description: '',
  status: TaskStatus.PENDING,
  priority: TaskPriority.MEDIUM,
  category: 'General',
  dueDate: new Date().toISOString().split('T')[0],
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  progress: 0,
}; 