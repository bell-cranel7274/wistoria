import React, { useState, useEffect } from 'react';
import { ArrowLeft, Clock, CheckCircle, XCircle, RefreshCw, TrendingUp, AlertTriangle, Activity } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Card } from '../ui/card';

export const UptimeMonitor = () => {
  const navigate = useNavigate();
  const [services, setServices] = useState([
    {
      id: 1,
      name: 'Pi-hole',
      url: 'http://192.168.1.100',
      status: 'online',
      uptime: '99.8%',
      lastCheck: '2024-01-15 10:30:00',
      responseTime: 12,
      uptimeHistory: [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0] // Last 24 hours
    },
    {
      id: 2,
      name: 'Media Server',
      url: 'http://192.168.1.101:8096',
      status: 'online',
      uptime: '97.5%',
      lastCheck: '2024-01-15 10:29:45',
      responseTime: 45,
      uptimeHistory: [1, 1, 1, 1, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1]
    },
    {
      id: 3,
      name: 'File Server',
      url: 'http://192.168.1.102',
      status: 'online',
      uptime: '99.9%',
      lastCheck: '2024-01-15 10:30:15',
      responseTime: 8,
      uptimeHistory: [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1]
    },
    {
      id: 4,
      name: 'Docker API',
      url: 'http://192.168.1.103:2376',
      status: 'warning',
      uptime: '95.2%',
      lastCheck: '2024-01-15 10:28:30',
      responseTime: 150,
      uptimeHistory: [1, 1, 0, 0, 1, 1, 1, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 1, 1, 1, 1]
    },
    {
      id: 5,
      name: 'VPN Server',
      url: 'http://192.168.1.104:1194',
      status: 'offline',
      uptime: '89.3%',
      lastCheck: '2024-01-15 10:25:12',
      responseTime: null,
      uptimeHistory: [0, 0, 0, 1, 1, 1, 1, 1, 0, 0, 1, 1, 1, 1, 0, 0, 0, 1, 1, 1, 1, 1, 0, 0]
    },
    {
      id: 6,
      name: 'Home Assistant',
      url: 'http://192.168.1.105:8123',
      status: 'online',
      uptime: '98.7%',
      lastCheck: '2024-01-15 10:30:08',
      responseTime: 25,
      uptimeHistory: [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1]
    }
  ]);

  const [autoRefresh, setAutoRefresh] = useState(true);
  const [refreshInterval, setRefreshInterval] = useState(30); // seconds

  useEffect(() => {
    if (autoRefresh) {
      const interval = setInterval(() => {
        // Simulate service checks
        setServices(prev => prev.map(service => {
          const randomCheck = Math.random();
          let newStatus = service.status;
          let newResponseTime = service.responseTime;

          // Simulate some status changes
          if (service.status === 'offline' && randomCheck > 0.7) {
            newStatus = 'online';
            newResponseTime = Math.floor(Math.random() * 100) + 10;
          } else if (service.status === 'online' && randomCheck < 0.05) {
            newStatus = 'offline';
            newResponseTime = null;
          } else if (service.status === 'warning' && randomCheck > 0.6) {
            newStatus = 'online';
            newResponseTime = Math.floor(Math.random() * 50) + 10;
          }

          return {
            ...service,
            status: newStatus,
            responseTime: newResponseTime,
            lastCheck: new Date().toLocaleString('sv-SE')
          };
        }));
      }, refreshInterval * 1000);

      return () => clearInterval(interval);
    }
  }, [autoRefresh, refreshInterval]);

  const getStatusColor = (status) => {
    switch (status) {
      case 'online':
        return 'text-green-500';
      case 'warning':
        return 'text-yellow-500';
      case 'offline':
        return 'text-red-500';
      default:
        return 'text-gray-500';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'online':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'warning':
        return <AlertTriangle className="w-5 h-5 text-yellow-500" />;
      case 'offline':
        return <XCircle className="w-5 h-5 text-red-500" />;
      default:
        return <Clock className="w-5 h-5 text-gray-500" />;
    }
  };

  const getStatusBadge = (status) => {
    const colors = {
      online: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
      warning: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
      offline: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
    };

    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${colors[status]}`}>
        {status.toUpperCase()}
      </span>
    );
  };

  const getResponseTimeColor = (responseTime) => {
    if (!responseTime) return 'text-gray-500';
    if (responseTime < 50) return 'text-green-500';
    if (responseTime < 200) return 'text-yellow-500';
    return 'text-red-500';
  };

  const calculateAverageUptime = () => {
    const total = services.reduce((sum, service) => sum + parseFloat(service.uptime), 0);
    return (total / services.length).toFixed(1);
  };

  const getActiveServices = () => services.filter(s => s.status === 'online').length;
  const getOfflineServices = () => services.filter(s => s.status === 'offline').length;
  const getWarningServices = () => services.filter(s => s.status === 'warning').length;

  const testService = (serviceId) => {
    setServices(prev => prev.map(service => 
      service.id === serviceId 
        ? { ...service, lastCheck: new Date().toLocaleString('sv-SE') }
        : service
    ));
  };

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/')}
              className="p-2 hover:bg-accent/10 rounded-full"
              title="Back to Dashboard"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <Clock className="w-6 h-6 text-blue-500" />
              Uptime Monitor
            </h1>
          </div>
          <div className="flex gap-2">
            <select
              value={refreshInterval}
              onChange={(e) => setRefreshInterval(Number(e.target.value))}
              className="px-3 py-2 bg-background border border-border rounded-lg focus:border-primary focus:ring-1 focus:ring-primary"
            >
              <option value={15}>15s</option>
              <option value={30}>30s</option>
              <option value={60}>1m</option>
              <option value={300}>5m</option>
            </select>
            <button 
              onClick={() => setAutoRefresh(!autoRefresh)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                autoRefresh 
                  ? 'bg-green-500 text-white hover:bg-green-600' 
                  : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
              }`}
            >
              <RefreshCw className={`w-4 h-4 ${autoRefresh ? 'animate-spin' : ''}`} />
              Auto Refresh
            </button>
          </div>
        </div>

        {/* Overview Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card className="p-4 text-center">
            <div className="text-2xl font-bold text-blue-500">{calculateAverageUptime()}%</div>
            <div className="text-sm text-muted-foreground">Average Uptime</div>
          </Card>
          <Card className="p-4 text-center">
            <div className="text-2xl font-bold text-green-500">{getActiveServices()}</div>
            <div className="text-sm text-muted-foreground">Services Online</div>
          </Card>
          <Card className="p-4 text-center">
            <div className="text-2xl font-bold text-yellow-500">{getWarningServices()}</div>
            <div className="text-sm text-muted-foreground">Services Warning</div>
          </Card>
          <Card className="p-4 text-center">
            <div className="text-2xl font-bold text-red-500">{getOfflineServices()}</div>
            <div className="text-sm text-muted-foreground">Services Offline</div>
          </Card>
        </div>

        {/* Services List */}
        <div className="space-y-4">
          {services.map((service) => (
            <Card key={service.id} className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-4">
                  {getStatusIcon(service.status)}
                  <div>
                    <h3 className="font-semibold text-lg">{service.name}</h3>
                    <p className="text-sm text-muted-foreground">{service.url}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  {getStatusBadge(service.status)}
                  <button
                    onClick={() => testService(service.id)}
                    className="p-2 hover:bg-accent/10 rounded-md"
                    title="Test Now"
                  >
                    <Activity className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-500">{service.uptime}</div>
                  <div className="text-sm text-muted-foreground">Uptime</div>
                </div>
                <div className="text-center">
                  <div className={`text-2xl font-bold ${getResponseTimeColor(service.responseTime)}`}>
                    {service.responseTime ? `${service.responseTime}ms` : 'N/A'}
                  </div>
                  <div className="text-sm text-muted-foreground">Response Time</div>
                </div>
                <div className="text-center">
                  <div className="text-sm text-muted-foreground">Last Check</div>
                  <div className="font-medium">{service.lastCheck}</div>
                </div>
                <div className="text-center">
                  <div className="text-sm text-muted-foreground">24h Status</div>
                  <div className="flex gap-1 justify-center mt-1">
                    {service.uptimeHistory.map((status, index) => (
                      <div
                        key={index}
                        className={`w-2 h-4 rounded-sm ${
                          status ? 'bg-green-500' : 'bg-red-500'
                        }`}
                        title={`Hour ${index + 1}: ${status ? 'Online' : 'Offline'}`}
                      />
                    ))}
                  </div>
                </div>
              </div>

              {/* Uptime Chart */}
              <div className="h-16 bg-accent/5 rounded-lg p-2">
                <div className="h-full flex items-end gap-1">
                  {service.uptimeHistory.map((status, index) => (
                    <div
                      key={index}
                      className={`flex-1 rounded-t transition-all ${
                        status ? 'bg-green-500' : 'bg-red-500'
                      }`}
                      style={{ height: status ? '100%' : '20%' }}
                      title={`${index + 1}:00 - ${status ? 'Online' : 'Offline'}`}
                    />
                  ))}
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};
