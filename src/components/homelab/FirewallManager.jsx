import React, { useState, useEffect } from 'react';
import { EnhancedNavigation } from '../navigation/EnhancedNavigation';

const FirewallManager = () => {
  const [activeTab, setActiveTab] = useState('rules');
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [refreshInterval] = useState(5000);
  const [firewallStatus, setFirewallStatus] = useState({
    enabled: true,
    profile: 'strict',
    totalRules: 156,
    activeConnections: 284,
    blockedAttempts: 47,
    allowedConnections: 1432
  });

  const [firewallRules, setFirewallRules] = useState([
    {
      id: 1,
      name: 'SSH Access',
      action: 'ALLOW',
      protocol: 'TCP',
      port: '22',
      source: '192.168.1.0/24',
      destination: 'any',
      enabled: true,
      priority: 1,
      created: '2024-01-15'
    },
    {
      id: 2,
      name: 'Block China IPs',
      action: 'DENY',
      protocol: 'any',
      port: 'any',
      source: '1.2.0.0/16',
      destination: 'any',
      enabled: true,
      priority: 2,
      created: '2024-01-10'
    },
    {
      id: 3,
      name: 'Web Server HTTP',
      action: 'ALLOW',
      protocol: 'TCP',
      port: '80',
      source: 'any',
      destination: '192.168.1.100',
      enabled: true,
      priority: 3,
      created: '2024-02-01'
    },
    {
      id: 4,
      name: 'Web Server HTTPS',
      action: 'ALLOW',
      protocol: 'TCP',
      port: '443',
      source: 'any',
      destination: '192.168.1.100',
      enabled: true,
      priority: 4,
      created: '2024-02-01'
    },
    {
      id: 5,
      name: 'Block Malicious Subnet',
      action: 'DENY',
      protocol: 'any',
      port: 'any',
      source: '10.0.0.0/8',
      destination: 'any',
      enabled: false,
      priority: 5,
      created: '2024-01-20'
    }
  ]);

  const [activeConnections, setActiveConnections] = useState([
    {
      id: 1,
      sourceIP: '192.168.1.50',
      destIP: '8.8.8.8',
      protocol: 'TCP',
      sourcePort: 54321,
      destPort: 53,
      state: 'ESTABLISHED',
      duration: '00:05:23',
      bytes: '2.4 KB'
    },
    {
      id: 2,
      sourceIP: '192.168.1.25',
      destIP: '192.168.1.100',
      protocol: 'TCP',
      sourcePort: 44932,
      destPort: 443,
      state: 'ESTABLISHED',
      duration: '00:12:45',
      bytes: '45.2 MB'
    },
    {
      id: 3,
      sourceIP: '10.0.0.15',
      destIP: '192.168.1.1',
      protocol: 'TCP',
      sourcePort: 23456,
      destPort: 22,
      state: 'BLOCKED',
      duration: '00:00:01',
      bytes: '0 B'
    }
  ]);

  const [blockedIPs, setBlockedIPs] = useState([
    {
      ip: '103.45.12.89',
      country: 'China',
      attempts: 47,
      lastAttempt: '2024-06-04 14:32:15',
      reason: 'Brute Force SSH',
      blocked: true
    },
    {
      ip: '185.220.100.240',
      country: 'Russia',
      attempts: 23,
      lastAttempt: '2024-06-04 14:28:42',
      reason: 'Port Scan',
      blocked: true
    },
    {
      ip: '45.132.75.19',
      country: 'Unknown',
      attempts: 12,
      lastAttempt: '2024-06-04 14:25:30',
      reason: 'Malicious Traffic',
      blocked: true
    }
  ]);

  const [threatIntel, setThreatIntel] = useState([
    {
      type: 'IP Reputation',
      source: 'AbuseIPDB',
      threats: 1247,
      blocked: 1203,
      lastUpdate: '2024-06-04 14:30:00'
    },
    {
      type: 'Domain Blacklist',
      source: 'MalwareDomains',
      threats: 892,
      blocked: 876,
      lastUpdate: '2024-06-04 14:25:00'
    },
    {
      type: 'GeoIP Blocking',
      source: 'MaxMind',
      threats: 2341,
      blocked: 2341,
      lastUpdate: '2024-06-04 14:20:00'
    }
  ]);

  // Simulate real-time updates
  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(() => {
      // Update firewall status
      setFirewallStatus(prev => ({
        ...prev,
        activeConnections: prev.activeConnections + Math.floor(Math.random() * 10) - 5,
        blockedAttempts: prev.blockedAttempts + Math.floor(Math.random() * 3),
        allowedConnections: prev.allowedConnections + Math.floor(Math.random() * 20) - 10
      }));

      // Simulate new blocked IPs
      if (Math.random() < 0.3) {
        const newIP = `${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`;
        setBlockedIPs(prev => [
          {
            ip: newIP,
            country: ['China', 'Russia', 'Unknown', 'Brazil'][Math.floor(Math.random() * 4)],
            attempts: Math.floor(Math.random() * 50) + 1,
            lastAttempt: new Date().toLocaleString(),
            reason: ['Brute Force SSH', 'Port Scan', 'Malicious Traffic'][Math.floor(Math.random() * 3)],
            blocked: true
          },
          ...prev.slice(0, 9)
        ]);
      }
    }, refreshInterval);

    return () => clearInterval(interval);
  }, [autoRefresh, refreshInterval]);

  const toggleFirewall = () => {
    setFirewallStatus(prev => ({ ...prev, enabled: !prev.enabled }));
  };

  const toggleRule = (ruleId) => {
    setFirewallRules(prev => prev.map(rule => 
      rule.id === ruleId ? { ...rule, enabled: !rule.enabled } : rule
    ));
  };

  const unblockIP = (ip) => {
    setBlockedIPs(prev => prev.filter(blocked => blocked.ip !== ip));
  };

  const getActionColor = (action) => {
    switch (action) {
      case 'ALLOW': return 'text-green-600 bg-green-100';
      case 'DENY': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getStateColor = (state) => {
    switch (state) {
      case 'ESTABLISHED': return 'text-green-600 bg-green-100';
      case 'BLOCKED': return 'text-red-600 bg-red-100';
      case 'LISTENING': return 'text-blue-600 bg-blue-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <EnhancedNavigation />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Firewall Manager</h1>
          <p className="mt-2 text-gray-600">Monitor and manage firewall rules, connections, and security policies</p>
        </div>

        {/* Status Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className={`w-3 h-3 rounded-full mr-3 ${firewallStatus.enabled ? 'bg-green-500' : 'bg-red-500'}`}></div>
              <div>
                <p className="text-sm font-medium text-gray-600">Firewall Status</p>
                <p className="text-2xl font-bold text-gray-900">
                  {firewallStatus.enabled ? 'Active' : 'Disabled'}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="w-3 h-3 rounded-full bg-blue-500 mr-3"></div>
              <div>
                <p className="text-sm font-medium text-gray-600">Active Rules</p>
                <p className="text-2xl font-bold text-gray-900">{firewallStatus.totalRules}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="w-3 h-3 rounded-full bg-green-500 mr-3"></div>
              <div>
                <p className="text-sm font-medium text-gray-600">Active Connections</p>
                <p className="text-2xl font-bold text-gray-900">{firewallStatus.activeConnections}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="w-3 h-3 rounded-full bg-red-500 mr-3"></div>
              <div>
                <p className="text-sm font-medium text-gray-600">Blocked Today</p>
                <p className="text-2xl font-bold text-gray-900">{firewallStatus.blockedAttempts}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center space-x-4">
              <button
                onClick={toggleFirewall}
                className={`px-4 py-2 rounded-md font-medium ${
                  firewallStatus.enabled 
                    ? 'bg-red-600 text-white hover:bg-red-700' 
                    : 'bg-green-600 text-white hover:bg-green-700'
                }`}
              >
                {firewallStatus.enabled ? 'Disable Firewall' : 'Enable Firewall'}
              </button>
              
              <select 
                value={firewallStatus.profile}
                onChange={(e) => setFirewallStatus(prev => ({ ...prev, profile: e.target.value }))}
                className="border border-gray-300 rounded-md px-3 py-2"
              >
                <option value="permissive">Permissive</option>
                <option value="balanced">Balanced</option>
                <option value="strict">Strict</option>
              </select>
            </div>

            <div className="flex items-center space-x-4">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={autoRefresh}
                  onChange={(e) => setAutoRefresh(e.target.checked)}
                  className="mr-2"
                />
                Auto-refresh
              </label>
              
              <button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
                Export Logs
              </button>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="bg-white rounded-lg shadow mb-8">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8 px-6">
              {[
                { id: 'rules', name: 'Firewall Rules' },
                { id: 'connections', name: 'Active Connections' },
                { id: 'blocked', name: 'Blocked IPs' },
                { id: 'threats', name: 'Threat Intelligence' }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  {tab.name}
                </button>
              ))}
            </nav>
          </div>

          <div className="p-6">
            {activeTab === 'rules' && (
              <div>
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-medium text-gray-900">Firewall Rules</h3>
                  <button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
                    Add Rule
                  </button>
                </div>
                
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Protocol</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Port</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Source</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Priority</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {firewallRules.map((rule) => (
                        <tr key={rule.id}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{rule.name}</td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2 py-1 text-xs font-medium rounded-full ${getActionColor(rule.action)}`}>
                              {rule.action}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{rule.protocol}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{rule.port}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{rule.source}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{rule.priority}</td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                              rule.enabled ? 'text-green-600 bg-green-100' : 'text-red-600 bg-red-100'
                            }`}>
                              {rule.enabled ? 'Enabled' : 'Disabled'}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <button
                              onClick={() => toggleRule(rule.id)}
                              className="text-blue-600 hover:text-blue-900 mr-3"
                            >
                              {rule.enabled ? 'Disable' : 'Enable'}
                            </button>
                            <button className="text-red-600 hover:text-red-900">Delete</button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {activeTab === 'connections' && (
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Active Connections</h3>
                
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Source IP</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Destination</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Protocol</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ports</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">State</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Duration</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Data</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {activeConnections.map((conn) => (
                        <tr key={conn.id}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{conn.sourceIP}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{conn.destIP}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{conn.protocol}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{conn.sourcePort} → {conn.destPort}</td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStateColor(conn.state)}`}>
                              {conn.state}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{conn.duration}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{conn.bytes}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {activeTab === 'blocked' && (
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Blocked IP Addresses</h3>
                
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">IP Address</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Country</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Attempts</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Last Attempt</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Reason</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {blockedIPs.map((blocked, index) => (
                        <tr key={index}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{blocked.ip}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{blocked.country}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{blocked.attempts}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{blocked.lastAttempt}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{blocked.reason}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <button
                              onClick={() => unblockIP(blocked.ip)}
                              className="text-blue-600 hover:text-blue-900"
                            >
                              Unblock
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {activeTab === 'threats' && (
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Threat Intelligence</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {threatIntel.map((intel, index) => (
                    <div key={index} className="bg-gray-50 rounded-lg p-6">
                      <h4 className="text-lg font-medium text-gray-900 mb-2">{intel.type}</h4>
                      <p className="text-sm text-gray-600 mb-4">Source: {intel.source}</p>
                      
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">Threats Identified:</span>
                          <span className="text-sm font-medium text-gray-900">{intel.threats}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">Blocked:</span>
                          <span className="text-sm font-medium text-green-600">{intel.blocked}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">Last Update:</span>
                          <span className="text-sm text-gray-900">{intel.lastUpdate}</span>
                        </div>
                      </div>
                      
                      <div className="mt-4">
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-green-600 h-2 rounded-full" 
                            style={{ width: `${(intel.blocked / intel.threats) * 100}%` }}
                          ></div>
                        </div>
                        <p className="text-xs text-gray-600 mt-1">
                          {((intel.blocked / intel.threats) * 100).toFixed(1)}% blocked
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default FirewallManager;
