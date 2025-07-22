// Homelab-specific constants and configurations

export const HOMELAB_CATEGORIES = {
  INFRASTRUCTURE: 'infrastructure',
  NETWORK: 'network',
  SECURITY: 'security',
  MEDIA: 'media',
  AUTOMATION: 'automation',
  STORAGE: 'storage',
  MONITORING: 'monitoring',
  MANAGEMENT: 'management'
};

export const SERVICE_STATUS = {
  RUNNING: 'running',
  STOPPED: 'stopped',
  RESTARTING: 'restarting',
  ERROR: 'error',
  UNKNOWN: 'unknown'
};

export const DEVICE_STATUS = {
  ONLINE: 'online',
  OFFLINE: 'offline',
  WARNING: 'warning',
  ERROR: 'error'
};

export const ALERT_SEVERITY = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
  CRITICAL: 'critical'
};

export const AUTOMATION_TRIGGER_TYPES = {
  TIME: 'time',
  DEVICE_STATE: 'device_state',
  SENSOR_VALUE: 'sensor_value',
  SERVICE_STATUS: 'service_status',
  SYSTEM_METRIC: 'system_metric'
};

export const AUTOMATION_ACTION_TYPES = {
  DEVICE_CONTROL: 'device_control',
  SERVICE_CONTROL: 'service_control',
  NOTIFICATION: 'notification',
  SCRIPT: 'script'
};

// Status color mappings for consistent theming
export const STATUS_COLORS = {
  [SERVICE_STATUS.RUNNING]: {
    text: 'text-green-500',
    bg: 'bg-green-100 dark:bg-green-900/20',
    border: 'border-green-200 dark:border-green-800',
    dot: 'bg-green-500'
  },
  [SERVICE_STATUS.STOPPED]: {
    text: 'text-red-500',
    bg: 'bg-red-100 dark:bg-red-900/20',
    border: 'border-red-200 dark:border-red-800',
    dot: 'bg-red-500'
  },
  [SERVICE_STATUS.RESTARTING]: {
    text: 'text-yellow-500',
    bg: 'bg-yellow-100 dark:bg-yellow-900/20',
    border: 'border-yellow-200 dark:border-yellow-800',
    dot: 'bg-yellow-500'
  },
  [SERVICE_STATUS.ERROR]: {
    text: 'text-red-600',
    bg: 'bg-red-100 dark:bg-red-900/30',
    border: 'border-red-300 dark:border-red-700',
    dot: 'bg-red-600'
  },
  [SERVICE_STATUS.UNKNOWN]: {
    text: 'text-gray-500',
    bg: 'bg-gray-100 dark:bg-gray-900/20',
    border: 'border-gray-200 dark:border-gray-800',
    dot: 'bg-gray-500'
  }
};

export const DEVICE_STATUS_COLORS = {
  [DEVICE_STATUS.ONLINE]: {
    text: 'text-green-500',
    bg: 'bg-green-50 dark:bg-green-900/10',
    icon: 'text-green-500'
  },
  [DEVICE_STATUS.OFFLINE]: {
    text: 'text-red-500',
    bg: 'bg-red-50 dark:bg-red-900/10',
    icon: 'text-red-500'
  },
  [DEVICE_STATUS.WARNING]: {
    text: 'text-yellow-500',
    bg: 'bg-yellow-50 dark:bg-yellow-900/10',
    icon: 'text-yellow-500'
  },
  [DEVICE_STATUS.ERROR]: {
    text: 'text-red-600',
    bg: 'bg-red-50 dark:bg-red-900/20',
    icon: 'text-red-600'
  }
};

export const ALERT_SEVERITY_COLORS = {
  [ALERT_SEVERITY.LOW]: {
    text: 'text-blue-600',
    bg: 'bg-blue-50 dark:bg-blue-900/10',
    border: 'border-blue-200 dark:border-blue-800'
  },
  [ALERT_SEVERITY.MEDIUM]: {
    text: 'text-yellow-600',
    bg: 'bg-yellow-50 dark:bg-yellow-900/10',
    border: 'border-yellow-200 dark:border-yellow-800'
  },
  [ALERT_SEVERITY.HIGH]: {
    text: 'text-orange-600',
    bg: 'bg-orange-50 dark:bg-orange-900/10',
    border: 'border-orange-200 dark:border-orange-800'
  },
  [ALERT_SEVERITY.CRITICAL]: {
    text: 'text-red-600',
    bg: 'bg-red-50 dark:bg-red-900/10',
    border: 'border-red-200 dark:border-red-800'
  }
};

// Category-specific configurations
export const CATEGORY_CONFIGS = {
  [HOMELAB_CATEGORIES.INFRASTRUCTURE]: {
    name: 'Infrastructure',
    icon: 'Server',
    color: 'blue',
    description: 'Core system services and infrastructure'
  },
  [HOMELAB_CATEGORIES.NETWORK]: {
    name: 'Network & Security',
    icon: 'Network',
    color: 'emerald',
    description: 'Network management and security services'
  },
  [HOMELAB_CATEGORIES.SECURITY]: {
    name: 'Security',
    icon: 'Shield',
    color: 'red',
    description: 'Security monitoring and protection services'
  },
  [HOMELAB_CATEGORIES.MEDIA]: {
    name: 'Media & Entertainment',
    icon: 'Play',
    color: 'purple',
    description: 'Media streaming and entertainment services'
  },
  [HOMELAB_CATEGORIES.AUTOMATION]: {
    name: 'Home Automation',
    icon: 'Zap',
    color: 'yellow',
    description: 'Smart home and automation services'
  },
  [HOMELAB_CATEGORIES.STORAGE]: {
    name: 'Storage & Backup',
    icon: 'HardDrive',
    color: 'indigo',
    description: 'File storage and backup services'
  },
  [HOMELAB_CATEGORIES.MONITORING]: {
    name: 'Monitoring',
    icon: 'Activity',
    color: 'green',
    description: 'System monitoring and analytics'
  },
  [HOMELAB_CATEGORIES.MANAGEMENT]: {
    name: 'Management',
    icon: 'Settings',
    color: 'gray',
    description: 'Management and administration tools'
  }
};

// Default service configurations
export const DEFAULT_SERVICES = [
  {
    id: 'docker',
    name: 'Docker',
    category: HOMELAB_CATEGORIES.INFRASTRUCTURE,
    port: 2376,
    status: SERVICE_STATUS.RUNNING,
    description: 'Container runtime platform',
    icon: 'Container'
  },
  {
    id: 'pihole',
    name: 'Pi-hole',
    category: HOMELAB_CATEGORIES.NETWORK,
    port: 80,
    status: SERVICE_STATUS.RUNNING,
    description: 'Network-wide ad blocking',
    icon: 'Shield'
  },
  {
    id: 'plex',
    name: 'Plex Media Server',
    category: HOMELAB_CATEGORIES.MEDIA,
    port: 32400,
    status: SERVICE_STATUS.RUNNING,
    description: 'Media streaming platform',
    icon: 'Play'
  },
  {
    id: 'homeassistant',
    name: 'Home Assistant',
    category: HOMELAB_CATEGORIES.AUTOMATION,
    port: 8123,
    status: SERVICE_STATUS.RUNNING,
    description: 'Home automation platform',
    icon: 'Home'
  },
  {
    id: 'nginx',
    name: 'Nginx Proxy',
    category: HOMELAB_CATEGORIES.INFRASTRUCTURE,
    port: 443,
    status: SERVICE_STATUS.RUNNING,
    description: 'Reverse proxy and load balancer',
    icon: 'Globe'
  },
  {
    id: 'portainer',
    name: 'Portainer',
    category: HOMELAB_CATEGORIES.MANAGEMENT,
    port: 9000,
    status: SERVICE_STATUS.RUNNING,
    description: 'Container management interface',
    icon: 'Settings'
  }
];

// System metric thresholds
export const SYSTEM_THRESHOLDS = {
  CPU: {
    WARNING: 70,
    CRITICAL: 85
  },
  MEMORY: {
    WARNING: 80,
    CRITICAL: 90
  },
  TEMPERATURE: {
    WARNING: 70,
    CRITICAL: 80
  },
  DISK: {
    WARNING: 80,
    CRITICAL: 90
  },
  NETWORK_LATENCY: {
    WARNING: 100,
    CRITICAL: 500
  }
};

// Polling intervals (in milliseconds)
export const POLLING_INTERVALS = {
  SYSTEM_METRICS: 5000,    // 5 seconds
  SERVICE_STATUS: 30000,   // 30 seconds
  NETWORK_DEVICES: 60000,  // 1 minute
  STORAGE_STATUS: 120000,  // 2 minutes
  SECURITY_ALERTS: 10000   // 10 seconds
};

// API endpoints
export const API_ENDPOINTS = {
  HEALTH: '/health',
  SYSTEM_METRICS: '/system/metrics',
  SERVICES: '/services',
  NETWORK_DEVICES: '/network/devices',
  NETWORK_SCAN: '/network/scan',
  STORAGE: '/storage',
  AUTOMATION_RULES: '/automation/rules',
  SECURITY_ALERTS: '/security/alerts',
  FIREWALL_STATUS: '/security/firewall'
};

// Error messages
export const ERROR_MESSAGES = {
  CONNECTION_FAILED: 'Failed to connect to homelab services',
  SERVICE_RESTART_FAILED: 'Failed to restart service',
  SERVICE_STOP_FAILED: 'Failed to stop service',
  SERVICE_START_FAILED: 'Failed to start service',
  NETWORK_SCAN_FAILED: 'Failed to scan network devices',
  DATA_LOAD_FAILED: 'Failed to load homelab data',
  DATA_SAVE_FAILED: 'Failed to save homelab data',
  AUTOMATION_RULE_FAILED: 'Failed to manage automation rule',
  INVALID_SERVICE_ID: 'Invalid service identifier',
  UNAUTHORIZED: 'Unauthorized access to homelab services',
  TIMEOUT: 'Request timeout - homelab services may be unavailable'
};

// Success messages
export const SUCCESS_MESSAGES = {
  SERVICE_RESTARTED: 'Service restarted successfully',
  SERVICE_STOPPED: 'Service stopped successfully',
  SERVICE_STARTED: 'Service started successfully',
  NETWORK_SCANNED: 'Network scan completed successfully',
  DATA_SAVED: 'Homelab data saved successfully',
  AUTOMATION_RULE_CREATED: 'Automation rule created successfully',
  AUTOMATION_RULE_UPDATED: 'Automation rule updated successfully',
  CONNECTION_ESTABLISHED: 'Connection to homelab services established'
};

// Utility functions for working with constants
export const getStatusColor = (status, type = 'service') => {
  const colorMap = type === 'device' ? DEVICE_STATUS_COLORS : STATUS_COLORS;
  return colorMap[status] || colorMap[SERVICE_STATUS.UNKNOWN];
};

export const getCategoryConfig = (category) => {
  return CATEGORY_CONFIGS[category] || CATEGORY_CONFIGS[HOMELAB_CATEGORIES.MANAGEMENT];
};

export const getAlertSeverityColor = (severity) => {
  return ALERT_SEVERITY_COLORS[severity] || ALERT_SEVERITY_COLORS[ALERT_SEVERITY.LOW];
};

export const isMetricAboveThreshold = (metric, value, level = 'WARNING') => {
  const threshold = SYSTEM_THRESHOLDS[metric];
  return threshold && value >= threshold[level];
};

export const formatUptime = (seconds) => {
  const days = Math.floor(seconds / 86400);
  const hours = Math.floor((seconds % 86400) / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  
  if (days > 0) {
    return `${days}d ${hours}h ${minutes}m`;
  } else if (hours > 0) {
    return `${hours}h ${minutes}m`;
  } else {
    return `${minutes}m`;
  }
};

export const formatBytes = (bytes, decimals = 2) => {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
};

export const formatPercentage = (value, total) => {
  if (total === 0) return '0%';
  return Math.round((value / total) * 100) + '%';
};

export default {
  HOMELAB_CATEGORIES,
  SERVICE_STATUS,
  DEVICE_STATUS,
  ALERT_SEVERITY,
  STATUS_COLORS,
  DEVICE_STATUS_COLORS,
  ALERT_SEVERITY_COLORS,
  CATEGORY_CONFIGS,
  DEFAULT_SERVICES,
  SYSTEM_THRESHOLDS,
  POLLING_INTERVALS,
  API_ENDPOINTS,
  ERROR_MESSAGES,
  SUCCESS_MESSAGES,
  getStatusColor,
  getCategoryConfig,
  getAlertSeverityColor,
  isMetricAboveThreshold,
  formatUptime,
  formatBytes,
  formatPercentage
};
