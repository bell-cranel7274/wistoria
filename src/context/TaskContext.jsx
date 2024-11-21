import React, { createContext, useContext, useState, useEffect } from 'react';

export const ViewMode = {
  LIST: 'LIST',
  KANBAN: 'KANBAN',
  CALENDAR: 'CALENDAR'
};

const TaskContext = createContext();

export const TaskProvider = ({ children }) => {
  // Initialize state from localStorage if available
  const [tasks, setTasks] = useState(() => {
    const savedTasks = localStorage.getItem('tasks');
    return savedTasks ? JSON.parse(savedTasks) : [];
  });

  const [notes, setNotes] = useState(() => {
    const savedNotes = localStorage.getItem('notes');
    return savedNotes ? JSON.parse(savedNotes) : [];
  });

  const [viewMode, setViewMode] = useState(() => {
    const savedViewMode = localStorage.getItem('viewMode');
    return savedViewMode || ViewMode.LIST;
  });

  const [darkMode, setDarkMode] = useState(() => {
    const savedTheme = localStorage.getItem('theme');
    return savedTheme === 'dark';
  });

  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');

  // Save tasks to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('tasks', JSON.stringify(tasks));
  }, [tasks]);

  // Save notes to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('notes', JSON.stringify(notes));
  }, [notes]);

  // Save viewMode to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('viewMode', viewMode);
  }, [viewMode]);

  // Theme handling
  useEffect(() => {
    const root = window.document.documentElement;
    if (darkMode) {
      root.setAttribute('data-theme', 'dark');
      localStorage.setItem('theme', 'dark');
    } else {
      root.removeAttribute('data-theme');
      localStorage.setItem('theme', 'light');
    }
  }, [darkMode]);

  const toggleTheme = () => {
    setDarkMode(!darkMode);
  };

  const addTask = (task) => {
    const newTask = {
      ...task,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    setTasks(prevTasks => [...prevTasks, newTask]);
  };

  const updateTask = (updatedTask) => {
    setTasks(prevTasks => prevTasks.map(task => 
      task.id === updatedTask.id 
        ? { ...updatedTask, updatedAt: new Date().toISOString() }
        : task
    ));
  };

  const deleteTask = (taskId) => {
    setTasks(prevTasks => prevTasks.filter(task => task.id !== taskId));
  };

  const addNote = (note) => {
    const newNote = {
      ...note,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    setNotes(prevNotes => [...prevNotes, newNote]);
  };

  const updateNote = (updatedNote) => {
    setNotes(prevNotes => prevNotes.map(note => 
      note.id === updatedNote.id 
        ? { ...updatedNote, updatedAt: new Date().toISOString() }
        : note
    ));
  };

  const deleteNote = (noteId) => {
    setNotes(prevNotes => prevNotes.filter(note => note.id !== noteId));
  };

  // Clear all data
  const clearAllData = () => {
    setTasks([]);
    setNotes([]);
    localStorage.removeItem('tasks');
    localStorage.removeItem('notes');
  };

  return (
    <TaskContext.Provider value={{
      tasks,
      addTask,
      updateTask,
      deleteTask,
      notes,
      addNote,
      updateNote,
      deleteNote,
      viewMode,
      setViewMode,
      darkMode,
      toggleTheme,
      searchQuery,
      setSearchQuery,
      categoryFilter,
      setCategoryFilter,
      clearAllData
    }}>
      {children}
    </TaskContext.Provider>
  );
};

export const useTaskContext = () => {
  const context = useContext(TaskContext);
  if (!context) {
    throw new Error('useTaskContext must be used within a TaskProvider');
  }
  return context;
}; 