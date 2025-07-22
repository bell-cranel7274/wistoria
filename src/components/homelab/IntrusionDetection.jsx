import React, { useState, useEffect } from 'react';
import { EnhancedNavigation } from '../navigation/EnhancedNavigation';

const IntrusionDetection = () => {
  const [activeTab, setActiveTab] = useState('alerts');
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [refreshInterval] = useState(3000);
  const [systemStatus, setSystemStatus] = useState({
    enabled: true,
    mode: 'active',
    alertLevel: 'medium',
    totalAlerts: 23,
    criticalAlerts: 3,
    activeThreats: 7,
    lastScan: '2024-06-04 14:35:00'
  });

  const [securityAlerts, setSecurityAlerts] = useState([
    {
      id: 1,
      timestamp: '2024-06-04 14:34:15',
      severity: 'critical',
      type: 'Brute Force Attack',
      source: '103.45.12.89',
      target: '192.168.1.100:22',
      description: 'Multiple failed SSH login attempts detected',
      status: 'active',
      actions: 'IP blocked automatically'
    },
    {
      id: 2,
      timestamp: '2024-06-04 14:31:42',
      severity: 'high',
      type: 'Port Scan',
      source: '185.220.100.240',
      target: '192.168.1.0/24',
      description: 'Systematic port scanning detected',
      status: 'investigating',
      actions: 'Traffic monitoring increased'
    },
    {
      id: 3,
      timestamp: '2024-06-04 14:28:30',
      severity: 'medium',
      type: 'Suspicious Traffic',
      source: '45.132.75.19',
      target: '192.168.1.50:80',
      description: 'Unusual HTTP request patterns',
      status: 'resolved',
      actions: 'User agent blacklisted'
    },
    {
      id: 4,
      timestamp: '2024-06-04 14:25:18',
      severity: 'low',
      type: 'Failed Authentication',
      source: '192.168.1.25',
      target: '192.168.1.1:443',
      description: 'Multiple failed web login attempts',
      status: 'monitoring',
      actions: 'User notified'
    }
  ]);

  const [trafficAnalysis, setTrafficAnalysis] = useState([
    {
      protocol: 'HTTP',
      requests: 15432,
      suspicious: 47,
      blocked: 23,
      avgResponseTime: '245ms'
    },
    {
      protocol: 'HTTPS',
      requests: 8921,
      suspicious: 12,
      blocked: 8,
      avgResponseTime: '189ms'
    },
    {
      protocol: 'SSH',
      requests: 234,
      suspicious: 89,
      blocked: 67,
      avgResponseTime: '1.2s'
    },
    {
      protocol: 'FTP',
      requests: 156,
      suspicious: 34,
      blocked: 28,
      avgResponseTime: '890ms'
    }
  ]);

  const [detectionRules, setDetectionRules] = useState([
    {
      id: 1,
      name: 'SSH Brute Force',
      category: 'Authentication',
      enabled: true,
      threshold: '5 attempts/minute',
      action: 'Block IP',
      matches: 47,
      lastTriggered: '2024-06-04 14:34:15'
    },
    {
      id: 2,
      name: 'Port Scan Detection',
      category: 'Network',
      enabled: true,
      threshold: '10 ports/second',
      action: 'Alert + Monitor',
      matches: 23,
      lastTriggered: '2024-06-04 14:31:42'
    },
    {
      id: 3,
      name: 'SQL Injection',
      category: 'Web Application',
      enabled: true,
      threshold: 'Pattern match',
      action: 'Block Request',
      matches: 12,
      lastTriggered: '2024-06-04 13:45:30'
    },
    {
      id: 4,
      name: 'DDoS Protection',
      category: 'Network',
      enabled: true,
      threshold: '1000 req/min',
      action: 'Rate Limit',
      matches: 8,
      lastTriggered: '2024-06-04 12:22:18'
    },
    {
      id: 5,
      name: 'Malware Signature',
      category: 'File Transfer',
      enabled: false,
      threshold: 'Hash match',
      action: 'Quarantine',
      matches: 0,
      lastTriggered: 'Never'
    }
  ]);

  const [threatHunting, setThreatHunting] = useState([
    {
      query: 'Reconnaissance Activity',
      indicators: ['Port scans', 'Service enumeration', 'Banner grabbing'],
      findings: 15,
      risk: 'medium',
      lastRun: '2024-06-04 14:30:00'
    },
    {
      query: 'Lateral Movement',
      indicators: ['Internal SSH', 'SMB enumeration', 'Credential access'],
      findings: 3,
      risk: 'high',
      lastRun: '2024-06-04 14:25:00'
    },
    {
      query: 'Data Exfiltration',
      indicators: ['Large transfers', 'Unusual destinations', 'Off-hours activity'],
      findings: 1,
      risk: 'critical',
      lastRun: '2024-06-04 14:20:00'
    }
  ]);

  const [forensicsData, setForensicsData] = useState([
    {
      timestamp: '2024-06-04 14:34:15',
      event: 'Failed SSH Login',
      source: '103.45.12.89',
      user: 'root',
      details: 'Authentication failure from suspicious IP',
      artifacts: ['auth.log', 'network.pcap']
    },
    {
      timestamp: '2024-06-04 14:31:42',
      event: 'Port Scan Detected',
      source: '185.220.100.240',
      user: 'N/A',
      details: 'Systematic scan of ports 1-1024',
      artifacts: ['firewall.log', 'network.pcap']
    },
    {
      timestamp: '2024-06-04 14:28:30',
      event: 'HTTP Anomaly',
      source: '45.132.75.19',
      user: 'anonymous',
      details: 'Unusual user agent and request patterns',
      artifacts: ['access.log', 'web.pcap']
    }
  ]);

  // Simulate real-time updates
  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(() => {
      // Update system status
      setSystemStatus(prev => ({
        ...prev,
        totalAlerts: prev.totalAlerts + Math.floor(Math.random() * 3),
        activeThreats: Math.max(0, prev.activeThreats + Math.floor(Math.random() * 3) - 1),
        lastScan: new Date().toLocaleString()
      }));

      // Simulate new alerts
      if (Math.random() < 0.4) {
        const alertTypes = ['Brute Force Attack', 'Port Scan', 'Suspicious Traffic', 'SQL Injection', 'DDoS Attempt'];
        const severities = ['low', 'medium', 'high', 'critical'];
        
        const newAlert = {
          id: Date.now(),
          timestamp: new Date().toLocaleString(),
          severity: severities[Math.floor(Math.random() * severities.length)],
          type: alertTypes[Math.floor(Math.random() * alertTypes.length)],
          source: `${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`,
          target: '192.168.1.100:80',
          description: 'Automated threat detection triggered',
          status: 'active',
          actions: 'Under investigation'
        };

        setSecurityAlerts(prev => [newAlert, ...prev.slice(0, 9)]);
      }
    }, refreshInterval);

    return () => clearInterval(interval);
  }, [autoRefresh, refreshInterval]);

  const toggleSystem = () => {
    setSystemStatus(prev => ({ ...prev, enabled: !prev.enabled }));
  };

  const toggleRule = (ruleId) => {
    setDetectionRules(prev => prev.map(rule => 
      rule.id === ruleId ? { ...rule, enabled: !rule.enabled } : rule
    ));
  };

  const acknowledgeAlert = (alertId) => {
    setSecurityAlerts(prev => prev.map(alert => 
      alert.id === alertId ? { ...alert, status: 'acknowledged' } : alert
    ));
  };

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'critical': return 'text-red-600 bg-red-100';
      case 'high': return 'text-orange-600 bg-orange-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      case 'low': return 'text-blue-600 bg-blue-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'text-red-600 bg-red-100';
      case 'investigating': return 'text-yellow-600 bg-yellow-100';
      case 'resolved': return 'text-green-600 bg-green-100';
      case 'acknowledged': return 'text-blue-600 bg-blue-100';
      case 'monitoring': return 'text-purple-600 bg-purple-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getRiskColor = (risk) => {
    switch (risk) {
      case 'critical': return 'text-red-600 bg-red-100';
      case 'high': return 'text-orange-600 bg-orange-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      case 'low': return 'text-green-600 bg-green-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <EnhancedNavigation />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Intrusion Detection System</h1>
          <p className="mt-2 text-gray-600">Monitor and analyze security threats, suspicious activities, and network intrusions</p>
        </div>

        {/* Status Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className={`w-3 h-3 rounded-full mr-3 ${systemStatus.enabled ? 'bg-green-500' : 'bg-red-500'}`}></div>
              <div>
                <p className="text-sm font-medium text-gray-600">IDS Status</p>
                <p className="text-2xl font-bold text-gray-900">
                  {systemStatus.enabled ? 'Active' : 'Disabled'}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="w-3 h-3 rounded-full bg-red-500 mr-3"></div>
              <div>
                <p className="text-sm font-medium text-gray-600">Critical Alerts</p>
                <p className="text-2xl font-bold text-gray-900">{systemStatus.criticalAlerts}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="w-3 h-3 rounded-full bg-orange-500 mr-3"></div>
              <div>
                <p className="text-sm font-medium text-gray-600">Active Threats</p>
                <p className="text-2xl font-bold text-gray-900">{systemStatus.activeThreats}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="w-3 h-3 rounded-full bg-blue-500 mr-3"></div>
              <div>
                <p className="text-sm font-medium text-gray-600">Total Alerts</p>
                <p className="text-2xl font-bold text-gray-900">{systemStatus.totalAlerts}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center space-x-4">
              <button
                onClick={toggleSystem}
                className={`px-4 py-2 rounded-md font-medium ${
                  systemStatus.enabled 
                    ? 'bg-red-600 text-white hover:bg-red-700' 
                    : 'bg-green-600 text-white hover:bg-green-700'
                }`}
              >
                {systemStatus.enabled ? 'Disable IDS' : 'Enable IDS'}
              </button>
              
              <select 
                value={systemStatus.mode}
                onChange={(e) => setSystemStatus(prev => ({ ...prev, mode: e.target.value }))}
                className="border border-gray-300 rounded-md px-3 py-2"
              >
                <option value="passive">Passive</option>
                <option value="active">Active</option>
                <option value="hybrid">Hybrid</option>
              </select>

              <select 
                value={systemStatus.alertLevel}
                onChange={(e) => setSystemStatus(prev => ({ ...prev, alertLevel: e.target.value }))}
                className="border border-gray-300 rounded-md px-3 py-2"
              >
                <option value="low">Low Sensitivity</option>
                <option value="medium">Medium Sensitivity</option>
                <option value="high">High Sensitivity</option>
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
                Generate Report
              </button>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="bg-white rounded-lg shadow mb-8">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8 px-6">
              {[
                { id: 'alerts', name: 'Security Alerts' },
                { id: 'traffic', name: 'Traffic Analysis' },
                { id: 'rules', name: 'Detection Rules' },
                { id: 'hunting', name: 'Threat Hunting' },
                { id: 'forensics', name: 'Forensics' }
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
            {activeTab === 'alerts' && (
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Security Alerts</h3>
                
                <div className="space-y-4">
                  {securityAlerts.map((alert) => (
                    <div key={alert.id} className="bg-gray-50 rounded-lg p-6">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-2">
                            <span className={`px-2 py-1 text-xs font-medium rounded-full ${getSeverityColor(alert.severity)}`}>
                              {alert.severity.toUpperCase()}
                            </span>
                            <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(alert.status)}`}>
                              {alert.status.toUpperCase()}
                            </span>
                            <span className="text-sm text-gray-500">{alert.timestamp}</span>
                          </div>
                          
                          <h4 className="text-lg font-medium text-gray-900 mb-1">{alert.type}</h4>
                          <p className="text-gray-600 mb-2">{alert.description}</p>
                          
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                            <div>
                              <span className="font-medium text-gray-700">Source:</span>
                              <span className="ml-2 text-gray-900">{alert.source}</span>
                            </div>
                            <div>
                              <span className="font-medium text-gray-700">Target:</span>
                              <span className="ml-2 text-gray-900">{alert.target}</span>
                            </div>
                            <div>
                              <span className="font-medium text-gray-700">Actions:</span>
                              <span className="ml-2 text-gray-900">{alert.actions}</span>
                            </div>
                          </div>
                        </div>
                        
                        <div className="ml-4">
                          <button
                            onClick={() => acknowledgeAlert(alert.id)}
                            className="px-3 py-1 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700"
                            disabled={alert.status === 'acknowledged'}
                          >
                            {alert.status === 'acknowledged' ? 'Acknowledged' : 'Acknowledge'}
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'traffic' && (
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Traffic Analysis</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {trafficAnalysis.map((traffic, index) => (
                    <div key={index} className="bg-gray-50 rounded-lg p-6">
                      <h4 className="text-lg font-medium text-gray-900 mb-4">{traffic.protocol}</h4>
                      
                      <div className="space-y-3">
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">Total Requests:</span>
                          <span className="text-sm font-medium text-gray-900">{traffic.requests.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">Suspicious:</span>
                          <span className="text-sm font-medium text-yellow-600">{traffic.suspicious}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">Blocked:</span>
                          <span className="text-sm font-medium text-red-600">{traffic.blocked}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">Avg Response:</span>
                          <span className="text-sm font-medium text-gray-900">{traffic.avgResponseTime}</span>
                        </div>
                      </div>
                      
                      <div className="mt-4">
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-red-600 h-2 rounded-full" 
                            style={{ width: `${(traffic.blocked / traffic.suspicious) * 100}%` }}
                          ></div>
                        </div>
                        <p className="text-xs text-gray-600 mt-1">
                          {((traffic.blocked / traffic.suspicious) * 100).toFixed(1)}% of suspicious traffic blocked
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'rules' && (
              <div>
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-medium text-gray-900">Detection Rules</h3>
                  <button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
                    Add Rule
                  </button>
                </div>
                
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Threshold</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Matches</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {detectionRules.map((rule) => (
                        <tr key={rule.id}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{rule.name}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{rule.category}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{rule.threshold}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{rule.action}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{rule.matches}</td>
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

            {activeTab === 'hunting' && (
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Threat Hunting Queries</h3>
                
                <div className="space-y-6">
                  {threatHunting.map((hunt, index) => (
                    <div key={index} className="bg-gray-50 rounded-lg p-6">
                      <div className="flex items-start justify-between mb-4">
                        <h4 className="text-lg font-medium text-gray-900">{hunt.query}</h4>
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getRiskColor(hunt.risk)}`}>
                          {hunt.risk.toUpperCase()} RISK
                        </span>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <h5 className="text-sm font-medium text-gray-700 mb-2">Indicators of Compromise:</h5>
                          <ul className="list-disc list-inside text-sm text-gray-600 space-y-1">
                            {hunt.indicators.map((indicator, idx) => (
                              <li key={idx}>{indicator}</li>
                            ))}
                          </ul>
                        </div>
                        
                        <div>
                          <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                              <span className="font-medium text-gray-700">Findings:</span>
                              <span className="ml-2 text-gray-900">{hunt.findings}</span>
                            </div>
                            <div>
                              <span className="font-medium text-gray-700">Last Run:</span>
                              <span className="ml-2 text-gray-900">{hunt.lastRun}</span>
                            </div>
                          </div>
                          
                          <button className="mt-4 px-4 py-2 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700">
                            Run Query
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'forensics' && (
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Digital Forensics</h3>
                
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Timestamp</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Event</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Source</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Details</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Artifacts</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {forensicsData.map((data, index) => (
                        <tr key={index}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{data.timestamp}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{data.event}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{data.source}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{data.user}</td>
                          <td className="px-6 py-4 text-sm text-gray-900">{data.details}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {data.artifacts.map((artifact, idx) => (
                              <span key={idx} className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded mr-1 mb-1">
                                {artifact}
                              </span>
                            ))}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <button className="text-blue-600 hover:text-blue-900 mr-3">
                              Analyze
                            </button>
                            <button className="text-green-600 hover:text-green-900">
                              Export
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default IntrusionDetection;
