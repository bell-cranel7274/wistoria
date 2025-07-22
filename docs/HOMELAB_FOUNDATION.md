# Homelab System Foundation

This document outlines the comprehensive foundation established for the homelab components in the task manager application. The foundation provides a modular, scalable, and maintainable architecture for homelab management functionality.

## Architecture Overview

The homelab system is built on a layered architecture:

1. **Context Layer** - Central state management
2. **Service Layer** - API integration and data management
3. **Hook Layer** - Reusable business logic
4. **Component Layer** - UI components and shared utilities
5. **Utility Layer** - Constants, helpers, and storage

## Core Components

### 1. HomelabContext (`src/context/HomelabContext.jsx`)

Central state management for all homelab functionality:

- **System Metrics**: CPU, memory, network, power consumption
- **Service Management**: Docker containers, system services
- **Network Monitoring**: Device discovery, status tracking
- **Security**: Alerts, firewall status
- **Automation**: Rules, smart device control
- **Real-time Updates**: Polling, live data feeds

**Key Features:**
- Real-time data polling with configurable intervals
- Error handling and fallback to mock data
- Connection status monitoring
- Automatic retry logic for failed API calls
- Memory and localStorage caching

### 2. Storage Management (`src/utils/homelabStorage.js`)

Robust data persistence with backup and recovery:

```javascript
import { homelabStorageManager } from '../utils/homelabStorage';

// Save data with automatic backup
await homelabStorageManager.save('services', servicesData);

// Load with fallback to cache
const data = await homelabStorageManager.load('services');

// Export/import functionality
const exportData = await homelabStorageManager.exportData();
await homelabStorageManager.importData(jsonString);
```

**Features:**
- Automatic backup and recovery
- Data validation and migration
- Memory caching with TTL
- Export/import functionality
- Cross-session persistence

### 3. API Service (`src/utils/homelabApi.js`)

Comprehensive API integration with mock mode fallback:

```javascript
import { homelabApiService } from '../utils/homelabApi';

// Initialize connection
await homelabApiService.initialize();

// Service management
await homelabApiService.restartService('docker');
await homelabApiService.getServiceStatus();

// Network operations
await homelabApiService.scanNetwork();
const devices = await homelabApiService.getNetworkDevices();
```

**Features:**
- Automatic connection testing
- Mock mode for development
- Retry logic with exponential backoff
- Request timeout handling
- Error recovery and logging

### 4. Custom Hooks (`src/hooks/useHomelabManager.js`)

Specialized hooks for different homelab aspects:

#### `useHomelabServices()`
- Service status monitoring
- Start/stop/restart operations
- Performance metrics
- Health checks

#### `useHomelabNetwork()`
- Device discovery and monitoring
- Network scanning
- Traffic analysis
- Connectivity status

#### `useHomelabSystem()`
- System metrics monitoring
- Threshold alerts
- Health status calculation
- Performance trends

#### `useHomelabAutomation()`
- Automation rule management
- Smart device control
- Trigger/action configuration
- Rule execution monitoring

#### `useHomelabPolling()`
- Real-time data updates
- Configurable polling intervals
- Connection-aware polling
- Performance optimization

### 5. Shared Components (`src/components/homelab/shared/HomelabComponents.jsx`)

Reusable UI components with consistent theming:

#### `StatusBadge`
```jsx
<StatusBadge status="running" type="service" size="md" />
```

#### `ServiceCard`
```jsx
<ServiceCard 
  service={serviceData} 
  metrics={metricsData}
  onAction={handleServiceAction}
  actionLoading={loadingState}
/>
```

#### `MetricCard`
```jsx
<MetricCard 
  title="CPU Usage"
  value={45}
  unit="%"
  status="warning"
  icon={Activity}
/>
```

#### `DeviceList`
```jsx
<DeviceList 
  devices={networkDevices}
  onDeviceClick={handleDeviceClick}
  showActions={true}
/>
```

### 6. Constants and Utilities (`src/utils/homelabConstants.js`)

Centralized configuration and helper functions:

```javascript
import { 
  SERVICE_STATUS, 
  DEVICE_STATUS,
  getStatusColor,
  formatUptime,
  formatBytes 
} from '../utils/homelabConstants';

// Status checking
const isHealthy = status === SERVICE_STATUS.RUNNING;

// Formatting utilities
const uptimeStr = formatUptime(seconds);
const sizeStr = formatBytes(bytes);
```

## Integration Patterns

### 1. Component Integration

Standard pattern for homelab components:

```jsx
import React from 'react';
import { useHomelabServices } from '../../hooks/useHomelabManager';
import { ServiceCard, LoadingSpinner, ErrorMessage } from './shared/HomelabComponents';

export const MyHomelabComponent = () => {
  const {
    services,
    serviceMetrics,
    performServiceAction,
    actionLoading,
    isLoading,
    errors
  } = useHomelabServices();

  if (isLoading) return <LoadingSpinner text="Loading services..." />;
  if (errors.services) return <ErrorMessage error={errors.services} />;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {services.map(service => (
        <ServiceCard
          key={service.id}
          service={service}
          metrics={serviceMetrics[service.id]}
          onAction={performServiceAction}
          actionLoading={actionLoading}
        />
      ))}
    </div>
  );
};
```

### 2. Context Provider Setup

Add to your app's root:

```jsx
import { HomelabProvider } from './context/HomelabContext';

function App() {
  return (
    <HomelabProvider>
      {/* Your app components */}
    </HomelabProvider>
  );
}
```

### 3. Real-time Updates

Enable automatic polling:

```jsx
import { useHomelabPolling } from '../hooks/useHomelabManager';

export const MyComponent = () => {
  const { startPolling, stopPolling, isPolling } = useHomelabPolling(true);
  
  // Polling starts automatically when component mounts
  // and stops when component unmounts
};
```

## Configuration

### Environment Variables

```env
REACT_APP_HOMELAB_API_URL=http://localhost:3001/api
REACT_APP_HOMELAB_API_KEY=your-api-key
```

### Polling Intervals

Customize in `homelabConstants.js`:

```javascript
export const POLLING_INTERVALS = {
  SYSTEM_METRICS: 5000,    // 5 seconds
  SERVICE_STATUS: 30000,   // 30 seconds
  NETWORK_DEVICES: 60000,  // 1 minute
  STORAGE_STATUS: 120000,  // 2 minutes
  SECURITY_ALERTS: 10000   // 10 seconds
};
```

### Status Thresholds

Configure system monitoring thresholds:

```javascript
export const SYSTEM_THRESHOLDS = {
  CPU: { WARNING: 70, CRITICAL: 85 },
  MEMORY: { WARNING: 80, CRITICAL: 90 },
  TEMPERATURE: { WARNING: 70, CRITICAL: 80 }
};
```

## Error Handling

The system includes comprehensive error handling:

1. **API Failures**: Automatic fallback to mock data
2. **Storage Errors**: Graceful degradation with cache
3. **Network Issues**: Retry logic with exponential backoff
4. **User Feedback**: Clear error messages with retry options

## Performance Optimization

1. **Intelligent Polling**: Stops during inactivity
2. **Data Caching**: Memory and localStorage caching
3. **Lazy Loading**: Components load data as needed
4. **Batch Operations**: Multiple API calls combined
5. **State Optimization**: Minimal re-renders

## Future Integration

The foundation is designed for easy separation into a standalone package:

1. **Modular Structure**: Clear separation of concerns
2. **Standardized APIs**: Consistent interfaces
3. **Configuration-driven**: Easy customization
4. **Documentation**: Comprehensive guides
5. **Testing Ready**: Mockable services and hooks

## Migration Path

To upgrade existing components:

1. Replace hardcoded data with hooks
2. Use shared components for consistency
3. Implement error handling patterns
4. Add real-time data support
5. Follow established patterns

## Example: Enhanced Component

See `EnhancedNetworkMonitor.jsx` for a complete example showing:

- Hook integration
- Shared component usage
- Real-time updates
- Error handling
- Modern UI patterns
- Search and filtering
- Status management

This foundation provides a solid base for building comprehensive homelab management functionality while maintaining code quality, performance, and user experience standards.
