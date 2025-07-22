import React, { useState } from 'react';
import { X, Trash2 } from 'lucide-react';
import { CATEGORIES } from '../../utils/constants';
import { TaskStatus, TaskPriority } from '../../types/task';
import { STORAGE_KEYS, handleStorageError } from '../../constants/storage';

export const TaskDetailModal = ({ task, onClose, onUpdate, onDelete }) => {
  const [editedTask, setEditedTask] = useState(task);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    setError(null);
    
    try {
      await onUpdate(editedTask);
      onClose();
    } catch (err) {
      setError('Failed to save task. Please try again.');
      handleStorageError(err, 'update', STORAGE_KEYS.TASKS);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-card rounded-lg w-full max-w-lg">
        <div className="p-6 space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold">Edit Task</h2>
            <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
              <X className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Title</label>
              <input
                type="text"
                value={editedTask.title}
                onChange={(e) => setEditedTask({ ...editedTask, title: e.target.value })}
                className="w-full p-2 rounded-md border bg-background"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Description</label>
              <textarea
                value={editedTask.description}
                onChange={(e) => setEditedTask({ ...editedTask, description: e.target.value })}
                className="w-full p-2 rounded-md border bg-background h-24 resize-none"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Category</label>
                <select
                  value={editedTask.category}
                  onChange={(e) => setEditedTask({ ...editedTask, category: e.target.value })}
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
                  value={editedTask.dueDate}
                  onChange={(e) => setEditedTask({ ...editedTask, dueDate: e.target.value })}
                  className="w-full p-2 rounded-md border bg-background"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Priority</label>
                <select
                  value={editedTask.priority}
                  onChange={(e) => setEditedTask({ ...editedTask, priority: e.target.value })}
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
                  value={editedTask.status}
                  onChange={(e) => setEditedTask({ ...editedTask, status: e.target.value })}
                  className="w-full p-2 rounded-md border bg-background"
                >
                  {Object.values(TaskStatus).map(status => (
                    <option key={status} value={status}>{status}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium mb-1">
                Progress: {editedTask.progress || 0}%
              </label>
              <input
                type="range"
                min="0"
                max="100"
                value={editedTask.progress || 0}
                onChange={(e) => setEditedTask({ 
                  ...editedTask, 
                  progress: parseInt(e.target.value),
                  status: parseInt(e.target.value) === 100 
                    ? TaskStatus.COMPLETED 
                    : parseInt(e.target.value) === 0 
                    ? TaskStatus.PENDING 
                    : TaskStatus.IN_PROGRESS
                })}
                className="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer"
              />
            </div>

            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowDeleteConfirm(true)}
                className="px-4 py-2 text-sm text-destructive hover:bg-destructive/10 rounded-md"
              >
                Delete
              </button>
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-sm border border-border rounded-md hover:bg-accent/10"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 text-sm bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
              >
                Save Changes
              </button>
            </div>
          </form>
        </div>
      </div>

      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-[60]">
          <div className="bg-card rounded-lg p-6 max-w-sm w-full">
            <h3 className="text-lg font-semibold mb-4">Delete Task</h3>
            <p className="text-muted-foreground mb-6">
              Are you sure you want to delete this task? This action cannot be undone.
            </p>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="px-4 py-2 text-sm border border-border rounded-md hover:bg-accent/10"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  onDelete(task.id);
                  onClose();
                }}
                className="px-4 py-2 text-sm bg-destructive text-destructive-foreground rounded-md hover:bg-destructive/90"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}; 