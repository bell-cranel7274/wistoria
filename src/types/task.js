export const TaskStatus = {
  PENDING: 'pending',
  IN_PROGRESS: 'in_progress',
  COMPLETED: 'completed'
};

export const TaskPriority = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high'
};

export const defaultTask = {
  id: null,
  title: '',
  description: '',
  dueDate: new Date().toISOString().split('T')[0],
  priority: TaskPriority.MEDIUM,
  category: 'work',
  status: TaskStatus.PENDING,
  progress: 0,
  comments: [],
  attachments: [],
  createdAt: null,
  updatedAt: null
}; 