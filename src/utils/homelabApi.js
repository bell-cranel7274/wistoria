// Homelab API service for handling all homelab-related network requests
class HomelabApiService {
  constructor() {
    this.baseUrl = import.meta.env.VITE_HOMELAB_API_URL || 'http://localhost:3001/api';
    this.apiKey = import.meta.env.VITE_HOMELAB_API_KEY || '';
    this.timeout = 10000; // 10 seconds
    this.retryAttempts = 3;
    this.retryDelay = 1000; // 1 second
    this.isInitialized = false;
    this.connectionStatus = 'disconnected';
  }

  async initialize() {
    try {
      // Test connection to homelab API
      const response = await this.makeRequest('/health', { method: 'GET' });
      this.isInitialized = true;
      this.connectionStatus = 'connected';
      console.log('Homelab API connected successfully');
      return { success: true, data: response };
    } catch (error) {
      console.warn('Homelab API not available, using mock mode:', error.message);
      this.connectionStatus = 'mock';
      this.isInitialized = true;
      return { success: false, error: error.message };
    }
  }

  async makeRequest(endpoint, options = {}) {
    const url = `${this.baseUrl}${endpoint}`;
    const config = {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...(this.apiKey && { 'Authorization': `Bearer ${this.apiKey}` }),
        ...options.headers
      },
      timeout: this.timeout,
      ...options
    };

    if (config.body && typeof config.body === 'object') {
      config.body = JSON.stringify(config.body);
    }

    let lastError;
    for (let attempt = 1; attempt <= this.retryAttempts; attempt++) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), this.timeout);

        const response = await fetch(url, {
          ...config,
          signal: controller.signal
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const data = await response.json();
        return data;
      } catch (error) {
        lastError = error;
        
        if (attempt === this.retryAttempts) {
          throw error;
        }

        // Wait before retrying
        await new Promise(resolve => setTimeout(resolve, this.retryDelay * attempt));
      }
    }

    throw lastError;
  }

  // System Metrics API
  async getSystemMetrics() {
    if (this.connectionStatus === 'mock') {
      return this.getMockSystemMetrics();
    }

    try {
      return await this.makeRequest('/system/metrics');
    } catch (error) {
      console.warn('Failed to fetch system metrics, using mock data:', error.message);
      return this.getMockSystemMetrics();
    }
  }

  getMockSystemMetrics() {
    return {
      cpu: {
        percentage: Math.floor(Math.random() * 30) + 30, // 30-60%
        temperature: Math.floor(Math.random() * 20) + 50, // 50-70°C
        cores: 8
      },
      memory: {
        used: Math.floor(Math.random() * 4) + 6, // 6-10 GB
        total: 16,
        percentage: Math.floor(Math.random() * 25) + 40 // 40-65%
      },
      network: {
        download: Math.floor(Math.random() * 20) + 30, // 30-50 Mbps
        upload: Math.floor(Math.random() * 10) + 10, // 10-20 Mbps
        latency: Math.floor(Math.random() * 10) + 15 // 15-25ms
      },
      power: {
        consumption: Math.floor(Math.random() * 50) + 150, // 150-200W
        efficiency: Math.floor(Math.random() * 10) + 85 // 85-95%
      },
      uptime: Math.floor(Date.now() / 1000) - Math.floor(Math.random() * 2592000) // Up to 30 days
    };
  }

  // Service Management API
  async getServiceStatus() {
    if (this.connectionStatus === 'mock') {
      return this.getMockServiceStatus();
    }

    try {
      return await this.makeRequest('/services');
    } catch (error) {
      console.warn('Failed to fetch service status, using mock data:', error.message);
      return this.getMockServiceStatus();
    }
  }

  getMockServiceStatus() {
    const services = [
      { id: 'docker', name: 'Docker', status: 'running', port: 2376, category: 'infrastructure' },
      { id: 'pihole', name: 'Pi-hole', status: 'running', port: 80, category: 'network' },
      { id: 'plex', name: 'Plex Media Server', status: 'running', port: 32400, category: 'media' },
      { id: 'homeassistant', name: 'Home Assistant', status: 'running', port: 8123, category: 'automation' },
      { id: 'nginx', name: 'Nginx Proxy', status: 'running', port: 443, category: 'infrastructure' },
      { id: 'portainer', name: 'Portainer', status: 'running', port: 9000, category: 'management' },
      { id: 'jellyfin', name: 'Jellyfin', status: 'stopped', port: 8096, category: 'media' },
      { id: 'nextcloud', name: 'NextCloud', status: 'running', port: 8080, category: 'storage' }
    ];

    const metrics = {};
    services.forEach(service => {
      metrics[service.id] = {
        cpu: Math.floor(Math.random() * 20) + 5,
        memory: Math.floor(Math.random() * 500) + 100,
        uptime: Math.floor(Math.random() * 86400) + 3600,
        requests: Math.floor(Math.random() * 1000) + 100
      };
    });

    return { services, metrics };
  }

  async restartService(serviceId) {
    if (this.connectionStatus === 'mock') {
      await new Promise(resolve => setTimeout(resolve, 2000)); // Simulate delay
      return { success: true, serviceId };
    }

    try {
      return await this.makeRequest(`/services/${serviceId}/restart`, { method: 'POST' });
    } catch (error) {
      console.error(`Failed to restart service ${serviceId}:`, error.message);
      throw error;
    }
  }

  async stopService(serviceId) {
    if (this.connectionStatus === 'mock') {
      await new Promise(resolve => setTimeout(resolve, 1000));
      return { success: true, serviceId };
    }

    try {
      return await this.makeRequest(`/services/${serviceId}/stop`, { method: 'POST' });
    } catch (error) {
      console.error(`Failed to stop service ${serviceId}:`, error.message);
      throw error;
    }
  }

  async startService(serviceId) {
    if (this.connectionStatus === 'mock') {
      await new Promise(resolve => setTimeout(resolve, 1000));
      return { success: true, serviceId };
    }

    try {
      return await this.makeRequest(`/services/${serviceId}/start`, { method: 'POST' });
    } catch (error) {
      console.error(`Failed to start service ${serviceId}:`, error.message);
      throw error;
    }
  }

  // Network Management API
  async getNetworkDevices() {
    if (this.connectionStatus === 'mock') {
      return this.getMockNetworkDevices();
    }

    try {
      return await this.makeRequest('/network/devices');
    } catch (error) {
      console.warn('Failed to fetch network devices, using mock data:', error.message);
      return this.getMockNetworkDevices();
    }
  }

  getMockNetworkDevices() {
    return [
      { id: 'router', name: 'Main Router', ip: '192.168.1.1', status: 'online', ping: 1, mac: '00:1A:2B:3C:4D:5E' },
      { id: 'switch', name: 'Network Switch', ip: '192.168.1.2', status: 'online', ping: 2, mac: '00:1A:2B:3C:4D:5F' },
      { id: 'nas', name: 'NAS Server', ip: '192.168.1.100', status: 'online', ping: 3, mac: '00:1A:2B:3C:4D:60' },
      { id: 'server', name: 'Main Server', ip: '192.168.1.101', status: 'online', ping: 2, mac: '00:1A:2B:3C:4D:61' },
      { id: 'pihole', name: 'Pi-hole', ip: '192.168.1.102', status: 'online', ping: 4, mac: '00:1A:2B:3C:4D:62' },
      { id: 'smart-tv', name: 'Smart TV', ip: '192.168.1.105', status: 'online', ping: 8, mac: '00:1A:2B:3C:4D:63' }
    ];
  }

  async scanNetwork() {
    if (this.connectionStatus === 'mock') {
      await new Promise(resolve => setTimeout(resolve, 3000)); // Simulate scan delay
      return this.getMockNetworkDevices();
    }

    try {
      return await this.makeRequest('/network/scan', { method: 'POST' });
    } catch (error) {
      console.error('Failed to scan network:', error.message);
      throw error;
    }
  }

  // Storage Management API
  async getStorageStatus() {
    if (this.connectionStatus === 'mock') {
      return this.getMockStorageStatus();
    }

    try {
      return await this.makeRequest('/storage');
    } catch (error) {
      console.warn('Failed to fetch storage status, using mock data:', error.message);
      return this.getMockStorageStatus();
    }
  }

  getMockStorageStatus() {
    return [
      { id: 'main', name: 'Main Drive', path: '/', used: 120, total: 500, percentage: 24, type: 'SSD' },
      { id: 'data', name: 'Data Drive', path: '/data', used: 800, total: 2000, percentage: 40, type: 'HDD' },
      { id: 'backup', name: 'Backup Drive', path: '/backup', used: 450, total: 1000, percentage: 45, type: 'HDD' }
    ];
  }

  // Automation API
  async getAutomationRules() {
    if (this.connectionStatus === 'mock') {
      return this.getMockAutomationRules();
    }

    try {
      return await this.makeRequest('/automation/rules');
    } catch (error) {
      console.warn('Failed to fetch automation rules, using mock data:', error.message);
      return this.getMockAutomationRules();
    }
  }

  getMockAutomationRules() {
    return [
      {
        id: 'lights-off',
        name: 'Turn off lights at night',
        trigger: { type: 'time', value: '23:00' },
        action: { type: 'device', device: 'all-lights', action: 'off' },
        enabled: true
      },
      {
        id: 'backup-daily',
        name: 'Daily backup',
        trigger: { type: 'time', value: '02:00' },
        action: { type: 'service', service: 'backup', action: 'start' },
        enabled: true
      }
    ];
  }

  async createAutomationRule(rule) {
    if (this.connectionStatus === 'mock') {
      await new Promise(resolve => setTimeout(resolve, 1000));
      return { ...rule, id: `rule-${Date.now()}` };
    }

    try {
      return await this.makeRequest('/automation/rules', {
        method: 'POST',
        body: rule
      });
    } catch (error) {
      console.error('Failed to create automation rule:', error.message);
      throw error;
    }
  }

  async toggleAutomationRule(ruleId, enabled) {
    if (this.connectionStatus === 'mock') {
      await new Promise(resolve => setTimeout(resolve, 500));
      return { success: true, ruleId, enabled };
    }

    try {
      return await this.makeRequest(`/automation/rules/${ruleId}`, {
        method: 'PATCH',
        body: { enabled }
      });
    } catch (error) {
      console.error(`Failed to toggle automation rule ${ruleId}:`, error.message);
      throw error;
    }
  }

  // Security API
  async getSecurityAlerts() {
    if (this.connectionStatus === 'mock') {
      return this.getMockSecurityAlerts();
    }

    try {
      return await this.makeRequest('/security/alerts');
    } catch (error) {
      console.warn('Failed to fetch security alerts, using mock data:', error.message);
      return this.getMockSecurityAlerts();
    }
  }

  getMockSecurityAlerts() {
    return [
      {
        id: 'alert-1',
        type: 'intrusion',
        severity: 'medium',
        message: 'Multiple failed login attempts detected',
        timestamp: Date.now() - 300000, // 5 minutes ago
        source: '192.168.1.150'
      }
    ];
  }

  // Utility methods
  getConnectionStatus() {
    return this.connectionStatus;
  }

  isConnected() {
    return this.connectionStatus === 'connected';
  }

  isMockMode() {
    return this.connectionStatus === 'mock';
  }

  async testConnection() {
    try {
      await this.makeRequest('/health');
      this.connectionStatus = 'connected';
      return { success: true, status: 'connected' };
    } catch (error) {
      this.connectionStatus = 'error';
      return { success: false, status: 'error', error: error.message };
    }
  }
}

// Create and export singleton instance
export const homelabApiService = new HomelabApiService();

export default homelabApiService;
