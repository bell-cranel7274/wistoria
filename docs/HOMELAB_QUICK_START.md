# Homelab Foundation - Quick Start Guide

## Overview

The homelab foundation has been successfully established with a comprehensive, modular architecture. Here's how to use it:

## 🎯 What's Been Created

### 1. Core Foundation Files
- ✅ `src/context/HomelabContext.jsx` - Central state management
- ✅ `src/utils/homelabStorage.js` - Data persistence and caching
- ✅ `src/utils/homelabApi.js` - API service with mock fallback
- ✅ `src/utils/homelabConstants.js` - Constants and utility functions
- ✅ `src/hooks/useHomelabManager.js` - Custom hooks for all homelab functionality
- ✅ `src/components/homelab/shared/HomelabComponents.jsx` - Reusable UI components
- ✅ `src/components/homelab/EnhancedNetworkMonitor.jsx` - Example enhanced component
- ✅ `HOMELAB_FOUNDATION.md` - Comprehensive documentation

### 2. Integration Complete
- ✅ HomelabProvider added to App.jsx
- ✅ Ready for immediate use in all homelab components

## 🚀 Quick Usage Examples

### Using Services Hook
```jsx
import { useHomelabServices } from '../../hooks/useHomelabManager';
import { ServiceCard } from './shared/HomelabComponents';

export const MyServiceComponent = () => {
  const {
    services,
    serviceMetrics,
    performServiceAction,
    actionLoading,
    isLoading
  } = useHomelabServices();

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

### Using Network Hook
```jsx
import { useHomelabNetwork } from '../../hooks/useHomelabManager';
import { DeviceList, MetricCard } from './shared/HomelabComponents';

export const MyNetworkComponent = () => {
  const {
    networkDevices,
    getOnlineDevicesCount,
    performNetworkScan,
    scanning
  } = useHomelabNetwork();

  return (
    <div>
      <MetricCard
        title="Online Devices"
        value={getOnlineDevicesCount()}
        icon={Wifi}
      />
      <DeviceList devices={networkDevices} />
      <button 
        onClick={performNetworkScan}
        disabled={scanning}
      >
        {scanning ? 'Scanning...' : 'Scan Network'}
      </button>
    </div>
  );
};
```

### Using System Monitoring
```jsx
import { useHomelabSystem } from '../../hooks/useHomelabManager';
import { MetricCard } from './shared/HomelabComponents';

export const SystemOverview = () => {
  const { systemOverview, getSystemHealth, alerts } = useHomelabSystem();

  return (
    <div className="grid grid-cols-4 gap-4">
      <MetricCard
        title="CPU Usage"
        value={systemOverview.cpu.percentage}
        unit="%"
        status={systemOverview.cpu.percentage > 80 ? 'warning' : 'normal'}
      />
      <MetricCard
        title="Memory"
        value={systemOverview.memory.used}
        unit="GB"
        status={systemOverview.memory.percentage > 85 ? 'critical' : 'normal'}
      />
    </div>
  );
};
```

## 🔧 Key Features Available

### 1. **Real-time Data**
- Automatic polling with configurable intervals
- Connection status monitoring
- Live system metrics

### 2. **Service Management**
- Start/stop/restart services
- Monitor performance metrics
- Health status tracking

### 3. **Network Monitoring**
- Device discovery and scanning
- Status tracking
- Traffic analysis

### 4. **Smart Error Handling**
- Automatic fallback to mock data
- Retry logic with exponential backoff
- Clear user feedback

### 5. **Persistent Storage**
- Automatic data caching
- Export/import functionality
- Cross-session persistence

### 6. **Modern UI Components**
- Consistent theming
- Status badges and indicators
- Loading and error states
- Responsive design

## 📁 Next Steps

1. **Migrate Existing Components**: Update current homelab components to use the new foundation
2. **Add Real API Integration**: Configure actual homelab API endpoints
3. **Customize Styling**: Adjust themes and colors as needed
4. **Extend Functionality**: Add new features using established patterns

## 🎨 Enhanced Example

The `EnhancedNetworkMonitor.jsx` shows a complete implementation featuring:

- Modern hook-based architecture
- Real-time data updates
- Search and filtering
- Error handling
- Loading states
- Status management
- Responsive design
- Consistent UI patterns

## 🛠️ Development Notes

- **Mock Mode**: The system automatically falls back to mock data when API is unavailable
- **Performance**: Intelligent polling stops during inactivity
- **Extensibility**: Easy to add new services, devices, or metrics
- **Maintainability**: Clear separation of concerns and standardized patterns

The foundation is now ready for production use and can easily be extended or separated into a standalone package for other projects!
