import React, { useState, useEffect } from 'react';
import { ArrowLeft, FileText, Download, Search, Filter, AlertTriangle, Info, CheckCircle, XCircle, RefreshCw } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Card } from '../ui/card';

export const LogViewer = () => {
  const navigate = useNavigate();
  const [logs, setLogs] = useState([
    { id: 1, timestamp: '2024-01-15 10:30:15', level: 'INFO', service: 'Docker', message: 'Container nginx started successfully', source: '/var/log/docker.log' },
    { id: 2, timestamp: '2024-01-15 10:29:42', level: 'ERROR', service: 'Pi-hole', message: 'Failed to resolve domain: malicious-site.com', source: '/var/log/pihole.log' },
    { id: 3, timestamp: '2024-01-15 10:28:30', level: 'WARN', service: 'System', message: 'High memory usage detected: 87%', source: '/var/log/syslog' },
    { id: 4, timestamp: '2024-01-15 10:27:18', level: 'INFO', service: 'SSH', message: 'User admin logged in from 192.168.1.50', source: '/var/log/auth.log' },
    { id: 5, timestamp: '2024-01-15 10:26:05', level: 'DEBUG', service: 'Network', message: 'Bandwidth monitor: Download 125Mbps, Upload 45Mbps', source: '/var/log/network.log' },
    { id: 6, timestamp: '2024-01-15 10:25:33', level: 'ERROR', service: 'Storage', message: 'Disk /dev/sdc1 usage above 85% threshold', source: '/var/log/storage.log' },
    { id: 7, timestamp: '2024-01-15 10:24:21', level: 'INFO', service: 'Docker', message: 'Container media-server restarted', source: '/var/log/docker.log' },
    { id: 8, timestamp: '2024-01-15 10:23:45', level: 'INFO', service: 'System', message: 'Scheduled backup completed successfully', source: '/var/log/backup.log' },
    { id: 9, timestamp: '2024-01-15 10:22:12', level: 'WARN', service: 'Network', message: 'Unusual traffic pattern detected from 192.168.1.105', source: '/var/log/security.log' },
    { id: 10, timestamp: '2024-01-15 10:21:56', level: 'INFO', service: 'Pi-hole', message: 'Blocked 1,247 ads in the last hour', source: '/var/log/pihole.log' }
  ]);

  const [filteredLogs, setFilteredLogs] = useState(logs);
  const [searchQuery, setSearchQuery] = useState('');
  const [levelFilter, setLevelFilter] = useState('ALL');
  const [serviceFilter, setServiceFilter] = useState('ALL');
  const [autoRefresh, setAutoRefresh] = useState(true);

  const logLevels = ['ALL', 'ERROR', 'WARN', 'INFO', 'DEBUG'];
  const services = ['ALL', 'Docker', 'Pi-hole', 'System', 'SSH', 'Network', 'Storage'];

  useEffect(() => {
    let filtered = logs;

    if (searchQuery) {
      filtered = filtered.filter(log => 
        log.message.toLowerCase().includes(searchQuery.toLowerCase()) ||
        log.service.toLowerCase().includes(searchQuery.toLowerCase()) ||
        log.source.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (levelFilter !== 'ALL') {
      filtered = filtered.filter(log => log.level === levelFilter);
    }

    if (serviceFilter !== 'ALL') {
      filtered = filtered.filter(log => log.service === serviceFilter);
    }

    setFilteredLogs(filtered);
  }, [searchQuery, levelFilter, serviceFilter, logs]);

  useEffect(() => {
    if (autoRefresh) {
      const interval = setInterval(() => {
        // Simulate new log entries
        const newLog = {
          id: Date.now(),
          timestamp: new Date().toLocaleString('sv-SE'),
          level: ['INFO', 'WARN', 'ERROR', 'DEBUG'][Math.floor(Math.random() * 4)],
          service: services[Math.floor(Math.random() * (services.length - 1)) + 1],
          message: 'Auto-generated log entry for demonstration',
          source: '/var/log/system.log'
        };
        setLogs(prev => [newLog, ...prev.slice(0, 49)]); // Keep last 50 logs
      }, 10000); // Add new log every 10 seconds

      return () => clearInterval(interval);
    }
  }, [autoRefresh]);

  const getLevelIcon = (level) => {
    switch (level) {
      case 'ERROR':
        return <XCircle className="w-4 h-4 text-red-500" />;
      case 'WARN':
        return <AlertTriangle className="w-4 h-4 text-yellow-500" />;
      case 'INFO':
        return <Info className="w-4 h-4 text-blue-500" />;
      case 'DEBUG':
        return <CheckCircle className="w-4 h-4 text-gray-500" />;
      default:
        return <FileText className="w-4 h-4 text-gray-500" />;
    }
  };

  const getLevelColor = (level) => {
    switch (level) {
      case 'ERROR':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      case 'WARN':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'INFO':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'DEBUG':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  const exportLogs = () => {
    const dataStr = JSON.stringify(filteredLogs, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `logs-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
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
              <FileText className="w-6 h-6 text-blue-500" />
              Log Viewer
            </h1>
          </div>
          <div className="flex gap-2">
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
            <button 
              onClick={exportLogs}
              className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90"
            >
              <Download className="w-4 h-4" />
              Export Logs
            </button>
          </div>
        </div>

        {/* Filters */}
        <Card className="p-4 mb-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <input
                type="text"
                placeholder="Search logs..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-background border border-border rounded-lg focus:border-primary focus:ring-1 focus:ring-primary"
              />
            </div>
            
            <div className="flex gap-2">
              <select
                value={levelFilter}
                onChange={(e) => setLevelFilter(e.target.value)}
                className="px-3 py-2 bg-background border border-border rounded-lg focus:border-primary focus:ring-1 focus:ring-primary"
              >
                {logLevels.map(level => (
                  <option key={level} value={level}>{level}</option>
                ))}
              </select>
              
              <select
                value={serviceFilter}
                onChange={(e) => setServiceFilter(e.target.value)}
                className="px-3 py-2 bg-background border border-border rounded-lg focus:border-primary focus:ring-1 focus:ring-primary"
              >
                {services.map(service => (
                  <option key={service} value={service}>{service}</option>
                ))}
              </select>
            </div>
          </div>
        </Card>

        {/* Log Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card className="p-4 text-center">
            <div className="text-2xl font-bold text-blue-500">
              {filteredLogs.filter(log => log.level === 'INFO').length}
            </div>
            <div className="text-sm text-muted-foreground">Info Messages</div>
          </Card>
          <Card className="p-4 text-center">
            <div className="text-2xl font-bold text-yellow-500">
              {filteredLogs.filter(log => log.level === 'WARN').length}
            </div>
            <div className="text-sm text-muted-foreground">Warnings</div>
          </Card>
          <Card className="p-4 text-center">
            <div className="text-2xl font-bold text-red-500">
              {filteredLogs.filter(log => log.level === 'ERROR').length}
            </div>
            <div className="text-sm text-muted-foreground">Errors</div>
          </Card>
          <Card className="p-4 text-center">
            <div className="text-2xl font-bold text-gray-500">
              {filteredLogs.filter(log => log.level === 'DEBUG').length}
            </div>
            <div className="text-sm text-muted-foreground">Debug</div>
          </Card>
        </div>

        {/* Logs Table */}
        <Card className="p-6">
          <div className="overflow-x-auto">
            <div className="space-y-2">
              {filteredLogs.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No logs found matching the current filters.
                </div>
              ) : (
                filteredLogs.map((log) => (
                  <div key={log.id} className="p-4 hover:bg-accent/5 rounded-lg border border-border">
                    <div className="flex items-start gap-4">
                      <div className="flex items-center gap-2 min-w-0">
                        {getLevelIcon(log.level)}
                        <span className={`px-2 py-1 rounded text-xs font-medium ${getLevelColor(log.level)}`}>
                          {log.level}
                        </span>
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-4 mb-2">
                          <span className="text-sm text-muted-foreground font-mono">
                            {log.timestamp}
                          </span>
                          <span className="text-sm font-medium text-blue-600">
                            {log.service}
                          </span>
                        </div>
                        <p className="text-sm break-words">{log.message}</p>
                        <p className="text-xs text-muted-foreground mt-1 font-mono">
                          {log.source}
                        </p>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </Card>

        {/* Footer Info */}
        <div className="mt-6 text-center text-sm text-muted-foreground">
          Showing {filteredLogs.length} of {logs.length} log entries
        </div>
      </div>
    </div>
  );
};
