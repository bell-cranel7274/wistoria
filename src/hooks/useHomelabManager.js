import { useState, useEffect, useCallback, useRef } from 'react';
import { useHomelab } from '../context/HomelabContext';
import { 
  SERVICE_STATUS, 
  DEVICE_STATUS, 
  POLLING_INTERVALS,
  ERROR_MESSAGES,
  SUCCESS_MESSAGES,
  getStatusColor,
  getCategoryConfig,
  isMetricAboveThreshold
} from '../utils/homelabConstants';

// Custom hook for homelab service management
export const useHomelabServices = () => {
  const { 
    services, 
    serviceMetrics, 
    restartService, 
    stopService, 
    startService,
    isLoading,
    errors 
  } = useHomelab();

  const [actionLoading, setActionLoading] = useState({});

  const performServiceAction = useCallback(async (serviceId, action) => {
    setActionLoading(prev => ({ ...prev, [serviceId]: action }));
    
    try {
      let result;
      switch (action) {
        case 'restart':
          result = await restartService(serviceId);
          break;
        case 'stop':
          result = await stopService(serviceId);
          break;
        case 'start':
          result = await startService(serviceId);
          break;
        default:
          throw new Error(`Unknown action: ${action}`);
      }
      
      return result;
    } catch (error) {
      console.error(`Service ${action} failed:`, error);
      throw error;
    } finally {
      setActionLoading(prev => {
        const newState = { ...prev };
        delete newState[serviceId];
        return newState;
      });
    }
  }, [restartService, stopService, startService]);

  const getServicesByCategory = useCallback((category) => {
    return services.filter(service => service.category === category);
  }, [services]);

  const getRunningServicesCount = useCallback(() => {
    return services.filter(service => service.status === SERVICE_STATUS.RUNNING).length;
  }, [services]);

  const getServiceHealth = useCallback((serviceId) => {
    const service = services.find(s => s.id === serviceId);
    const metrics = serviceMetrics[serviceId];
    
    if (!service || !metrics) return null;

    return {
      status: service.status,
      health: service.status === SERVICE_STATUS.RUNNING ? 'healthy' : 'unhealthy',
      metrics,
      issues: []
    };
  }, [services, serviceMetrics]);

  return {
    services,
    serviceMetrics,
    actionLoading,
    isLoading,
    errors,
    performServiceAction,
    getServicesByCategory,
    getRunningServicesCount,
    getServiceHealth
  };
};

// Custom hook for network monitoring
export const useHomelabNetwork = () => {
  const { 
    networkDevices, 
    networkTraffic,
    scanNetwork,
    isLoading,
    errors 
  } = useHomelab();

  const [scanning, setScanning] = useState(false);
  const [lastScan, setLastScan] = useState(null);

  const performNetworkScan = useCallback(async () => {
    setScanning(true);
    try {
      const result = await scanNetwork();
      setLastScan(new Date());
      return result;
    } catch (error) {
      console.error('Network scan failed:', error);
      throw error;
    } finally {
      setScanning(false);
    }
  }, [scanNetwork]);

  const getOnlineDevicesCount = useCallback(() => {
    return networkDevices.filter(device => device.status === DEVICE_STATUS.ONLINE).length;
  }, [networkDevices]);

  const getDevicesByStatus = useCallback((status) => {
    return networkDevices.filter(device => device.status === status);
  }, [networkDevices]);

  const getAveragePing = useCallback(() => {
    const onlineDevices = getDevicesByStatus(DEVICE_STATUS.ONLINE);
    if (onlineDevices.length === 0) return 0;
    
    const totalPing = onlineDevices.reduce((sum, device) => sum + (device.ping || 0), 0);
    return Math.round(totalPing / onlineDevices.length);
  }, [getDevicesByStatus]);

  return {
    networkDevices,
    networkTraffic,
    scanning,
    lastScan,
    isLoading,
    errors,
    performNetworkScan,
    getOnlineDevicesCount,
    getDevicesByStatus,
    getAveragePing
  };
};

// Custom hook for system monitoring
export const useHomelabSystem = () => {
  const { systemOverview, isLoading, errors } = useHomelab();
  const [alerts, setAlerts] = useState([]);

  // Monitor system thresholds and generate alerts
  useEffect(() => {
    const newAlerts = [];

    if (systemOverview.cpu) {
      if (isMetricAboveThreshold('CPU', systemOverview.cpu.percentage, 'CRITICAL')) {
        newAlerts.push({
          id: 'cpu-critical',
          type: 'system',
          severity: 'critical',
          message: `CPU usage critically high: ${systemOverview.cpu.percentage}%`,
          timestamp: Date.now()
        });
      } else if (isMetricAboveThreshold('CPU', systemOverview.cpu.percentage, 'WARNING')) {
        newAlerts.push({
          id: 'cpu-warning',
          type: 'system',
          severity: 'medium',
          message: `CPU usage high: ${systemOverview.cpu.percentage}%`,
          timestamp: Date.now()
        });
      }

      if (isMetricAboveThreshold('TEMPERATURE', systemOverview.cpu.temperature, 'CRITICAL')) {
        newAlerts.push({
          id: 'temp-critical',
          type: 'system',
          severity: 'critical',
          message: `CPU temperature critically high: ${systemOverview.cpu.temperature}°C`,
          timestamp: Date.now()
        });
      }
    }

    if (systemOverview.memory) {
      if (isMetricAboveThreshold('MEMORY', systemOverview.memory.percentage, 'CRITICAL')) {
        newAlerts.push({
          id: 'memory-critical',
          type: 'system',
          severity: 'critical',
          message: `Memory usage critically high: ${systemOverview.memory.percentage}%`,
          timestamp: Date.now()
        });
      }
    }

    setAlerts(newAlerts);
  }, [systemOverview]);

  const getSystemHealth = useCallback(() => {
    const issues = alerts.filter(alert => alert.severity === 'critical').length;
    const warnings = alerts.filter(alert => alert.severity === 'medium').length;

    if (issues > 0) return 'critical';
    if (warnings > 0) return 'warning';
    return 'healthy';
  }, [alerts]);

  const formatSystemMetric = useCallback((metric, value) => {
    switch (metric) {
      case 'cpu':
        return `${value}%`;
      case 'memory':
        return `${value.toFixed(1)} GB`;
      case 'temperature':
        return `${value}°C`;
      case 'network':
        return `${value.toFixed(1)} Mbps`;
      case 'power':
        return `${value}W`;
      default:
        return value;
    }
  }, []);

  return {
    systemOverview,
    alerts,
    isLoading,
    errors,
    getSystemHealth,
    formatSystemMetric
  };
};

// Custom hook for automation management
export const useHomelabAutomation = () => {
  const { 
    automationRules, 
    smartDevices,
    addAutomationRule,
    toggleAutomationRule,
    isLoading,
    errors 
  } = useHomelab();

  const [ruleLoading, setRuleLoading] = useState({});

  const performRuleAction = useCallback(async (ruleId, action, data = null) => {
    setRuleLoading(prev => ({ ...prev, [ruleId]: action }));
    
    try {
      let result;
      switch (action) {
        case 'toggle':
          result = await toggleAutomationRule(ruleId, data.enabled);
          break;
        case 'create':
          result = await addAutomationRule(data);
          break;
        default:
          throw new Error(`Unknown automation action: ${action}`);
      }
      
      return result;
    } catch (error) {
      console.error(`Automation ${action} failed:`, error);
      throw error;
    } finally {
      setRuleLoading(prev => {
        const newState = { ...prev };
        delete newState[ruleId];
        return newState;
      });
    }
  }, [addAutomationRule, toggleAutomationRule]);

  const getActiveRulesCount = useCallback(() => {
    return automationRules.filter(rule => rule.enabled).length;
  }, [automationRules]);

  const getRulesByType = useCallback((triggerType) => {
    return automationRules.filter(rule => rule.trigger.type === triggerType);
  }, [automationRules]);

  const getConnectedDevicesCount = useCallback(() => {
    return smartDevices.filter(device => device.status === DEVICE_STATUS.ONLINE).length;
  }, [smartDevices]);

  return {
    automationRules,
    smartDevices,
    ruleLoading,
    isLoading,
    errors,
    performRuleAction,
    getActiveRulesCount,
    getRulesByType,
    getConnectedDevicesCount
  };
};

// Custom hook for data polling and real-time updates
export const useHomelabPolling = (enablePolling = true) => {
  const { refreshAllData, connectionStatus } = useHomelab();
  const intervalRef = useRef(null);

  const startPolling = useCallback(() => {
    if (intervalRef.current) return;

    intervalRef.current = setInterval(() => {
      if (connectionStatus === 'connected') {
        refreshAllData().catch(error => {
          console.error('Polling error:', error);
        });
      }
    }, POLLING_INTERVALS.SYSTEM_METRICS);
  }, [refreshAllData, connectionStatus]);

  const stopPolling = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  useEffect(() => {
    if (enablePolling && connectionStatus === 'connected') {
      startPolling();
    } else {
      stopPolling();
    }

    return stopPolling;
  }, [enablePolling, connectionStatus, startPolling, stopPolling]);

  return {
    startPolling,
    stopPolling,
    isPolling: !!intervalRef.current
  };
};

// Main homelab hook that combines all functionality
export const useHomelabManager = (options = {}) => {
  const { enablePolling = true, enableAlerts = true } = options;
  
  const homelab = useHomelab();
  const services = useHomelabServices();
  const network = useHomelabNetwork();
  const system = useHomelabSystem();
  const automation = useHomelabAutomation();
  const polling = useHomelabPolling(enablePolling);

  // Combined statistics
  const getOverallStats = useCallback(() => {
    return {
      services: {
        total: services.services.length,
        running: services.getRunningServicesCount(),
        stopped: services.services.filter(s => s.status === SERVICE_STATUS.STOPPED).length
      },
      network: {
        total: network.networkDevices.length,
        online: network.getOnlineDevicesCount(),
        averagePing: network.getAveragePing()
      },
      automation: {
        totalRules: automation.automationRules.length,
        activeRules: automation.getActiveRulesCount(),
        connectedDevices: automation.getConnectedDevicesCount()
      },
      system: {
        health: system.getSystemHealth(),
        alerts: system.alerts.length,
        uptime: homelab.systemOverview.uptime
      }
    };
  }, [services, network, automation, system, homelab.systemOverview.uptime]);

  return {
    // Core homelab context
    ...homelab,
    
    // Specialized hooks
    services,
    network,
    system,
    automation,
    polling,
    
    // Combined utilities
    getOverallStats
  };
};

export default useHomelabManager;
