const DB_NAME = 'TaskManagerDB';
const STORE_NAME = 'recordings';
const DB_VERSION = 1;

let db = null;

// Track active URLs to ensure proper cleanup
const activeURLs = new Set();

export const initDB = () => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => {
      reject(request.error);
    };

    request.onsuccess = (event) => {
      db = event.target.result;
      resolve(db);
    };

    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        const store = db.createObjectStore(STORE_NAME, { keyPath: 'id' });
        store.createIndex('filePath', 'filePath', { unique: false });
      }
    };
  });
};

const cleanup = (url) => {
  if (url && activeURLs.has(url)) {
    URL.revokeObjectURL(url);
    activeURLs.delete(url);
  }
};

export const saveRecordingToFileSystem = async (recording) => {
  try {
    const handle = await window.showSaveFilePicker({
      suggestedName: `${recording.title || 'recording'}.webm`,
      types: [{
        description: 'Video File',
        accept: {
          'video/webm': ['.webm'],
        },
      }],
    });

    const writable = await handle.createWritable();
    await writable.write(recording.blob);
    await writable.close();

    return {
      filePath: handle.name,
      handle: handle
    };
  } catch (error) {
    console.error('Error saving to file system:', error);
    throw error;
  }
};

export const saveRecording = async (recording) => {
  if (!db) await initDB();
  
  try {
    // Create new URL and track it
    const url = URL.createObjectURL(recording.blob);
    activeURLs.add(url);

    const { filePath, handle } = await saveRecordingToFileSystem(recording);

    const recordingToSave = {
      ...recording,
      filePath,
      fileHandle: handle,
      url
    };

    return new Promise((resolve, reject) => {
      const transaction = db.transaction([STORE_NAME], 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.put(recordingToSave);
      
      request.onsuccess = () => resolve(recordingToSave);
      request.onerror = () => {
        cleanup(url);
        reject(request.error);
      };
    });
  } catch (error) {
    console.error('Error in saveRecording:', error);
    if (error.name !== 'AbortError') {
      throw error;
    }
    return null; // Return null if user cancelled save dialog
  }
};

export const loadRecordingFile = async (recording) => {
  try {
    // Cleanup any existing URL
    cleanup(recording.url);

    let file;
    if (recording.fileHandle) {
      file = await recording.fileHandle.getFile();
    } else if (recording.filePath) {
      const [handle] = await window.showOpenFilePicker({
        types: [{
          description: 'Video File',
          accept: {
            'video/webm': ['.webm'],
          },
        }],
        multiple: false
      });
      
      file = await handle[0].getFile();
      recording.fileHandle = handle[0];
    } else {
      throw new Error('No file handle or path available');
    }

    const url = URL.createObjectURL(file);
    activeURLs.add(url);

    return {
      ...recording,
      blob: file,
      url
    };
  } catch (error) {
    console.error('Error loading recording file:', error);
    throw error;
  }
};

export const getAllRecordings = async () => {
  if (!db) await initDB();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORE_NAME], 'readonly');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.getAll();

    request.onsuccess = async () => {
      try {
        const recordings = await Promise.all(
          request.result.map(async (recording) => {
            try {
              return await loadRecordingFile(recording);
            } catch (error) {
              console.warn(`Failed to load recording ${recording.id}:`, error);
              return recording;
            }
          })
        );
        resolve(recordings);
      } catch (error) {
        reject(error);
      }
    };
    request.onerror = () => reject(request.error);
  });
};

export const deleteRecording = async (id) => {
  if (!db) await initDB();

  const recording = await new Promise((resolve, reject) => {
    const transaction = db.transaction([STORE_NAME], 'readonly');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.get(id);
    
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });

  if (!recording) {
    throw new Error('Recording not found');
  }

  // Clean up resources
  try {
    cleanup(recording.url);

    if (recording.fileHandle) {
      try {
        await recording.fileHandle.remove();
      } catch (error) {
        console.warn('File may have already been deleted:', error);
      }
    }
  } catch (error) {
    console.warn('Error cleaning up recording resources:', error);
  }

  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORE_NAME], 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    const deleteRequest = store.delete(id);

    deleteRequest.onsuccess = () => resolve({ success: true, id });
    deleteRequest.onerror = () => reject(deleteRequest.error);
  });
};

export const updateRecording = async (recording) => {
  if (!db) await initDB();

  // Clean up old URL if it exists
  cleanup(recording.url);

  // Create new URL if we have a blob
  if (recording.blob) {
    recording.url = URL.createObjectURL(recording.blob);
    activeURLs.add(recording.url);
  }

  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORE_NAME], 'readwrite');
    const store = transaction.objectStore(STORE_NAME);

    const request = store.put(recording);
    request.onsuccess = () => resolve(recording);
    request.onerror = () => {
      cleanup(recording.url);
      reject(request.error);
    };
  });
};