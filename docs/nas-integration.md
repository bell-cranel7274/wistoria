# NAS Integration Guide

This guide provides detailed instructions for integrating Network Attached Storage (NAS) systems with your homelab dashboard.

## 🎯 Supported NAS Systems

### Primary Support
- **Synology DSM** - Complete API integration
- **QNAP QTS** - Full feature support
- **TrueNAS** - REST API integration

### Community Support  
- **OpenMediaVault** - Basic integration
- **FreeNAS** - Legacy support
- **Custom Solutions** - Generic SNMP/API

## 🚀 Quick Setup

### 1. Enable NAS API Access

#### Synology DSM
```bash
# Enable SSH (Control Panel → Terminal & SNMP → SSH)
# Enable Web API (Control Panel → Security → API)
```

#### QNAP QTS
```bash
# Enable SSH (Control Panel → Network & File Services → SSH)
# Enable Web API (Control Panel → System → External Device → Web API)
```

#### TrueNAS
```bash
# Enable API (System → API Keys)
# Generate API key for authentication
```

### 2. Configure API Server

Add to your API server's `.env`:
```env
# Synology Configuration
SYNOLOGY_HOST=192.168.1.100
SYNOLOGY_PORT=5000
SYNOLOGY_USERNAME=homelab-api
SYNOLOGY_PASSWORD=secure-password
SYNOLOGY_USE_HTTPS=true

# QNAP Configuration  
QNAP_HOST=192.168.1.101
QNAP_PORT=8080
QNAP_USERNAME=admin
QNAP_PASSWORD=admin-password

# TrueNAS Configuration
TRUENAS_HOST=192.168.1.102
TRUENAS_API_KEY=your-api-key-here
```

## 🔧 Implementation Examples

### Synology DSM Integration

#### Full Service Implementation (`src/services/synologyService.js`)
```javascript
const axios = require('axios');
const https = require('https');

class SynologyService {
  constructor() {
    this.host = process.env.SYNOLOGY_HOST;
    this.port = process.env.SYNOLOGY_PORT || 5000;
    this.username = process.env.SYNOLOGY_USERNAME;
    this.password = process.env.SYNOLOGY_PASSWORD;
    this.useHttps = process.env.SYNOLOGY_USE_HTTPS === 'true';
    
    this.baseURL = `${this.useHttps ? 'https' : 'http'}://${this.host}:${this.port}`;
    this.sessionId = null;
    this.sessionExpiry = null;
    
    // Configure axios instance
    this.client = axios.create({
      baseURL: this.baseURL,
      timeout: 15000,
      httpsAgent: new https.Agent({
        rejectUnauthorized: false // For self-signed certificates
      })
    });
  }

  async authenticate() {
    // Check if session is still valid
    if (this.sessionId && this.sessionExpiry && Date.now() < this.sessionExpiry) {
      return this.sessionId;
    }

    try {
      const response = await this.client.get('/webapi/auth.cgi', {
        params: {
          api: 'SYNO.API.Auth',
          version: '3',
          method: 'login',
          account: this.username,
          passwd: this.password,
          session: 'SurveillanceStation',
          format: 'cookie'
        }
      });

      if (response.data.success) {
        this.sessionId = response.data.data.sid;
        this.sessionExpiry = Date.now() + (30 * 60 * 1000); // 30 minutes
        return this.sessionId;
      } else {
        throw new Error(`Authentication failed: ${response.data.error?.code}`);
      }
    } catch (error) {
      console.error('Synology authentication error:', error.message);
      throw new Error('Failed to authenticate with Synology NAS');
    }
  }

  async apiRequest(api, method, params = {}, version = '1') {
    await this.authenticate();
    
    try {
      const response = await this.client.get('/webapi/entry.cgi', {
        params: {
          api,
          method,
          version,
          _sid: this.sessionId,
          ...params
        }
      });

      if (!response.data.success) {
        throw new Error(`API Error: ${response.data.error?.code || 'Unknown error'}`);
      }

      return response.data.data;
    } catch (error) {
      // If authentication error, clear session and retry once
      if (error.response?.data?.error?.code === 105) {
        this.sessionId = null;
        this.sessionExpiry = null;
        return this.apiRequest(api, method, params, version);
      }
      throw error;
    }
  }

  // Storage Information
  async getStorageInfo() {
    const [volumes, disks] = await Promise.all([
      this.getVolumes(),
      this.getDisks()
    ]);

    const totalSpace = volumes.reduce((sum, vol) => sum + vol.size_total, 0);
    const usedSpace = volumes.reduce((sum, vol) => sum + vol.size_used, 0);
    const freeSpace = totalSpace - usedSpace;

    return {
      volumes: volumes.map(vol => ({
        id: vol.id,
        path: vol.path,
        label: vol.label,
        status: vol.status,
        fileSystem: vol.fs_type,
        size: vol.size_total,
        used: vol.size_used,
        available: vol.size_total - vol.size_used,
        percentage: Math.round((vol.size_used / vol.size_total) * 100)
      })),
      disks: disks.map(disk => ({
        id: disk.id,
        name: disk.name,
        device: disk.device,
        model: disk.model,
        size: disk.size_total,
        status: disk.status,
        temperature: disk.temp,
        health: disk.smart_status
      })),
      summary: {
        totalSpace,
        usedSpace,
        freeSpace,
        usagePercentage: Math.round((usedSpace / totalSpace) * 100)
      }
    };
  }

  async getVolumes() {
    return await this.apiRequest('SYNO.Core.Storage.Volume', 'list');
  }

  async getDisks() {
    return await this.apiRequest('SYNO.Core.Storage.Disk', 'list');
  }

  // System Information
  async getSystemInfo() {
    const [info, utilization, network] = await Promise.all([
      this.apiRequest('SYNO.Core.System', 'info'),
      this.apiRequest('SYNO.Core.System.Utilization', 'get'),
      this.getNetworkInfo()
    ]);

    return {
      model: info.model,
      serialNumber: info.serial,
      version: info.version_string,
      uptime: info.up_time,
      time: info.time,
      temperature: {
        cpu: utilization.cpu.temperature,
        system: info.temperature
      },
      cpu: {
        usage: utilization.cpu.user_load + utilization.cpu.system_load,
        cores: utilization.cpu.cores || 4,
        temperature: utilization.cpu.temperature
      },
      memory: {
        total: utilization.memory.total_real,
        used: utilization.memory.total_real - utilization.memory.avail_real,
        available: utilization.memory.avail_real,
        percentage: Math.round(((utilization.memory.total_real - utilization.memory.avail_real) / utilization.memory.total_real) * 100)
      },
      network: network
    };
  }

  async getNetworkInfo() {
    try {
      const interfaces = await this.apiRequest('SYNO.Core.Network.Interface', 'list');
      return interfaces.map(iface => ({
        id: iface.id,
        name: iface.name,
        status: iface.link,
        ip: iface.ip,
        mask: iface.mask,
        gateway: iface.gateway,
        speed: iface.speed,
        rx: iface.rx,
        tx: iface.tx
      }));
    } catch (error) {
      console.warn('Failed to get network info:', error.message);
      return [];
    }
  }

  // Background Tasks
  async getBackgroundTasks() {
    try {
      const tasks = await this.apiRequest('SYNO.Core.TaskScheduler', 'list');
      return tasks.map(task => ({
        id: task.id,
        name: task.name,
        status: task.status,
        lastResult: task.last_result,
        nextRun: task.next_trigger_time,
        owner: task.owner
      }));
    } catch (error) {
      console.warn('Failed to get background tasks:', error.message);
      return [];
    }
  }

  // File Station Operations
  async getSharedFolders() {
    return await this.apiRequest('SYNO.Core.Share', 'list');
  }

  async getDirectoryListing(path = '/') {
    return await this.apiRequest('SYNO.FileStation.List', 'list', {
      folder_path: path,
      limit: 100,
      sort_by: 'name',
      sort_direction: 'ASC'
    });
  }

  // Package Management
  async getInstalledPackages() {
    try {
      const packages = await this.apiRequest('SYNO.Core.Package', 'list');
      return packages.map(pkg => ({
        id: pkg.id,
        name: pkg.name,
        version: pkg.version,
        status: pkg.status,
        description: pkg.description
      }));
    } catch (error) {
      console.warn('Failed to get installed packages:', error.message);
      return [];
    }
  }
}

module.exports = new SynologyService();
```

### QNAP Integration

#### QNAP Service Implementation (`src/services/qnapService.js`)
```javascript
const axios = require('axios');

class QNAPService {
  constructor() {
    this.host = process.env.QNAP_HOST;
    this.port = process.env.QNAP_PORT || 8080;
    this.username = process.env.QNAP_USERNAME;
    this.password = process.env.QNAP_PASSWORD;
    
    this.baseURL = `http://${this.host}:${this.port}`;
    this.sessionId = null;
    
    this.client = axios.create({
      baseURL: this.baseURL,
      timeout: 10000
    });
  }

  async authenticate() {
    if (this.sessionId) return this.sessionId;

    try {
      const response = await this.client.post('/cgi-bin/authLogin.cgi', {
        user: this.username,
        pwd: Buffer.from(this.password).toString('base64')
      });

      if (response.data.authSid) {
        this.sessionId = response.data.authSid;
        return this.sessionId;
      } else {
        throw new Error('Authentication failed');
      }
    } catch (error) {
      console.error('QNAP authentication error:', error);
      throw error;
    }
  }

  async apiRequest(endpoint, params = {}) {
    await this.authenticate();
    
    const response = await this.client.get(endpoint, {
      params: {
        sid: this.sessionId,
        ...params
      }
    });

    return response.data;
  }

  async getSystemInfo() {
    const data = await this.apiRequest('/cgi-bin/management/manaRequest.cgi', {
      subfunc: 'sysinfo'
    });

    return {
      model: data.model,
      version: data.version,
      uptime: data.uptime,
      cpu: {
        usage: data.cpu_usage,
        temperature: data.cpu_temp
      },
      memory: {
        total: data.total_memory,
        used: data.used_memory,
        percentage: Math.round((data.used_memory / data.total_memory) * 100)
      }
    };
  }

  async getStorageInfo() {
    const data = await this.apiRequest('/cgi-bin/disk/disk_manage.cgi', {
      func: 'volume_info'
    });

    return {
      volumes: data.volumes.map(vol => ({
        id: vol.id,
        label: vol.label,
        size: vol.size,
        used: vol.used,
        available: vol.free,
        percentage: Math.round((vol.used / vol.size) * 100),
        status: vol.status
      }))
    };
  }
}

module.exports = new QNAPService();
```

### TrueNAS Integration

#### TrueNAS Service Implementation (`src/services/truenasService.js`)
```javascript
const axios = require('axios');

class TrueNASService {
  constructor() {
    this.host = process.env.TRUENAS_HOST;
    this.apiKey = process.env.TRUENAS_API_KEY;
    this.baseURL = `http://${this.host}/api/v2.0`;
    
    this.client = axios.create({
      baseURL: this.baseURL,
      timeout: 10000,
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json'
      }
    });
  }

  async getSystemInfo() {
    try {
      const [info, stats] = await Promise.all([
        this.client.get('/system/info'),
        this.client.get('/reporting/realtime')
      ]);

      return {
        hostname: info.data.hostname,
        version: info.data.version,
        uptime: info.data.uptime_seconds,
        model: info.data.system_product,
        cpu: {
          usage: stats.data.cpu?.usage || 0,
          cores: stats.data.cpu?.cores || 1
        },
        memory: {
          total: stats.data.memory?.total || 0,
          used: stats.data.memory?.used || 0,
          percentage: Math.round((stats.data.memory?.used / stats.data.memory?.total) * 100) || 0
        }
      };
    } catch (error) {
      console.error('TrueNAS system info error:', error);
      throw error;
    }
  }

  async getStorageInfo() {
    try {
      const [pools, disks] = await Promise.all([
        this.client.get('/pool'),
        this.client.get('/disk')
      ]);

      return {
        pools: pools.data.map(pool => ({
          id: pool.id,
          name: pool.name,
          status: pool.status,
          size: pool.size,
          allocated: pool.allocated,
          free: pool.free,
          percentage: Math.round((pool.allocated / pool.size) * 100)
        })),
        disks: disks.data.map(disk => ({
          name: disk.name,
          model: disk.model,
          size: disk.size,
          status: disk.status,
          temperature: disk.temperature
        }))
      };
    } catch (error) {
      console.error('TrueNAS storage info error:', error);
      throw error;
    }
  }
}

module.exports = new TrueNASService();
```

## 🎯 Frontend Integration

### Update HomelabContext for NAS Data

```javascript
// src/context/HomelabContext.jsx - Add NAS state
const [nasData, setNasData] = useState({
  storage: null,
  system: null,
  tasks: null,
  lastUpdate: null,
  status: 'disconnected'
});

// Add NAS fetch functions
const fetchNASData = useCallback(async () => {
  try {
    setNasData(prev => ({ ...prev, status: 'loading' }));
    
    const [storage, system, tasks] = await Promise.all([
      homelabApi.getNASStorage(),
      homelabApi.getNASSystem(),
      homelabApi.getBackgroundTasks()
    ]);

    setNasData({
      storage: storage.data,
      system: system.data,
      tasks: tasks.data,
      lastUpdate: new Date(),
      status: 'connected'
    });
  } catch (error) {
    console.error('Failed to fetch NAS data:', error);
    setNasData(prev => ({ 
      ...prev, 
      status: 'error',
      lastUpdate: new Date()
    }));
  }
}, []);
```

### NAS Dashboard Component

```javascript
// src/components/homelab/NASDashboard.jsx
import React, { useContext } from 'react';
import { HomelabContext } from '../../context/HomelabContext';
import { 
  HardDrive, 
  Activity, 
  Thermometer, 
  Cpu, 
  MemoryStick,
  AlertTriangle 
} from 'lucide-react';

const NASDashboard = () => {
  const { nasData } = useContext(HomelabContext);

  if (nasData.status === 'loading') {
    return <div className="animate-pulse">Loading NAS data...</div>;
  }

  if (nasData.status === 'error') {
    return (
      <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg">
        <div className="flex items-center gap-2 text-red-600 dark:text-red-400">
          <AlertTriangle className="w-5 h-5" />
          <span>Unable to connect to NAS</span>
        </div>
      </div>
    );
  }

  const { storage, system } = nasData;

  return (
    <div className="space-y-6">
      {/* System Overview */}
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Activity className="w-5 h-5" />
          System Overview
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="flex items-center gap-3">
            <Cpu className="w-8 h-8 text-blue-500" />
            <div>
              <div className="text-sm text-gray-600 dark:text-gray-400">CPU Usage</div>
              <div className="text-xl font-semibold">{system?.cpu.usage}%</div>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <MemoryStick className="w-8 h-8 text-green-500" />
            <div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Memory</div>
              <div className="text-xl font-semibold">{system?.memory.percentage}%</div>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <Thermometer className="w-8 h-8 text-orange-500" />
            <div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Temperature</div>
              <div className="text-xl font-semibold">{system?.temperature.cpu}°C</div>
            </div>
          </div>
        </div>
      </div>

      {/* Storage Overview */}
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <HardDrive className="w-5 h-5" />
          Storage Status
        </h3>
        
        <div className="space-y-4">
          {storage?.volumes.map(volume => (
            <div key={volume.id} className="border rounded-lg p-4">
              <div className="flex justify-between items-center mb-2">
                <h4 className="font-medium">{volume.label || volume.path}</h4>
                <span className={`px-2 py-1 rounded text-sm ${
                  volume.status === 'normal' 
                    ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                    : 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
                }`}>
                  {volume.status}
                </span>
              </div>
              
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mb-2">
                <div 
                  className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${volume.percentage}%` }}
                />
              </div>
              
              <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400">
                <span>{volume.percentage}% used</span>
                <span>{formatBytes(volume.used)} / {formatBytes(volume.size)}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const formatBytes = (bytes) => {
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  if (bytes === 0) return '0 Bytes';
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
};

export default NASDashboard;
```

## 🔐 Security Best Practices

### 1. NAS User Account Setup
```bash
# Create dedicated API user (Synology)
# Control Panel → User & Group → Create user "homelab-api"
# Assign minimal required permissions:
# - File Station: Read access only
# - System: Basic read permissions
# - No admin rights
```

### 2. Network Security
```bash
# Firewall rules (example for Synology)
# Control Panel → Security → Firewall
# Allow API server IP only on required ports
# Block all other external access
```

### 3. API Rate Limiting
```javascript
// Add to your API server
const rateLimit = require('express-rate-limit');

const nasRateLimit = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 30, // 30 requests per minute
  message: 'Too many NAS API requests'
});

app.use('/api/nas', nasRateLimit);
```

## 📊 Monitoring and Alerting

### Health Check Implementation
```javascript
// src/services/nasHealthCheck.js
class NASHealthCheck {
  async checkSynologyHealth() {
    try {
      const startTime = Date.now();
      await synologyService.authenticate();
      const responseTime = Date.now() - startTime;
      
      return {
        status: 'healthy',
        responseTime,
        lastCheck: new Date()
      };
    } catch (error) {
      return {
        status: 'unhealthy',
        error: error.message,
        lastCheck: new Date()
      };
    }
  }
}
```

## 🎯 Next Steps

1. **Test Connection**: Verify API credentials and network access
2. **Implement Caching**: Add Redis for performance optimization  
3. **Add Alerting**: Set up notifications for disk space, temperature
4. **Expand Features**: Add file management, backup monitoring
5. **Add Other Services**: Integrate Docker, media servers, etc.

## 🔗 Related Documentation

- [API Server Setup](./api-server-setup.md) - Setting up the backend server
- [Docker Integration](./service-integrations/docker.md) - Adding Docker support
- [Security Guide](./security/nas-security.md) - NAS-specific security
- [Troubleshooting](./troubleshooting/nas-issues.md) - Common problems and solutions

## 📚 Additional Resources

### Official Documentation
- [Synology Web API Guide](https://global.download.synology.com/download/Document/Software/DeveloperGuide/Package/FileStation/All/enu/Synology_File_Station_API_Guide.pdf)
- [QNAP API Documentation](https://www.qnap.com/en/how-to/tutorial/article/qnap-development-api)
- [TrueNAS API Reference](https://www.truenas.com/docs/references/api/)

### Community Resources
- [Home Assistant NAS Integration](https://www.home-assistant.io/integrations/synology_dsm/)
- [Grafana NAS Dashboards](https://grafana.com/grafana/dashboards/?search=nas)
- [Docker Compose Examples](https://github.com/awesome-selfhosted/awesome-selfhosted)
