// Browser-based storage implementation
export const saveToFile = (key, data) => {
  try {
    localStorage.setItem(key, JSON.stringify(data));
    return true;
  } catch (error) {
    console.error(`Storage backup failed for ${key}:`, error);
    return false;
  }
};

export const loadFromFile = (key) => {
  try {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : null;
  } catch (error) {
    console.error(`Storage recovery failed for ${key}:`, error);
    return null;
  }
};