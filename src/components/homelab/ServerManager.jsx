import React, { useState } from 'react';
import { ArrowLeft, Server, Play, Square, RotateCcw, Trash2, Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Card } from '../ui/card';

export const ServerManager = () => {
  const navigate = useNavigate();
  const [servers, setServers] = useState([
    {
      id: 1,
      name: 'Main Server',
      status: 'running',
      cpu: '45%',
      memory: '8.2GB / 16GB',
      uptime: '15 days, 4 hours',
      services: ['Docker', 'SSH', 'Web Server']
    },
    {
      id: 2,
      name: 'Media Server',
      status: 'running',
      cpu: '23%',
      memory: '4.1GB / 8GB',
      uptime: '12 days, 2 hours',
      services: ['Plex', 'Jellyfin', 'Transmission']
    },
    {
      id: 3,
      name: 'Pi-hole',
      status: 'running',
      cpu: '8%',
      memory: '512MB / 2GB',
      uptime: '25 days, 8 hours',
      services: ['DNS', 'DHCP', 'Web Admin']
    },
    {
      id: 4,
      name: 'Backup Server',
      status: 'stopped',
      cpu: '0%',
      memory: '0GB / 4GB',
      uptime: 'Stopped',
      services: ['Backup Service', 'Monitoring']
    }
  ]);

  const getStatusColor = (status) => {
    switch (status) {
      case 'running':
        return 'text-green-500 bg-green-100 dark:bg-green-900/20';
      case 'stopped':
        return 'text-red-500 bg-red-100 dark:bg-red-900/20';
      case 'warning':
        return 'text-yellow-500 bg-yellow-100 dark:bg-yellow-900/20';
      default:
        return 'text-gray-500 bg-gray-100 dark:bg-gray-900/20';
    }
  };

  const handleServerAction = (serverId, action) => {
    setServers(servers.map(server => {
      if (server.id === serverId) {
        switch (action) {
          case 'start':
            return { ...server, status: 'running' };
          case 'stop':
            return { ...server, status: 'stopped', cpu: '0%', memory: '0GB / ' + server.memory.split(' / ')[1] };
          case 'restart':
            return { ...server, status: 'running' };
          default:
            return server;
        }
      }
      return server;
    }));
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
              <Server className="w-6 h-6 text-blue-500" />
              Server Manager
            </h1>
          </div>
          <button className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90">
            <Plus className="w-4 h-4" />
            Add Server
          </button>
        </div>

        {/* Server Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {servers.map((server) => (
            <Card key={server.id} className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <Server className="w-5 h-5 text-blue-500" />
                  <h3 className="text-lg font-semibold">{server.name}</h3>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(server.status)}`}>
                  {server.status}
                </span>
              </div>

              <div className="space-y-3 mb-6">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">CPU Usage</span>
                  <span className="text-sm font-medium">{server.cpu}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Memory</span>
                  <span className="text-sm font-medium">{server.memory}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Uptime</span>
                  <span className="text-sm font-medium">{server.uptime}</span>
                </div>
              </div>

              <div className="mb-4">
                <div className="text-sm text-muted-foreground mb-2">Services</div>
                <div className="flex flex-wrap gap-2">
                  {server.services.map((service, index) => (
                    <span
                      key={index}
                      className="px-2 py-1 bg-secondary/10 text-secondary-foreground rounded text-xs"
                    >
                      {service}
                    </span>
                  ))}
                </div>
              </div>

              <div className="flex gap-2">
                {server.status === 'stopped' ? (
                  <button
                    onClick={() => handleServerAction(server.id, 'start')}
                    className="flex items-center gap-1 px-3 py-1.5 bg-green-500 text-white rounded text-sm hover:bg-green-600"
                  >
                    <Play className="w-3 h-3" />
                    Start
                  </button>
                ) : (
                  <button
                    onClick={() => handleServerAction(server.id, 'stop')}
                    className="flex items-center gap-1 px-3 py-1.5 bg-red-500 text-white rounded text-sm hover:bg-red-600"
                  >
                    <Square className="w-3 h-3" />
                    Stop
                  </button>
                )}
                <button
                  onClick={() => handleServerAction(server.id, 'restart')}
                  className="flex items-center gap-1 px-3 py-1.5 bg-blue-500 text-white rounded text-sm hover:bg-blue-600"
                >
                  <RotateCcw className="w-3 h-3" />
                  Restart
                </button>
                <button className="flex items-center gap-1 px-3 py-1.5 bg-gray-500 text-white rounded text-sm hover:bg-gray-600">
                  <Trash2 className="w-3 h-3" />
                  Delete
                </button>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ServerManager;
