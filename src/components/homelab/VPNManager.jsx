import React, { useState, useEffect } from 'react';
import { EnhancedNavigation } from '../navigation/EnhancedNavigation';

export const VPNManager = () => {
  const [vpnServers, setVpnServers] = useState([]);
  const [activeConnections, setActiveConnections] = useState([]);
  const [vpnUsers, setVpnUsers] = useState([]);
  const [serverLogs, setServerLogs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [selectedServer, setSelectedServer] = useState(null);

  useEffect(() => {
    // Simulate loading data
    const timer = setTimeout(() => {
      setVpnServers([
        {
          id: 1,
          name: 'OpenVPN-Main',
          protocol: 'OpenVPN',
          port: 1194,
          status: 'running',
          clients: 12,
          maxClients: 50,
          bytesIn: '2.4GB',
          bytesOut: '8.1GB',
          uptime: '15d 8h 32m'
        },
        {
          id: 2,
          name: 'WireGuard-Fast',
          protocol: 'WireGuard',
          port: 51820,
          status: 'running',
          clients: 8,
          maxClients: 25,
          bytesIn: '1.2GB',
          bytesOut: '3.6GB',
          uptime: '7d 14h 15m'
        },
        {
          id: 3,
          name: 'L2TP-Legacy',
          protocol: 'L2TP/IPSec',
          port: 1701,
          status: 'stopped',
          clients: 0,
          maxClients: 10,
          bytesIn: '0B',
          bytesOut: '0B',
          uptime: '0h 0m'
        }
      ]);

      setActiveConnections([
        {
          id: 1,
          user: 'alice',
          server: 'OpenVPN-Main',
          clientIP: '10.8.0.2',
          realIP: '203.0.113.45',
          connected: '2h 15m',
          bytesIn: '45MB',
          bytesOut: '120MB'
        },
        {
          id: 2,
          user: 'bob',
          server: 'WireGuard-Fast',
          clientIP: '10.7.0.3',
          realIP: '198.51.100.78',
          connected: '45m',
          bytesIn: '12MB',
          bytesOut: '35MB'
        },
        {
          id: 3,
          user: 'charlie',
          server: 'OpenVPN-Main',
          clientIP: '10.8.0.4',
          realIP: '192.0.2.156',
          connected: '1h 30m',
          bytesIn: '78MB',
          bytesOut: '234MB'
        }
      ]);

      setVpnUsers([
        {
          id: 1,
          username: 'alice',
          email: 'alice@example.com',
          status: 'active',
          lastSeen: '2024-01-15 14:30',
          totalSessions: 145,
          dataUsed: '12.5GB'
        },
        {
          id: 2,
          username: 'bob',
          email: 'bob@example.com',
          status: 'active',
          lastSeen: '2024-01-15 13:45',
          totalSessions: 89,
          dataUsed: '8.2GB'
        },
        {
          id: 3,
          username: 'charlie',
          email: 'charlie@example.com',
          status: 'suspended',
          lastSeen: '2024-01-14 16:20',
          totalSessions: 67,
          dataUsed: '5.8GB'
        }
      ]);

      setServerLogs([
        { id: 1, timestamp: '2024-01-15 14:35', level: 'INFO', server: 'OpenVPN-Main', message: 'Client alice connected from 203.0.113.45' },
        { id: 2, timestamp: '2024-01-15 14:30', level: 'INFO', server: 'WireGuard-Fast', message: 'Client bob authenticated successfully' },
        { id: 3, timestamp: '2024-01-15 14:25', level: 'WARN', server: 'OpenVPN-Main', message: 'Failed authentication attempt from 192.0.2.100' },
        { id: 4, timestamp: '2024-01-15 14:20', level: 'INFO', server: 'OpenVPN-Main', message: 'Client charlie disconnected after 2h 45m' }
      ]);

      setIsLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(() => {
      // Simulate real-time updates
      setActiveConnections(prev => prev.map(conn => ({
        ...conn,
        bytesIn: `${Math.floor(Math.random() * 200)}MB`,
        bytesOut: `${Math.floor(Math.random() * 500)}MB`
      })));
    }, 30000);

    return () => clearInterval(interval);
  }, [autoRefresh]);

  const getStatusColor = (status) => {
    switch (status) {
      case 'running': return 'text-green-500';
      case 'stopped': return 'text-red-500';
      case 'active': return 'text-green-500';
      case 'suspended': return 'text-yellow-500';
      default: return 'text-gray-500';
    }
  };

  const getLogLevelColor = (level) => {
    switch (level) {
      case 'INFO': return 'text-blue-400';
      case 'WARN': return 'text-yellow-400';
      case 'ERROR': return 'text-red-400';
      default: return 'text-gray-400';
    }
  };

  const handleStartServer = (serverId) => {
    setVpnServers(prev => prev.map(server => 
      server.id === serverId ? { ...server, status: 'running' } : server
    ));
  };

  const handleStopServer = (serverId) => {
    setVpnServers(prev => prev.map(server => 
      server.id === serverId ? { ...server, status: 'stopped', clients: 0 } : server
    ));
  };

  const handleKickUser = (connectionId) => {
    setActiveConnections(prev => prev.filter(conn => conn.id !== connectionId));
  };

  const handleToggleUserStatus = (userId) => {
    setVpnUsers(prev => prev.map(user => 
      user.id === userId ? {
        ...user,
        status: user.status === 'active' ? 'suspended' : 'active'
      } : user
    ));
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-900 text-white p-8">
        <div className="flex items-center justify-center h-64">
          <div className="text-xl">Loading VPN data...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <EnhancedNavigation />
      
      <div className="container mx-auto px-6 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">VPN Manager</h1>
          <div className="flex items-center space-x-4">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={autoRefresh}
                onChange={(e) => setAutoRefresh(e.target.checked)}
                className="mr-2"
              />
              Auto Refresh
            </label>
            <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors">
              Add Server
            </button>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-gray-800 p-6 rounded-lg">
            <h3 className="text-lg font-semibold mb-2">Running Servers</h3>
            <p className="text-3xl font-bold text-green-400">
              {vpnServers.filter(s => s.status === 'running').length}
            </p>
          </div>
          <div className="bg-gray-800 p-6 rounded-lg">
            <h3 className="text-lg font-semibold mb-2">Active Connections</h3>
            <p className="text-3xl font-bold text-blue-400">{activeConnections.length}</p>
          </div>
          <div className="bg-gray-800 p-6 rounded-lg">
            <h3 className="text-lg font-semibold mb-2">Total Users</h3>
            <p className="text-3xl font-bold text-purple-400">{vpnUsers.length}</p>
          </div>
          <div className="bg-gray-800 p-6 rounded-lg">
            <h3 className="text-lg font-semibold mb-2">Data Transfer</h3>
            <p className="text-3xl font-bold text-yellow-400">15.2GB</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* VPN Servers */}
          <div className="bg-gray-800 p-6 rounded-lg">
            <h2 className="text-xl font-semibold mb-4">VPN Servers</h2>
            <div className="space-y-4">
              {vpnServers.map((server) => (
                <div key={server.id} className="bg-gray-700 p-4 rounded-lg">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h3 className="font-semibold text-lg">{server.name}</h3>
                      <p className="text-sm text-gray-400">{server.protocol} - Port {server.port}</p>
                    </div>
                    <div className="flex space-x-2">
                      {server.status === 'running' ? (
                        <button
                          onClick={() => handleStopServer(server.id)}
                          className="px-3 py-1 bg-red-600 hover:bg-red-700 rounded text-sm transition-colors"
                        >
                          Stop
                        </button>
                      ) : (
                        <button
                          onClick={() => handleStartServer(server.id)}
                          className="px-3 py-1 bg-green-600 hover:bg-green-700 rounded text-sm transition-colors"
                        >
                          Start
                        </button>
                      )}
                      <button
                        onClick={() => setSelectedServer(server)}
                        className="px-3 py-1 bg-blue-600 hover:bg-blue-700 rounded text-sm transition-colors"
                      >
                        Config
                      </button>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-400">Status:</span>
                      <span className={`ml-2 ${getStatusColor(server.status)}`}>
                        ● {server.status}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-400">Uptime:</span>
                      <span className="ml-2">{server.uptime}</span>
                    </div>
                    <div>
                      <span className="text-gray-400">Clients:</span>
                      <span className="ml-2">{server.clients}/{server.maxClients}</span>
                    </div>
                    <div>
                      <span className="text-gray-400">Transfer:</span>
                      <span className="ml-2">↓{server.bytesIn} ↑{server.bytesOut}</span>
                    </div>
                  </div>
                  <div className="mt-3">
                    <div className="w-full bg-gray-600 rounded-full h-2">
                      <div 
                        className="bg-blue-500 h-2 rounded-full" 
                        style={{ width: `${(server.clients / server.maxClients) * 100}%` }}
                      ></div>
                    </div>
                    <p className="text-xs text-gray-400 mt-1">
                      {Math.round((server.clients / server.maxClients) * 100)}% capacity
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Active Connections */}
          <div className="bg-gray-800 p-6 rounded-lg">
            <h2 className="text-xl font-semibold mb-4">Active Connections</h2>
            <div className="space-y-4">
              {activeConnections.map((conn) => (
                <div key={conn.id} className="bg-gray-700 p-4 rounded-lg">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h3 className="font-semibold">{conn.user}</h3>
                      <p className="text-sm text-gray-400">{conn.server}</p>
                    </div>
                    <button
                      onClick={() => handleKickUser(conn.id)}
                      className="px-3 py-1 bg-red-600 hover:bg-red-700 rounded text-sm transition-colors"
                    >
                      Disconnect
                    </button>
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-400">VPN IP:</span>
                      <span className="ml-2">{conn.clientIP}</span>
                    </div>
                    <div>
                      <span className="text-gray-400">Real IP:</span>
                      <span className="ml-2">{conn.realIP}</span>
                    </div>
                    <div>
                      <span className="text-gray-400">Connected:</span>
                      <span className="ml-2">{conn.connected}</span>
                    </div>
                    <div>
                      <span className="text-gray-400">Transfer:</span>
                      <span className="ml-2">↓{conn.bytesIn} ↑{conn.bytesOut}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* VPN Users */}
          <div className="bg-gray-800 p-6 rounded-lg">
            <h2 className="text-xl font-semibold mb-4">VPN Users</h2>
            <div className="space-y-4">
              {vpnUsers.map((user) => (
                <div key={user.id} className="bg-gray-700 p-4 rounded-lg">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h3 className="font-semibold">{user.username}</h3>
                      <p className="text-sm text-gray-400">{user.email}</p>
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleToggleUserStatus(user.id)}
                        className={`px-3 py-1 rounded text-sm transition-colors ${
                          user.status === 'active' 
                            ? 'bg-yellow-600 hover:bg-yellow-700' 
                            : 'bg-green-600 hover:bg-green-700'
                        }`}
                      >
                        {user.status === 'active' ? 'Suspend' : 'Activate'}
                      </button>
                      <button className="px-3 py-1 bg-blue-600 hover:bg-blue-700 rounded text-sm transition-colors">
                        Edit
                      </button>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-400">Status:</span>
                      <span className={`ml-2 ${getStatusColor(user.status)}`}>
                        ● {user.status}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-400">Last Seen:</span>
                      <span className="ml-2">{user.lastSeen}</span>
                    </div>
                    <div>
                      <span className="text-gray-400">Sessions:</span>
                      <span className="ml-2">{user.totalSessions}</span>
                    </div>
                    <div>
                      <span className="text-gray-400">Data Used:</span>
                      <span className="ml-2">{user.dataUsed}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Server Logs */}
          <div className="bg-gray-800 p-6 rounded-lg">
            <h2 className="text-xl font-semibold mb-4">Server Logs</h2>
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {serverLogs.map((log) => (
                <div key={log.id} className="bg-gray-700 p-3 rounded text-sm">
                  <div className="flex justify-between items-start mb-1">
                    <span className="text-gray-400">{log.timestamp}</span>
                    <span className={getLogLevelColor(log.level)}>{log.level}</span>
                  </div>
                  <div className="text-blue-400 text-xs mb-1">{log.server}</div>
                  <div className="text-gray-200">{log.message}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
