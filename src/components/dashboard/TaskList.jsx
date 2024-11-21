import React from 'react';
import { Card } from '../ui/card';
import { Clock, AlertCircle } from 'lucide-react';
import { TaskStatus, TaskPriority } from '../../types/task';

export const TaskList = ({ tasks, onTaskSelect, viewMode }) => {
  const getStatusColor = (status) => {
    switch (status) {
      case TaskStatus.COMPLETED:
        return 'bg-green-500/10 text-green-500';
      case TaskStatus.IN_PROGRESS:
        return 'bg-blue-500/10 text-blue-500';
      default:
        return 'bg-yellow-500/10 text-yellow-500';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case TaskPriority.HIGH:
        return 'bg-red-500/10 text-red-500';
      case TaskPriority.MEDIUM:
        return 'bg-orange-500/10 text-orange-500';
      default:
        return 'bg-green-500/10 text-green-500';
    }
  };

  const getProgressColor = (progress) => {
    if (progress >= 80) return 'bg-green-500';
    if (progress >= 50) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  return (
    <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
      {tasks.map(task => (
        <Card 
          key={task.id}
          className="p-4 cursor-pointer hover:border-primary transition-colors"
          onClick={() => onTaskSelect(task)}
        >
          <div className="space-y-3">
            <div className="flex items-start justify-between">
              <h3 className="font-medium truncate">{task.title}</h3>
              <div className="flex gap-2">
                <span className={`px-2 py-1 rounded-md text-xs ${getStatusColor(task.status)}`}>
                  {task.status}
                </span>
                <span className={`px-2 py-1 rounded-md text-xs ${getPriorityColor(task.priority)}`}>
                  {task.priority}
                </span>
              </div>
            </div>
            
            <p className="text-sm text-muted-foreground line-clamp-2">
              {task.description}
            </p>

            {/* Progress Bar */}
            <div className="space-y-1">
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Progress</span>
                <span>{task.progress || 0}%</span>
              </div>
              <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                <div 
                  className={`h-full ${getProgressColor(task.progress || 0)} transition-all duration-300`}
                  style={{ width: `${task.progress || 0}%` }}
                />
              </div>
            </div>

            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <div className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {new Date(task.dueDate).toLocaleDateString()}
              </div>
              <span className="px-2 py-1 rounded-md bg-secondary/10">
                {task.category}
              </span>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}; 