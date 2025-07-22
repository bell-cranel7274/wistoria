# Docker Integration Guide

This guide covers integrating Docker containers and Docker Compose services with your homelab dashboard.

## 🐳 Docker Integration Overview

Monitor and manage your Docker containers, images, volumes, and networks directly from your homelab dashboard.

### Features
- **Container Management**: Start, stop, restart containers
- **Resource Monitoring**: CPU, memory, network usage per container
- **Log Streaming**: Real-time container logs
- **Image Management**: View and manage Docker images
- **Compose Integration**: Monitor Docker Compose stacks

## 🚀 Quick Setup

### 1. Enable Docker API Access

#### Local Docker Daemon
```bash
# Most common setup - Unix socket access
# API server needs access to /var/run/docker.sock
```

#### Remote Docker Daemon
```bash
# Enable TCP access (secure with TLS)
sudo dockerd -H tcp://0.0.0.0:2376 --tls --tlscert=/path/to/cert.pem --tlskey=/path/to/key.pem
```

### 2. Configure API Server

Add to your `.env`:
```env
# Local Docker socket
DOCKER_HOST=unix:///var/run/docker.sock

# Remote Docker with TLS
# DOCKER_HOST=tcp://192.168.1.100:2376
# DOCKER_TLS_VERIFY=1
# DOCKER_CERT_PATH=/path/to/certs
```

## 🔧 Implementation

### Docker Service (`src/services/dockerService.js`)
```javascript
const Docker = require('dockerode');
const fs = require('fs');

class DockerService {
  constructor() {
    this.docker = this.createDockerClient();
  }

  createDockerClient() {
    const dockerHost = process.env.DOCKER_HOST || 'unix:///var/run/docker.sock';
    
    if (dockerHost.startsWith('unix://')) {
      return new Docker({ socketPath: dockerHost.replace('unix://', '') });
    } else if (dockerHost.startsWith('tcp://')) {
      const url = new URL(dockerHost);
      const options = {
        host: url.hostname,
        port: url.port || 2376
      };

      // Add TLS configuration if enabled
      if (process.env.DOCKER_TLS_VERIFY === '1') {
        const certPath = process.env.DOCKER_CERT_PATH;
        options.ca = fs.readFileSync(`${certPath}/ca.pem`);
        options.cert = fs.readFileSync(`${certPath}/cert.pem`);
        options.key = fs.readFileSync(`${certPath}/key.pem`);
      }

      return new Docker(options);
    }
    
    throw new Error('Unsupported Docker host configuration');
  }

  // Container Operations
  async getContainers(all = true) {
    try {
      const containers = await this.docker.listContainers({ all });
      
      return await Promise.all(containers.map(async (containerInfo) => {
        const container = this.docker.getContainer(containerInfo.Id);
        const [inspect, stats] = await Promise.all([
          container.inspect(),
          this.getContainerStats(container)
        ]);

        return {
          id: containerInfo.Id.substring(0, 12),
          name: containerInfo.Names[0].replace('/', ''),
          image: containerInfo.Image,
          status: containerInfo.Status,
          state: containerInfo.State,
          created: containerInfo.Created,
          ports: this.formatPorts(containerInfo.Ports),
          networks: Object.keys(inspect.NetworkSettings.Networks),
          mounts: inspect.Mounts?.map(mount => ({
            source: mount.Source,
            destination: mount.Destination,
            type: mount.Type
          })) || [],
          env: inspect.Config.Env || [],
          stats: stats,
          labels: containerInfo.Labels || {}
        };
      }));
    } catch (error) {
      console.error('Docker containers error:', error);
      throw new Error('Failed to fetch containers');
    }
  }

  async getContainerStats(container) {
    try {
      const stream = await container.stats({ stream: false });
      
      // Calculate CPU percentage
      const cpuPercent = this.calculateCPUPercent(stream);
      
      // Calculate memory usage
      const memoryUsage = stream.memory_stats.usage || 0;
      const memoryLimit = stream.memory_stats.limit || 0;
      const memoryPercent = memoryLimit > 0 ? (memoryUsage / memoryLimit) * 100 : 0;

      // Network I/O
      const networks = stream.networks || {};
      const networkRx = Object.values(networks).reduce((sum, net) => sum + net.rx_bytes, 0);
      const networkTx = Object.values(networks).reduce((sum, net) => sum + net.tx_bytes, 0);

      return {
        cpu: Math.round(cpuPercent * 100) / 100,
        memory: {
          usage: memoryUsage,
          limit: memoryLimit,
          percent: Math.round(memoryPercent * 100) / 100
        },
        network: {
          rx: networkRx,
          tx: networkTx
        }
      };
    } catch (error) {
      console.warn('Failed to get container stats:', error.message);
      return {
        cpu: 0,
        memory: { usage: 0, limit: 0, percent: 0 },
        network: { rx: 0, tx: 0 }
      };
    }
  }

  calculateCPUPercent(stats) {
    const cpuDelta = stats.cpu_stats.cpu_usage.total_usage - 
                     (stats.precpu_stats.cpu_usage?.total_usage || 0);
    const systemDelta = stats.cpu_stats.system_cpu_usage - 
                        (stats.precpu_stats.system_cpu_usage || 0);
    
    if (systemDelta > 0 && cpuDelta > 0) {
      return (cpuDelta / systemDelta) * stats.cpu_stats.online_cpus * 100;
    }
    return 0;
  }

  formatPorts(ports) {
    return ports.map(port => ({
      private: port.PrivatePort,
      public: port.PublicPort,
      type: port.Type,
      ip: port.IP
    }));
  }

  // Container Control
  async startContainer(containerId) {
    try {
      const container = this.docker.getContainer(containerId);
      await container.start();
      return { success: true, message: 'Container started successfully' };
    } catch (error) {
      throw new Error(`Failed to start container: ${error.message}`);
    }
  }

  async stopContainer(containerId) {
    try {
      const container = this.docker.getContainer(containerId);
      await container.stop();
      return { success: true, message: 'Container stopped successfully' };
    } catch (error) {
      throw new Error(`Failed to stop container: ${error.message}`);
    }
  }

  async restartContainer(containerId) {
    try {
      const container = this.docker.getContainer(containerId);
      await container.restart();
      return { success: true, message: 'Container restarted successfully' };
    } catch (error) {
      throw new Error(`Failed to restart container: ${error.message}`);
    }
  }

  // Image Management
  async getImages() {
    try {
      const images = await this.docker.listImages();
      
      return images.map(image => ({
        id: image.Id.substring(7, 19),
        repository: image.RepoTags?.[0]?.split(':')[0] || '<none>',
        tag: image.RepoTags?.[0]?.split(':')[1] || '<none>',
        created: image.Created,
        size: image.Size,
        virtualSize: image.VirtualSize,
        containers: image.Containers || 0
      }));
    } catch (error) {
      console.error('Docker images error:', error);
      throw new Error('Failed to fetch images');
    }
  }

  // Network Management
  async getNetworks() {
    try {
      const networks = await this.docker.listNetworks();
      
      return networks.map(network => ({
        id: network.Id.substring(0, 12),
        name: network.Name,
        driver: network.Driver,
        scope: network.Scope,
        created: network.Created,
        containers: Object.keys(network.Containers || {}).length
      }));
    } catch (error) {
      console.error('Docker networks error:', error);
      throw new Error('Failed to fetch networks');
    }
  }

  // Volume Management
  async getVolumes() {
    try {
      const { Volumes } = await this.docker.listVolumes();
      
      return (Volumes || []).map(volume => ({
        name: volume.Name,
        driver: volume.Driver,
        mountpoint: volume.Mountpoint,
        created: volume.CreatedAt,
        scope: volume.Scope,
        options: volume.Options || {}
      }));
    } catch (error) {
      console.error('Docker volumes error:', error);
      throw new Error('Failed to fetch volumes');
    }
  }

  // Container Logs
  async getContainerLogs(containerId, options = {}) {
    try {
      const container = this.docker.getContainer(containerId);
      const stream = await container.logs({
        stdout: true,
        stderr: true,
        tail: options.tail || 100,
        timestamps: true,
        ...options
      });
      
      return stream.toString();
    } catch (error) {
      console.error('Docker logs error:', error);
      throw new Error('Failed to fetch container logs');
    }
  }

  // System Information
  async getSystemInfo() {
    try {
      const [info, version] = await Promise.all([
        this.docker.info(),
        this.docker.version()
      ]);

      return {
        version: version.Version,
        apiVersion: version.ApiVersion,
        containers: {
          total: info.Containers,
          running: info.ContainersRunning,
          paused: info.ContainersPaused,
          stopped: info.ContainersStopped
        },
        images: info.Images,
        serverVersion: info.ServerVersion,
        storageDriver: info.Driver,
        memory: info.MemTotal,
        cpus: info.NCPU,
        osType: info.OSType,
        architecture: info.Architecture
      };
    } catch (error) {
      console.error('Docker system info error:', error);
      throw new Error('Failed to fetch Docker system information');
    }
  }
}

module.exports = new DockerService();
```

### Docker Controller (`src/controllers/dockerController.js`)
```javascript
const dockerService = require('../services/dockerService');

class DockerController {
  async getContainers(req, res) {
    try {
      const { all = 'true' } = req.query;
      const containers = await dockerService.getContainers(all === 'true');
      
      res.json({
        success: true,
        data: containers,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('Docker containers error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch containers',
        message: error.message
      });
    }
  }

  async getImages(req, res) {
    try {
      const images = await dockerService.getImages();
      
      res.json({
        success: true,
        data: images,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('Docker images error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch images'
      });
    }
  }

  async startContainer(req, res) {
    try {
      const { id } = req.params;
      const result = await dockerService.startContainer(id);
      
      res.json({
        success: true,
        message: result.message,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('Start container error:', error);
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }

  async stopContainer(req, res) {
    try {
      const { id } = req.params;
      const result = await dockerService.stopContainer(id);
      
      res.json({
        success: true,
        message: result.message,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('Stop container error:', error);
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }

  async restartContainer(req, res) {
    try {
      const { id } = req.params;
      const result = await dockerService.restartContainer(id);
      
      res.json({
        success: true,
        message: result.message,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('Restart container error:', error);
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }

  async getContainerLogs(req, res) {
    try {
      const { id } = req.params;
      const { tail = 100 } = req.query;
      
      const logs = await dockerService.getContainerLogs(id, { tail: parseInt(tail) });
      
      res.json({
        success: true,
        data: logs,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('Container logs error:', error);
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }

  async getSystemInfo(req, res) {
    try {
      const systemInfo = await dockerService.getSystemInfo();
      
      res.json({
        success: true,
        data: systemInfo,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('Docker system info error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch Docker system information'
      });
    }
  }
}

module.exports = new DockerController();
```

## 🎯 Frontend Integration

### Docker Dashboard Component
```javascript
// src/components/homelab/DockerDashboard.jsx
import React, { useState, useEffect, useContext } from 'react';
import { HomelabContext } from '../../context/HomelabContext';
import { 
  Container, 
  Play, 
  Square, 
  RotateCcw, 
  Activity,
  HardDrive,
  Cpu,
  MemoryStick 
} from 'lucide-react';

const DockerDashboard = () => {
  const { dockerData } = useContext(HomelabContext);
  const [selectedContainer, setSelectedContainer] = useState(null);
  const [logs, setLogs] = useState('');

  const handleContainerAction = async (containerId, action) => {
    try {
      await homelabApi.controlContainer(containerId, action);
      // Refresh container data
      // This would trigger a refetch in your context
    } catch (error) {
      console.error('Container action failed:', error);
    }
  };

  const getStatusColor = (status) => {
    if (status.includes('Up')) return 'text-green-500';
    if (status.includes('Exited')) return 'text-red-500';
    return 'text-yellow-500';
  };

  return (
    <div className="space-y-6">
      {/* Docker System Overview */}
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Container className="w-5 h-5" />
          Docker System
        </h3>
        
        {dockerData.systemInfo && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-500">
                {dockerData.systemInfo.containers.running}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Running</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-500">
                {dockerData.systemInfo.containers.stopped}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Stopped</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-500">
                {dockerData.systemInfo.images}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Images</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-500">
                {dockerData.systemInfo.cpus}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">CPUs</div>
            </div>
          </div>
        )}
      </div>

      {/* Containers List */}
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
        <h3 className="text-lg font-semibold mb-4">Containers</h3>
        
        <div className="space-y-3">
          {dockerData.containers?.map(container => (
            <div key={container.id} className="border rounded-lg p-4 hover:bg-gray-50 dark:hover:bg-gray-700">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <h4 className="font-medium">{container.name}</h4>
                    <span className={`text-sm ${getStatusColor(container.status)}`}>
                      {container.status}
                    </span>
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    {container.image}
                  </div>
                  
                  {/* Resource Usage */}
                  {container.stats && (
                    <div className="flex items-center gap-4 mt-2 text-sm">
                      <div className="flex items-center gap-1">
                        <Cpu className="w-4 h-4" />
                        <span>{container.stats.cpu}%</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <MemoryStick className="w-4 h-4" />
                        <span>{container.stats.memory.percent}%</span>
                      </div>
                    </div>
                  )}
                </div>
                
                {/* Action Buttons */}
                <div className="flex items-center gap-2">
                  {container.state === 'running' ? (
                    <>
                      <button
                        onClick={() => handleContainerAction(container.id, 'restart')}
                        className="p-2 text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded"
                        title="Restart"
                      >
                        <RotateCcw className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleContainerAction(container.id, 'stop')}
                        className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded"
                        title="Stop"
                      >
                        <Square className="w-4 h-4" />
                      </button>
                    </>
                  ) : (
                    <button
                      onClick={() => handleContainerAction(container.id, 'start')}
                      className="p-2 text-green-500 hover:bg-green-50 dark:hover:bg-green-900/20 rounded"
                      title="Start"
                    >
                      <Play className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
              
              {/* Ports */}
              {container.ports.length > 0 && (
                <div className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                  Ports: {container.ports.map(port => 
                    `${port.public || port.private}:${port.private}/${port.type}`
                  ).join(', ')}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default DockerDashboard;
```

## 🔐 Security Considerations

### 1. Docker Socket Security
```bash
# Create docker group for API server user
sudo groupadd docker
sudo usermod -aG docker $USER

# Secure socket permissions
sudo chmod 660 /var/run/docker.sock
```

### 2. Remote Docker TLS Setup
```bash
# Generate TLS certificates
openssl genrsa -aes256 -out ca-key.pem 4096
openssl req -new -x509 -days 365 -key ca-key.pem -sha256 -out ca.pem

# Server certificates
openssl genrsa -out server-key.pem 4096
openssl req -subj "/CN=$HOST" -sha256 -new -key server-key.pem -out server.csr
openssl x509 -req -days 365 -sha256 -in server.csr -CA ca.pem -CAkey ca-key.pem -out server-cert.pem

# Client certificates
openssl genrsa -out key.pem 4096
openssl req -subj '/CN=client' -new -key key.pem -out client.csr
openssl x509 -req -days 365 -sha256 -in client.csr -CA ca.pem -CAkey ca-key.pem -out cert.pem
```

## 📊 Monitoring Patterns

### Resource Monitoring
```javascript
// Real-time container stats collection
const collectContainerStats = async () => {
  const containers = await dockerService.getContainers();
  const runningContainers = containers.filter(c => c.state === 'running');
  
  const statsPromises = runningContainers.map(async (container) => {
    const stats = await dockerService.getContainerStats(container.id);
    return {
      containerId: container.id,
      name: container.name,
      ...stats,
      timestamp: new Date()
    };
  });
  
  return Promise.all(statsPromises);
};
```

### Health Checks
```javascript
// Container health monitoring
const checkContainerHealth = async (containerId) => {
  try {
    const container = docker.getContainer(containerId);
    const inspect = await container.inspect();
    
    return {
      status: inspect.State.Health?.Status || 'unknown',
      failingStreak: inspect.State.Health?.FailingStreak || 0,
      log: inspect.State.Health?.Log || []
    };
  } catch (error) {
    return { status: 'error', error: error.message };
  }
};
```

## 🚀 Advanced Features

### Docker Compose Integration
```javascript
// Monitor Docker Compose stacks
const getComposeProjects = async () => {
  const containers = await dockerService.getContainers();
  
  // Group containers by compose project
  const projects = containers.reduce((acc, container) => {
    const project = container.labels['com.docker.compose.project'];
    if (project) {
      if (!acc[project]) acc[project] = [];
      acc[project].push(container);
    }
    return acc;
  }, {});
  
  return projects;
};
```

### Log Streaming
```javascript
// WebSocket log streaming
const streamContainerLogs = (containerId, socket) => {
  const container = docker.getContainer(containerId);
  
  container.logs({
    follow: true,
    stdout: true,
    stderr: true,
    timestamps: true
  }).then(stream => {
    stream.on('data', chunk => {
      socket.emit('container-logs', {
        containerId,
        data: chunk.toString()
      });
    });
  });
};
```

## 🎯 Next Steps

1. **Test Docker Connection**: Verify API access to Docker daemon
2. **Implement Controls**: Add start/stop/restart functionality
3. **Add Monitoring**: Implement resource usage tracking
4. **Log Management**: Add log streaming and search
5. **Compose Support**: Monitor Docker Compose stacks

## 🔗 Related Documentation

- [API Server Setup](../api-server-setup.md) - Setting up the backend
- [Security Guide](../security/docker-security.md) - Docker-specific security
- [Deployment](../deployment/docker-deployment.md) - Production deployment

## 📚 Additional Resources

- [Docker Engine API](https://docs.docker.com/engine/api/) - Official API documentation
- [Dockerode](https://github.com/apocas/dockerode) - Node.js Docker API client
- [Docker Security](https://docs.docker.com/engine/security/) - Security best practices
