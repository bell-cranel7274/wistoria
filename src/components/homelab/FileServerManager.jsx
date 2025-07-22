import React, { useState, useEffect } from 'react';
import { EnhancedNavigation } from '../navigation/EnhancedNavigation';

export const FileServerManager = () => {
  const [shares, setShares] = useState([]);
  const [connections, setConnections] = useState([]);
  const [permissions, setPermissions] = useState([]);
  const [selectedShare, setSelectedShare] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [autoRefresh, setAutoRefresh] = useState(true);

  useEffect(() => {
    // Simulate loading data
    const timer = setTimeout(() => {
      setShares([
        {
          id: 1,
          name: 'Media',
          path: '/mnt/storage/media',
          protocol: 'SMB',
          size: '2.4TB',
          available: '800GB',
          users: 5,
          status: 'active',
          permissions: 'read-write'
        },
        {
          id: 2,
          name: 'Documents',
          path: '/mnt/storage/documents',
          protocol: 'NFS',
          size: '500GB',
          available: '200GB',
          users: 12,
          status: 'active',
          permissions: 'read-only'
        },
        {
          id: 3,
          name: 'Backup',
          path: '/mnt/backup/shared',
          protocol: 'FTP',
          size: '5TB',
          available: '1.2TB',
          users: 3,
          status: 'maintenance',
          permissions: 'admin-only'
        },
        {
          id: 4,
          name: 'Projects',
          path: '/mnt/storage/projects',
          protocol: 'SMB',
          size: '1TB',
          available: '400GB',
          users: 8,
          status: 'active',
          permissions: 'read-write'
        }
      ]);

      setConnections([
        { id: 1, user: 'alice', share: 'Media', ip: '192.168.1.101', connected: '2h 15m', activity: 'streaming' },
        { id: 2, user: 'bob', share: 'Documents', ip: '192.168.1.102', connected: '45m', activity: 'reading' },
        { id: 3, user: 'charlie', share: 'Projects', ip: '192.168.1.103', connected: '1h 30m', activity: 'editing' },
        { id: 4, user: 'dave', share: 'Media', ip: '192.168.1.104', connected: '30m', activity: 'downloading' }
      ]);

      setPermissions([
        { id: 1, user: 'alice', shares: ['Media', 'Documents'], role: 'user', lastAccess: '2024-01-15 14:30' },
        { id: 2, user: 'bob', shares: ['Documents'], role: 'guest', lastAccess: '2024-01-15 13:45' },
        { id: 3, user: 'charlie', shares: ['Projects', 'Documents'], role: 'admin', lastAccess: '2024-01-15 15:00' },
        { id: 4, user: 'dave', shares: ['Media'], role: 'user', lastAccess: '2024-01-15 14:45' }
      ]);

      setIsLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(() => {
      // Simulate real-time updates
      setConnections(prev => prev.map(conn => ({
        ...conn,
        connected: Math.floor(Math.random() * 180) + 'm'
      })));
    }, 30000);

    return () => clearInterval(interval);
  }, [autoRefresh]);

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'text-green-500';
      case 'maintenance': return 'text-yellow-500';
      case 'offline': return 'text-red-500';
      default: return 'text-gray-500';
    }
  };

  const getProtocolIcon = (protocol) => {
    switch (protocol) {
      case 'SMB': return '🗂️';
      case 'NFS': return '🔗';
      case 'FTP': return '📁';
      default: return '📂';
    }
  };

  const handleCreateShare = () => {
    // Simulate creating new share
    const newShare = {
      id: shares.length + 1,
      name: 'New Share',
      path: '/mnt/storage/new',
      protocol: 'SMB',
      size: '100GB',
      available: '100GB',
      users: 0,
      status: 'active',
      permissions: 'read-write'
    };
    setShares([...shares, newShare]);
  };

  const handleDeleteShare = (shareId) => {
    setShares(shares.filter(share => share.id !== shareId));
  };

  const handleKickUser = (connectionId) => {
    setConnections(connections.filter(conn => conn.id !== connectionId));
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-900 text-white p-8">
        <div className="flex items-center justify-center h-64">
          <div className="text-xl">Loading file server data...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <EnhancedNavigation />
      
      <div className="container mx-auto px-6 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">File Server Manager</h1>
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
            <button
              onClick={handleCreateShare}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
            >
              Create Share
            </button>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-gray-800 p-6 rounded-lg">
            <h3 className="text-lg font-semibold mb-2">Active Shares</h3>
            <p className="text-3xl font-bold text-blue-400">{shares.filter(s => s.status === 'active').length}</p>
          </div>
          <div className="bg-gray-800 p-6 rounded-lg">
            <h3 className="text-lg font-semibold mb-2">Active Connections</h3>
            <p className="text-3xl font-bold text-green-400">{connections.length}</p>
          </div>
          <div className="bg-gray-800 p-6 rounded-lg">
            <h3 className="text-lg font-semibold mb-2">Total Storage</h3>
            <p className="text-3xl font-bold text-purple-400">8.9TB</p>
          </div>
          <div className="bg-gray-800 p-6 rounded-lg">
            <h3 className="text-lg font-semibold mb-2">Available Space</h3>
            <p className="text-3xl font-bold text-yellow-400">2.6TB</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* File Shares */}
          <div className="bg-gray-800 p-6 rounded-lg">
            <h2 className="text-xl font-semibold mb-4">File Shares</h2>
            <div className="space-y-4">
              {shares.map((share) => (
                <div key={share.id} className="bg-gray-700 p-4 rounded-lg">
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex items-center">
                      <span className="text-2xl mr-3">{getProtocolIcon(share.protocol)}</span>
                      <div>
                        <h3 className="font-semibold">{share.name}</h3>
                        <p className="text-sm text-gray-400">{share.path}</p>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => setSelectedShare(share)}
                        className="px-3 py-1 bg-blue-600 hover:bg-blue-700 rounded text-sm transition-colors"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteShare(share.id)}
                        className="px-3 py-1 bg-red-600 hover:bg-red-700 rounded text-sm transition-colors"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-400">Protocol:</span> {share.protocol}
                    </div>
                    <div>
                      <span className="text-gray-400">Users:</span> {share.users}
                    </div>
                    <div>
                      <span className="text-gray-400">Size:</span> {share.size}
                    </div>
                    <div>
                      <span className="text-gray-400">Available:</span> {share.available}
                    </div>
                  </div>
                  <div className="mt-2 flex justify-between items-center">
                    <span className={`text-sm ${getStatusColor(share.status)}`}>
                      ● {share.status}
                    </span>
                    <span className="text-sm text-gray-400">{share.permissions}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Active Connections */}
          <div className="bg-gray-800 p-6 rounded-lg">
            <h2 className="text-xl font-semibold mb-4">Active Connections</h2>
            <div className="space-y-4">
              {connections.map((conn) => (
                <div key={conn.id} className="bg-gray-700 p-4 rounded-lg">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h3 className="font-semibold">{conn.user}</h3>
                      <p className="text-sm text-gray-400">{conn.ip}</p>
                    </div>
                    <button
                      onClick={() => handleKickUser(conn.id)}
                      className="px-3 py-1 bg-red-600 hover:bg-red-700 rounded text-sm transition-colors"
                    >
                      Kick
                    </button>
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-400">Share:</span> {conn.share}
                    </div>
                    <div>
                      <span className="text-gray-400">Connected:</span> {conn.connected}
                    </div>
                    <div className="col-span-2">
                      <span className="text-gray-400">Activity:</span> {conn.activity}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* User Permissions */}
        <div className="bg-gray-800 p-6 rounded-lg">
          <h2 className="text-xl font-semibold mb-4">User Permissions</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-700">
                  <th className="text-left py-2">User</th>
                  <th className="text-left py-2">Role</th>
                  <th className="text-left py-2">Shares</th>
                  <th className="text-left py-2">Last Access</th>
                  <th className="text-left py-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {permissions.map((perm) => (
                  <tr key={perm.id} className="border-b border-gray-700">
                    <td className="py-2">{perm.user}</td>
                    <td className="py-2">
                      <span className={`px-2 py-1 rounded text-xs ${
                        perm.role === 'admin' ? 'bg-red-600' : 
                        perm.role === 'user' ? 'bg-blue-600' : 'bg-gray-600'
                      }`}>
                        {perm.role}
                      </span>
                    </td>
                    <td className="py-2">{perm.shares.join(', ')}</td>
                    <td className="py-2">{perm.lastAccess}</td>
                    <td className="py-2">
                      <div className="flex space-x-2">
                        <button className="px-2 py-1 bg-blue-600 hover:bg-blue-700 rounded text-xs transition-colors">
                          Edit
                        </button>
                        <button className="px-2 py-1 bg-red-600 hover:bg-red-700 rounded text-xs transition-colors">
                          Remove
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
