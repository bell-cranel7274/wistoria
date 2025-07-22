import React, { useState, useEffect } from 'react';
import { ArrowLeft, AlertTriangle, Bell, CheckCircle, XCircle, Clock, Settings, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Card } from '../ui/card';

export const AlertManager = () => {
  const navigate = useNavigate();
  const [alerts, setAlerts] = useState([
    {
      id: 1,
      title: 'High Disk Usage',
      message: 'Backup drive usage above 85% threshold (87% used)',
      severity: 'warning',
      timestamp: '2024-01-15 10:25:33',
      source: 'Storage Monitor',
      acknowledged: false,
      category: 'storage'
    },
    {
      id: 2,
      title: 'Container Down',
      message: 'Media server container has stopped unexpectedly',
      severity: 'error',
      timestamp: '2024-01-15 09:45:12',
      source: 'Docker Manager',
      acknowledged: false,
      category: 'services'
    },
    {
      id: 3,
      title: 'High Memory Usage',
      message: 'System memory usage at 89% - consider restarting services',
      severity: 'warning',
      timestamp: '2024-01-15 09:30:45',
      source: 'System Monitor',
      acknowledged: true,
      category: 'system'
    },
    {
      id: 4,
      title: 'Backup Completed',
      message: 'Daily backup completed successfully (2.3GB archived)',
      severity: 'info',
      timestamp: '2024-01-15 02:00:15',
      source: 'Backup Service',
      acknowledged: true,
      category: 'backup'
    },
    {
      id: 5,
      title: 'Unusual Network Activity',
      message: 'Detected unusual traffic pattern from IP 192.168.1.105',
      severity: 'critical',
      timestamp: '2024-01-15 08:22:18',
      source: 'Security Monitor',
      acknowledged: false,
      category: 'security'
    }
  ]);

  const [filter, setFilter] = useState('all');
  const [sortBy, setSortBy] = useState('timestamp');

  const severityColors = {
    critical: 'bg-red-100 text-red-800 border-red-200 dark:bg-red-900 dark:text-red-200',
    error: 'bg-red-50 text-red-700 border-red-200 dark:bg-red-900/50 dark:text-red-300',
    warning: 'bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900 dark:text-yellow-200',
    info: 'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900 dark:text-blue-200'
  };

  const getSeverityIcon = (severity) => {
    switch (severity) {
      case 'critical':
        return <XCircle className="w-5 h-5 text-red-500" />;
      case 'error':
        return <XCircle className="w-5 h-5 text-red-400" />;
      case 'warning':
        return <AlertTriangle className="w-5 h-5 text-yellow-500" />;
      case 'info':
        return <CheckCircle className="w-5 h-5 text-blue-500" />;
      default:
        return <Bell className="w-5 h-5 text-gray-500" />;
    }
  };

  const filteredAlerts = alerts.filter(alert => {
    if (filter === 'all') return true;
    if (filter === 'unacknowledged') return !alert.acknowledged;
    if (filter === 'acknowledged') return alert.acknowledged;
    return alert.severity === filter;
  });

  const sortedAlerts = [...filteredAlerts].sort((a, b) => {
    if (sortBy === 'timestamp') {
      return new Date(b.timestamp) - new Date(a.timestamp);
    }
    if (sortBy === 'severity') {
      const severityOrder = { critical: 4, error: 3, warning: 2, info: 1 };
      return severityOrder[b.severity] - severityOrder[a.severity];
    }
    return 0;
  });

  const acknowledgeAlert = (alertId) => {
    setAlerts(prev => prev.map(alert => 
      alert.id === alertId ? { ...alert, acknowledged: true } : alert
    ));
  };

  const deleteAlert = (alertId) => {
    setAlerts(prev => prev.filter(alert => alert.id !== alertId));
  };

  const acknowledgeAll = () => {
    setAlerts(prev => prev.map(alert => ({ ...alert, acknowledged: true })));
  };

  const getAlertStats = () => {
    const total = alerts.length;
    const unacknowledged = alerts.filter(a => !a.acknowledged).length;
    const critical = alerts.filter(a => a.severity === 'critical').length;
    const errors = alerts.filter(a => a.severity === 'error').length;
    
    return { total, unacknowledged, critical, errors };
  };

  const stats = getAlertStats();

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
              <AlertTriangle className="w-6 h-6 text-yellow-500" />
              Alert Manager
            </h1>
          </div>
          <div className="flex gap-2">
            <button 
              onClick={acknowledgeAll}
              className="flex items-center gap-2 px-4 py-2 bg-secondary text-secondary-foreground rounded-lg hover:bg-secondary/80"
            >
              <CheckCircle className="w-4 h-4" />
              Acknowledge All
            </button>
            <button className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90">
              <Settings className="w-4 h-4" />
              Configure
            </button>
          </div>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card className="p-4 text-center">
            <div className="text-2xl font-bold text-blue-500">{stats.total}</div>
            <div className="text-sm text-muted-foreground">Total Alerts</div>
          </Card>
          <Card className="p-4 text-center">
            <div className="text-2xl font-bold text-yellow-500">{stats.unacknowledged}</div>
            <div className="text-sm text-muted-foreground">Unacknowledged</div>
          </Card>
          <Card className="p-4 text-center">
            <div className="text-2xl font-bold text-red-500">{stats.critical}</div>
            <div className="text-sm text-muted-foreground">Critical</div>
          </Card>
          <Card className="p-4 text-center">
            <div className="text-2xl font-bold text-red-400">{stats.errors}</div>
            <div className="text-sm text-muted-foreground">Errors</div>
          </Card>
        </div>

        {/* Filters */}
        <Card className="p-4 mb-6">
          <div className="flex flex-col sm:flex-row gap-4 items-center">
            <div className="flex gap-2">
              <label className="text-sm font-medium">Filter:</label>
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="px-3 py-1 bg-background border border-border rounded focus:border-primary focus:ring-1 focus:ring-primary"
              >
                <option value="all">All Alerts</option>
                <option value="unacknowledged">Unacknowledged</option>
                <option value="acknowledged">Acknowledged</option>
                <option value="critical">Critical</option>
                <option value="error">Error</option>
                <option value="warning">Warning</option>
                <option value="info">Info</option>
              </select>
            </div>
            
            <div className="flex gap-2">
              <label className="text-sm font-medium">Sort by:</label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-3 py-1 bg-background border border-border rounded focus:border-primary focus:ring-1 focus:ring-primary"
              >
                <option value="timestamp">Timestamp</option>
                <option value="severity">Severity</option>
              </select>
            </div>
          </div>
        </Card>

        {/* Alerts List */}
        <div className="space-y-4">
          {sortedAlerts.length === 0 ? (
            <Card className="p-8 text-center">
              <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No alerts found</h3>
              <p className="text-muted-foreground">
                {filter === 'all' ? 'Your system is running smoothly!' : `No ${filter} alerts at this time.`}
              </p>
            </Card>
          ) : (
            sortedAlerts.map((alert) => (
              <Card key={alert.id} className={`p-4 border-l-4 ${
                alert.severity === 'critical' ? 'border-l-red-500' :
                alert.severity === 'error' ? 'border-l-red-400' :
                alert.severity === 'warning' ? 'border-l-yellow-500' :
                'border-l-blue-500'
              } ${alert.acknowledged ? 'opacity-60' : ''}`}>
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4 flex-1">
                    {getSeverityIcon(alert.severity)}
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-semibold">{alert.title}</h3>
                        <span className={`px-2 py-1 rounded text-xs font-medium ${severityColors[alert.severity]}`}>
                          {alert.severity.toUpperCase()}
                        </span>
                        {alert.acknowledged && (
                          <span className="px-2 py-1 rounded text-xs bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                            ACKNOWLEDGED
                          </span>
                        )}
                      </div>
                      
                      <p className="text-sm text-muted-foreground mb-3">{alert.message}</p>
                      
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {alert.timestamp}
                        </div>
                        <div>Source: {alert.source}</div>
                        <div>Category: {alert.category}</div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex gap-2 ml-4">
                    {!alert.acknowledged && (
                      <button
                        onClick={() => acknowledgeAlert(alert.id)}
                        className="p-2 text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20 rounded transition-colors"
                        title="Acknowledge"
                      >
                        <CheckCircle className="w-4 h-4" />
                      </button>
                    )}
                    <button
                      onClick={() => deleteAlert(alert.id)}
                      className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors"
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
