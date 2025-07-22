import React, { useState, useMemo, useEffect } from 'react';
import { Plus, Search, Filter, LayoutGrid, List, Calendar, StickyNote, X, Book, Grid, BarChart, BookOpen, Video, Bell, FileText } from 'lucide-react';
import { AddTaskModal } from './AddTaskModal';
import { TaskDetailModal } from './TaskDetailModal';
import { TaskList } from './TaskList';
import { KanbanView } from './views/KanbanView';
import { CalendarView } from './views/CalendarView';
import MasterNavigation from '../navigation/MasterNavigation';
import ProductivitySidebar from '../navigation/ProductivitySidebar';
import { useTaskContext, ViewMode } from '../../context/TaskContext';
import { CATEGORIES } from '../../utils/constants';
import { defaultTask } from '../../types/task';
import { STORAGE_KEYS, handleStorageError } from '../../constants/storage';
import { ChatWidget } from '../chat/ChatWidget';

export const TaskDashboard = () => {
  const {
    tasks,
    addTask,
    updateTask,
    deleteTask,
    viewMode,
    setViewMode,
    darkMode,
    toggleTheme,
    searchQuery,
    setSearchQuery,
    categoryFilter,
    setCategoryFilter,
    addNote,
    isLoading
  } = useTaskContext();

  const [isAddingTask, setIsAddingTask] = useState(false);
  const [isAddingNote, setIsAddingNote] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [newTask, setNewTask] = useState(defaultTask);
  const [newNote, setNewNote] = useState({ title: '', content: '' });
  const [showAddModal, setShowAddModal] = useState(false);

  const handleAddTask = async (task) => {
    try {
      await addTask(task);
      setShowAddModal(false);
      return true;
    } catch (error) {
      console.error('Error adding task:', error);
      return false;
    }
  };

  const handleUpdateTask = async (updatedTask) => {
    try {
      await updateTask(updatedTask);
      setSelectedTask(null);
    } catch (error) {
      console.error('Error updating task:', error);
    }
  };

  const handleDeleteTask = async (taskId) => {
    try {
      await deleteTask(taskId);
      setSelectedTask(null);
    } catch (error) {
      console.error('Error deleting task:', error);
    }
  };

  const handleAddNote = async () => {
    try {
      if (!newNote.title.trim() || !newNote.content.trim()) {
        return;
      }
      await addNote(newNote);
      setNewNote({ title: '', content: '' });
      setIsAddingNote(false);
    } catch (error) {
      console.error('Error adding note:', error);
    }
  };

  const filteredTasks = useMemo(() => {
    // Skip filtering if tasks are still loading
    if (isLoading) {
      return [];
    }

    // Make sure tasks is an array before filtering
    if (!Array.isArray(tasks)) {
      return [];
    }

    return tasks.filter(task => {
      const matchesSearch = searchQuery.trim() === '' || 
        task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        task.description.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesCategory = categoryFilter === 'all' || task.category === categoryFilter;

      return matchesSearch && matchesCategory;
    });
  }, [tasks, searchQuery, categoryFilter, isLoading]);

  // Add loading state to render function
  const renderTaskView = () => {
    if (isLoading) {
      return (
        <div className="flex items-center justify-center p-8">
          <div className="bg-card border border-border rounded-lg p-6 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary border-t-transparent mx-auto mb-4"></div>
            <p className="text-sm text-muted-foreground">Loading tasks...</p>
          </div>
        </div>
      );
    }

    switch (viewMode) {
      case ViewMode.KANBAN:
        return (
          <KanbanView 
            tasks={filteredTasks} 
            onTaskSelect={setSelectedTask}
          />
        );
      case ViewMode.CALENDAR:
        return (
          <CalendarView 
            tasks={filteredTasks} 
            onTaskSelect={setSelectedTask}
          />
        );
      default:
        return (
          <TaskList 
            tasks={filteredTasks}
            onTaskSelect={setSelectedTask}
          />
        );
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Master Navigation */}
      <MasterNavigation />
      
      <div className="flex">
        {/* Productivity Sidebar */}
        <ProductivitySidebar />
        
        {/* Main Content Area */}
        <div className="flex-1 flex">
          {/* Central Task Content */}
          <div className="flex-1 min-h-screen bg-card">
            {/* Task Management Header */}
            <div className="bg-card border-b border-border p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h1 className="text-3xl font-bold text-card-foreground mb-2">Task Dashboard</h1>
                  <p className="text-muted-foreground">Organize and track your tasks efficiently</p>
                </div>
                <div className="flex items-center gap-4">
                  <ChatWidget />
                  <button
                    onClick={() => window.open('/chart', '_blank')}
                    className="flex items-center gap-2 px-4 py-2 bg-muted text-muted-foreground rounded-lg hover:bg-accent/10 transition-colors"
                  >
                    <BarChart className="w-4 h-4" /> Analytics
                  </button>
                  <button
                    onClick={() => setShowAddModal(true)}
                    className="bg-primary hover:bg-primary/90 text-primary-foreground px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Add Task</span>
                  </button>
                </div>
              </div>
              
              {/* Search and Filters */}
              <div className="flex gap-4 mb-6">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                  <input
                    type="text"
                    placeholder="Search tasks..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-border rounded-lg focus:border-primary focus:ring-1 focus:ring-primary transition-all bg-background text-foreground"
                  />
                </div>
                <div className="relative">
                  <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                  <select
                    value={categoryFilter}
                    onChange={(e) => setCategoryFilter(e.target.value)}
                    className="pl-10 pr-4 py-2 border border-border rounded-lg appearance-none focus:border-primary focus:ring-1 focus:ring-primary transition-all bg-background text-foreground"
                  >
                    <option value="all">All Categories</option>
                    {CATEGORIES.map(category => (
                      <option key={category} value={category}>{category}</option>
                    ))}
                  </select>
                </div>
                <div className="flex border border-border rounded-lg overflow-hidden">
                  <button
                    onClick={() => setViewMode(ViewMode.LIST)}
                    className={`p-2 ${viewMode === ViewMode.LIST ? 'bg-primary text-primary-foreground' : 'bg-card hover:bg-accent/10'}`}
                    title="List View"
                  >
                    <List className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setViewMode(ViewMode.KANBAN)}
                    className={`p-2 ${viewMode === ViewMode.KANBAN ? 'bg-primary text-primary-foreground' : 'bg-card hover:bg-accent/10'}`}
                    title="Kanban View"
                  >
                    <LayoutGrid className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setViewMode(ViewMode.CALENDAR)}
                    className={`p-2 ${viewMode === ViewMode.CALENDAR ? 'bg-primary text-primary-foreground' : 'bg-card hover:bg-accent/10'}`}
                    title="Calendar View"
                  >
                    <Calendar className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* Tasks Content */}
            <div className="p-6 bg-card">
              {renderTaskView()}
            </div>
          </div>

          {/* Right Sidebar */}
          <div className="w-80 bg-muted/20 border-l border-border p-6 overflow-y-auto">
            {/* Task Summary */}
            <div className="mb-8">
              <h2 className="text-lg font-semibold text-foreground mb-4">Task Summary</h2>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-card p-4 rounded-lg border border-border shadow-sm">
                  <div className="text-2xl font-bold text-primary">{tasks.length}</div>
                  <div className="text-sm text-muted-foreground">Total Tasks</div>
                </div>
                <div className="bg-card p-4 rounded-lg border border-border shadow-sm">
                  <div className="text-2xl font-bold text-accent">
                    {tasks.filter(t => t.completed || t.status === 'COMPLETED').length}
                  </div>
                  <div className="text-sm text-muted-foreground">Completed</div>
                </div>
                <div className="bg-card p-4 rounded-lg border border-border shadow-sm">
                  <div className="text-2xl font-bold text-secondary">
                    {tasks.filter(t => t.status === 'IN_PROGRESS').length}
                  </div>
                  <div className="text-sm text-muted-foreground">In Progress</div>
                </div>
                <div className="bg-card p-4 rounded-lg border border-border shadow-sm">
                  <div className="text-2xl font-bold text-warning">
                    {tasks.filter(t => !t.completed && t.status !== 'COMPLETED').length}
                  </div>
                  <div className="text-sm text-muted-foreground">Pending</div>
                </div>
              </div>
            </div>

            {/* Recent Tasks */}
            <div className="mb-8">
              <h2 className="text-lg font-semibold text-foreground mb-4">Recent Tasks</h2>
              <div className="space-y-3">
                {tasks.slice(-5).reverse().map(task => (
                  <div 
                    key={task.id}
                    onClick={() => setSelectedTask(task)}
                    className="bg-card p-4 rounded-lg border border-border hover:border-primary hover:shadow-md cursor-pointer transition-all duration-200"
                  >
                    <h3 className="font-medium text-card-foreground mb-1 truncate">{task.title}</h3>
                    <div className="flex items-center justify-between text-sm">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                        task.completed || task.status === 'COMPLETED' ? 'bg-accent/20 text-accent-foreground' :
                        task.status === 'IN_PROGRESS' ? 'bg-secondary/20 text-secondary-foreground' :
                        'bg-warning/20 text-warning-foreground'
                      }`}>
                        {task.completed || task.status === 'COMPLETED' ? 'Completed' :
                         task.status === 'IN_PROGRESS' ? 'In Progress' : 'Pending'}
                      </span>
                      <span className="text-muted-foreground text-xs">
                        {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'No due date'}
                      </span>
                    </div>
                    {task.progress !== undefined && (
                      <div className="mt-2">
                        <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                          <div 
                            className={`h-full transition-all duration-300 ${
                              task.progress >= 80 ? 'bg-accent' :
                              task.progress >= 50 ? 'bg-secondary' :
                              'bg-warning'
                            }`}
                            style={{ width: `${task.progress || 0}%` }}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Actions */}
            <div className="mb-8">
              <h2 className="text-lg font-semibold text-foreground mb-4">Quick Actions</h2>
              <div className="space-y-3">
                <button
                  onClick={() => setShowAddModal(true)}
                  className="w-full flex items-center gap-2 p-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  <span>New Task</span>
                </button>
                <button
                  onClick={() => setIsAddingNote(true)}
                  className="w-full flex items-center gap-2 p-3 bg-card border border-border hover:border-primary hover:bg-accent/10 rounded-lg transition-all duration-200"
                >
                  <StickyNote className="w-4 h-4" />
                  <span>Quick Note</span>
                </button>
                <button
                  onClick={() => window.open('/notes', '_blank')}
                  className="w-full flex items-center gap-2 p-3 bg-card border border-border hover:border-muted hover:bg-muted/10 rounded-lg transition-all duration-200"
                >
                  <FileText className="w-4 h-4" />
                  <span>View Notes</span>
                </button>
                <button
                  onClick={() => window.open('/research', '_blank')}
                  className="w-full flex items-center gap-2 p-3 bg-card border border-border hover:border-muted hover:bg-muted/10 rounded-lg transition-all duration-200"
                >
                  <BookOpen className="w-4 h-4" />
                  <span>Research Hub</span>
                </button>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
              <h3 className="text-sm font-semibold text-gray-900 mb-3">Today's Stats</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Tasks Due Today:</span>
                  <span className="font-medium text-gray-900">
                    {tasks.filter(t => {
                      if (!t.dueDate) return false;
                      const today = new Date().toDateString();
                      return new Date(t.dueDate).toDateString() === today;
                    }).length}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Overdue:</span>
                  <span className="font-medium text-red-600">
                    {tasks.filter(t => {
                      if (!t.dueDate || t.completed) return false;
                      return new Date(t.dueDate) < new Date();
                    }).length}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Completion Rate:</span>
                  <span className="font-medium text-green-600">
                    {tasks.length > 0 ? Math.round((tasks.filter(t => t.completed || t.status === 'COMPLETED').length / tasks.length) * 100) : 0}%
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
      {showAddModal && (
        <AddTaskModal
          onClose={() => setShowAddModal(false)}
          onSubmit={handleAddTask}
        />
      )}
      
      {selectedTask && (
        <TaskDetailModal 
          task={selectedTask} 
          onClose={() => setSelectedTask(null)}
          onUpdate={handleUpdateTask}
          onDelete={handleDeleteTask}
        />
      )}

      {isAddingNote && (
        <div className="fixed inset-0 bg-background/80 flex items-center justify-center p-4 z-50">
          <div className="bg-card rounded-lg w-full max-w-4xl h-[90vh] flex flex-col font-['Monorama']">
            {/* Header Section */}
            <div className="p-6 border-b border-border">
              <div className="space-y-6">
                <input
                  type="text"
                  placeholder="NOTE TITLE"
                  value={newNote.title}
                  onChange={(e) => setNewNote({ ...newNote, title: e.target.value })}
                  className="w-full text-2xl font-bold bg-transparent border-none focus:outline-none placeholder-muted-foreground text-foreground"
                  required
                />
                
                <div className="grid grid-cols-3 gap-8">
                  <div>
                    <label className="block text-xs text-muted-foreground mb-1 font-semibold uppercase tracking-wider">PROJECT NAME</label>
                    <input
                      type="text"
                      placeholder="Enter project name"
                      className="w-full bg-transparent border-b border-border focus:outline-none focus:border-primary transition-colors text-foreground"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-muted-foreground mb-1 font-semibold uppercase tracking-wider">REFERENCE NUMBER</label>
                    <div className="font-mono text-sm text-foreground">1-{Math.floor(Math.random() * 999999)}</div>
                  </div>
                  <div>
                    <label className="block text-xs text-muted-foreground mb-1 font-semibold uppercase tracking-wider">DATE</label>
                    <div className="text-sm text-foreground">{new Date().toLocaleDateString()}</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Content Section with Grid Paper Effect */}
            <div className="flex-1 relative overflow-hidden bg-card">
              {/* Grid Background */}
              <div 
                className="absolute inset-0" 
                style={{
                  backgroundImage: `
                    linear-gradient(to right, hsl(var(--muted)/0.03) 1px, transparent 1px),
                    linear-gradient(to bottom, hsl(var(--muted)/0.03) 1px, transparent 1px)
                  `,
                  backgroundSize: '24px 24px',
                }}
              />

              {/* Content Area */}
              <textarea
                value={newNote.content}
                onChange={(e) => setNewNote({ ...newNote, content: e.target.value })}
                placeholder="Start your journey here..."
                className="w-full h-full p-6 bg-transparent resize-none focus:outline-none relative z-10 font-mono text-foreground placeholder-muted-foreground"
                style={{
                  lineHeight: '24px',
                  backgroundImage: 'linear-gradient(transparent 23px, hsl(var(--muted)/0.03) 24px)',
                  backgroundSize: '100% 24px',
                  backgroundAttachment: 'local',
                }}
                required
              />
            </div>

            {/* Footer Section */}
            <div className="p-4 border-t border-border flex justify-between items-center">
              <div className="text-xs text-muted-foreground font-mono">
                EDEN PRODUCTIVITY SYSTEM
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setIsAddingNote(false)}
                  className="px-4 py-2 text-sm border border-border rounded-md hover:bg-muted/10 transition-colors font-medium text-foreground"
                >
                  CANCEL
                </button>
                <button
                  onClick={handleAddNote}
                  className="px-4 py-2 text-sm bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors font-medium"
                >
                  SAVE NOTE
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};