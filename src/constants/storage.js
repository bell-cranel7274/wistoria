import { saveToFile, loadFromFile } from '../utils/fileStorage';
import { validateTasks } from '../utils/validation';

export const STORAGE_KEYS = {
  TASKS: 'eden_tasks',
  NOTES: 'eden_notes',
  SETTINGS: 'eden_settings',
  THEME: 'eden_theme',
  USER_PREFERENCES: 'eden_preferences'
};

export const STORAGE_VERSION = '1.0.0';

export const MAX_RETRY_ATTEMPTS = 3;
export const RETRY_DELAY = 1000; // milliseconds

export const handleStorageError = (error, operation, key) => {
  console.error(`Storage ${operation} failed for key ${key}:`, error);
  // Add error reporting
  try {
    const errorLog = JSON.parse(localStorage.getItem('error_log') || '[]');
    errorLog.push({
      timestamp: new Date().toISOString(),
      operation,
      key,
      error: error.message
    });
    localStorage.setItem('error_log', JSON.stringify(errorLog));
  } catch (e) {
    console.error('Error logging failed:', e);
  }
};

export const isStorageAvailable = () => {
  try {
    const storage = window.localStorage;
    const testKey = '__storage_test__';
    storage.setItem(testKey, testKey);
    storage.removeItem(testKey);
    return true;
  } catch (e) {
    return false;
  }
};

// Add storage recovery function
export const recoverStorage = (key) => {
  try {
    const backup = localStorage.getItem(`${key}_backup`);
    if (backup) {
      localStorage.setItem(key, backup);
      return JSON.parse(backup);
    }
    return null;
  } catch (e) {
    console.error('Recovery failed:', e);
    return null;
  }
};

// Add backup function
export const backupStorage = (key, data) => {
  try {
    localStorage.setItem(`${key}_backup`, JSON.stringify(data));
  } catch (e) {
    console.error('Backup failed:', e);
  }
};

// Add a helper function to check storage
export const checkStorage = (key) => {
  try {
    const value = localStorage.getItem(key);
    console.log(`Storage check for ${key}:`, value);
    return value ? JSON.parse(value) : null;
  } catch (e) {
    console.error(`Storage error for ${key}:`, e);
    return null;
  }
};

export const saveWithBackup = async (key, data) => {
  try {
    // Validate data before saving
    if (key === STORAGE_KEYS.TASKS && !validateTasks(data)) {
      throw new Error('Invalid task data');
    }

    // Save to both main storage and backup
    await saveToFile(key, data);
    localStorage.setItem(`${key}_backup`, JSON.stringify(data));
    
    return true;
  } catch (error) {
    handleStorageError(error, 'save', key);
    return false;
  }
};

export const loadWithRecovery = async (key) => {
  try {
    // Try main storage first
    const data = await loadFromFile(key);
    if (data) {
      return data;
    }

    // Try backup
    const backupData = localStorage.getItem(`${key}_backup`);
    if (backupData) {
      const parsed = JSON.parse(backupData);
      await saveToFile(key, parsed); // Restore main storage from backup
      return parsed;
    }

    return null;
  } catch (error) {
    handleStorageError(error, 'load', key);
    return null;
  }
};