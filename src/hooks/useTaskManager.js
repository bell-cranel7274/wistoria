import { useState } from 'react';
import { defaultTask } from '../types/task';
import { useTaskContext } from '../context/TaskContext';

export const useTaskManager = () => {
  const {
    tasks,
    isAddingTask,
    setIsAddingTask,
    selectedTask,
    setSelectedTask,
    addTask,
    updateTask,
    deleteTask
  } = useTaskContext();
  
  const [newTask, setNewTask] = useState(defaultTask);

  const handleAddTask = (e) => {
    e.preventDefault();
    addTask(newTask);
    setIsAddingTask(false);
    setNewTask(defaultTask);
  };

  const handleUpdateTask = (updatedTask) => {
    updateTask(updatedTask);
  };

  return {
    tasks,
    setTasks: updateTask,
    isAddingTask,
    setIsAddingTask,
    newTask,
    setNewTask,
    selectedTask,
    setSelectedTask,
    handleAddTask,
    handleUpdateTask,
    deleteTask
  };
}; 