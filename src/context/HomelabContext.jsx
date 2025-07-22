import React, { createContext, useContext, useState, useEffect } from 'react';
import { homelabStorageManager } from '../utils/homelabStorage';
import { homelabApiService } from '../utils/homelabApi';

const HomelabContext = createContext();

export const HomelabProvider = ({ children }) => {
  // Core system state
  const [systemOverview, setSystemOverview] = useState({
    cpu: { percentage: 0, temperature: 0, cores: 0 },
    memory: { used: 0, total: 0, percentage: 0 },
    network: { download: 0, upload: 0, latency: 0 },
    power: { consumption: 0, efficiency: 0 },
    uptime: 0
  });

  // Services state
  const [services, setServices] = useState([]);
  const [serviceMetrics, setServiceMetrics] = useState({});
  
  // Network state
  const [networkDevices, setNetworkDevices] = useState([]);
  const [networkTraffic, setNetworkTraffic] = useState({});
  
  // Storage state
  const [storageStatus, setStorageStatus] = useState([]);
  
  // Security state
  const [securityAlerts, setSecurityAlerts] = useState([]);
  const [firewallStatus, setFirewallStatus] = useState({});
  
  // Automation state
  const [automationRules, setAutomationRules] = useState([]);
  const [smartDevices, setSmartDevices] = useState([]);
  
  // Media services state
  const [mediaServices, setMediaServices] = useState([]);
  
  // Loading and error states
  const [isLoading, setIsLoading] = useState(true);
  const [errors, setErrors] = useState({});
  const [connectionStatus, setConnectionStatus] = useState('disconnected');

  // Real-time data polling
  useEffect(() => {
    const initializeHomelab = async () => {
      try {
        setIsLoading(true);
        
        // Load persisted data
        const persistedData = await homelabStorageManager.loadAll();
        if (persistedData.services) setServices(persistedData.services);
        if (persistedData.networkDevices) setNetworkDevices(persistedData.networkDevices);
        if (persistedData.automationRules) setAutomationRules(persistedData.automationRules);
        
        // Initialize API connection
        await homelabApiService.initialize();
        setConnectionStatus('connected');
        
        // Start polling for real-time data
        startDataPolling();
        
      } catch (error) {
        console.error('Error initializing homelab:', error);
        setErrors(prev => ({ ...prev, initialization: error.message }));
        setConnectionStatus('error');
        
        // Load mock data as fallback
        loadMockData();
      } finally {
        setIsLoading(false);
      }
    };

    initializeHomelab();
    
    // Cleanup polling on unmount
    return () => {
      stopDataPolling();
    };
  }, []);

  const startDataPolling = () => {
    // Poll system metrics every 5 seconds
    const systemInterval = setInterval(async () => {
      try {
        const metrics = await homelabApiService.getSystemMetrics();
        setSystemOverview(metrics);
      } catch (error) {
        console.error('Error fetching system metrics:', error);
      }
    }, 5000);

    // Poll service status every 30 seconds
    const serviceInterval = setInterval(async () => {
      try {
        const serviceData = await homelabApiService.getServiceStatus();
        setServices(serviceData.services);
        setServiceMetrics(serviceData.metrics);
      } catch (error) {
        console.error('Error fetching service status:', error);
      }
    }, 30000);

    // Store intervals for cleanup
    window.homelabIntervals = { systemInterval, serviceInterval };
  };

  const stopDataPolling = () => {
    if (window.homelabIntervals) {
      Object.values(window.homelabIntervals).forEach(clearInterval);
      delete window.homelabIntervals;
    }
  };

  // Mock data loader for development/fallback
  const loadMockData = () => {
    setSystemOverview({
      cpu: { percentage: 45, temperature: 62, cores: 8 },
      memory: { used: 8.2, total: 16, percentage: 51 },
      network: { download: 45.2, upload: 12.8, latency: 18 },
      power: { consumption: 180, efficiency: 92 },
      uptime: 1382400 // 16 days in seconds
    });

    setServices([
      { id: 'docker', name: 'Docker', status: 'running', port: 2376, category: 'infrastructure' },
      { id: 'pihole', name: 'Pi-hole', status: 'running', port: 80, category: 'network' },
      { id: 'plex', name: 'Plex Media Server', status: 'running', port: 32400, category: 'media' },
      { id: 'homeassistant', name: 'Home Assistant', status: 'running', port: 8123, category: 'automation' },
      { id: 'nginx', name: 'Nginx Proxy', status: 'running', port: 443, category: 'infrastructure' },
      { id: 'portainer', name: 'Portainer', status: 'running', port: 9000, category: 'management' }
    ]);

    setNetworkDevices([
      { id: 'router', name: 'Main Router', ip: '192.168.1.1', status: 'online', ping: 1 },
      { id: 'switch', name: 'Network Switch', ip: '192.168.1.2', status: 'online', ping: 2 },
      { id: 'nas', name: 'NAS Server', ip: '192.168.1.100', status: 'online', ping: 3 },
      { id: 'server', name: 'Main Server', ip: '192.168.1.101', status: 'online', ping: 2 }
    ]);

    setConnectionStatus('mock');
  };

  // Service management functions
  const restartService = async (serviceId) => {
    try {
      setServices(prev => prev.map(service => 
        service.id === serviceId 
          ? { ...service, status: 'restarting' }
          : service
      ));

      await homelabApiService.restartService(serviceId);
      
      // Refresh service status after restart
      setTimeout(async () => {
        const serviceData = await homelabApiService.getServiceStatus();
        setServices(serviceData.services);
      }, 3000);

      return { success: true };
    } catch (error) {
      console.error(`Error restarting service ${serviceId}:`, error);
      setErrors(prev => ({ ...prev, [serviceId]: error.message }));
      return { success: false, error: error.message };
    }
  };

  const stopService = async (serviceId) => {
    try {
      await homelabApiService.stopService(serviceId);
      setServices(prev => prev.map(service => 
        service.id === serviceId 
          ? { ...service, status: 'stopped' }
          : service
      ));
      return { success: true };
    } catch (error) {
      console.error(`Error stopping service ${serviceId}:`, error);
      return { success: false, error: error.message };
    }
  };

  const startService = async (serviceId) => {
    try {
      await homelabApiService.startService(serviceId);
      setServices(prev => prev.map(service => 
        service.id === serviceId 
          ? { ...service, status: 'running' }
          : service
      ));
      return { success: true };
    } catch (error) {
      console.error(`Error starting service ${serviceId}:`, error);
      return { success: false, error: error.message };
    }
  };

  // Network management functions
  const scanNetwork = async () => {
    try {
      const devices = await homelabApiService.scanNetwork();
      setNetworkDevices(devices);
      return { success: true, devices };
    } catch (error) {
      console.error('Error scanning network:', error);
      return { success: false, error: error.message };
    }
  };

  // Automation functions
  const addAutomationRule = async (rule) => {
    try {
      const newRule = await homelabApiService.createAutomationRule(rule);
      setAutomationRules(prev => [...prev, newRule]);
      await homelabStorageManager.save('automationRules', [...automationRules, newRule]);
      return { success: true, rule: newRule };
    } catch (error) {
      console.error('Error adding automation rule:', error);
      return { success: false, error: error.message };
    }
  };

  const toggleAutomationRule = async (ruleId, enabled) => {
    try {
      await homelabApiService.toggleAutomationRule(ruleId, enabled);
      setAutomationRules(prev => prev.map(rule => 
        rule.id === ruleId ? { ...rule, enabled } : rule
      ));
      return { success: true };
    } catch (error) {
      console.error('Error toggling automation rule:', error);
      return { success: false, error: error.message };
    }
  };

  // Utility functions
  const clearError = (key) => {
    setErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors[key];
      return newErrors;
    });
  };

  const refreshAllData = async () => {
    setIsLoading(true);
    try {
      const [systemData, serviceData, networkData] = await Promise.all([
        homelabApiService.getSystemMetrics(),
        homelabApiService.getServiceStatus(),
        homelabApiService.getNetworkDevices()
      ]);

      setSystemOverview(systemData);
      setServices(serviceData.services);
      setServiceMetrics(serviceData.metrics);
      setNetworkDevices(networkData);
      
      setConnectionStatus('connected');
      setErrors({});
    } catch (error) {
      console.error('Error refreshing data:', error);
      setConnectionStatus('error');
    } finally {
      setIsLoading(false);
    }
  };

  const contextValue = {
    // State
    systemOverview,
    services,
    serviceMetrics,
    networkDevices,
    networkTraffic,
    storageStatus,
    securityAlerts,
    firewallStatus,
    automationRules,
    smartDevices,
    mediaServices,
    isLoading,
    errors,
    connectionStatus,

    // Actions
    restartService,
    stopService,
    startService,
    scanNetwork,
    addAutomationRule,
    toggleAutomationRule,
    clearError,
    refreshAllData,

    // Utils
    setSystemOverview,
    setServices,
    setNetworkDevices,
    setAutomationRules
  };

  return (
    <HomelabContext.Provider value={contextValue}>
      {children}
    </HomelabContext.Provider>
  );
};

export const useHomelab = () => {
  const context = useContext(HomelabContext);
  if (!context) {
    throw new Error('useHomelab must be used within a HomelabProvider');
  }
  return context;
};

export default HomelabContext;
