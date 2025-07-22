import React, { useState } from 'react';
import { ArrowLeft, Container, Play, Square, RotateCcw, Trash2, Plus, Download } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Card } from '../ui/card';

export const DockerManager = () => {
  const navigate = useNavigate();
  const [containers, setContainers] = useState([
    {
      id: 'pihole',
      name: 'pihole',
      image: 'pihole/pihole:latest',
      status: 'running',
      ports: ['80:80', '53:53'],
      uptime: '5 days',
      memory: '89.2MB',
      cpu: '2.1%'
    },
    {
      id: 'jellyfin',
      name: 'jellyfin',
      image: 'jellyfin/jellyfin:latest',
      status: 'running',
      ports: ['8096:8096'],
      uptime: '3 days',
      memory: '412MB',
      cpu: '15.3%'
    },
    {
      id: 'portainer',
      name: 'portainer',
      image: 'portainer/portainer-ce:latest',
      status: 'running',
      ports: ['9000:9000'],
      uptime: '7 days',
      memory: '23.1MB',
      cpu: '0.8%'
    },
    {
      id: 'homeassistant',
      name: 'homeassistant',
      image: 'homeassistant/home-assistant:latest',
      status: 'stopped',
      ports: ['8123:8123'],
      uptime: 'Stopped',
      memory: '0MB',
      cpu: '0%'
    }
  ]);

  const getStatusColor = (status) => {
    switch (status) {
      case 'running':
        return 'text-green-500 bg-green-100 dark:bg-green-900/20';
      case 'stopped':
        return 'text-red-500 bg-red-100 dark:bg-red-900/20';
      case 'starting':
        return 'text-blue-500 bg-blue-100 dark:bg-blue-900/20';
      case 'error':
        return 'text-red-500 bg-red-100 dark:bg-red-900/20';
      default:
        return 'text-gray-500 bg-gray-100 dark:bg-gray-900/20';
    }
  };

  const handleContainerAction = (containerId, action) => {
    setContainers(containers.map(container => {
      if (container.id === containerId) {
        switch (action) {
          case 'start':
            return { ...container, status: 'running' };
          case 'stop':
            return { ...container, status: 'stopped', memory: '0MB', cpu: '0%', uptime: 'Stopped' };
          case 'restart':
            return { ...container, status: 'running' };
          default:
            return container;
        }
      }
      return container;
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
              <Container className="w-6 h-6 text-blue-500" />
              Docker Manager
            </h1>
          </div>
          <div className="flex gap-2">
            <button className="flex items-center gap-2 px-4 py-2 bg-secondary text-secondary-foreground rounded-lg hover:bg-secondary/80">
              <Download className="w-4 h-4" />
              Pull Image
            </button>
            <button className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90">
              <Plus className="w-4 h-4" />
              New Container
            </button>
          </div>
        </div>

        {/* Container Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card className="p-4">
            <div className="text-sm text-muted-foreground">Total Containers</div>
            <div className="text-2xl font-bold">{containers.length}</div>
          </Card>
          <Card className="p-4">
            <div className="text-sm text-muted-foreground">Running</div>
            <div className="text-2xl font-bold text-green-500">
              {containers.filter(c => c.status === 'running').length}
            </div>
          </Card>
          <Card className="p-4">
            <div className="text-sm text-muted-foreground">Stopped</div>
            <div className="text-2xl font-bold text-red-500">
              {containers.filter(c => c.status === 'stopped').length}
            </div>
          </Card>
          <Card className="p-4">
            <div className="text-sm text-muted-foreground">Total Memory</div>
            <div className="text-2xl font-bold text-blue-500">
              {containers.reduce((total, c) => {
                const memory = parseFloat(c.memory.replace('MB', ''));
                return total + (isNaN(memory) ? 0 : memory);
              }, 0).toFixed(1)}MB
            </div>
          </Card>
        </div>

        {/* Containers List */}
        <div className="space-y-4">
          {containers.map((container) => (
            <Card key={container.id} className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <Container className="w-5 h-5 text-blue-500" />
                  <div>
                    <h3 className="text-lg font-semibold">{container.name}</h3>
                    <p className="text-sm text-muted-foreground">{container.image}</p>
                  </div>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(container.status)}`}>
                  {container.status}
                </span>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mt-4 mb-4">
                <div>
                  <div className="text-xs text-muted-foreground">Ports</div>
                  <div className="text-sm font-medium">
                    {container.ports.join(', ')}
                  </div>
                </div>
                <div>
                  <div className="text-xs text-muted-foreground">Uptime</div>
                  <div className="text-sm font-medium">{container.uptime}</div>
                </div>
                <div>
                  <div className="text-xs text-muted-foreground">Memory</div>
                  <div className="text-sm font-medium">{container.memory}</div>
                </div>
                <div>
                  <div className="text-xs text-muted-foreground">CPU</div>
                  <div className="text-sm font-medium">{container.cpu}</div>
                </div>
                <div className="flex gap-2">
                  {container.status === 'stopped' ? (
                    <button
                      onClick={() => handleContainerAction(container.id, 'start')}
                      className="flex items-center gap-1 px-2 py-1 bg-green-500 text-white rounded text-xs hover:bg-green-600"
                    >
                      <Play className="w-3 h-3" />
                      Start
                    </button>
                  ) : (
                    <button
                      onClick={() => handleContainerAction(container.id, 'stop')}
                      className="flex items-center gap-1 px-2 py-1 bg-red-500 text-white rounded text-xs hover:bg-red-600"
                    >
                      <Square className="w-3 h-3" />
                      Stop
                    </button>
                  )}
                  <button
                    onClick={() => handleContainerAction(container.id, 'restart')}
                    className="flex items-center gap-1 px-2 py-1 bg-blue-500 text-white rounded text-xs hover:bg-blue-600"
                  >
                    <RotateCcw className="w-3 h-3" />
                  </button>
                  <button className="flex items-center gap-1 px-2 py-1 bg-gray-500 text-white rounded text-xs hover:bg-gray-600">
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default DockerManager;
