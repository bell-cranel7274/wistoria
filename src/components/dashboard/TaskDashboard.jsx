import React, { useState, useMemo } from 'react';
import { Plus, Search, Filter, Moon, Sun, LayoutGrid, List, Calendar, StickyNote, X, Book, Grid, BarChart } from 'lucide-react';
import { AddTaskModal } from './AddTaskModal';
import { TaskDetailModal } from './TaskDetailModal';
import { TaskList } from './TaskList';
import { KanbanView } from './views/KanbanView';
import { CalendarView } from './views/CalendarView';
import { useTaskContext, ViewMode } from '../../context/TaskContext';
import { CATEGORIES } from '../../utils/constants';
import { defaultTask } from '../../types/task';

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
    addNote
  } = useTaskContext();

  const [isAddingTask, setIsAddingTask] = useState(false);
  const [isAddingNote, setIsAddingNote] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [newTask, setNewTask] = useState(defaultTask);
  const [newNote, setNewNote] = useState({ title: '', content: '' });

  const handleAddTask = (e) => {
    e.preventDefault();
    addTask(newTask);
    setIsAddingTask(false);
    setNewTask(defaultTask);
  };

  const handleUpdateTask = (updatedTask) => {
    updateTask(updatedTask);
    setSelectedTask(null);
  };

  const handleDeleteTask = (taskId) => {
    deleteTask(taskId);
    setSelectedTask(null);
  };

  const handleAddNote = (e) => {
    e.preventDefault();
    if (!newNote.title.trim() || !newNote.content.trim()) return;
    
    addNote({
      ...newNote,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      referenceNumber: generateReferenceNumber()
    });
    setNewNote({ title: '', content: '' });
    setIsAddingNote(false);
  };

  const generateReferenceNumber = () => {
    const prefix = 'NOTE';
    const timestamp = Date.now().toString().slice(-6);
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    return `${prefix}-${timestamp}-${random}`;
  };

  const filteredTasks = useMemo(() => {
    return tasks.filter(task => {
      const matchesSearch = searchQuery.trim() === '' || 
        task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        task.description.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesCategory = categoryFilter === 'all' || task.category === categoryFilter;

      return matchesSearch && matchesCategory;
    });
  }, [tasks, searchQuery, categoryFilter]);

  const renderTaskView = () => {
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
    <div className="p-4 max-w-7xl mx-auto">
      <div className="mb-6 flex justify-between items-center">
        <h1 className="text-2xl font-bold">Task Dashboard</h1>
        <div className="flex items-center gap-4">
          <button
            onClick={toggleTheme}
            className="p-2 rounded-md hover:bg-muted"
            title="Toggle theme"
          >
            {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </button>
          <button
            onClick={() => window.open('/chart', '_blank')}
            className="flex items-center gap-2 bg-accent text-accent-foreground px-4 py-2 rounded-md hover:bg-accent/90"
          >
            <BarChart className="w-4 h-4" /> Chart
          </button>
          <button
            onClick={() => setIsAddingNote(true)}
            className="flex items-center gap-2 bg-secondary text-secondary-foreground px-4 py-2 rounded-md hover:bg-secondary/90"
          >
            <StickyNote className="w-4 h-4" /> Add Note
          </button>
          <button
            onClick={() => window.open('/notes', '_blank')}
            className="flex items-center gap-2 bg-accent text-accent-foreground px-4 py-2 rounded-md hover:bg-accent/90"
          >
            <Book className="w-4 h-4" /> See Notes
          </button>
          <button
            onClick={() => setIsAddingTask(true)}
            className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-md hover:bg-primary/90"
          >
            <Plus className="w-4 h-4" /> Add Task
          </button>
        </div>
      </div>

      <div className="mb-6 flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <input
            type="text"
            placeholder="Search tasks..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border rounded-md bg-background text-foreground"
          />
        </div>
        <div className="flex gap-2">
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="pl-10 pr-4 py-2 border rounded-md bg-background"
            >
              <option value="all">All Categories</option>
              {CATEGORIES.map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
          </div>
          <div className="flex border rounded-md overflow-hidden">
            <button
              onClick={() => setViewMode(ViewMode.LIST)}
              className={`p-2 ${viewMode === ViewMode.LIST ? 'bg-primary text-primary-foreground' : 'bg-background hover:bg-muted'}`}
              title="List View"
            >
              <List className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode(ViewMode.KANBAN)}
              className={`p-2 ${viewMode === ViewMode.KANBAN ? 'bg-primary text-primary-foreground' : 'bg-background hover:bg-muted'}`}
              title="Kanban View"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode(ViewMode.CALENDAR)}
              className={`p-2 ${viewMode === ViewMode.CALENDAR ? 'bg-primary text-primary-foreground' : 'bg-background hover:bg-muted'}`}
              title="Calendar View"
            >
              <Calendar className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {renderTaskView()}

      {isAddingTask && (
        <AddTaskModal
          newTask={newTask}
          setNewTask={setNewTask}
          onClose={() => setIsAddingTask(false)}
          onSubmit={handleAddTask}
          categories={CATEGORIES}
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
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-card rounded-lg w-full max-w-4xl h-[90vh] flex flex-col">
            {/* Header Section */}
            <div className="p-6 border-b border-border">
              <div className="space-y-6">
                <input
                  type="text"
                  placeholder="NOTE TITLE"
                  value={newNote.title}
                  onChange={(e) => setNewNote({ ...newNote, title: e.target.value })}
                  className="w-full text-2xl font-bold bg-transparent border-none focus:outline-none"
                  required
                />
                
                <div className="grid grid-cols-3 gap-8">
                  <div>
                    <label className="block text-xs text-muted-foreground mb-1">PROJECT NAME</label>
                    <input
                      type="text"
                      placeholder="Enter project name"
                      className="w-full bg-transparent border-b border-border focus:outline-none focus:border-primary"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-muted-foreground mb-1">REFERENCE NUMBER</label>
                    <div className="font-mono text-sm">1-586-460</div>
                  </div>
                  <div>
                    <label className="block text-xs text-muted-foreground mb-1">DATE</label>
                    <div className="text-sm">{new Date().toLocaleDateString()}</div>
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
                className="w-full h-full p-6 bg-transparent resize-none focus:outline-none relative z-10 font-mono"
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
            <div className="p-4 border-t border-border flex justify-end gap-2">
              <button
                onClick={() => setIsAddingNote(false)}
                className="px-4 py-2 text-sm border border-border rounded-md hover:bg-accent/10"
              >
                CANCEL
              </button>
              <button
                onClick={handleAddNote}
                className="px-4 py-2 text-sm bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
              >
                SAVE NOTE
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}; 