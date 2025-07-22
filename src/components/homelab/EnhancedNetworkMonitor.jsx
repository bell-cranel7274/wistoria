import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, 
  Wifi, 
  Server, 
  Activity, 
  RefreshCw,
  Search,
  Filter,
  Download,
  Upload,
  Zap
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Card } from '../ui/card';
import { useHomelabNetwork } from '../../hooks/useHomelabManager';
import { 
  StatusBadge, 
  MetricCard, 
  DeviceList, 
  LoadingSpinner, 
  ErrorMessage,
  ConnectionStatus 
} from './shared/HomelabComponents';
import { DEVICE_STATUS } from '../../utils/homelabConstants';

export const EnhancedNetworkMonitor = () => {
  const navigate = useNavigate();
  const {
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
  } = useHomelabNetwork();

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortBy, setSortBy] = useState('name');

  // Filter and sort devices
  const filteredDevices = networkDevices
    .filter(device => {
      const matchesSearch = device.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           device.ip.includes(searchQuery);
      const matchesStatus = statusFilter === 'all' || device.status === statusFilter;
      return matchesSearch && matchesStatus;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'ip':
          return a.ip.localeCompare(b.ip);
        case 'status':
          return a.status.localeCompare(b.status);
        case 'ping':
          return (a.ping || 0) - (b.ping || 0);
        default:
          return 0;
      }
    });

  const handleScanNetwork = async () => {
    try {
      await performNetworkScan();
    } catch (error) {
      console.error('Network scan failed:', error);
    }
  };

  const handleDeviceClick = (device) => {
    // Handle device detail view or actions
    console.log('Device clicked:', device);
  };

  // Calculate network statistics
  const stats = {
    totalDevices: networkDevices.length,
    onlineDevices: getOnlineDevicesCount(),
    averagePing: getAveragePing(),
    offlineDevices: getDevicesByStatus(DEVICE_STATUS.OFFLINE).length,
    warningDevices: getDevicesByStatus(DEVICE_STATUS.WARNING).length
  };

  if (isLoading && networkDevices.length === 0) {
    return (
      <div className="min-h-screen bg-background p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-center h-64">
            <LoadingSpinner size="lg" text="Loading network data..." />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/homelab')}
              className="p-2 hover:bg-accent/10 rounded-full transition-colors"
              title="Back to Homelab Dashboard"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-2xl font-bold flex items-center gap-2">
                <Wifi className="w-6 h-6 text-blue-500" />
                Network Monitor
              </h1>
              {lastScan && (
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Last scan: {lastScan.toLocaleTimeString()}
                </p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-3">
            <ConnectionStatus status="connected" />
            <button
              onClick={handleScanNetwork}
              disabled={scanning}
              className="
                flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg
                hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed
                transition-colors duration-200
              "
            >
              <RefreshCw className={`w-4 h-4 ${scanning ? 'animate-spin' : ''}`} />
              {scanning ? 'Scanning...' : 'Scan Network'}
            </button>
          </div>
        </div>

        {/* Error Display */}
        {errors.network && (
          <ErrorMessage 
            error={errors.network} 
            onRetry={handleScanNetwork}
            className="mb-6" 
          />
        )}

        {/* Network Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <MetricCard
            title="Total Devices"
            value={stats.totalDevices}
            icon={Server}
            status="normal"
          />
          
          <MetricCard
            title="Online Devices"
            value={stats.onlineDevices}
            icon={Wifi}
            status={stats.onlineDevices === stats.totalDevices ? 'good' : 'normal'}
          />
          
          <MetricCard
            title="Average Ping"
            value={stats.averagePing}
            unit="ms"
            icon={Activity}
            status={stats.averagePing < 50 ? 'good' : stats.averagePing < 100 ? 'warning' : 'critical'}
          />
          
          <MetricCard
            title="Issues"
            value={stats.offlineDevices + stats.warningDevices}
            icon={Zap}
            status={stats.offlineDevices + stats.warningDevices === 0 ? 'good' : 'warning'}
          />
        </div>

        {/* Network Traffic (if available) */}
        {networkTraffic && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <Card className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <Download className="w-5 h-5 text-green-500" />
                <h3 className="font-semibold">Download Speed</h3>
              </div>
              <div className="text-2xl font-bold text-green-500">
                {networkTraffic.download?.toFixed(1) || '0'} Mbps
              </div>
            </Card>
            
            <Card className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <Upload className="w-5 h-5 text-blue-500" />
                <h3 className="font-semibold">Upload Speed</h3>
              </div>
              <div className="text-2xl font-bold text-blue-500">
                {networkTraffic.upload?.toFixed(1) || '0'} Mbps
              </div>
            </Card>
            
            <Card className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <Activity className="w-5 h-5 text-purple-500" />
                <h3 className="font-semibold">Latency</h3>
              </div>
              <div className="text-2xl font-bold text-purple-500">
                {networkTraffic.latency || '0'}ms
              </div>
            </Card>
          </div>
        )}

        {/* Device Management Section */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold">Connected Devices</h2>
            <div className="text-sm text-gray-500 dark:text-gray-400">
              {filteredDevices.length} of {networkDevices.length} devices shown
            </div>
          </div>

          {/* Filters and Search */}
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search devices by name or IP..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="
                  w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600
                  rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white
                  focus:ring-2 focus:ring-blue-500 focus:border-transparent
                "
              />
            </div>
            
            <div className="flex gap-2">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="
                  px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg
                  bg-white dark:bg-gray-800 text-gray-900 dark:text-white
                  focus:ring-2 focus:ring-blue-500 focus:border-transparent
                "
              >
                <option value="all">All Status</option>
                <option value="online">Online</option>
                <option value="offline">Offline</option>
                <option value="warning">Warning</option>
              </select>
              
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="
                  px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg
                  bg-white dark:bg-gray-800 text-gray-900 dark:text-white
                  focus:ring-2 focus:ring-blue-500 focus:border-transparent
                "
              >
                <option value="name">Sort by Name</option>
                <option value="ip">Sort by IP</option>
                <option value="status">Sort by Status</option>
                <option value="ping">Sort by Ping</option>
              </select>
            </div>
          </div>

          {/* Status Summary */}
          <div className="flex flex-wrap gap-4 mb-6 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
            <div className="flex items-center gap-2">
              <StatusBadge status="online" type="device" showText={false} />
              <span className="text-sm text-gray-600 dark:text-gray-400">
                {stats.onlineDevices} Online
              </span>
            </div>
            <div className="flex items-center gap-2">
              <StatusBadge status="offline" type="device" showText={false} />
              <span className="text-sm text-gray-600 dark:text-gray-400">
                {stats.offlineDevices} Offline
              </span>
            </div>
            <div className="flex items-center gap-2">
              <StatusBadge status="warning" type="device" showText={false} />
              <span className="text-sm text-gray-600 dark:text-gray-400">
                {stats.warningDevices} Warning
              </span>
            </div>
          </div>

          {/* Device List */}
          {filteredDevices.length > 0 ? (
            <DeviceList 
              devices={filteredDevices}
              onDeviceClick={handleDeviceClick}
              showActions={true}
            />
          ) : (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              {searchQuery || statusFilter !== 'all' 
                ? 'No devices match your filters' 
                : 'No devices found'
              }
            </div>
          )}
        </Card>
      </div>
    </div>
  );
};

export default EnhancedNetworkMonitor;
