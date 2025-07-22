import React, { useState } from 'react';
import { X } from 'lucide-react';
import { CATEGORIES } from '../../utils/constants';
import { TaskStatus, TaskPriority } from '../../types/task';
import { STORAGE_KEYS, MAX_RETRY_ATTEMPTS, RETRY_DELAY, handleStorageError } from '../../constants/storage';

export const AddTaskModal = ({ onClose, onSubmit }) => {
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState(null);
  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    category: CATEGORIES[0],
    dueDate: new Date().toISOString().split('T')[0],
    priority: TaskPriority.MEDIUM,
    status: TaskStatus.PENDING,
    progress: 0
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isSaving) return; // Prevent double submission
    
    setIsSaving(true);
    setError(null);

    try {
      await onSubmit({
        ...newTask,
        id: Date.now().toString(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });
      onClose();
    } catch (err) {
      setError('Failed to save task. Please try again.');
      handleStorageError(err, 'create', STORAGE_KEYS.TASKS);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-card rounded-lg w-full max-w-lg">
        <div className="p-6 space-y-4">
          {error && (
            <div className="p-3 text-sm text-destructive bg-destructive/10 rounded-md">
              {error}
            </div>
          )}
          
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold">Add New Task</h2>
            <button 
              type="button"
              onClick={onClose} 
              className="text-muted-foreground hover:text-foreground"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Title</label>
              <input
                type="text"
                value={newTask.title}
                onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                className="w-full p-2 rounded-md border bg-background"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Description</label>
              <textarea
                value={newTask.description}
                onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                className="w-full p-2 rounded-md border bg-background h-24 resize-none"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Category</label>
                <select
                  value={newTask.category}
                  onChange={(e) => setNewTask({ ...newTask, category: e.target.value })}
                  className="w-full p-2 rounded-md border bg-background"
                >
                  {CATEGORIES.map(category => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Due Date</label>
                <input
                  type="date"
                  value={newTask.dueDate}
                  onChange={(e) => setNewTask({ ...newTask, dueDate: e.target.value })}
                  className="w-full p-2 rounded-md border bg-background"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Priority</label>
                <select
                  value={newTask.priority}
                  onChange={(e) => setNewTask({ ...newTask, priority: e.target.value })}
                  className="w-full p-2 rounded-md border bg-background"
                >
                  {Object.values(TaskPriority).map(priority => (
                    <option key={priority} value={priority}>{priority}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Status</label>
                <select
                  value={newTask.status}
                  onChange={(e) => setNewTask({ ...newTask, status: e.target.value })}
                  className="w-full p-2 rounded-md border bg-background"
                >
                  {Object.values(TaskStatus).map(status => (
                    <option key={status} value={status}>{status}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-sm border border-border rounded-md hover:bg-accent/10"
                disabled={isSaving}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 text-sm bg-primary text-primary-foreground rounded-md hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={isSaving}
              >
                {isSaving ? 'Adding...' : 'Add Task'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}; 