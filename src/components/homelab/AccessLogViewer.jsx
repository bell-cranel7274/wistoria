import React, { useState, useEffect } from 'react';
import { EnhancedNavigation } from '../navigation/EnhancedNavigation';

export const AccessLogViewer = () => {
  const [accessLogs, setAccessLogs] = useState([]);
  const [filteredLogs, setFilteredLogs] = useState([]);
  const [users, setUsers] = useState([]);
  const [resources, setResources] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filterUser, setFilterUser] = useState('');
  const [filterResource, setFilterResource] = useState('');
  const [filterResult, setFilterResult] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTimeRange, setSelectedTimeRange] = useState('24h');

  useEffect(() => {
    // Simulate loading data
    const timer = setTimeout(() => {
      setUsers([
        { id: 'alice', name: 'Alice Johnson', role: 'admin' },
        { id: 'bob', name: 'Bob Smith', role: 'user' },
        { id: 'charlie', name: 'Charlie Brown', role: 'user' },
        { id: 'dave', name: 'Dave Wilson', role: 'guest' },
        { id: 'system', name: 'System', role: 'system' }
      ]);

      setResources([
        { id: 'file_server', name: 'File Server', type: 'storage' },
        { id: 'media_server', name: 'Media Server', type: 'media' },
        { id: 'vpn_server', name: 'VPN Server', type: 'network' },
        { id: 'docker_api', name: 'Docker API', type: 'container' },
        { id: 'security_cameras', name: 'Security Cameras', type: 'security' },
        { id: 'smart_devices', name: 'Smart Devices', type: 'iot' },
        { id: 'web_interface', name: 'Web Interface', type: 'web' }
      ]);

      const generateAccessLogs = () => {
        const logs = [];
        const now = new Date();
        const actions = ['login', 'logout', 'file_access', 'file_upload', 'file_download', 'config_change', 'system_restart', 'user_create', 'user_delete', 'permission_change'];
        const results = ['success', 'failed', 'blocked', 'timeout'];
        const ips = ['192.168.1.101', '192.168.1.102', '192.168.1.103', '192.168.1.104', '10.0.0.50', '203.0.113.45'];
        const userAgents = ['Chrome/121.0', 'Firefox/122.0', 'Safari/17.0', 'Mobile App v2.1', 'API Client v1.5'];

        for (let i = 0; i < 150; i++) {
          const timestamp = new Date(now - Math.random() * 7 * 24 * 60 * 60 * 1000); // Last 7 days
          const user = users[Math.floor(Math.random() * users.length)];
          const resource = resources[Math.floor(Math.random() * resources.length)];
          const action = actions[Math.floor(Math.random() * actions.length)];
          const result = results[Math.floor(Math.random() * results.length)];
          const ip = ips[Math.floor(Math.random() * ips.length)];
          const userAgent = userAgents[Math.floor(Math.random() * userAgents.length)];

          logs.push({
            id: i + 1,
            timestamp: timestamp.toISOString(),
            user: user.id,
            userName: user.name,
            userRole: user.role,
            resource: resource.id,
            resourceName: resource.name,
            resourceType: resource.type,
            action: action,
            result: result,
            ipAddress: ip,
            userAgent: userAgent,
            details: generateLogDetails(action, result, resource.name),
            risk: calculateRiskLevel(action, result, user.role, ip)
          });
        }

        return logs.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
      };

      const generateLogDetails = (action, result, resource) => {
        const details = {
          'login': 'User authentication attempt',
          'logout': 'User session terminated',
          'file_access': `Accessed files on ${resource}`,
          'file_upload': `Uploaded file to ${resource}`,
          'file_download': `Downloaded file from ${resource}`,
          'config_change': `Modified configuration on ${resource}`,
          'system_restart': `Initiated system restart on ${resource}`,
          'user_create': `Created new user account`,
          'user_delete': `Deleted user account`,
          'permission_change': `Modified user permissions`
        };

        let detail = details[action] || 'Unknown action';
        
        if (result === 'failed') {
          detail += ' - Authentication failed';
        } else if (result === 'blocked') {
          detail += ' - Access denied by security policy';
        } else if (result === 'timeout') {
          detail += ' - Request timed out';
        }

        return detail;
      };

      const calculateRiskLevel = (action, result, role, ip) => {
        let risk = 'low';
        
        if (result === 'failed' || result === 'blocked') risk = 'medium';
        if (action === 'config_change' || action === 'system_restart') risk = 'medium';
        if (action === 'user_create' || action === 'user_delete' || action === 'permission_change') risk = 'high';
        if (ip.startsWith('203.')) risk = 'high'; // External IP
        if (role === 'guest' && (action === 'config_change' || action === 'system_restart')) risk = 'high';

        return risk;
      };

      const logs = generateAccessLogs();
      setAccessLogs(logs);
      setFilteredLogs(logs);
      setIsLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    // Apply filters
    let filtered = accessLogs;

    // Time range filter
    const now = new Date();
    const timeRanges = {
      '1h': 1 * 60 * 60 * 1000,
      '24h': 24 * 60 * 60 * 1000,
      '7d': 7 * 24 * 60 * 60 * 1000,
      '30d': 30 * 24 * 60 * 60 * 1000
    };

    if (timeRanges[selectedTimeRange]) {
      const cutoff = new Date(now - timeRanges[selectedTimeRange]);
      filtered = filtered.filter(log => new Date(log.timestamp) >= cutoff);
    }

    // User filter
    if (filterUser) {
      filtered = filtered.filter(log => log.user === filterUser);
    }

    // Resource filter
    if (filterResource) {
      filtered = filtered.filter(log => log.resource === filterResource);
    }

    // Result filter
    if (filterResult) {
      filtered = filtered.filter(log => log.result === filterResult);
    }

    // Search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(log => 
        log.userName.toLowerCase().includes(query) ||
        log.resourceName.toLowerCase().includes(query) ||
        log.action.toLowerCase().includes(query) ||
        log.details.toLowerCase().includes(query) ||
        log.ipAddress.includes(query)
      );
    }

    setFilteredLogs(filtered);
  }, [accessLogs, filterUser, filterResource, filterResult, searchQuery, selectedTimeRange]);

  const getResultColor = (result) => {
    switch (result) {
      case 'success': return 'text-green-500';
      case 'failed': return 'text-red-500';
      case 'blocked': return 'text-yellow-500';
      case 'timeout': return 'text-gray-500';
      default: return 'text-gray-500';
    }
  };

  const getRiskColor = (risk) => {
    switch (risk) {
      case 'low': return 'bg-green-100 text-green-800 border-green-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'high': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getRoleColor = (role) => {
    switch (role) {
      case 'admin': return 'bg-red-600';
      case 'user': return 'bg-blue-600';
      case 'guest': return 'bg-gray-600';
      case 'system': return 'bg-purple-600';
      default: return 'bg-gray-600';
    }
  };

  const exportLogs = () => {
    const csvContent = [
      ['Timestamp', 'User', 'Resource', 'Action', 'Result', 'IP Address', 'Risk', 'Details'],
      ...filteredLogs.map(log => [
        log.timestamp,
        log.userName,
        log.resourceName,
        log.action,
        log.result,
        log.ipAddress,
        log.risk,
        log.details
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.style.display = 'none';
    a.href = url;
    a.download = `access_logs_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-900 text-white p-8">
        <div className="flex items-center justify-center h-64">
          <div className="text-xl">Loading access logs...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <EnhancedNavigation />
      
      <div className="container mx-auto px-6 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Access Log Viewer</h1>
          <div className="flex items-center space-x-4">
            <button
              onClick={exportLogs}
              className="px-4 py-2 bg-green-600 hover:bg-green-700 rounded-lg transition-colors"
            >
              Export CSV
            </button>
            <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors">
              Configure Alerts
            </button>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-gray-800 p-6 rounded-lg">
            <h3 className="text-lg font-semibold mb-2">Total Entries</h3>
            <p className="text-3xl font-bold text-blue-400">{filteredLogs.length}</p>
          </div>
          <div className="bg-gray-800 p-6 rounded-lg">
            <h3 className="text-lg font-semibold mb-2">Successful</h3>
            <p className="text-3xl font-bold text-green-400">
              {filteredLogs.filter(log => log.result === 'success').length}
            </p>
          </div>
          <div className="bg-gray-800 p-6 rounded-lg">
            <h3 className="text-lg font-semibold mb-2">Failed</h3>
            <p className="text-3xl font-bold text-red-400">
              {filteredLogs.filter(log => log.result === 'failed').length}
            </p>
          </div>
          <div className="bg-gray-800 p-6 rounded-lg">
            <h3 className="text-lg font-semibold mb-2">High Risk</h3>
            <p className="text-3xl font-bold text-yellow-400">
              {filteredLogs.filter(log => log.risk === 'high').length}
            </p>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-gray-800 p-6 rounded-lg mb-8">
          <h2 className="text-xl font-semibold mb-4">Filters</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Time Range</label>
              <select
                value={selectedTimeRange}
                onChange={(e) => setSelectedTimeRange(e.target.value)}
                className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2"
              >
                <option value="1h">Last Hour</option>
                <option value="24h">Last 24 Hours</option>
                <option value="7d">Last 7 Days</option>
                <option value="30d">Last 30 Days</option>
                <option value="">All Time</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">User</label>
              <select
                value={filterUser}
                onChange={(e) => setFilterUser(e.target.value)}
                className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2"
              >
                <option value="">All Users</option>
                {users.map(user => (
                  <option key={user.id} value={user.id}>{user.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Resource</label>
              <select
                value={filterResource}
                onChange={(e) => setFilterResource(e.target.value)}
                className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2"
              >
                <option value="">All Resources</option>
                {resources.map(resource => (
                  <option key={resource.id} value={resource.id}>{resource.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Result</label>
              <select
                value={filterResult}
                onChange={(e) => setFilterResult(e.target.value)}
                className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2"
              >
                <option value="">All Results</option>
                <option value="success">Success</option>
                <option value="failed">Failed</option>
                <option value="blocked">Blocked</option>
                <option value="timeout">Timeout</option>
              </select>
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium mb-2">Search</label>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search logs..."
                className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2"
              />
            </div>
          </div>
          <div className="mt-4 flex space-x-4">
            <button
              onClick={() => {
                setFilterUser('');
                setFilterResource('');
                setFilterResult('');
                setSearchQuery('');
                setSelectedTimeRange('24h');
              }}
              className="px-4 py-2 bg-gray-600 hover:bg-gray-700 rounded transition-colors"
            >
              Clear Filters
            </button>
            <span className="text-sm text-gray-400 flex items-center">
              Showing {filteredLogs.length} of {accessLogs.length} entries
            </span>
          </div>
        </div>

        {/* Access Logs Table */}
        <div className="bg-gray-800 rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-700">
                <tr>
                  <th className="text-left py-3 px-4">Timestamp</th>
                  <th className="text-left py-3 px-4">User</th>
                  <th className="text-left py-3 px-4">Resource</th>
                  <th className="text-left py-3 px-4">Action</th>
                  <th className="text-left py-3 px-4">Result</th>
                  <th className="text-left py-3 px-4">IP Address</th>
                  <th className="text-left py-3 px-4">Risk</th>
                  <th className="text-left py-3 px-4">Details</th>
                </tr>
              </thead>
              <tbody>
                {filteredLogs.map((log) => (
                  <tr key={log.id} className="border-b border-gray-700 hover:bg-gray-750">
                    <td className="py-3 px-4">
                      <div className="text-xs text-gray-400">
                        {new Date(log.timestamp).toLocaleString()}
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center space-x-2">
                        <span className={`w-2 h-2 rounded-full ${getRoleColor(log.userRole)}`}></span>
                        <div>
                          <div className="font-medium">{log.userName}</div>
                          <div className="text-xs text-gray-400">{log.userRole}</div>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div>
                        <div className="font-medium">{log.resourceName}</div>
                        <div className="text-xs text-gray-400">{log.resourceType}</div>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-1 bg-gray-600 rounded text-xs">
                        {log.action.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`font-medium ${getResultColor(log.result)}`}>
                        {log.result}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-mono text-xs">{log.ipAddress}</td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-1 rounded text-xs border ${getRiskColor(log.risk)}`}>
                        {log.risk}
                      </span>
                    </td>
                    <td className="py-3 px-4 max-w-xs">
                      <div className="text-xs text-gray-300 truncate" title={log.details}>
                        {log.details}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {filteredLogs.length === 0 && (
            <div className="text-center py-8 text-gray-400">
              No access logs found matching the current filters.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
