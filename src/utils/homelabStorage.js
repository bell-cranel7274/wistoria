// Homelab data storage management
export const HOMELAB_STORAGE_KEYS = {
  SERVICES: 'homelab_services',
  NETWORK_DEVICES: 'homelab_network_devices',
  AUTOMATION_RULES: 'homelab_automation_rules',
  SMART_DEVICES: 'homelab_smart_devices',
  SYSTEM_SETTINGS: 'homelab_system_settings',
  USER_PREFERENCES: 'homelab_user_preferences',
  SECURITY_SETTINGS: 'homelab_security_settings',
  MEDIA_SETTINGS: 'homelab_media_settings'
};

class HomelabStorageManager {
  constructor() {
    this.isLocalStorageAvailable = this.checkLocalStorageAvailability();
    this.cache = new Map();
  }

  checkLocalStorageAvailability() {
    try {
      const test = 'test';
      localStorage.setItem(test, test);
      localStorage.removeItem(test);
      return true;
    } catch (error) {
      console.warn('localStorage is not available, using memory cache only');
      return false;
    }
  }

  async save(key, data) {
    try {
      const serializedData = JSON.stringify({
        data,
        timestamp: Date.now(),
        version: '1.0'
      });

      // Always cache in memory
      this.cache.set(key, { data, timestamp: Date.now() });

      // Save to localStorage if available
      if (this.isLocalStorageAvailable) {
        localStorage.setItem(key, serializedData);
      }

      return { success: true };
    } catch (error) {
      console.error(`Error saving homelab data for key ${key}:`, error);
      return { success: false, error: error.message };
    }
  }

  async load(key) {
    try {
      // Check memory cache first
      if (this.cache.has(key)) {
        const cached = this.cache.get(key);
        // Return cached data if it's less than 5 minutes old
        if (Date.now() - cached.timestamp < 300000) {
          return cached.data;
        }
      }

      // Try to load from localStorage
      if (this.isLocalStorageAvailable) {
        const stored = localStorage.getItem(key);
        if (stored) {
          const parsed = JSON.parse(stored);
          const data = parsed.data || parsed; // Handle both new and legacy formats
          
          // Update cache
          this.cache.set(key, { data, timestamp: Date.now() });
          
          return data;
        }
      }

      return null;
    } catch (error) {
      console.error(`Error loading homelab data for key ${key}:`, error);
      
      // Try to return cached data even if it's old
      if (this.cache.has(key)) {
        return this.cache.get(key).data;
      }
      
      return null;
    }
  }

  async remove(key) {
    try {
      this.cache.delete(key);
      
      if (this.isLocalStorageAvailable) {
        localStorage.removeItem(key);
      }
      
      return { success: true };
    } catch (error) {
      console.error(`Error removing homelab data for key ${key}:`, error);
      return { success: false, error: error.message };
    }
  }

  async clear() {
    try {
      this.cache.clear();
      
      if (this.isLocalStorageAvailable) {
        Object.values(HOMELAB_STORAGE_KEYS).forEach(key => {
          localStorage.removeItem(key);
        });
      }
      
      return { success: true };
    } catch (error) {
      console.error('Error clearing homelab data:', error);
      return { success: false, error: error.message };
    }
  }

  async loadAll() {
    const data = {};
    
    for (const [keyName, storageKey] of Object.entries(HOMELAB_STORAGE_KEYS)) {
      try {
        const loaded = await this.load(storageKey);
        if (loaded !== null) {
          data[keyName.toLowerCase().replace('_', '')] = loaded;
        }
      } catch (error) {
        console.error(`Error loading ${keyName}:`, error);
      }
    }
    
    return data;
  }

  async saveAll(data) {
    const results = {};
    
    for (const [key, value] of Object.entries(data)) {
      const storageKey = HOMELAB_STORAGE_KEYS[key.toUpperCase()] || key;
      results[key] = await this.save(storageKey, value);
    }
    
    return results;
  }

  // Backup and restore functionality
  async exportData() {
    try {
      const allData = await this.loadAll();
      const exportData = {
        version: '1.0',
        timestamp: Date.now(),
        data: allData
      };
      
      return {
        success: true,
        data: JSON.stringify(exportData, null, 2)
      };
    } catch (error) {
      console.error('Error exporting homelab data:', error);
      return { success: false, error: error.message };
    }
  }

  async importData(jsonString) {
    try {
      const importData = JSON.parse(jsonString);
      
      if (!importData.data) {
        throw new Error('Invalid import data format');
      }
      
      const results = await this.saveAll(importData.data);
      
      return {
        success: true,
        results,
        imported: Object.keys(importData.data).length
      };
    } catch (error) {
      console.error('Error importing homelab data:', error);
      return { success: false, error: error.message };
    }
  }

  // Data validation and migration
  validateData(key, data) {
    switch (key) {
      case HOMELAB_STORAGE_KEYS.SERVICES:
        return this.validateServices(data);
      case HOMELAB_STORAGE_KEYS.NETWORK_DEVICES:
        return this.validateNetworkDevices(data);
      case HOMELAB_STORAGE_KEYS.AUTOMATION_RULES:
        return this.validateAutomationRules(data);
      default:
        return { valid: true, data };
    }
  }

  validateServices(services) {
    if (!Array.isArray(services)) {
      return { valid: false, error: 'Services must be an array' };
    }

    const validatedServices = services.filter(service => {
      return service.id && service.name && service.status;
    });

    return { valid: true, data: validatedServices };
  }

  validateNetworkDevices(devices) {
    if (!Array.isArray(devices)) {
      return { valid: false, error: 'Network devices must be an array' };
    }

    const validatedDevices = devices.filter(device => {
      return device.id && device.name && device.ip;
    });

    return { valid: true, data: validatedDevices };
  }

  validateAutomationRules(rules) {
    if (!Array.isArray(rules)) {
      return { valid: false, error: 'Automation rules must be an array' };
    }

    const validatedRules = rules.filter(rule => {
      return rule.id && rule.name && rule.trigger && rule.action;
    });

    return { valid: true, data: validatedRules };
  }

  // Cache management
  getCacheStats() {
    return {
      size: this.cache.size,
      keys: Array.from(this.cache.keys()),
      memoryUsage: JSON.stringify(Object.fromEntries(this.cache)).length
    };
  }

  clearCache() {
    this.cache.clear();
    return { success: true };
  }
}

// Create and export singleton instance
export const homelabStorageManager = new HomelabStorageManager();

// Export utility functions
export const saveHomelabData = (key, data) => homelabStorageManager.save(key, data);
export const loadHomelabData = (key) => homelabStorageManager.load(key);
export const removeHomelabData = (key) => homelabStorageManager.remove(key);
export const clearHomelabData = () => homelabStorageManager.clear();
export const exportHomelabData = () => homelabStorageManager.exportData();
export const importHomelabData = (jsonString) => homelabStorageManager.importData(jsonString);

export default homelabStorageManager;
