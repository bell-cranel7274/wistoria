import React, { createContext, useContext, useState, useEffect } from 'react';
import { STORAGE_KEYS, handleStorageError, saveWithBackup, loadWithRecovery } from '../constants/storage';

export const ViewMode = {
  LIST: 'LIST',
  KANBAN: 'KANBAN',
  CALENDAR: 'CALENDAR'
};

const TaskContext = createContext();

export const TaskProvider = ({ children }) => {
  // Initialize state from localStorage with better error handling
  const [tasks, setTasks] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load tasks on mount
  useEffect(() => {
    const loadInitialTasks = async () => {
      try {
        const savedTasks = await loadWithRecovery(STORAGE_KEYS.TASKS);
        setTasks(savedTasks || []);
      } catch (error) {
        console.error('Error loading tasks:', error);
        setTasks([]);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadInitialTasks();
  }, []);

  const [notes, setNotes] = useState(() => {
    try {
      const savedNotes = localStorage.getItem(STORAGE_KEYS.NOTES);
      return savedNotes ? JSON.parse(savedNotes) : [];
    } catch (error) {
      console.error('Error loading notes:', error);
      return [];
    }
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

  // Save tasks to localStorage with error handling
  useEffect(() => {
    saveWithBackup(STORAGE_KEYS.TASKS, tasks);
  }, [tasks]);

  // Save notes to localStorage with error handling
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.NOTES, JSON.stringify(notes));
    } catch (error) {
      handleStorageError(error, 'save', STORAGE_KEYS.NOTES);
    }
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

  const addTask = async (task) => {
    try {
      const newTasks = [...tasks, task];
      setTasks(newTasks);
      await saveWithBackup(STORAGE_KEYS.TASKS, newTasks);
      return true;
    } catch (error) {
      handleStorageError(error, 'add', STORAGE_KEYS.TASKS);
      throw error;
    }
  };

  const updateTask = (updatedTask) => {
    try {
      const newTasks = tasks.map(task => 
        task.id === updatedTask.id 
          ? { ...updatedTask, updatedAt: new Date().toISOString() }
          : task
      );
      setTasks(newTasks);
      localStorage.setItem(STORAGE_KEYS.TASKS, JSON.stringify(newTasks));
    } catch (error) {
      handleStorageError(error, 'update', STORAGE_KEYS.TASKS);
      throw error;
    }
  };

  const deleteTask = (taskId) => {
    try {
      const newTasks = tasks.filter(task => task.id !== taskId);
      setTasks(newTasks);
      localStorage.setItem(STORAGE_KEYS.TASKS, JSON.stringify(newTasks));
    } catch (error) {
      handleStorageError(error, 'delete', STORAGE_KEYS.TASKS);
      throw error;
    }
  };

  const addNote = (note) => {
    const newNote = {
      ...note,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      type: note.type || 'general'
    };
    
    setNotes(prevNotes => {
      const updatedNotes = [...prevNotes, newNote];
      localStorage.setItem(STORAGE_KEYS.NOTES, JSON.stringify(updatedNotes));
      return updatedNotes;
    });
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
    localStorage.removeItem(STORAGE_KEYS.TASKS);
    localStorage.removeItem(STORAGE_KEYS.NOTES);
  };

  // Add this useEffect to sync with localStorage
  useEffect(() => {
    const savedNotes = localStorage.getItem(STORAGE_KEYS.NOTES);
    if (savedNotes) {
      setNotes(JSON.parse(savedNotes));
    }

    const savedDrawings = localStorage.getItem('whiteboardDrawings');
    if (savedDrawings) {
      // You might want to add state for drawings if needed
      console.log('Loaded saved drawings:', JSON.parse(savedDrawings));
    }
  }, []);

  // Add periodic storage check
  useEffect(() => {
    const checkStorage = () => {
      try {
        const storedTasks = localStorage.getItem(STORAGE_KEYS.TASKS);
        const storedNotes = localStorage.getItem(STORAGE_KEYS.NOTES);
        
        if (storedTasks) {
          const parsedTasks = JSON.parse(storedTasks);
          if (JSON.stringify(parsedTasks) !== JSON.stringify(tasks)) {
            setTasks(parsedTasks);
          }
        }
        
        if (storedNotes) {
          const parsedNotes = JSON.parse(storedNotes);
          if (JSON.stringify(parsedNotes) !== JSON.stringify(notes)) {
            setNotes(parsedNotes);
          }
        }
      } catch (error) {
        console.error('Storage check error:', error);
      }
    };

    // Check storage every 30 seconds
    const interval = setInterval(checkStorage, 30000);
    return () => clearInterval(interval);
  }, []);

  // Add storage event listener to sync across tabs
  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === STORAGE_KEYS.TASKS) {
        try {
          const newTasks = JSON.parse(e.newValue);
          setTasks(newTasks);
        } catch (error) {
          console.error('Error syncing tasks:', error);
        }
      }
      if (e.key === STORAGE_KEYS.NOTES) {
        try {
          const newNotes = JSON.parse(e.newValue);
          setNotes(newNotes);
        } catch (error) {
          console.error('Error syncing notes:', error);
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  // Add auto-save interval
  useEffect(() => {
    const autoSave = async () => {
      try {
        await saveWithBackup(STORAGE_KEYS.TASKS, tasks);
        await saveWithBackup(STORAGE_KEYS.NOTES, notes);
      } catch (error) {
        console.error('Auto-save failed:', error);
      }
    };

    const interval = setInterval(autoSave, 60000); // Auto-save every minute
    return () => clearInterval(interval);
  }, [tasks, notes]);

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
      clearAllData,
      isLoading
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
  console.log('TaskContext:', context);
  return context;
};